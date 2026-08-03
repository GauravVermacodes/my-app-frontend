import React, { useState, useRef, useEffect } from "react";

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "pt", name: "Português", flag: "🇧🇷" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "ta", name: "தமிழ்", flag: "🇮🇳" },
  { code: "bn", name: "বাংলা", flag: "🇧🇩" },
  { code: "mr", name: "मराठी", flag: "🇮🇳" },
  { code: "gu", name: "ગુજરાતી", flag: "🇮🇳" },
];

const LanguageTranslator = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentLang, setCurrentLang] = useState("en");
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Load Google Translate script once
    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);

      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: LANGUAGES.map((l) => l.code).join(","),
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          "google_translate_element"
        );
        setScriptLoaded(true);
      };
    } else {
      setScriptLoaded(true);
    }

    // Get saved language
    const savedLang = localStorage.getItem("preferredLanguage") || "en";
    setCurrentLang(savedLang);

    // Close dropdown on outside click
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const changeLanguage = (langCode) => {
    setCurrentLang(langCode);
    localStorage.setItem("preferredLanguage", langCode);
    setShowDropdown(false);

    // Trigger Google Translate
    const selectEl = document.querySelector(".goog-te-combo");
    if (selectEl) {
      selectEl.value = langCode;
      selectEl.dispatchEvent(new Event("change"));
    } else {
      // Fallback: set cookie
      document.cookie = `googtrans=/en/${langCode}; path=/`;
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=.${window.location.hostname}`;
      window.location.reload();
    }
  };

  const currentLangObj = LANGUAGES.find((l) => l.code === currentLang);

  return (
    <>
      {/* Hidden Google Translate element */}
      <div id="google_translate_element" style={{ display: "none" }}></div>

      {/* Custom dropdown */}
      <div ref={dropdownRef} style={{ position: "relative" }}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          style={{
            background: "transparent",
            border: "none",
            color: "white",
            fontSize: 18,
            cursor: "pointer",
            padding: 8,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "background 0.2s",
          }}
          title="Change language"
        >
          <span>🌐</span>
          <span style={{ fontSize: 13 }}>
            {currentLangObj?.flag} {currentLangObj?.name}
          </span>
          <span style={{ fontSize: 10 }}>▼</span>
        </button>

        {showDropdown && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              width: 260,
              maxHeight: 400,
              background: "#1a1a20",
              borderRadius: 12,
              border: "1px solid #2a2a30",
              boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
              overflow: "hidden",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                padding: 12,
                borderBottom: "1px solid #2a2a30",
                color: "white",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              🌐 Select Language
            </div>
            <div style={{ maxHeight: 340, overflowY: "auto" }}>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background:
                      currentLang === lang.code
                        ? "rgba(6,95,212,0.2)"
                        : "transparent",
                    border: "none",
                    color: "white",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    fontSize: 14,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#2a2a30")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      currentLang === lang.code
                        ? "rgba(6,95,212,0.2)"
                        : "transparent")
                  }
                >
                  <span style={{ fontSize: 20 }}>{lang.flag}</span>
                  <span style={{ flex: 1 }}>{lang.name}</span>
                  {currentLang === lang.code && (
                    <span style={{ color: "#10b981" }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hide Google branding */}
      <style>{`
        .goog-te-banner-frame { display: none !important; }
        .goog-te-gadget { display: none !important; }
        body { top: 0 !important; }
        .skiptranslate { display: none !important; }
      `}</style>
    </>
  );
};

export default LanguageTranslator;