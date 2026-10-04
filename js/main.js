import { translations } from "./i18n.js";

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

  /* ---------- Navbar shadow on scroll ---------- */
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

  /* ---------- Active nav link on scroll ---------- */
  var sections = document.querySelectorAll("section[id]");
  var navLinkEls = document.querySelectorAll("[data-nav]");
  if (sections.length && navLinkEls.length && "IntersectionObserver" in window) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute("id");
            navLinkEls.forEach(function (link) {
              link.classList.toggle("active", link.getAttribute("href") === "#" + id);
            });
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------- Scroll-reveal ---------- */
  function observeReveal(el) {
    if (!("IntersectionObserver" in window)) {
      el.classList.add("is-visible");
      return;
    }
    var obs = new IntersectionObserver(
      function (entries, o) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            o.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
  }
  document.querySelectorAll("[data-reveal]").forEach(function (el, i) {
    setTimeout(function () { observeReveal(el); }, (i % 6) * 60);
  });

  /* =========================================================
     LANGUAGE SWITCHER
  ========================================================= */
  var langBtn = document.getElementById("langBtn");
  var langMenu = document.getElementById("langMenu");
  var langSwitch = document.getElementById("langSwitch");
  var langCurrent = document.getElementById("langCurrent");
  var langCurrentFlag = document.getElementById("langCurrentFlag");
  var LANG_KEY = "portfolio-lang";
  var currentLang = localStorage.getItem(LANG_KEY) || "en";

  function applyLanguage(lang) {
    var dict = translations[lang] || translations.en;
    document.documentElement.setAttribute("lang", lang);
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (dict[key]) el.textContent = dict[key];
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-ph");
      if (dict[key]) el.setAttribute("placeholder", dict[key]);
    });
    if (langCurrent) langCurrent.textContent = lang.toUpperCase();
    var activeBtn = langMenu.querySelector('button[data-lang="' + lang + '"]');
    if (langCurrentFlag && activeBtn) {
      var flagCode = activeBtn.getAttribute("data-flag") || "gb";
      langCurrentFlag.className = "lang-flag fi fi-" + flagCode;
    }
    langMenu.querySelectorAll("button[data-lang]").forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-lang") === lang);
    });
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);
    startRoleTyper(); // restart with translated roles
    window.dispatchEvent(new CustomEvent("app:langchange", { detail: { lang: lang } }));
  }

  if (langBtn && langMenu && langSwitch) {
    langBtn.addEventListener("click", function () {
      var isOpen = langSwitch.classList.toggle("is-open");
      langBtn.setAttribute("aria-expanded", String(isOpen));
    });
    document.addEventListener("click", function (e) {
      if (!langSwitch.contains(e.target)) {
        langSwitch.classList.remove("is-open");
        langBtn.setAttribute("aria-expanded", "false");
      }
    });
    langMenu.querySelectorAll("button[data-lang]").forEach(function (b) {
      b.addEventListener("click", function () {
        applyLanguage(b.getAttribute("data-lang"));
        langSwitch.classList.remove("is-open");
      });
    });
  }

  applyLanguage(currentLang);

  /* =========================================================
     HERO ROLE TYPING EFFECT
  ========================================================= */
  var roleEl = document.getElementById("roleTyped");
  var typerTimeout = null;

  function startRoleTyper() {
    if (!roleEl) return;
    if (typerTimeout) clearTimeout(typerTimeout);

    var dict = translations[currentLang] || translations.en;
    var roles = [dict["hero.role1"], dict["hero.role2"], dict["hero.role3"]].filter(Boolean);
    if (!roles.length) return;

    var roleIndex = 0, charIndex = 0, deleting = false;

    function tick() {
      var word = roles[roleIndex];
      if (!deleting) {
        charIndex++;
        roleEl.textContent = word.slice(0, charIndex);
        if (charIndex === word.length) {
          deleting = true;
          typerTimeout = setTimeout(tick, 1600);
          return;
        }
      } else {
        charIndex--;
        roleEl.textContent = word.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
        }
      }
      typerTimeout = setTimeout(tick, deleting ? 35 : 65);
    }
    tick();
  }

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!prefersReducedMotion) {
    startRoleTyper();
  } else if (roleEl) {
    var dict0 = translations[currentLang] || translations.en;
    roleEl.textContent = dict0["hero.role1"];
  }

})();
