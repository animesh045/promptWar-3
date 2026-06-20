"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  User, 
  Calendar, 
  Camera, 
  MapPin, 
  MessageSquare, 
  Award, 
  Activity, 
  Settings as SettingsIcon,
  Sun, 
  Moon, 
  Flame, 
  Leaf,
  Bell
} from "lucide-react";
import { UserProfile, defaultProfile } from "@/lib/mockAi";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [notification, setNotification] = useState<string | null>(null);

  // Sync theme and profile with localStorage on mount
  useEffect(() => {
    setMounted(true);
    
    // Theme setup
    const savedTheme = localStorage.getItem("carbonos-theme") as "light" | "dark" | null;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const currentTheme = savedTheme || systemTheme;
    setTheme(currentTheme);
    document.documentElement.setAttribute("data-theme", currentTheme);

    // Profile setup
    const savedProfile = localStorage.getItem("carbonos-profile");
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (e) {
        localStorage.setItem("carbonos-profile", JSON.stringify(defaultProfile));
      }
    } else {
      localStorage.setItem("carbonos-profile", JSON.stringify(defaultProfile));
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("carbonos-theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    
    // Show premium toast notification
    triggerNotification(`Switched to ${nextTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}`);
  };

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Carbon Twin", path: "/twin", icon: User },
    { name: "Time Machine", path: "/time-machine", icon: Calendar },
    { name: "Carbon Lens", path: "/scanner", icon: Camera },
    { name: "Travel Engine", path: "/travel", icon: MapPin },
    { name: "AI Coach", path: "/coach", icon: MessageSquare },
    { name: "Missions", path: "/missions", icon: Award },
    { name: "Impact Feed", path: "/feed", icon: Activity },
    { name: "Settings", path: "/settings", icon: SettingsIcon },
  ];

  if (!mounted) {
    return (
      <div style={{
        display: "flex", 
        height: "100vh", 
        alignItems: "center", 
        justifyContent: "center", 
        background: "#070b09",
        color: "var(--brand-500)",
        fontFamily: "sans-serif"
      }}>
        <div style={{ textAlign: "center" }}>
          <Leaf style={{ animation: "float 2s infinite" }} />
          <h3 style={{ marginTop: "1rem" }}>Booting CarbonOS...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="layout-container">
      {/* Top Bar for Mobile & Desktop branding */}
      <header className="app-header">
        <div className="header-logo-group" onClick={() => router.push("/")}>
          <div className="logo-icon-wrap">
            <Leaf className="logo-icon" />
          </div>
          <span className="logo-text">CARBON<span className="logo-subtext">OS</span></span>
        </div>

        <div className="header-stats-group">
          {/* Streak Indicator */}
          <div className="stat-pill streak-pill animate-float">
            <Flame className="streak-icon" />
            <span>{profile.streakDays} Day Streak</span>
          </div>

          {/* Carbon Score Pill */}
          <div className="stat-pill score-pill">
            <Leaf className="score-icon" />
            <span>Score: <strong>{profile.score}</strong></span>
          </div>

          {/* Theme Switcher */}
          <button 
            className="header-btn theme-btn" 
            onClick={toggleTheme} 
            aria-label="Toggle theme"
            aria-pressed={theme === "dark"}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notifications Trigger */}
          <button 
            className="header-btn notification-btn" 
            onClick={() => triggerNotification("You are on track to beat this week's carbon goals!")}
            aria-label="View notifications"
          >
            <Bell size={18} />
          </button>
        </div>
      </header>

      <div className="layout-body">
        {/* Arc-Style Sidebar (Desktop) */}
        <aside className="sidebar-nav">
          <div className="nav-items-container">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              return (
                <Link 
                  key={item.path} 
                  href={item.path} 
                  className={`sidebar-link ${isActive ? "active" : ""}`}
                  aria-label={item.name}
                >
                  <Icon size={20} className="nav-icon" />
                  <span className="nav-label">{item.name}</span>
                  {isActive && <div className="active-indicator" />}
                </Link>
              );
            })}
          </div>

          <div className="sidebar-footer">
            <div className="user-profile-summary">
              <div className="user-avatar">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <span className="user-name">{profile.name}</span>
                <span className="user-role">Sustainer</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="content-viewport">
          <div className="content-container">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Nav Bar (Mobile only) */}
      <nav className="bottom-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link 
              key={item.path} 
              href={item.path} 
              className={`bottom-nav-link ${isActive ? "active" : ""}`}
              aria-label={item.name}
            >
              <Icon size={20} />
              <span className="bottom-nav-label">{item.name.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>

      {/* Premium Toast Notification Banner */}
      {notification && (
        <div className="toast-notification animate-float" role="alert">
          <Leaf size={16} className="toast-icon" />
          <span>{notification}</span>
        </div>
      )}

      {/* Inline styles for layouts (Vanilla CSS structure) */}
      <style jsx>{`
        .layout-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          width: 100%;
          background: var(--bg-primary);
        }

        .app-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 2rem;
          background: rgba(12, 18, 15, 0.4);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .header-logo-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
        }

        .logo-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: linear-gradient(135deg, var(--brand-400) 0%, var(--brand-600) 100%);
          color: white;
          box-shadow: 0 4px 10px var(--brand-glow);
        }

        :global(.logo-icon) {
          width: 18px !important;
          height: 18px !important;
        }

        .logo-text {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1.25rem;
          letter-spacing: 0.05em;
          color: var(--text-primary);
        }

        .logo-subtext {
          color: var(--brand-500);
        }

        .header-stats-group {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 0.85rem;
          border-radius: 99px;
          font-size: 0.85rem;
          font-weight: 600;
          border: 1px solid var(--border-color);
        }

        .streak-pill {
          background: var(--orange-glow);
          color: var(--orange-500);
          border-color: rgba(249, 115, 22, 0.2);
        }

        :global(.streak-icon) {
          fill: var(--orange-500);
          width: 16px;
          height: 16px;
        }

        .score-pill {
          background: var(--brand-glow);
          color: var(--brand-500);
          border-color: var(--border-color);
        }

        :global(.score-icon) {
          width: 16px;
          height: 16px;
        }

        .header-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid var(--border-color);
          background: rgba(255, 255, 255, 0.03);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .header-btn:hover {
          color: var(--brand-500);
          border-color: var(--brand-400);
          background: rgba(16, 185, 129, 0.05);
        }

        .layout-body {
          display: flex;
          flex: 1;
          position: relative;
        }

        /* Sidebar Nav Styling */
        .sidebar-nav {
          width: 250px;
          border-right: 1px solid var(--border-color);
          background: rgba(12, 18, 15, 0.2);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 1.5rem 1rem;
          position: sticky;
          top: 57px;
          height: calc(100vh - 57px);
          z-index: 40;
        }

        .nav-items-container {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        :global(.sidebar-link) {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          color: var(--text-secondary);
          text-decoration: none;
          font-weight: 500;
          font-size: 0.95rem;
          transition: all var(--transition-fast);
          position: relative;
        }

        :global(.sidebar-link:hover) {
          color: var(--text-primary);
          background: rgba(16, 185, 129, 0.05);
        }

        :global(.sidebar-link.active) {
          color: var(--brand-500);
          background: var(--brand-glow);
          font-weight: 600;
        }

        .active-indicator {
          position: absolute;
          left: 0;
          top: 25%;
          width: 4px;
          height: 50%;
          background: var(--brand-500);
          border-radius: 0 4px 4px 0;
        }

        .sidebar-footer {
          border-top: 1px solid var(--border-color);
          padding-top: 1rem;
        }

        .user-profile-summary {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 99px;
          background: linear-gradient(135deg, var(--brand-500) 0%, var(--blue-500) 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-family: var(--font-display);
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
          max-width: 140px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-role {
          font-size: 0.75rem;
          color: var(--text-tertiary);
        }

        /* Content Area */
        .content-viewport {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          min-width: 0; /* Prevents flex box blowout */
        }

        .content-container {
          flex: 1;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 2.5rem;
          padding-bottom: 5rem; /* Space for mobile nav if wrapping */
        }

        /* Bottom Nav (Mobile) Styling */
        .bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(12, 18, 15, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid var(--border-color);
          padding: 0.5rem 0.25rem;
          z-index: 45;
          justify-content: space-around;
        }

        :global(.bottom-nav-link) {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.2rem;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.65rem;
          font-weight: 500;
          transition: color var(--transition-fast);
          flex: 1;
          min-width: 0;
        }

        :global(.bottom-nav-link:hover) {
          color: var(--text-primary);
        }

        :global(.bottom-nav-link.active) {
          color: var(--brand-500);
        }

        .bottom-nav-label {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
          text-align: center;
        }

        /* Toast Alert Banner */
        .toast-notification {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          background: var(--bg-secondary);
          border: 1px solid var(--brand-500);
          box-shadow: 0 10px 30px rgba(16, 185, 129, 0.25);
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          z-index: 100;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
          backdrop-filter: blur(10px);
        }

        :global(.toast-icon) {
          color: var(--brand-500);
        }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .sidebar-nav {
            width: 80px;
            padding: 1.5rem 0.5rem;
            align-items: center;
          }
          .nav-label {
            display: none;
          }
          :global(.sidebar-link) {
            justify-content: center;
            width: 44px;
            height: 44px;
            padding: 0;
          }
          .user-info {
            display: none;
          }
          .user-avatar {
            margin: 0 auto;
          }
        }

        @media (max-width: 768px) {
          .app-header {
            padding: 0.75rem 1rem;
          }
          .sidebar-nav {
            display: none;
          }
          .bottom-nav {
            display: flex;
          }
          .content-container {
            padding: 1.5rem 1rem;
            padding-bottom: 6rem;
          }
          .streak-pill span {
            display: none;
          }
          .score-pill span {
            display: none;
          }
          .streak-pill {
            padding: 0.4rem;
          }
          .score-pill {
            padding: 0.4rem;
          }
          .toast-notification {
            bottom: 5.5rem;
            right: 1rem;
            left: 1rem;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
