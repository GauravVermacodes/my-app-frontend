import React from "react";
import { useTheme } from "../context/ThemeContext";

const ThemeToggle = () => {
  const { theme, changeTheme } = useTheme();

  const themes = [
    { value: "light", icon: "☀️" },
    { value: "dark", icon: "🌙" },
    { value: "auto", icon: "⚙️" },
  ];

  return (
    <div className="theme-toggle">
      {themes.map((t) => (
        <button
          key={t.value}
          onClick={() => changeTheme(t.value)}
          className={`theme-btn ${theme === t.value ? "active" : ""}`}
        >
          {t.icon}
        </button>
      ))}
    </div>
  );
};

export default ThemeToggle;