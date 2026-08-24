"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import axiosClient, {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from "../lib/axiosClient";
import "../styles/admin-dashboard.css";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "▦" },
  { href: "/admin/contact-us", label: "Contact Us", icon: "✉" },
  { href: "/admin/subscribers", label: "Subscribers", icon: "📩" },
];

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/contact-us": "Contact Us",
  "/admin/subscribers": "Subscribers",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      if (getAccessToken()) {
        if (!cancelled) setChecking(false);
        return;
      }

      try {
        const res = await axiosClient.post("/admin/refresh-token");
        if (cancelled) return;

        if (!res.data?.success || !res.data?.accessToken) {
          router.replace("/login");
          return;
        }

        setAccessToken(res.data.accessToken);
        setChecking(false);
      } catch {
        if (!cancelled) router.replace("/login");
      }
    };

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      await axiosClient.post("/admin/logout");
    } catch {
      // ignore network errors on logout — clear local state regardless
    } finally {
      clearAccessToken();
      router.push("/login");
    }
  };

  if (checking) {
    return <div className="adminGuard">Checking session...</div>;
  }

  const pageTitle = PAGE_TITLES[pathname ?? ""] ?? "Dashboard";
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="adminShell">
      <aside className={`adminSidebar${collapsed ? " collapsed" : ""}`}>
        <div className="adminSidebar-brand">
          <span className="adminSidebar-logo">A</span>
          {!collapsed && <span className="adminSidebar-brandText">Admin Panel</span>}
        </div>

        {!collapsed && <div className="adminSidebar-sectionLabel">Menu</div>}
        <nav className="adminSidebar-nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`adminSidebar-link${pathname === item.href ? " active" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <span className="adminSidebar-linkIcon">{item.icon}</span>
              {!collapsed && (
                <span className="adminSidebar-linkText">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>

        <div className="adminSidebar-footer">
          <button className="adminSidebar-logout" onClick={handleLogout}>
            {!collapsed && "Logout"}
            {collapsed && "⎋"}
          </button>
          <button
            className="adminSidebar-collapseBtn"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? "»" : "« Collapse"}
          </button>
        </div>
      </aside>

      <div className="adminBody">
        <header className="adminTopbar">
          <div>
            <div className="adminTopbar-title">{pageTitle}</div>
            <div className="adminTopbar-date">{today}</div>
          </div>
          <div className="adminTopbar-right">
            <button className="adminTopbar-iconBtn" aria-label="Notifications">
              🔔
            </button>
            <div className="adminTopbar-user">
              <span className="adminTopbar-avatar">A</span>
              <span className="adminTopbar-username">Admin</span>
            </div>
          </div>
        </header>

        <main className="adminMain">{children}</main>
      </div>
    </div>
  );
}
