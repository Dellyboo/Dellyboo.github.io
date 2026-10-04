import { translations } from "./i18n.js";
import { EMAILJS_PUBLIC_KEY, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID } from "./emailjs-config.js";

(async function () {
  "use strict";

  var LANG_KEY = "portfolio-lang";
  var currentLang = localStorage.getItem(LANG_KEY) || "en";
  window.addEventListener("app:langchange", function (e) {
    currentLang = e.detail.lang;
    rerenderHobbyStrings();
  });

  function t(key) {
    var dict = translations[currentLang] || translations.en;
    return dict[key] || key;
  }

  /* ---------- Load Firebase lazily; degrade gracefully if it fails ---------- */
  var fetchHobbies = null;
  var submitMessage = null;
  var firebaseAvailable = false;

  try {
    var mod = await import("./firebase-init.js");
    fetchHobbies = mod.fetchHobbies;
    submitMessage = mod.submitMessage;
    firebaseAvailable = mod.firebaseReady;
  } catch (err) {
    console.warn("Firebase features unavailable (network blocked or CDN failed):", err);
  }

  /* =========================================================
     HOBBIES - loaded live from Firebase, with demo fallback
  ========================================================= */
  var hobbiesGrid = document.getElementById("hobbiesGrid");
  var modal = document.getElementById("hobbyModal");
  var modalImg = document.getElementById("modalImg");
  var modalTitle = document.getElementById("modalTitle");
  var modalDesc = document.getElementById("modalDesc");
  var lastRenderedHobbies = [];

  // Shown until real hobbies are added to Firestore, or if Firebase can't load - see README.md
  var DEMO_HOBBIES = [
    { title: "Photography", description: "Wandering around Kobe with a camera, chasing good light and quiet street corners.", icon: "bi-camera", image: "" },
    { title: "Gaming", description: "Unwinding with story-driven and strategy games after a long day of building things.", icon: "bi-controller", image: "" },
    { title: "Exploring Japan", description: "Weekend trips around Kansai - food, shrines, and finding new favorite spots.", icon: "bi-signpost-2", image: "" }
  ];

  function openModal(hobby) {
    if (!modal) return;
    if (hobby.image) {
      modalImg.src = hobby.image;
      modalImg.alt = hobby.title || "";
      modalImg.style.display = "block";
    } else {
      modalImg.style.display = "none";
    }
    modalTitle.textContent = hobby.title || "";
    modalDesc.textContent = hobby.description || "";
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }
  if (modal) {
    modal.querySelectorAll("[data-close-modal]").forEach(function (el) {
      el.addEventListener("click", closeModal);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal();
    });
  }

  var READ_MORE_THRESHOLD = 90;

  function renderHobbies(hobbies) {
    if (!hobbiesGrid) return;
    lastRenderedHobbies = hobbies;
    hobbiesGrid.innerHTML = "";

    if (!hobbies.length) {
      var empty = document.createElement("p");
      empty.className = "hobbies-empty";
      empty.textContent = t("hobbies.empty");
      hobbiesGrid.appendChild(empty);
      return;
    }

    hobbies.forEach(function (hobby) {
      var card = document.createElement("article");
      card.className = "hobby-card";

      var media = document.createElement("div");
      media.className = "hobby-card__media";
      if (hobby.image) {
        var img = document.createElement("img");
        img.src = hobby.image;
        img.alt = hobby.title || "";
        media.appendChild(img);
      } else {
        var icon = document.createElement("i");
        icon.className = "bi " + (hobby.icon || "bi-heart");
        media.appendChild(icon);
      }

      var body = document.createElement("div");
      body.className = "hobby-card__body";

      var h3 = document.createElement("h3");
      h3.textContent = hobby.title || "";

      var p = document.createElement("p");
      var desc = hobby.description || "";
      var isLong = desc.length > READ_MORE_THRESHOLD;
      p.textContent = isLong ? desc.slice(0, READ_MORE_THRESHOLD).trim() + "…" : desc;

      body.appendChild(h3);
      body.appendChild(p);

      if (isLong) {
        var more = document.createElement("button");
        more.className = "hobby-card__more";
        more.innerHTML = '<span>' + t("hobbies.readmore") + '</span> <i class="bi bi-arrow-right"></i>';
        more.addEventListener("click", function () { openModal(hobby); });
        body.appendChild(more);
      }

      card.appendChild(media);
      card.appendChild(body);
      hobbiesGrid.appendChild(card);
    });
  }

  function rerenderHobbyStrings() {
    if (lastRenderedHobbies.length || hobbiesGrid) renderHobbies(lastRenderedHobbies);
  }

  if (fetchHobbies) {
    fetchHobbies()
      .then(function (hobbies) {
        renderHobbies(hobbies && hobbies.length ? hobbies : DEMO_HOBBIES);
      })
      .catch(function () {
        renderHobbies(DEMO_HOBBIES);
      });
  } else {
    renderHobbies(DEMO_HOBBIES);
  }

  /* =========================================================
     CONTACT FORM
     Primary path: EmailJS (free, no backend, no billing) sends the
     message straight to dellydear98@gmail.com with an auto-generated
     subject line summarizing the project details.
     Backup: also logs the message to Firestore if that's configured
     (handy as a searchable record - entirely optional).
     Last resort: if EmailJS isn't configured yet, falls back to opening
     the visitor's email client so nothing gets lost either way.
  ========================================================= */
  var form = document.getElementById("contactForm");
  var formNote = document.getElementById("formNote");
  var submitBtn = document.getElementById("submitBtn");

  var emailjsReady =
    EMAILJS_PUBLIC_KEY !== "REPLACE_ME" &&
    EMAILJS_SERVICE_ID !== "REPLACE_ME" &&
    EMAILJS_TEMPLATE_ID !== "REPLACE_ME" &&
    typeof window.emailjs !== "undefined";

  if (emailjsReady) {
    try {
      window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    } catch (err) {
      console.warn("EmailJS init failed:", err);
      emailjsReady = false;
    }
  }

  // A short, free, client-side stand-in for an AI-written subject line -
  // no backend or API key required, so it works within Firebase's free
  // Spark plan and EmailJS's free tier with no billing account anywhere.
  function generateSubject(name, message) {
    var clean = message.replace(/\s+/g, " ").trim();
    var firstSentence = clean.split(/(?<=[.!?])\s/)[0] || clean;
    var summary =
      firstSentence.length <= 70 ? firstSentence : clean.slice(0, 70).trim() + "…";
    return "Portfolio inquiry from " + name + ": " + summary;
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var message = form.message.value.trim();

      if (!name || !email || !message) {
        formNote.textContent = t("contact.form.required");
        formNote.className = "form-note is-error";
        return;
      }

      var subject = generateSubject(name, message);

      // Always keep a free Firestore log if it's configured - best effort,
      // never blocks or fails the actual email send.
      if (submitMessage) {
        submitMessage({ name: name, email: email, message: message }).catch(function (err) {
          console.warn("Firestore backup log failed (non-fatal):", err);
        });
      }

      if (!emailjsReady) {
        // EmailJS isn't configured yet - fall back to the visitor's own
        // email client so the message still reaches you.
        var mailSubject = encodeURIComponent(subject);
        var mailBody = encodeURIComponent(message + "\n\n- " + name + " (" + email + ")");
        window.location.href = "mailto:dellydear98@gmail.com?subject=" + mailSubject + "&body=" + mailBody;
        formNote.textContent = t("contact.form.success");
        formNote.className = "form-note is-success";
        return;
      }

      submitBtn.disabled = true;
      formNote.textContent = t("contact.form.sending");
      formNote.className = "form-note";

      window.emailjs
        .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          from_name: name,
          from_email: email,
          subject: subject,
          message: message
        })
        .then(function () {
          formNote.textContent = t("contact.form.success");
          formNote.className = "form-note is-success";
          form.reset();
        })
        .catch(function (err) {
          console.warn("EmailJS send failed:", err);
          formNote.textContent = t("contact.form.error");
          formNote.className = "form-note is-error";
        })
        .finally(function () {
          submitBtn.disabled = false;
        });
    });
  }
})();
