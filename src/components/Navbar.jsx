import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import API from "../api/axios";
import toast from "react-hot-toast";
import BlockedSearchModal from "./BlockedSearchModal";

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "pt", name: "Português", flag: "🇧🇷" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "ta", name: "தமிழ்", flag: "🇮🇳" },
  { code: "bn", name: "বাংলা", flag: "🇧🇩" },
];

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const { theme, changeTheme } = useTheme();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);
  const [allVideos, setAllVideos] = useState([]);
  const [allSeries, setAllSeries] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [menuView, setMenuView] = useState("main");
  const [blockedSearchData, setBlockedSearchData] = useState(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(
    localStorage.getItem("preferredLanguage") || "en"
  );

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isSmallMobile = windowWidth < 480;

  const searchRef = useRef(null);
  const menuRef = useRef(null);
  const mobileSearchInputRef = useRef(null);

  const BACKEND = "http://localhost:5000";
  const getUrl = (u) => (!u ? "" : u.startsWith("http") ? u : `${BACKEND}${u}`);

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      try {
        const [videosRes, seriesRes] = await Promise.all([
          API.get("/videos?limit=100").catch(() => ({ data: { videos: [] } })),
          API.get("/series").catch(() => ({ data: { series: [] } })),
        ]);
        setAllVideos(videosRes.data.videos || []);
        setAllSeries(seriesRes.data.series || []);
      } catch (e) {
        console.log("Preload failed:", e.message);
      }
    };
    loadData();
  }, [user]);

  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem("recentSearches") || "[]");
    setRecentSearches(recent);
  }, []);

  useEffect(() => {
    if (mobileSearchOpen && mobileSearchInputRef.current) {
      setTimeout(() => mobileSearchInputRef.current.focus(), 100);
    }
  }, [mobileSearchOpen]);

  useEffect(() => {
    if (mobileSearchOpen || (isMobile && showMenu)) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileSearchOpen, isMobile, showMenu]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        if (mobileSearchOpen) setMobileSearchOpen(false);
        if (showMenu) {
          setShowMenu(false);
          setMenuView("main");
        }
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [mobileSearchOpen, showMenu]);

  useEffect(() => {
    if (!search.trim()) {
      setSuggestions([]);
      return;
    }
    const query = search.toLowerCase().trim();

    const videoMatches = allVideos
      .filter((v) => {
        const title = (v.title || "").toLowerCase();
        const desc = (v.description || "").toLowerCase();
        const uploader = (v.uploader?.name || "").toLowerCase();
        return title.includes(query) || desc.includes(query) || uploader.includes(query);
      })
      .slice(0, 5)
      .map((v) => ({
        type: "video",
        _id: v._id,
        title: v.title,
        thumbnail: v.thumbnailUrl,
        subtitle: v.uploader?.name || "Unknown",
        link: `/video/${v._id}`,
      }));

    const seriesMatches = allSeries
      .filter((s) => (s.title || "").toLowerCase().includes(query))
      .slice(0, 3)
      .map((s) => ({
        type: "series",
        _id: s._id,
        title: s.title,
        thumbnail: s.thumbnail || s.episodes?.[0]?.video?.thumbnailUrl,
        subtitle: `${s.episodes?.length || 0} episodes`,
        link: s.episodes?.[0]?.video
          ? `/video/${s.episodes[0].video._id || s.episodes[0].video}`
          : "#",
      }));

    setSuggestions([...videoMatches, ...seriesMatches]);
    setSelectedIdx(-1);
  }, [search, allVideos, allSeries]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
        setMenuView("main");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login");
    setShowMenu(false);
    setMenuView("main");
  };

  const handleSwitchAccount = () => {
    const isGoogleUser = user?.authProvider === "google" || user?.authProvider === "both";

    if (!isGoogleUser) {
      toast("Switch account is only available for Google-linked accounts.", {
        icon: "ℹ️", duration: 5000
      });
      setShowMenu(false);
      return;
    }

    toast.loading("Switching account...", { id: "switch-account" });
    setShowMenu(false);
    setMenuView("main");
    logout();

    setTimeout(() => {
      toast.dismiss("switch-account");
      const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      window.location.href = `${backendUrl}/api/auth/google?prompt=select_account`;
    }, 400);
  };

  const saveRecentSearch = (q) => {
    if (!q?.trim()) return;
    const updated = [q, ...recentSearches.filter((r) => r !== q)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const handleSearch = async (e, searchQuery) => {
    e?.preventDefault();
    const q = searchQuery || search;
    if (!q.trim()) return;

    try {
      const { data } = await API.post("/content-filter/check-search", { query: q });
      if (data.blocked) {
        setBlockedSearchData({
          query: q, reason: data.reason, severity: data.severity, email: user?.email,
        });
        setShowDropdown(false);
        setSearch("");
        return;
      }
    } catch (err) {}

    saveRecentSearch(q);
    setShowDropdown(false);
    setSearch(q);
    setMobileSearchOpen(false);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleSuggestionClick = async (suggestion) => {
    saveRecentSearch(suggestion.title);
    setShowDropdown(false);
    setSearch("");
    setMobileSearchOpen(false);
    navigate(suggestion.link);
  };

  const handleKeyDown = (e) => {
    const items = search ? suggestions : recentSearches;
    if (!items.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => (i < items.length - 1 ? i + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => (i > 0 ? i - 1 : items.length - 1));
    } else if (e.key === "Enter" && selectedIdx >= 0) {
      e.preventDefault();
      if (search) handleSuggestionClick(suggestions[selectedIdx]);
      else handleSearch(null, recentSearches[selectedIdx]);
    } else if (e.key === "Escape") setShowDropdown(false);
  };

  const removeRecent = (item, e) => {
    e.stopPropagation();
    const updated = recentSearches.filter((r) => r !== item);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const clearAllRecent = (e) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const handleThemeChange = (newTheme) => {
    changeTheme(newTheme);
    toast.success(`Theme: ${newTheme}`);
  };

  const handleLanguageChange = (langCode) => {
    setCurrentLang(langCode);
    localStorage.setItem("preferredLanguage", langCode);
    const selectEl = document.querySelector(".goog-te-combo");
    if (selectEl) {
      selectEl.value = langCode;
      selectEl.dispatchEvent(new Event("change"));
    } else {
      document.cookie = `googtrans=/en/${langCode}; path=/`;
      window.location.reload();
    }
    toast.success(`Language: ${LANGUAGES.find((l) => l.code === langCode)?.name}`);
    setMenuView("main");
  };

  const TYPE_ICONS = { video: "🎬", series: "📺", channel: "👤" };
  const currentLangObj = LANGUAGES.find((l) => l.code === currentLang);
  const isGoogleUser = user?.authProvider === "google" || user?.authProvider === "both";

  const renderSearchDropdown = (isInMobileOverlay = false) => (
    <div className={isInMobileOverlay ? "wn-mobile-dropdown" : "wn-dropdown"}>
      {search && suggestions.length > 0 && (
        <div>
          <div className="wn-dropdown-header">
            <span>🔎 SUGGESTIONS ({suggestions.length})</span>
          </div>
          {suggestions.map((s, i) => (
            <div
              key={`${s.type}-${s._id}`}
              onClick={() => handleSuggestionClick(s)}
              onMouseEnter={() => setSelectedIdx(i)}
              className={`wn-dropdown-item ${selectedIdx === i ? "active" : ""}`}
            >
              {s.thumbnail ? (
                <img src={getUrl(s.thumbnail)} alt="" className="wn-dropdown-thumb"
                  onError={(e) => (e.target.style.display = "none")} />
              ) : (
                <div className="wn-dropdown-thumb wn-dropdown-thumb-placeholder">
                  {TYPE_ICONS[s.type]}
                </div>
              )}
              <div className="wn-dropdown-info">
                <div className="wn-dropdown-title">{s.title}</div>
                <div className="wn-dropdown-sub">{TYPE_ICONS[s.type]} {s.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!search && recentSearches.length > 0 && (
        <div>
          <div className="wn-dropdown-header wn-dropdown-header-flex">
            <span>🕐 RECENT SEARCHES</span>
            <button onClick={clearAllRecent} className="wn-clear-all">Clear all</button>
          </div>
          {recentSearches.map((item, i) => (
            <div key={i} onClick={() => handleSearch(null, item)}
              className={`wn-dropdown-item ${selectedIdx === i ? "active" : ""}`}>
              <span style={{ fontSize: 16, width: 30, textAlign: "center" }}>🕐</span>
              <div className="wn-dropdown-info">{item}</div>
              <button onClick={(e) => removeRecent(item, e)} className="wn-remove-btn">✕</button>
            </div>
          ))}
        </div>
      )}

      {search && suggestions.length === 0 && (
        <div style={{ padding: "24px 16px", textAlign: "center", color: "#6b7280", fontSize: 14 }}>
          No results found for "{search}"
        </div>
      )}

      {!search && recentSearches.length === 0 && (
        <div style={{ padding: "24px 16px", textAlign: "center", color: "#6b7280", fontSize: 14 }}>
          Start typing to search videos, series & more
        </div>
      )}
    </div>
  );

  return (
    <>
      <nav className="wn-navbar">
        {/* LEFT */}
        <div className="wn-nav-left">
          <button className="wn-menu-btn" onClick={onMenuToggle} aria-label="Menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <Link to="/" className="wn-logo">
            <div className="wn-logo-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#fbbf24" strokeWidth="2"/>
                <polygon points="10 8 16 12 10 16 10 8" fill="#fbbf24"/>
              </svg>
            </div>
            <span className="wn-logo-text">WatchNest</span>
          </Link>

          <div className="wn-nav-tabs">
            <Link to="/" className="wn-tab wn-tab-active">Home</Link>
          </div>
        </div>

        {/* CENTER - SEARCH */}
        <div className="wn-nav-center" ref={searchRef}>
          <form onSubmit={handleSearch} className="wn-search-box">
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={handleKeyDown}
              placeholder="Explore videos, series, live events..."
            />
            {search && (
              <button type="button" className="wn-search-clear"
                onClick={() => { setSearch(""); setSuggestions([]); }}>✕</button>
            )}
            <button type="submit" className="wn-search-btn" aria-label="Search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </form>

          {showDropdown && (search || recentSearches.length > 0) && renderSearchDropdown(false)}
        </div>

        {/* RIGHT */}
        <div className="wn-nav-right">
          <button className="wn-icon-btn wn-mobile-search-btn"
            onClick={() => setMobileSearchOpen(true)} aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {user && (
            <>
              <button className="wn-create-btn wn-hide-sm" onClick={() => navigate("/upload")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginRight: 6 }}>
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
                <span>Create</span>
              </button>

              <button className="wn-icon-btn wn-show-sm-only"
                onClick={() => navigate("/upload")} aria-label="Create">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>

              <button className="wn-icon-btn wn-hide-xs" aria-label="Notifications">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2a7 7 0 00-7 7v4l-2 3h18l-2-3V9a7 7 0 00-7-7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M10 20a2 2 0 004 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>

              <div ref={menuRef} style={{ position: "relative" }}>
                <div className="wn-avatar"
                  onClick={() => { setShowMenu(!showMenu); setMenuView("main"); }}>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name}
                      style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                      onError={(e) => { e.target.style.display = "none"; }} />
                  ) : (user.name?.charAt(0).toUpperCase())}
                </div>

                {showMenu && (
                  <>
                    {isMobile && (
                      <div className="wn-menu-backdrop"
                        onClick={() => { setShowMenu(false); setMenuView("main"); }} />
                    )}

                    <div className={`wn-user-menu ${isMobile ? "wn-user-menu-mobile" : ""}`}>
                      {isMobile && (
                        <button className="wn-menu-close"
                          onClick={() => { setShowMenu(false); setMenuView("main"); }}
                          aria-label="Close menu">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </button>
                      )}

                      {menuView === "main" && (
                        <>
                          <div className="wn-menu-profile">
                            <div className="wn-menu-profile-top">
                              <div className="wn-menu-avatar-lg">
                                {user.avatar ? (
                                  <img src={user.avatar} alt={user.name}
                                    style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                                ) : (user.name?.charAt(0).toUpperCase())}
                              </div>
                              <div className="wn-menu-profile-info">
                                <div className="wn-menu-profile-name">
                                  {user.name}
                                  {user.authProvider === "google" && (
                                    <span className="wn-auth-badge wn-auth-badge-google">
                                      <svg width="10" height="10" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                      </svg>
                                      Google
                                    </span>
                                  )}
                                </div>
                                <div className="wn-menu-profile-handle">{user.email}</div>
                              </div>
                            </div>
                            <Link to="/profile" onClick={() => setShowMenu(false)} className="wn-view-channel-btn">
                              View your profile
                            </Link>
                          </div>

                          <div className="wn-menu-divider" />
                          {isGoogleUser && (
                            <MenuItem icon={<GoogleIcon />} label="Google Account"
                              onClick={() => window.open("https://myaccount.google.com/", "_blank")} />
                          )}
                          {isGoogleUser && (
                            <MenuItem icon={<SwitchIcon />} label="Switch account" hasArrow onClick={handleSwitchAccount} />
                          )}
                          <MenuItem icon={<SignOutIcon />} label="Sign out" onClick={handleLogout} />
                          <div className="wn-menu-divider" />
                          <MenuItem icon={<StudioIcon />} label="Creator Studio"
                            onClick={() => { navigate("/my-videos"); setShowMenu(false); }} />
                          <MenuItem icon={<PurchaseIcon />} label="Purchases and memberships"
                            onClick={() => { navigate("/subscription"); setShowMenu(false); }} />
                          <div className="wn-menu-divider" />
                          <MenuItem icon={<DataIcon />} label="Your data in WatchNest"
                            onClick={() => { navigate("/profile"); setShowMenu(false); }} />
                          <MenuItem icon={<ThemeIcon />}
                            label={`Appearance: ${theme === "auto" ? "Auto" : theme.charAt(0).toUpperCase() + theme.slice(1)}`}
                            hasArrow onClick={() => setMenuView("theme")} />
                          <MenuItem icon={<LanguageIcon />}
                            label={`Language: ${currentLangObj?.name || "English"}`}
                            hasArrow onClick={() => setMenuView("language")} />
                          <MenuItem icon={<RestrictedIcon />} label="Restricted Mode: Off" hasArrow
                            onClick={() => { navigate("/content-filter"); setShowMenu(false); }} />
                          <div className="wn-menu-divider" />
                          <MenuItem icon={<SettingsIcon />} label="Settings"
                            onClick={() => { navigate("/security"); setShowMenu(false); }} />
                          <MenuItem icon={<HelpIcon />} label="Help"
                            onClick={() => { toast("Help center coming soon!", { icon: "❓" }); }} />
                        </>
                      )}

                      {menuView === "theme" && (
                        <>
                          <div className="wn-submenu-header">
                            <button onClick={() => setMenuView("main")} className="wn-back-btn">←</button>
                            <span>Appearance</span>
                          </div>
                          <div className="wn-submenu-desc">Setting applies to this browser only</div>
                          {[
                            { id: "auto", icon: "⚙️", label: "Use device theme", desc: "Follows system" },
                            { id: "light", icon: "☀️", label: "Light theme", desc: "Bright & clean" },
                            { id: "dark", icon: "🌙", label: "Dark theme", desc: "Easy on eyes" },
                          ].map((opt) => (
                            <div key={opt.id}
                              className={`wn-theme-option ${theme === opt.id ? "active" : ""}`}
                              onClick={() => handleThemeChange(opt.id)}>
                              <div className="wn-theme-icon">{opt.icon}</div>
                              <div style={{ flex: 1 }}>
                                <div className="wn-theme-label">{opt.label}</div>
                                <div className="wn-theme-desc">{opt.desc}</div>
                              </div>
                              {theme === opt.id && <div className="wn-check-icon">✓</div>}
                            </div>
                          ))}
                        </>
                      )}

                      {menuView === "language" && (
                        <>
                          <div className="wn-submenu-header">
                            <button onClick={() => setMenuView("main")} className="wn-back-btn">←</button>
                            <span>Choose your language</span>
                          </div>
                          <div className="wn-submenu-desc">Setting applies to this browser</div>
                          <div className="wn-language-list">
                            {LANGUAGES.map((lang) => (
                              <div key={lang.code}
                                className={`wn-lang-option ${currentLang === lang.code ? "active" : ""}`}
                                onClick={() => handleLanguageChange(lang.code)}>
                                <span className="wn-lang-flag">{lang.flag}</span>
                                <span className="wn-lang-name">{lang.name}</span>
                                {currentLang === lang.code && <div className="wn-check-icon">✓</div>}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {!user && <Link to="/login" className="wn-signin-btn">Sign In</Link>}
        </div>
      </nav>

      {mobileSearchOpen && (
        <div className="wn-mobile-search">
          <div className="wn-mobile-search-header">
            <button className="wn-mobile-back-btn"
              onClick={() => { setMobileSearchOpen(false); setSearch(""); }}
              aria-label="Close search">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <form onSubmit={handleSearch} className="wn-mobile-search-form">
              <input ref={mobileSearchInputRef} type="text" value={search}
                onChange={(e) => setSearch(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Search WatchNest..." autoFocus />
              {search && (
                <button type="button" className="wn-mobile-clear-btn"
                  onClick={() => { setSearch(""); setSuggestions([]); }} aria-label="Clear">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#e5e7eb"/>
                    <line x1="15" y1="9" x2="9" y2="15" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="9" y1="9" x2="15" y2="15" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </form>
            <button className="wn-mobile-search-submit" onClick={handleSearch} aria-label="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="wn-mobile-search-content">{renderSearchDropdown(true)}</div>
        </div>
      )}

      <BlockedSearchModal
        isOpen={!!blockedSearchData}
        onClose={() => setBlockedSearchData(null)}
        query={blockedSearchData?.query}
        reason={blockedSearchData?.reason}
        severity={blockedSearchData?.severity}
        email={blockedSearchData?.email}
      />

      <div id="google_translate_element" style={{ display: "none" }}></div>
      <style>{navbarStyles}</style>
    </>
  );
};

const MenuItem = ({ icon, label, hasArrow, onClick }) => (
  <div className="wn-menu-item" onClick={onClick}>
    <span className="wn-menu-icon">{icon}</span>
    <span className="wn-menu-label">{label}</span>
    {hasArrow && <span className="wn-menu-arrow">›</span>}
  </div>
);

// SVG Icons (unchanged)
const GoogleIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>);
const SwitchIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 11l-3-3m0 0l-3 3m3-3v12M16 3.13a4 4 0 010 7.75M9 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const SignOutIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const StudioIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const PurchaseIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>);
const DataIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>);
const ThemeIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const LanguageIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke="currentColor" strokeWidth="1.5"/></svg>);
const RestrictedIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="1.5"/></svg>);
const SettingsIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="1.5"/></svg>);
const HelpIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>);

// ============ NAVBAR STYLES ============
const navbarStyles = `
  * { -webkit-tap-highlight-color: transparent; }

  .wn-navbar {
    position: fixed;
    top: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 10px 20px;
    background: #ffffff;
    border-bottom: 1px solid #e5e7eb;
    height: 60px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    box-sizing: border-box;
    width: 100%;
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  }

  .wn-menu-btn {
    width: 40px; height: 40px; border-radius: 50%;
    background: transparent; border: none; color: #1a1a1a;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: all 0.15s;
  }
  .wn-menu-btn:hover { background: #f1f5f9; color: #1e293b; }
  .wn-menu-btn:active { transform: scale(0.95); }

  /* ✅ NEW LOGO with gold accent */
  .wn-logo {
    display: flex; align-items: center; gap: 8px;
    color: #1a1a1a; text-decoration: none;
    font-size: 18px; font-weight: 700; flex-shrink: 0;
  }
  .wn-logo-icon {
    width: 32px; height: 32px; border-radius: 50%;
    background: linear-gradient(135deg, #1e293b, #0f172a);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 2px 6px rgba(15,23,42,0.2);
  }
  .wn-logo-text {
    background: linear-gradient(135deg, #1e293b, #475569);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.02em;
  }

  .wn-nav-tabs { display: flex; margin-left: 12px; }
  .wn-tab {
    padding: 8px 14px; font-size: 14px; color: #6b7280;
    text-decoration: none; border-radius: 20px;
    font-weight: 500; position: relative; transition: color 0.15s;
  }
  .wn-tab-active { color: #1a1a1a; font-weight: 600; }
  .wn-tab-active::after {
    content: ''; position: absolute; bottom: -14px; left: 14px; right: 14px;
    height: 3px; background: linear-gradient(90deg, #fbbf24, #f59e0b);
    border-radius: 3px 3px 0 0;
  }

  .wn-nav-center { flex: 1; max-width: 640px; position: relative; min-width: 0; }

  .wn-search-box {
    display: flex; align-items: center;
    background: #f8fafc; border: 1px solid #e2e8f0;
    border-radius: 24px; padding: 4px 4px 4px 18px;
    transition: all 0.2s;
  }
  .wn-search-box:focus-within {
    background: white; border-color: #fbbf24;
    box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.1);
  }
  .wn-search-box input {
    flex: 1; border: none; background: transparent; outline: none;
    padding: 8px 0; font-size: 14px; color: #1a1a1a; min-width: 0;
  }
  .wn-search-clear {
    background: transparent; border: none; color: #6b7280;
    cursor: pointer; padding: 4px 8px; font-size: 14px;
  }
  .wn-search-btn {
    width: 38px; height: 38px; border-radius: 50%;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: white; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: all 0.15s;
    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.35);
  }
  .wn-search-btn:hover {
    background: linear-gradient(135deg, #d97706, #b45309);
    transform: scale(1.05);
  }
  .wn-search-btn:active { transform: scale(0.95); }

  .wn-nav-left { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
  .wn-nav-right { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }

  .wn-icon-btn {
    width: 40px; height: 40px; border-radius: 50%;
    background: transparent; border: none; color: #1a1a1a;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
  }
  .wn-icon-btn:hover { background: #f1f5f9; color: #1e293b; }
  .wn-icon-btn:active { transform: scale(0.95); }

  /* ✅ CREATE BUTTON - Gold gradient */
  .wn-create-btn {
    display: inline-flex; align-items: center;
    background: linear-gradient(135deg, #d97706, #b45309);
    color: white; border: none;
    padding: 8px 16px; border-radius: 20px;
    font-weight: 600; cursor: pointer; font-size: 13px;
    transition: all 0.2s; font-family: inherit;
    box-shadow: 0 2px 8px rgba(217, 119, 6, 0.35);
    letter-spacing: 0.01em;
  }
  .wn-create-btn:hover {
    background: linear-gradient(135deg, #b45309, #92400e);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(217, 119, 6, 0.45);
  }
  .wn-create-btn:active { transform: scale(0.98); }

  .wn-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: linear-gradient(135deg, #fbbf24, #d97706);
    color: white; display: flex; align-items: center; justify-content: center;
    font-weight: 700; cursor: pointer; overflow: hidden;
    flex-shrink: 0; transition: all 0.15s; font-size: 14px;
    border: 2px solid #fef3c7;
  }
  .wn-avatar:hover { transform: scale(1.05); border-color: #fbbf24; }
  .wn-avatar:active { transform: scale(0.95); }

  .wn-signin-btn {
    color: white; background: linear-gradient(135deg, #1e293b, #0f172a);
    padding: 8px 20px; border-radius: 20px; text-decoration: none;
    font-weight: 600; font-size: 14px;
  }

  /* ============ DROPDOWN ============ */
  .wn-dropdown {
    position: absolute; top: calc(100% + 8px); left: 0; right: 0;
    background: white; border-radius: 14px;
    border: 1px solid #e5e7eb; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);
    max-height: 480px; overflow-y: auto; z-index: 1000;
  }

  .wn-dropdown-header {
    padding: 12px 16px 6px; font-size: 10px; color: #6b7280;
    font-weight: 700; letter-spacing: 1px;
  }
  .wn-dropdown-header-flex { display: flex; justify-content: space-between; align-items: center; }
  .wn-dropdown-item {
    padding: 10px 16px; display: flex; align-items: center; gap: 12px;
    cursor: pointer; transition: background 0.15s;
  }
  .wn-dropdown-item:hover, .wn-dropdown-item.active { background: #fef3c7; }
  .wn-dropdown-thumb { width: 50px; height: 30px; object-fit: cover; border-radius: 4px; flex-shrink: 0; }
  .wn-dropdown-thumb-placeholder {
    background: #e5e7eb; display: flex; align-items: center;
    justify-content: center; font-size: 16px;
  }
  .wn-dropdown-info { flex: 1; min-width: 0; }
  .wn-dropdown-title {
    font-size: 13px; overflow: hidden; text-overflow: ellipsis;
    white-space: nowrap; color: #1a1a1a; font-weight: 500;
  }
  .wn-dropdown-sub { font-size: 11px; color: #6b7280; margin-top: 2px; }
  .wn-clear-all {
    background: transparent; border: none; color: #d97706;
    cursor: pointer; font-weight: 600; font-size: 11px;
  }
  .wn-remove-btn {
    background: transparent; border: none; color: #9ca3af;
    cursor: pointer; padding: 4px 8px; font-size: 12px;
  }
  .wn-remove-btn:hover { color: #ef4444; }

  /* ============ USER MENU ============ */
  .wn-menu-backdrop {
    position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4);
    z-index: 998; animation: fadeIn 0.2s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .wn-user-menu {
    position: absolute; top: calc(100% + 8px); right: 0;
    background: #ffffff; border: 1px solid #e5e7eb; border-radius: 14px;
    box-shadow: 0 12px 40px rgba(15, 23, 42, 0.15);
    min-width: 300px; max-width: 340px; padding: 8px 0;
    z-index: 999; max-height: 85vh; overflow-y: auto; scrollbar-width: thin;
  }
  .wn-user-menu::-webkit-scrollbar { width: 6px; }
  .wn-user-menu::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }

  .wn-user-menu-mobile {
    position: fixed !important; top: auto !important; right: 0 !important;
    bottom: 0 !important; left: 0 !important;
    min-width: 100%; max-width: 100%; max-height: 90vh;
    border-radius: 20px 20px 0 0; padding-top: 24px;
    animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

  .wn-menu-close {
    position: absolute; top: 12px; right: 12px;
    width: 32px; height: 32px; border-radius: 50%;
    background: #f3f4f6; border: none; color: #1a1a1a; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    z-index: 10; transition: all 0.15s;
  }
  .wn-menu-close:hover { background: #e5e7eb; }
  .wn-menu-close:active { transform: scale(0.9); }

  .wn-menu-profile { padding: 16px; border-bottom: 1px solid #e5e7eb; }
  .wn-menu-profile-top { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
  .wn-menu-avatar-lg {
    width: 44px; height: 44px; border-radius: 50%;
    background: linear-gradient(135deg, #fbbf24, #d97706);
    color: white; display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 18px; flex-shrink: 0; overflow: hidden;
    border: 2px solid #fef3c7;
  }
  .wn-menu-profile-info { flex: 1; min-width: 0; }
  .wn-menu-profile-name {
    font-weight: 600; color: #1a1a1a; font-size: 15px;
    display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
  }
  .wn-menu-profile-handle {
    font-size: 13px; color: #6b7280; margin-top: 2px;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap; word-break: break-all;
  }

  .wn-auth-badge {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 10px; font-weight: 600; padding: 2px 6px;
    border-radius: 4px; vertical-align: middle; flex-shrink: 0;
  }
  .wn-auth-badge-google { background: #eff6ff; color: #1e40af; border: 1px solid #dbeafe; }

  .wn-view-channel-btn {
    display: block; color: #d97706; text-decoration: none;
    font-size: 13px; font-weight: 600; padding: 4px 0;
    transition: opacity 0.2s;
  }
  .wn-view-channel-btn:hover { opacity: 0.8; }

  .wn-menu-divider { border-top: 1px solid #e5e7eb; margin: 6px 0; }

  .wn-menu-item {
    display: flex; align-items: center; gap: 14px;
    padding: 10px 16px; color: #1a1a1a; cursor: pointer;
    transition: background 0.15s; font-size: 14px; text-decoration: none;
  }
  .wn-menu-item:hover { background: #fef3c7; }
  .wn-menu-item:active { background: #fde68a; }

  .wn-menu-icon {
    width: 24px; height: 24px; display: flex;
    align-items: center; justify-content: center;
    color: #4b5563; flex-shrink: 0;
  }
  .wn-menu-label {
    flex: 1; font-size: 14px; overflow: hidden;
    text-overflow: ellipsis; white-space: nowrap;
  }
  .wn-menu-arrow { color: #9ca3af; font-size: 20px; line-height: 1; flex-shrink: 0; }

  .wn-submenu-header {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 16px; border-bottom: 1px solid #e5e7eb;
    font-weight: 600; color: #1a1a1a; font-size: 15px;
  }
  .wn-back-btn {
    background: transparent; border: none; color: #1a1a1a; cursor: pointer;
    font-size: 20px; width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    padding: 0; flex-shrink: 0;
  }
  .wn-back-btn:hover { background: #f3f4f6; }

  .wn-submenu-desc {
    padding: 12px 16px; font-size: 12px; color: #6b7280;
    border-bottom: 1px solid #f3f4f6;
  }

  .wn-theme-option {
    display: flex; align-items: center; gap: 14px;
    padding: 12px 16px; cursor: pointer; transition: background 0.15s;
  }
  .wn-theme-option:hover { background: #fef3c7; }
  .wn-theme-option.active { background: #fef3c7; }

  .wn-theme-icon { font-size: 24px; width: 32px; text-align: center; flex-shrink: 0; }
  .wn-theme-label { font-weight: 600; font-size: 14px; color: #1a1a1a; }
  .wn-theme-desc { font-size: 12px; color: #6b7280; margin-top: 2px; }
  .wn-check-icon { color: #d97706; font-weight: 700; font-size: 18px; flex-shrink: 0; }

  .wn-language-list { max-height: 400px; overflow-y: auto; }
  .wn-lang-option {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 16px; cursor: pointer; transition: background 0.15s;
  }
  .wn-lang-option:hover { background: #fef3c7; }
  .wn-lang-option.active { background: #fef3c7; color: #1a1a1a; font-weight: 600; }
  .wn-lang-flag { font-size: 20px; width: 30px; text-align: center; flex-shrink: 0; }
  .wn-lang-name { flex: 1; font-size: 14px; }

  /* ============ MOBILE SEARCH ============ */
  .wn-mobile-search {
    position: fixed; inset: 0; background: #ffffff;
    z-index: 2000; display: flex; flex-direction: column;
    animation: fadeIn 0.2s ease;
  }
  .wn-mobile-search-header {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 12px; border-bottom: 1px solid #e5e7eb;
    flex-shrink: 0; background: white;
  }
  .wn-mobile-back-btn {
    width: 40px; height: 40px; border-radius: 50%;
    background: transparent; border: none; color: #1a1a1a;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: all 0.15s;
  }
  .wn-mobile-back-btn:hover { background: #f3f4f6; }
  .wn-mobile-back-btn:active { transform: scale(0.95); }

  .wn-mobile-search-form {
    flex: 1; display: flex; align-items: center;
    background: #f3f4f6; border-radius: 24px;
    padding: 0 8px 0 16px; min-width: 0;
  }
  .wn-mobile-search-form input {
    flex: 1; border: none; background: transparent; outline: none;
    padding: 10px 0; font-size: 16px; color: #1a1a1a;
    min-width: 0; -webkit-appearance: none;
  }
  .wn-mobile-clear-btn {
    background: transparent; border: none; cursor: pointer;
    padding: 4px; display: flex; align-items: center;
    justify-content: center; flex-shrink: 0;
  }
  .wn-mobile-search-submit {
    width: 40px; height: 40px; border-radius: 50%;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: white; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: all 0.15s;
  }
  .wn-mobile-search-submit:hover { background: linear-gradient(135deg, #d97706, #b45309); }
  .wn-mobile-search-submit:active { transform: scale(0.95); }

  .wn-mobile-search-content {
    flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch;
  }
  .wn-mobile-dropdown { padding: 8px 0; }

  /* ============ RESPONSIVE ============ */
  .wn-hide-sm { display: inline-flex; }
  .wn-show-sm-only { display: none; }
  .wn-mobile-search-btn { display: none; }
  .wn-hide-xs { display: flex; }

  @media (max-width: 1024px) {
    .wn-nav-tabs { display: none; }
    .wn-navbar { padding: 10px 16px; gap: 12px; }
  }

  @media (max-width: 768px) {
    .wn-navbar { padding: 8px 10px; gap: 4px; height: 56px; }
    .wn-nav-center { display: none; }
    .wn-mobile-search-btn { display: flex; }
    .wn-hide-sm { display: none !important; }
    .wn-show-sm-only { display: flex !important; }
    .wn-nav-left { gap: 6px; }
    .wn-nav-right { gap: 2px; }
    .wn-logo { font-size: 16px; }
    .wn-menu-btn, .wn-icon-btn { width: 40px; height: 40px; }
    .wn-avatar { width: 34px; height: 34px; }
  }

  @media (max-width: 480px) {
    .wn-navbar { padding: 8px 8px; gap: 2px; }
    .wn-logo-text { display: none; }
    .wn-hide-xs { display: none; }
    .wn-nav-left { gap: 4px; }
    .wn-menu-btn, .wn-icon-btn { width: 38px; height: 38px; }
    .wn-avatar { width: 32px; height: 32px; font-size: 13px; }
  }

  @media (max-width: 380px) {
    .wn-navbar { padding: 6px; }
    .wn-menu-btn, .wn-icon-btn { width: 36px; height: 36px; }
  }

  @media (max-width: 768px) {
    .wn-mobile-search-form input, .wn-search-box input { font-size: 16px !important; }
  }
`;

export default Navbar;