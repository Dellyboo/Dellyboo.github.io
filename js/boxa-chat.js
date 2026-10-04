import { translations } from "./i18n.js";

(function () {
  "use strict";

  var LANG_FLAGS = { en: "gb", fr: "fr", ja: "jp", sw: "tz", rn: "bi" };
  var SPEECH_LANG = { en: "en-US", fr: "fr-FR", ja: "ja-JP", sw: "sw-KE", rn: "rn-BI" };
  var BOXA_LANG_KEY = "boxa-lang";

  var boxaLang =
    localStorage.getItem(BOXA_LANG_KEY) ||
    localStorage.getItem("portfolio-lang") ||
    "en";

  function t(key) {
    var dict = translations[boxaLang] || translations.en;
    return dict[key] || key;
  }

  /* ---------- Elements ---------- */
  var toggle = document.getElementById("boxaToggle");
  var panel = document.getElementById("boxaPanel");
  var closeBtn = document.getElementById("boxaCloseBtn");
  var messagesEl = document.getElementById("boxaMessages");
  var typingEl = document.getElementById("boxaTyping");
  var form = document.getElementById("boxaForm");
  var input = document.getElementById("boxaInput");
  var sendBtn = document.getElementById("boxaSendBtn");
  var micBtn = document.getElementById("boxaMicBtn");
  var speakerBtn = document.getElementById("boxaSpeakerBtn");

  var langBtn = document.getElementById("boxaLangBtn");
  var langMenu = document.getElementById("boxaLangMenu");
  var langSwitch = document.getElementById("boxaLangSwitch");
  var langCurrent = document.getElementById("boxaLangCurrent");
  var langFlag = document.getElementById("boxaLangFlag");

  if (!toggle || !panel) return; // widget markup missing; nothing to wire up

  var isOpen = false;
  var hasGreeted = false;
  var voiceOn = false;
  var conversation = []; // [{role:'user'|'assistant', content:'...'}]

  /* =========================================================
     OPEN / CLOSE
  ========================================================= */
  function openPanel() {
    isOpen = true;
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    toggle.setAttribute("aria-expanded", "true");
    toggle.classList.add("is-open");
    if (!hasGreeted) {
      hasGreeted = true;
      addMessage("assistant", t("boxa.greeting"));
    }
    setTimeout(function () { input && input.focus(); }, 250);
  }
  function closePanel() {
    isOpen = false;
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
    toggle.classList.remove("is-open");
  }

  toggle.addEventListener("click", function () {
    isOpen ? closePanel() : openPanel();
  });
  closeBtn && closeBtn.addEventListener("click", closePanel);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen) closePanel();
  });

  /* =========================================================
     LANGUAGE SWITCH (independent of the site-wide one)
  ========================================================= */
  function applyBoxaLang(lang) {
    boxaLang = lang;
    localStorage.setItem(BOXA_LANG_KEY, lang);
    if (langCurrent) langCurrent.textContent = lang.toUpperCase();
    if (langFlag) langFlag.className = "lang-flag fi fi-" + (LANG_FLAGS[lang] || "gb");
    langMenu.querySelectorAll("button[data-lang]").forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-lang") === lang);
    });
    if (input) input.setAttribute("placeholder", t("boxa.placeholder"));
    if (micBtn) micBtn.setAttribute("aria-label", t("boxa.mic_start"));
    if (speakerBtn) {
      speakerBtn.setAttribute(
        "aria-label",
        voiceOn ? t("boxa.speaker_on") : t("boxa.speaker_off")
      );
    }
  }

  if (langBtn && langMenu && langSwitch) {
    langBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = langSwitch.classList.toggle("is-open");
      langBtn.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("click", function (e) {
      if (!langSwitch.contains(e.target)) {
        langSwitch.classList.remove("is-open");
        langBtn.setAttribute("aria-expanded", "false");
      }
    });
    langMenu.querySelectorAll("button[data-lang]").forEach(function (b) {
      b.addEventListener("click", function () {
        applyBoxaLang(b.getAttribute("data-lang"));
        langSwitch.classList.remove("is-open");
      });
    });
  }
  applyBoxaLang(boxaLang);

  /* =========================================================
     MESSAGE RENDERING
  ========================================================= */
  function addMessage(role, text) {
    var bubble = document.createElement("div");
    bubble.className = "boxa__msg boxa__msg--" + role;
    bubble.textContent = text;
    messagesEl.appendChild(bubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return bubble;
  }

  function setTyping(on) {
    typingEl.hidden = !on;
    if (on) messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  /* =========================================================
     BOXA'S BRAIN - a free, client-side, rule-based assistant.
     No backend, no API key, no billing account anywhere: it matches a
     few keywords in the visitor's message and answers using the site's
     own translated content, in whichever language is selected. It's not
     a full conversational AI (that would need a server holding a secret
     API key), but it covers the questions visitors actually ask, in all
     5 languages, for free.
  ========================================================= */
  var INTENTS = [
    {
      name: "contact",
      keywords: ["contact", "email", "reach", "phone", "wasiliana", "twandikire", "contacter", "contatti", "連絡", "メール"],
      build: function (dict) { return t("boxa.intent.contact_cta"); }
    },
    {
      name: "pricing",
      keywords: ["price", "cost", "budget", "how much", "rate", "bei", "gharama", "igiciro", "prix", "coût", "値段", "料金", "いくら"],
      build: function (dict) { return t("boxa.intent.pricing"); }
    },
    {
      name: "process",
      keywords: ["collaborate", "work together", "process", "how do we", "how does this work", "hire", "freelance", "kazi", "kushirikiana", "gukorana", "collaborer", "一緒", "協力", "進め方"],
      build: function (dict) { return t("boxa.intent.process"); }
    },
    {
      name: "projects",
      keywords: ["project", "portfolio", "github", "example", "miradi", "imigambi", "projet", "実績", "プロジェクト"],
      build: function (dict) {
        return (
          t("boxa.intent.projects_intro") +
          " Bar & Restaurant Management System, Request Management System, Live in Kobe - github.com/Dellyboo"
        );
      }
    },
    {
      name: "skills",
      keywords: ["skill", "technology", "stack", "language", "tech", "ujuzi", "ubuhanga", "compétence", "technologie", "スキル", "技術"],
      build: function (dict) {
        return (
          t("boxa.intent.skills_intro") +
          " " +
          [dict["skills.frontend"], dict["skills.backend"], dict["skills.database"], dict["skills.mobile"]].join(" · ")
        );
      }
    },
    {
      name: "services",
      keywords: ["service", "build for me", "can you build", "offer", "huduma", "serivisi", "service", "proposez", "サービス", "何が作れる"],
      build: function (dict) {
        return (
          t("boxa.intent.services_intro") +
          " " +
          [
            dict["services.web.title"],
            dict["services.mobile.title"],
            dict["services.db.title"],
            dict["services.automation.title"],
            dict["services.debug.title"],
            dict["services.logo.title"]
          ].join(" · ")
        );
      }
    },
    {
      name: "age",
      keywords: ["age", "old are you", "umri", "imyaka", "âge", "年齢", "いくつ"],
      build: function (dict) { return dict["about.age_value"] + " · " + dict["about.location_value"]; }
    },
    {
      name: "availability",
      keywords: ["available", "availability", "free right now", "busy", "patikana", "boneka", "disponible", "空いて", "対応"],
      build: function (dict) { return dict["about.availability_value"]; }
    },
    {
      name: "greeting",
      keywords: ["hi", "hello", "hey", "bonjour", "salut", "habari", "muraho", "yo", "こんにちは"],
      build: function (dict) { return t("boxa.greeting"); }
    }
  ];

  function generateReply(userText) {
    var lower = userText.toLowerCase();
    var dict = translations[boxaLang] || translations.en;
    for (var i = 0; i < INTENTS.length; i++) {
      var intent = INTENTS[i];
      for (var k = 0; k < intent.keywords.length; k++) {
        if (lower.indexOf(intent.keywords[k]) !== -1) {
          return intent.build(dict);
        }
      }
    }
    return t("boxa.intent.fallback");
  }

  function sendToBoxa(userText) {
    conversation.push({ role: "user", content: userText });
    setTyping(true);
    sendBtn.disabled = true;

    // Tiny delay so the typing indicator is visible and it feels alive,
    // rather than an instant canned reply appearing.
    setTimeout(function () {
      var reply = generateReply(userText);
      conversation.push({ role: "assistant", content: reply });
      addMessage("assistant", reply);
      if (voiceOn) speak(reply);
      setTyping(false);
      sendBtn.disabled = false;
    }, 500 + Math.random() * 400);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text) return;
    addMessage("user", text);
    input.value = "";
    sendToBoxa(text);
  });

  /* =========================================================
     VOICE OUTPUT (Web Speech API - SpeechSynthesis)
  ========================================================= */
  var synthSupported = "speechSynthesis" in window;

  function speak(text) {
    if (!synthSupported) return;
    try {
      window.speechSynthesis.cancel();
      var utter = new SpeechSynthesisUtterance(text);
      utter.lang = SPEECH_LANG[boxaLang] || "en-US";
      window.speechSynthesis.speak(utter);
    } catch (err) {
      console.warn("Speech synthesis failed:", err);
    }
  }

  if (speakerBtn) {
    if (!synthSupported) {
      speakerBtn.disabled = true;
      speakerBtn.title = t("boxa.voice_unsupported");
    } else {
      speakerBtn.addEventListener("click", function () {
        voiceOn = !voiceOn;
        speakerBtn.classList.toggle("is-active", voiceOn);
        speakerBtn.setAttribute("aria-pressed", String(voiceOn));
        speakerBtn.innerHTML = voiceOn
          ? '<i class="bi bi-volume-up-fill"></i>'
          : '<i class="bi bi-volume-mute-fill"></i>';
        if (!voiceOn) window.speechSynthesis.cancel();
      });
    }
  }

  /* =========================================================
     VOICE INPUT (Web Speech API - SpeechRecognition)
  ========================================================= */
  var SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
  var recognizer = null;
  var isListening = false;

  if (micBtn) {
    if (!SpeechRecognitionCtor) {
      micBtn.disabled = true;
      micBtn.title = t("boxa.voice_unsupported");
    } else {
      micBtn.addEventListener("click", function () {
        if (isListening) {
          recognizer && recognizer.stop();
          return;
        }
        recognizer = new SpeechRecognitionCtor();
        recognizer.lang = SPEECH_LANG[boxaLang] || "en-US";
        recognizer.interimResults = false;
        recognizer.maxAlternatives = 1;

        recognizer.onstart = function () {
          isListening = true;
          micBtn.classList.add("is-listening");
          input.setAttribute("placeholder", t("boxa.listening"));
        };
        recognizer.onresult = function (event) {
          var transcript = event.results[0][0].transcript;
          input.value = transcript;
        };
        recognizer.onerror = function (err) {
          console.warn("Speech recognition error:", err);
        };
        recognizer.onend = function () {
          isListening = false;
          micBtn.classList.remove("is-listening");
          input.setAttribute("placeholder", t("boxa.placeholder"));
        };

        try {
          recognizer.start();
        } catch (err) {
          console.warn("Could not start speech recognition:", err);
        }
      });
    }
  }
})();
