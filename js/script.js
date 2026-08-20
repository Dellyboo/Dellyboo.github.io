(function () {
  "use strict";

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var isOpen = navLinks.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("is-open");
        navToggle.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Navbar shrink/shadow on scroll ---------- */
  var navbar = document.getElementById("navbar");
  window.addEventListener(
    "scroll",
    function () {
      if (!navbar) return;
      navbar.style.boxShadow =
        window.scrollY > 12 ? "0 8px 24px -12px rgba(0,0,0,.5)" : "none";
    },
    { passive: true }
  );

  /* ---------- Active nav link on scroll (IntersectionObserver) ---------- */
  var sections = document.querySelectorAll("section[id]");
  var navLinkEls = document.querySelectorAll("[data-nav]");

  if (sections.length && navLinkEls.length && "IntersectionObserver" in window) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute("id");
            navLinkEls.forEach(function (link) {
              link.classList.toggle(
                "active",
                link.getAttribute("href") === "#" + id
              );
            });
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (s) {
      navObserver.observe(s);
    });
  }

  /* ---------- Scroll-reveal for [data-reveal] elements ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length && "IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            var el = entry.target;
            setTimeout(function () {
              el.classList.add("is-visible");
            }, (i % 6) * 80);
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------- Contact form ----------
     GitHub Pages is static hosting only, so this form can't send email on
     its own. Default behavior: open the visitor's email client pre-filled
     via a mailto: link. To send silently in the background instead, sign
     up for a free endpoint at https://formspree.io and follow the README.
  ------------------------------------ */
  var form = document.getElementById("contactForm");
  var formNote = document.getElementById("formNote");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var message = form.message.value.trim();

      if (!name || !email || !message) {
        formNote.textContent = "Please fill in every field before sending.";
        formNote.classList.remove("is-success");
        return;
      }

      var subject = encodeURIComponent("Project inquiry from " + name);
      var body = encodeURIComponent(
        message + "\n\n— " + name + " (" + email + ")"
      );

      window.location.href =
        "mailto:dellydear98@gmail.com?subject=" + subject + "&body=" + body;

      formNote.textContent =
        "Opening your email client to send this message…";
      formNote.classList.add("is-success");
    });
  }
})();
