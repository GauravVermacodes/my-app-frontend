import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Subscription = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(null);
  const [currentPlan, setCurrentPlan] = useState("free");
  const [billingCycle, setBillingCycle] = useState("monthly");

  // ✅ Responsive breakpoints
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isSmallMobile = windowWidth < 400;
  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

  useEffect(() => {
    fetchPlans();
    fetchActive();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data } = await API.get("/subscription/plans");
      setPlans(data.plans);
    } catch (e) {
      toast.error("Failed to load plans");
    }
  };

  const fetchActive = async () => {
    try {
      const { data } = await API.get("/subscription/history");
      setActive(data);
      setCurrentPlan(data.currentPlan || "free");
    } catch (e) {}
  };

  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });

  const handleSubscribe = async (planId) => {
    if (planId === "free" || planId === currentPlan) return;

    const planOrder = ["free", "bronze", "silver", "gold"];
    if (
      planOrder.indexOf(planId) < planOrder.indexOf(currentPlan) &&
      !window.confirm(`Downgrade to ${planId.toUpperCase()}?`)
    )
      return;

    setLoading(true);
    const ok = await loadRazorpay();
    if (!ok) {
      toast.error("Payment gateway failed");
      setLoading(false);
      return;
    }

    try {
      const { data } = await API.post("/subscription/create-order", { plan: planId });
      const rzp = new window.Razorpay({
        key: data.key,
        amount: data.order.amount,
        currency: "INR",
        name: "WatchNest",
        description: `${planId.toUpperCase()} Plan`,
        order_id: data.order.id,
        handler: async (res) => {
          try {
            await API.post("/subscription/verify-payment", {
              razorpay_order_id: res.razorpay_order_id,
              razorpay_payment_id: res.razorpay_payment_id,
              razorpay_signature: res.razorpay_signature,
            });
            toast.success(`🎉 ${planId.toUpperCase()} Activated!`);
            const u = { ...user, plan: planId };
            localStorage.setItem("user", JSON.stringify(u));
            if (setUser) setUser(u);
            setCurrentPlan(planId);
            fetchActive();
            setTimeout(() => navigate("/"), 1500);
          } catch {
            toast.error("Verification failed");
          }
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#6366f1" },
        modal: { ondismiss: () => setLoading(false) },
      });
      rzp.on("payment.failed", (r) => toast.error(r.error.description));
      rzp.open();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Cancel subscription?")) return;
    try {
      await API.post("/subscription/cancel");
      toast.success("Downgraded to free");
      const u = { ...user, plan: "free" };
      localStorage.setItem("user", JSON.stringify(u));
      if (setUser) setUser(u);
      setCurrentPlan("free");
      fetchActive();
    } catch {
      toast.error("Failed");
    }
  };

  const CONFIGS = {
    free: {
      icon: "🎁",
      gradient: "linear-gradient(135deg,#64748b,#475569)",
      light: "#f1f5f9",
      tag: "Get started",
      popular: false,
    },
    bronze: {
      icon: "🥉",
      gradient: "linear-gradient(135deg,#f59e0b,#d97706)",
      light: "#fffbeb",
      tag: "For casual viewers",
      popular: false,
    },
    silver: {
      icon: "🥈",
      gradient: "linear-gradient(135deg,#6366f1,#4f46e5)",
      light: "#eef2ff",
      tag: "Best value",
      popular: true,
    },
    gold: {
      icon: "👑",
      gradient: "linear-gradient(135deg,#f59e0b,#ea580c)",
      light: "#fff7ed",
      tag: "Ultimate access",
      popular: false,
    },
  };

  const btnState = (id) => {
    const o = ["free", "bronze", "silver", "gold"];
    const ci = o.indexOf(currentPlan);
    const ti = o.indexOf(id);
    if (id === currentPlan) return { text: "Current Plan", disabled: true, type: "current" };
    if (id === "free") return { text: "Default", disabled: true, type: "free" };
    if (ti > ci) return { text: "Upgrade", disabled: false, type: "upgrade" };
    return { text: "Downgrade", disabled: false, type: "downgrade" };
  };

  const yearlyPrice = (p) => (p ? Math.floor(p * 12 * 0.83) : 0);

  const S = getStyles(isMobile, isTablet, isSmallMobile);

  return (
    <div style={S.page}>
      <style>{`
        * { -webkit-tap-highlight-color: transparent; }
        html, body { overflow-x: hidden; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .compare-table-wrap::-webkit-scrollbar { height: 8px; }
        .compare-table-wrap::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        .compare-table-wrap::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        @media (hover: hover) {
          .plan-card:hover {
            transform: translateY(-4px) !important;
            box-shadow: 0 20px 50px rgba(99,102,241,0.2) !important;
          }
          .subscribe-btn:not(:disabled):hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 16px rgba(99,102,241,0.3);
          }
          .toggle-btn:hover:not(.active) {
            background: #f1f5f9 !important;
          }
          .cancel-btn:hover {
            background: rgba(255,255,255,0.25) !important;
          }
          .faq-card:hover {
            border-color: #6366f1 !important;
            box-shadow: 0 4px 12px rgba(99,102,241,0.08) !important;
          }
        }
      `}</style>

      {/* HERO */}
      <div style={S.hero}>
        <span style={S.badge}>⭐ PREMIUM PLANS</span>
        <h1 style={S.heroTitle}>
          Find the perfect plan for{" "}
          <span style={S.gradient}>your needs</span>
        </h1>
        <p style={S.heroSub}>
          Unlock premium features, ad-free viewing, and exclusive content
        </p>
        <div style={S.trustRow}>
          {["🔒 Secure Payment", "💳 Cancel Anytime", "⚡ Instant Access"].map(
            (t) => (
              <span key={t} style={S.trustItem}>
                {t}
              </span>
            )
          )}
        </div>
      </div>

      {/* ACTIVE BANNER */}
      {active?.activeSubscription && currentPlan !== "free" && (
        <div style={S.activeBanner}>
          <div style={S.activeLeft}>
            <div style={S.activeIcon}>{CONFIGS[currentPlan]?.icon}</div>
            <div style={{ minWidth: 0 }}>
              <div style={S.activeLabel}>ACTIVE PLAN</div>
              <div style={S.activeName}>{currentPlan.toUpperCase()}</div>
              <div style={S.activeExpiry}>
                Renews{" "}
                {new Date(active.activeSubscription.endDate).toLocaleDateString(
                  "en-IN",
                  { year: "numeric", month: isMobile ? "short" : "long", day: "numeric" }
                )}
              </div>
            </div>
          </div>
          <button onClick={handleCancel} className="cancel-btn" style={S.cancelBtn}>
            Cancel
          </button>
        </div>
      )}

      {/* BILLING TOGGLE */}
      <div style={S.toggleWrap}>
        <div style={S.toggle}>
          {["monthly", "yearly"].map((c) => (
            <button
              key={c}
              onClick={() => setBillingCycle(c)}
              className={`toggle-btn ${billingCycle === c ? "active" : ""}`}
              style={{
                ...S.toggleBtn,
                ...(billingCycle === c ? S.toggleActive : {}),
              }}
            >
              {c === "monthly" ? "Monthly" : "Yearly"}
              {c === "yearly" && <span style={S.saveTag}>-17%</span>}
            </button>
          ))}
        </div>
      </div>

      {/* PLANS */}
      <div style={S.grid}>
        {plans.map((plan) => {
          const c = CONFIGS[plan.id] || CONFIGS.free;
          const isCurrent = plan.id === currentPlan;
          const bs = btnState(plan.id);
          const price =
            billingCycle === "yearly" ? yearlyPrice(plan.price) : plan.price;

          return (
            <div
              key={plan.id}
              className="plan-card"
              style={{
                ...S.card,
                borderColor: isCurrent || c.popular ? "#6366f1" : "#e2e8f0",
                background: isCurrent ? c.light : "#fff",
                transform: c.popular && !isCurrent && !isMobile ? "scale(1.02)" : "none",
                boxShadow:
                  c.popular || isCurrent
                    ? "0 20px 50px rgba(99,102,241,0.15)"
                    : "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              {c.popular && !isCurrent && (
                <div style={S.popularBadge}>⭐ POPULAR</div>
              )}
              {isCurrent && <div style={S.currentBadge}>✓ ACTIVE</div>}

              <div style={{ ...S.iconWrap, background: c.gradient }}>
                <span style={{ fontSize: isMobile ? 28 : 32 }}>{c.icon}</span>
              </div>

              <h2 style={S.planName}>{plan.name}</h2>
              <p style={S.planTag}>{c.tag}</p>

              <div style={S.priceWrap}>
                <span style={S.currency}>₹</span>
                <span style={S.price}>{price}</span>
                <span style={S.period}>
                  /{billingCycle === "yearly" ? "yr" : "mo"}
                </span>
              </div>

              {billingCycle === "yearly" && plan.price > 0 && (
                <div style={S.savingsText}>
                  Save ₹{plan.price * 12 - price}/year
                </div>
              )}

              <div style={S.divider} />

              <ul style={S.features}>
                {plan.features.map((f, i) => (
                  <li key={i} style={S.feature}>
                    <span style={{ ...S.check, background: c.gradient }}>✓</span>
                    <span style={{ flex: 1, minWidth: 0 }}>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading || bs.disabled}
                className="subscribe-btn"
                style={{
                  ...S.btn,
                  background: bs.disabled
                    ? "#e2e8f0"
                    : bs.type === "downgrade"
                    ? "#64748b"
                    : c.gradient,
                  color: bs.disabled ? "#94a3b8" : "#fff",
                  cursor: bs.disabled ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "..." : bs.text}
              </button>
            </div>
          );
        })}
      </div>

      {/* COMPARE TABLE */}
      <div style={S.section}>
        <h2 style={S.sectionTitle}>Compare Plans</h2>
        <div className="compare-table-wrap" style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={{ ...S.th, textAlign: "left", position: isMobile ? "sticky" : "static", left: 0, background: "#f8fafc", zIndex: 2 }}>
                  Feature
                </th>
                {plans.map((p) => (
                  <th key={p.id} style={S.th}>
                    <span style={{ fontSize: isMobile ? 18 : 20 }}>{CONFIGS[p.id]?.icon}</span>
                    <div style={{ fontWeight: 700, marginTop: 4, fontSize: isMobile ? 12 : 13 }}>{p.name}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["🎬 Quality", "480p", "720p", "1080p", "4K"],
                ["📥 Downloads", "1/day", "3/day", "10/day", "∞"],
                ["🚫 No Ads", "❌", "✅", "✅", "✅"],
                ["⚡ Early Access", "❌", "❌", "✅", "✅"],
                ["📱 Devices", "1", "2", "3", "5"],
                ["🎧 Audio Mode", "❌", "❌", "✅", "✅"],
                ["🎁 Support", "—", "Email", "Priority", "24/7"],
              ].map(([label, ...vals], i) => (
                <tr key={i}>
                  <td style={{ ...S.td, fontWeight: 600, position: isMobile ? "sticky" : "static", left: 0, background: "#fff", zIndex: 1 }}>
                    {label}
                  </td>
                  {vals.map((v, j) => (
                    <td key={j} style={{ ...S.td, textAlign: "center" }}>
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isMobile && (
          <p style={S.scrollHint}>← Swipe to see all plans →</p>
        )}
      </div>

      {/* FAQ */}
      <div style={S.section}>
        <h2 style={S.sectionTitle}>FAQ</h2>
        <div style={S.faqGrid}>
          {[
            ["Can I change plans?", "Yes, upgrade or downgrade anytime."],
            ["How does billing work?", "Monthly on the same date. Cancel anytime."],
            ["Is payment secure?", "Yes, powered by Razorpay with bank-level security."],
            ["What if I cancel?", "Keep access until the billing period ends."],
          ].map(([q, a], i) => (
            <div key={i} className="faq-card" style={S.faqCard}>
              <h3 style={S.faqQ}>{q}</h3>
              <p style={S.faqA}>{a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div style={S.statsSection}>
        <div style={S.statsGrid}>
          {[
            ["500K+", "Members"],
            ["10M+", "Videos"],
            ["99.9%", "Uptime"],
            ["4.9★", "Rating"],
          ].map(([n, l], i) => (
            <div key={i} style={S.statCard}>
              <div style={S.statNum}>{n}</div>
              <div style={S.statLabel}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============ STYLES ============
const getStyles = (isMobile, isTablet, isSmallMobile) => ({
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    paddingBottom: isMobile ? 40 : 60,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif",
    width: "100%",
    overflowX: "hidden",
    boxSizing: "border-box",
  },

  // Hero
  hero: {
    textAlign: "center",
    padding: isSmallMobile ? "32px 16px 24px" : isMobile ? "40px 16px 28px" : "60px 20px 40px",
    background: "linear-gradient(180deg, #eef2ff, #f8fafc)",
  },
  badge: {
    display: "inline-block",
    padding: isMobile ? "5px 14px" : "6px 16px",
    background: "#eef2ff",
    color: "#6366f1",
    borderRadius: 20,
    fontSize: isMobile ? 11 : 12,
    fontWeight: 700,
    letterSpacing: 1,
    border: "1px solid #c7d2fe",
    marginBottom: isMobile ? 14 : 20,
  },
  heroTitle: {
    fontSize: isSmallMobile ? 24 : isMobile ? 28 : isTablet ? 36 : 44,
    fontWeight: 800,
    color: "#0f172a",
    margin: "0 0 12px",
    lineHeight: 1.2,
    letterSpacing: -1,
    padding: isMobile ? "0 8px" : 0,
  },
  gradient: {
    background: "linear-gradient(135deg, #6366f1, #ec4899)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroSub: {
    fontSize: isMobile ? 14 : 17,
    color: "#64748b",
    margin: "0 auto 24px",
    lineHeight: 1.6,
    maxWidth: 600,
    padding: isMobile ? "0 8px" : 0,
  },
  trustRow: {
    display: "flex",
    justifyContent: "center",
    gap: isMobile ? 12 : 20,
    flexWrap: "wrap",
    padding: isMobile ? "0 8px" : 0,
  },
  trustItem: {
    fontSize: isMobile ? 11 : 13,
    color: "#64748b",
    fontWeight: 500,
  },

  // Active banner
  activeBanner: {
    maxWidth: 1200,
    margin: isMobile ? "20px 12px 24px" : "0 auto 30px",
    padding: isMobile ? "16px 18px" : "20px 24px",
    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
    borderRadius: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#fff",
    flexWrap: "wrap",
    gap: 16,
    boxShadow: "0 8px 24px rgba(99,102,241,0.25)",
  },
  activeLeft: {
    display: "flex",
    alignItems: "center",
    gap: isMobile ? 12 : 16,
    minWidth: 0,
    flex: isMobile ? "1 1 100%" : "unset",
  },
  activeIcon: {
    width: isMobile ? 44 : 50,
    height: isMobile ? 44 : 50,
    background: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: isMobile ? 22 : 24,
    flexShrink: 0,
  },
  activeLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1,
    opacity: 0.8,
  },
  activeName: {
    fontSize: isMobile ? 18 : 22,
    fontWeight: 700,
  },
  activeExpiry: {
    fontSize: isMobile ? 12 : 13,
    opacity: 0.9,
  },
  cancelBtn: {
    padding: isMobile ? "8px 16px" : "10px 20px",
    background: "rgba(255,255,255,0.15)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: isMobile ? 13 : 14,
    width: isMobile ? "100%" : "auto",
    fontFamily: "inherit",
    transition: "all 0.2s",
  },

  // Toggle
  toggleWrap: {
    display: "flex",
    justifyContent: "center",
    marginBottom: isMobile ? 24 : 40,
    padding: isMobile ? "0 12px" : 0,
  },
  toggle: {
    display: "inline-flex",
    background: "#fff",
    borderRadius: 30,
    padding: 4,
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    width: isMobile ? "100%" : "auto",
    maxWidth: isMobile ? 400 : "none",
  },
  toggleBtn: {
    padding: isMobile ? "9px 16px" : "10px 24px",
    background: "transparent",
    color: "#64748b",
    border: "none",
    borderRadius: 30,
    cursor: "pointer",
    fontSize: isMobile ? 13 : 14,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    transition: "all 0.2s",
    flex: isMobile ? 1 : "unset",
    fontFamily: "inherit",
  },
  toggleActive: {
    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
    color: "#fff",
    boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
  },
  saveTag: {
    background: "#10b981",
    color: "#fff",
    padding: "2px 8px",
    borderRadius: 10,
    fontSize: 10,
    fontWeight: 700,
  },

  // Plans grid
  grid: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: isSmallMobile ? "0 12px" : isMobile ? "0 14px" : "0 20px",
    display: "grid",
    gridTemplateColumns: isMobile
      ? "1fr"
      : isTablet
      ? "repeat(2, 1fr)"
      : "repeat(auto-fit, minmax(260px, 1fr))",
    gap: isMobile ? 14 : 20,
    marginBottom: isMobile ? 40 : 60,
  },

  // Card
  card: {
    background: "#fff",
    borderRadius: isMobile ? 16 : 20,
    padding: isSmallMobile ? 20 : isMobile ? 22 : 28,
    textAlign: "center",
    position: "relative",
    border: "2px solid #e2e8f0",
    transition: "all 0.3s",
    boxSizing: "border-box",
  },
  popularBadge: {
    position: "absolute",
    top: -12,
    left: "50%",
    transform: "translateX(-50%)",
    background: "linear-gradient(135deg, #f59e0b, #ef4444)",
    color: "#fff",
    padding: isMobile ? "4px 12px" : "5px 16px",
    borderRadius: 20,
    fontSize: isMobile ? 10 : 11,
    fontWeight: 800,
    boxShadow: "0 4px 12px rgba(245,158,11,0.4)",
    whiteSpace: "nowrap",
  },
  currentBadge: {
    position: "absolute",
    top: -12,
    right: isMobile ? 12 : 16,
    background: "#6366f1",
    color: "#fff",
    padding: isMobile ? "4px 10px" : "5px 14px",
    borderRadius: 20,
    fontSize: isMobile ? 10 : 11,
    fontWeight: 800,
    whiteSpace: "nowrap",
  },
  iconWrap: {
    width: isMobile ? 56 : 64,
    height: isMobile ? 56 : 64,
    borderRadius: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 14px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
  },
  planName: {
    fontSize: isMobile ? 20 : 24,
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 4px",
    letterSpacing: -0.5,
  },
  planTag: {
    fontSize: isMobile ? 12 : 13,
    color: "#64748b",
    margin: "0 0 16px",
    fontWeight: 500,
  },
  priceWrap: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "center",
    gap: 2,
    marginBottom: 8,
  },
  currency: {
    fontSize: isMobile ? 18 : 20,
    fontWeight: 700,
    color: "#0f172a",
  },
  price: {
    fontSize: isMobile ? 36 : 44,
    fontWeight: 800,
    color: "#0f172a",
    lineHeight: 1,
    letterSpacing: -1,
  },
  period: {
    fontSize: isMobile ? 13 : 14,
    color: "#94a3b8",
    marginLeft: 4,
  },
  savingsText: {
    fontSize: isMobile ? 11 : 12,
    color: "#10b981",
    fontWeight: 600,
    padding: "4px 12px",
    background: "#ecfdf5",
    borderRadius: 20,
    display: "inline-block",
    marginBottom: 16,
  },
  divider: {
    height: 1,
    background: "#e2e8f0",
    margin: "16px 0",
  },
  features: {
    listStyle: "none",
    padding: 0,
    margin: "0 0 20px",
    textAlign: "left",
  },
  feature: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: isMobile ? "7px 0" : "8px 0",
    fontSize: isMobile ? 13 : 14,
    color: "#334155",
  },
  check: {
    width: 20,
    height: 20,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 10,
    color: "#fff",
    fontWeight: 700,
    flexShrink: 0,
  },
  btn: {
    width: "100%",
    padding: isMobile ? 13 : 14,
    border: "none",
    borderRadius: 12,
    fontSize: isMobile ? 13 : 14,
    fontWeight: 700,
    transition: "all 0.2s",
    fontFamily: "inherit",
  },

  // Sections
  section: {
    maxWidth: 1200,
    margin: isMobile ? "0 auto 40px" : "0 auto 60px",
    padding: isSmallMobile ? "0 12px" : isMobile ? "0 14px" : "0 20px",
  },
  sectionTitle: {
    fontSize: isMobile ? 22 : 32,
    fontWeight: 800,
    textAlign: "center",
    color: "#0f172a",
    marginBottom: isMobile ? 20 : 30,
    letterSpacing: -0.5,
  },

  // Compare table
  tableWrap: {
    background: "#fff",
    borderRadius: 16,
    overflow: "auto",
    overflowX: "auto",
    border: "1px solid #e2e8f0",
    WebkitOverflowScrolling: "touch",
    maxWidth: "100%",
  },
  table: {
    width: "100%",
    minWidth: isMobile ? 500 : "auto",
    borderCollapse: "collapse",
  },
  th: {
    padding: isMobile ? "12px 10px" : "16px",
    textAlign: "center",
    background: "#f8fafc",
    color: "#0f172a",
    fontSize: isMobile ? 11 : 13,
    fontWeight: 700,
    borderBottom: "1px solid #e2e8f0",
    whiteSpace: "nowrap",
  },
  td: {
    padding: isMobile ? "10px 10px" : "12px 16px",
    fontSize: isMobile ? 12 : 13,
    color: "#334155",
    borderBottom: "1px solid #f1f5f9",
    whiteSpace: "nowrap",
  },
  scrollHint: {
    textAlign: "center",
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 8,
    fontStyle: "italic",
  },

  // FAQ
  faqGrid: {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(260px, 1fr))",
    gap: isMobile ? 12 : 16,
  },
  faqCard: {
    background: "#fff",
    padding: isMobile ? 16 : 20,
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    transition: "all 0.2s",
  },
  faqQ: {
    fontSize: isMobile ? 14 : 15,
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 8px",
  },
  faqA: {
    fontSize: isMobile ? 12 : 13,
    color: "#64748b",
    margin: 0,
    lineHeight: 1.6,
  },

  // Stats
  statsSection: {
    maxWidth: 900,
    margin: isMobile ? "0 12px" : "0 auto",
    padding: isMobile ? "28px 16px" : "40px 20px",
    background: "#eef2ff",
    borderRadius: 20,
    textAlign: "center",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: isSmallMobile
      ? "1fr 1fr"
      : isMobile
      ? "1fr 1fr"
      : "repeat(auto-fit, minmax(180px, 1fr))",
    gap: isMobile ? 12 : 20,
  },
  statCard: {
    padding: isMobile ? 10 : 16,
  },
  statNum: {
    fontSize: isMobile ? 28 : 36,
    fontWeight: 800,
    background: "linear-gradient(135deg, #6366f1, #ec4899)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    lineHeight: 1.1,
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: isMobile ? 12 : 14,
    color: "#64748b",
    fontWeight: 600,
    marginTop: 4,
  },
});

export default Subscription;