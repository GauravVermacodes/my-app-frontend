// App.jsx (Merged — TASK2 base + Meeting features ADDED)
import React, { useState, useEffect, createContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ToastContainer, toast } from "react-toastify";
import { io } from "socket.io-client";
import "react-toastify/dist/ReactToastify.css";
import authService from "./services/authService";
import WatchList from "./pages/WatchList";
import UserProfile from "./pages/UserProfile";  // ✅ ADD THIS

// ==================== CONTEXTS (TASK2) ====================
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

// ✅ Re-export AuthContext for meeting pages
export { AuthContext,useAuth} from "./context/AuthContext";

// ✅ NEW: Meeting Contexts
export const NotificationContext = createContext(null);
export const FriendContext = createContext(null);

// ==================== SERVICES (NEW - Meeting) ====================
import notificationService from "./services/notificationService";
import friendService from "./services/friendService";

// ==================== SOCKET URL ====================
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

// ==================== COMPONENTS (TASK2) ====================
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import PlaylistPlayer from "./pages/PlaylistPlayer";

// ==================== PAGES (TASK2) ====================
import AuthCallback from "./pages/AuthCallback";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OTPVerify from "./pages/OTPVerify";
import VideoPlayer from "./pages/VideoPlayer";
import Subscription from "./pages/Subscription";
import Upload from "./pages/Upload";
import Profile from "./pages/Profile";
import History from "./pages/History";
import Playlists from "./pages/Playlists";
import Downloads from "./pages/Downloads";
import MyClips from "./pages/MyClips";
import Shorts from "./pages/Shorts";
import SecuritySettings from "./pages/SecuritySettings";
import ContentFilter from "./pages/ContentFilter";
import MyVideos from "./pages/MyVideos";

// ✅ Series Pages (TASK2)
import CreateSeries from "./pages/CreateSeries";
import EditSeries from "./pages/EditSeries";
import MySeries from "./pages/MySeries";
import SearchResults from "./pages/SearchResults";

// ✅ NEW: Meeting Pages (from Video-Streaming)
import Dashboard from "./pages/Dashboard";         // Meeting dashboard
import CreateRoom from "./pages/CreateRoom";
import JoinRoom from "./pages/JoinRoom";
import WatchRoom from "./pages/WatchRoom";
import Friends from "./pages/Friends";
import Notifications from "./pages/Notifications";

// ==================== ROUTE GUARDS ====================

// Protected Route
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

// Public Route
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/" />;
};

const AppLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  const getMainMargin = () => {
    if (isMobile) return 0;
    if (isTablet) return 72;
    return sidebarCollapsed ? 72 : 240;
  };

  const handleToggle = () => setSidebarCollapsed(prev => !prev);

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f7" }}>
      <Navbar onMenuToggle={handleToggle} />
      <Sidebar collapsed={sidebarCollapsed} onToggle={handleToggle} />
      <main
        style={{
          marginLeft: getMainMargin(),
          transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {children}
      </main>
    </div>
  );
};

// ==================== MEETING FEATURES PROVIDER ====================
// This wraps children with NotificationContext + FriendContext + Socket
const MeetingProvider = ({ children }) => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);

  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);

  // Fetch initial data when authenticated
  useEffect(() => {
    if (token && user) {
      fetchNotifications();
      fetchUnreadCount();
      fetchFriends();
      fetchPendingRequests();
    }
  }, [token, user]);

  // Real-time notification socket
  useEffect(() => {
    if (!token || !user) return;

    console.log("🔌 Connecting notification socket...");
    const socket = io(`${SOCKET_URL}/room`, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("✅ Notification socket connected");
    });

    socket.on("newNotification", (notification) => {
      console.log("📬 New notification:", notification);

      setNotifications((prev) => {
        if (prev.some((n) => n._id === notification._id)) return prev;
        return [notification, ...prev];
      });
      setUnreadCount((prev) => prev + 1);

      const icon =
        notification.type === "meeting_invite"
          ? "📹"
          : notification.type === "friend_request"
          ? "👋"
          : notification.type === "friend_request_accepted"
          ? "🎉"
          : "🔔";

      toast.info(
        <div>
          <strong>
            {icon} {notification.sender?.username}
          </strong>
          <br />
          <small>{notification.message}</small>
        </div>,
        {
          position: "top-right",
          autoClose: 6000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          onClick: () => {
            if (
              notification.type === "meeting_invite" &&
              notification.roomCode
            ) {
              window.location.href = `/join/${notification.roomCode}`;
            }
          },
        }
      );

      if (notification.type === "friend_request_accepted") {
        fetchFriends();
      }
    });

    socket.on("friendRequestUpdate", () => {
      fetchPendingRequests();
      fetchFriends();
    });

    socket.on("disconnect", () => {
      console.log("🔌 Notification socket disconnected");
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
    });

    return () => {
      console.log("🔌 Disconnecting notification socket");
      socket.disconnect();
    };
  }, [token, user]);

  // ── Notification Functions ──
  const fetchNotifications = async () => {
    setNotifLoading(true);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setNotifLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      fetchUnreadCount();
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const deleteAllNotifications = async () => {
    try {
      await notificationService.deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to delete all notifications:", err);
    }
  };

  // ── Friend Functions ──
  const fetchFriends = async () => {
    try {
      const data = await authService.getFriends();
      setFriends(data.friends || []);
    } catch (err) {
      console.error("Failed to fetch friends:", err);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const data = await friendService.getPendingRequests();
      setPendingRequests(data.requests || []);
    } catch (err) {
      console.error("Failed to fetch pending requests:", err);
    }
  };

  const fetchSentRequests = async () => {
    try {
      const data = await friendService.getSentRequests();
      setSentRequests(data.requests || []);
    } catch (err) {
      console.error("Failed to fetch sent requests:", err);
    }
  };

  const sendFriendRequest = async (recipientId) => {
    const data = await friendService.sendFriendRequest(recipientId);
    await fetchSentRequests();
    return data;
  };

  const acceptFriendRequest = async (requestId) => {
    const data = await friendService.acceptFriendRequest(requestId);
    setPendingRequests((prev) => prev.filter((r) => r._id !== requestId));
    await fetchFriends();
    return data;
  };

  const declineFriendRequest = async (requestId) => {
    const data = await friendService.declineFriendRequest(requestId);
    setPendingRequests((prev) => prev.filter((r) => r._id !== requestId));
    return data;
  };

  const removeFriend = async (friendId) => {
    const data = await friendService.removeFriend(friendId);
    setFriends((prev) => prev.filter((f) => f._id !== friendId));
    return data;
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        notifLoading,
        fetchNotifications,
        fetchUnreadCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        deleteAllNotifications,
      }}
    >
      <FriendContext.Provider
        value={{
          friends,
          pendingRequests,
          sentRequests,
          fetchFriends,
          fetchPendingRequests,
          fetchSentRequests,
          sendFriendRequest,
          acceptFriendRequest,
          declineFriendRequest,
          removeFriend,
        }}
      >
        {children}
      </FriendContext.Provider>
    </NotificationContext.Provider>
  );
};

// ==================== ROUTES ====================
const AppRoutes = () => {
  return (
    <Routes>
      {/* ==================== AUTH ROUTES ==================== */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route path="/verify-otp" element={<OTPVerify />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* ==================== MAIN ROUTES ==================== */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Home />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/shorts"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Shorts />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      {/* ✅ USER PROFILE - View other users' profiles */}
      <Route
        path="/user/:userId"
        element={
          <ProtectedRoute>
            <AppLayout>
              <UserProfile />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-videos"
        element={
          <ProtectedRoute>
            <AppLayout>
              <MyVideos />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/video/:id"
        element={
          <ProtectedRoute>
            <AppLayout>
              <VideoPlayer />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Upload />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/subscription"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Subscription />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* ==================== SEARCH ==================== */}
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <AppLayout>
              <SearchResults />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* ==================== SERIES ==================== */}
      <Route
        path="/my-series"
        element={
          <ProtectedRoute>
            <AppLayout>
              <MySeries />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-series"
        element={
          <ProtectedRoute>
            <AppLayout>
              <CreateSeries />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-series/:id"
        element={
          <ProtectedRoute>
            <AppLayout>
              <EditSeries />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* ==================== LIBRARY ==================== */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Profile />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <AppLayout>
              <History />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/playlists"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Playlists />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/playlist/:id"
        element={
          <ProtectedRoute>
            <AppLayout>
              <PlaylistPlayer />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/downloads"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Downloads />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-clips"
        element={
          <ProtectedRoute>
            <AppLayout>
              <MyClips />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/content-filter"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ContentFilter />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* ==================== SECURITY ==================== */}
      <Route
        path="/security"
        element={
          <ProtectedRoute>
            <AppLayout>
              <SecuritySettings />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* ═══════════════════════════════════════════════════ */}
      {/*  ✅ NEW: MEETING ROUTES (from Video-Streaming)      */}
      {/* ═══════════════════════════════════════════════════ */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-room"
        element={
          <ProtectedRoute>
            <AppLayout>
              <CreateRoom />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/join"
        element={
          <ProtectedRoute>
            <AppLayout>
              <JoinRoom />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/join/:roomCode"
        element={
          <ProtectedRoute>
            <AppLayout>
              <JoinRoom />
            </AppLayout>
          </ProtectedRoute>
        }
        
      />
      <Route
        path="/room/:roomId"
        element={
          <ProtectedRoute>
            <WatchRoom />
          </ProtectedRoute>
        }
      />

      <Route
        path="/watch-list"
        element={
          <ProtectedRoute>
            <AppLayout>
              <WatchList />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/friends"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Friends />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Notifications />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

// ==================== MAIN APP ====================
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <MeetingProvider>
            <AppRoutes />

            {/* Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: "#333",
                  color: "#fff",
                },
              }}
            />

            {/* Meeting Notifications (react-toastify) */}
            <ToastContainer
              position="top-right"
              autoClose={3000}
              theme="light"
              newestOnTop
            />
          </MeetingProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;