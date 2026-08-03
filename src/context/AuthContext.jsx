// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";

// ✅ CHANGED: Added "export" keyword
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        refreshUser();
      } catch (e) {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  // Periodic session check (every 30 seconds)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      try {
        await API.get("/auth/session-status");
        // Session valid, do nothing
      } catch (e) {
        console.log("Session check failed");
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
  };

  const refreshUser = async () => {
    try {
      const { data } = await API.get("/auth/profile");
      const freshUser = {
        id: data._id,
        _id: data._id,
        name: data.name,
        email: data.email,
        plan: data.plan || "free",
        theme: data.theme,
        avatar: data.avatar,
        authProvider: data.authProvider,   // ✅ Added for switch account feature
      };
      localStorage.setItem("user", JSON.stringify(freshUser));
      setUser(freshUser);
      return freshUser;
    } catch (e) {
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, login, logout, updateUser, refreshUser, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);