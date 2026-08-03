import React, { createContext, useContext, useEffect, useState } from "react";
import API from "../api/axios";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("auto");
  const [autoTheme, setAutoTheme] = useState("light");

  // ✅ Determine auto theme based on time
  // Light: 6 AM to 6 PM
  // Dark: 6 PM to 6 AM
  const getAutoTheme = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 18) {
      return "light";
    }
    return "dark";
  };

  // ✅ Get active theme (resolves 'auto')
  const getActiveTheme = () => {
    if (theme === "auto") return getAutoTheme();
    return theme;
  };

  // Load user preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "auto";
    setTheme(savedTheme);

    // Set auto theme
    const auto = getAutoTheme();
    setAutoTheme(auto);
    console.log(`🎨 Current hour: ${new Date().getHours()} → Auto theme: ${auto}`);

    // Try to sync from user profile
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.theme && user.theme !== savedTheme) {
      setTheme(user.theme);
      localStorage.setItem("theme", user.theme);
    }
  }, []);

  // ✅ Auto-update theme every minute (in case time crosses 6 AM/6 PM)
  useEffect(() => {
    if (theme !== "auto") return;

    const interval = setInterval(() => {
      const newAuto = getAutoTheme();
      if (newAuto !== autoTheme) {
        setAutoTheme(newAuto);
        console.log(`🎨 Auto theme changed to: ${newAuto}`);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [theme, autoTheme]);

  // ✅ Apply theme to document
  useEffect(() => {
    const activeTheme = getActiveTheme();
    document.documentElement.setAttribute("data-theme", activeTheme);
    document.documentElement.style.colorScheme = activeTheme;
    
    // Also add class for CSS targeting
    document.body.className = `theme-${activeTheme}`;
    
    console.log(`🎨 Applied theme: ${activeTheme} (mode: ${theme})`);
  }, [theme, autoTheme]);

  // Manual theme change
  const changeTheme = async (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    // Update user profile in backend
    try {
      await API.put("/theme", { theme: newTheme });
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      user.theme = newTheme;
      localStorage.setItem("user", JSON.stringify(user));
    } catch (e) {
      console.log("Theme save failed:", e.message);
    }
  };

  const currentActiveTheme = getActiveTheme();

  return (
    <ThemeContext.Provider
      value={{
        theme,           // 'auto' | 'light' | 'dark' (user preference)
        activeTheme: currentActiveTheme,  // actual applied theme
        autoTheme,       // what auto mode currently is
        changeTheme,
        isAuto: theme === "auto",
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);