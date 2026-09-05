"use client";

import { Inbox, Sparkles, Clock, CheckCircle2, Archive } from "lucide-react";

// Dummy stats — replace with real API data later.
const STATS = [
  { label: "Total Contacts", value: "14", icon: Inbox, tone: "blue" },
  { label: "New This Week", value: "5", icon: Sparkles, tone: "purple" },
  { label: "Pending Replies", value: "3", icon: Clock, tone: "amber" },
  { label: "Resolved", value: "9", icon: CheckCircle2, tone: "green" },
];

export default function AdminDashboardPage() {
  return (
    <>
      <div className="adminMain-header">
        <h1 className="adminMain-title">Dashboard</h1>
        <p className="adminMain-subtitle">Overview of contact form activity</p>
      </div>

      <div className="adminStats-grid">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div className="adminStats-card" key={stat.label}>
              <div className={`adminStats-icon adminStats-icon--${stat.tone}`}>
                <Icon size={20} strokeWidth={2} />
              </div>
              <div>
                <div className="adminStats-value">{stat.value}</div>
                <div className="adminStats-label">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="adminPanel">
        <div className="adminPanel-header">
          <h2 className="adminPanel-title">Recent Activity</h2>
          <p className="adminPanel-subtitle">
            Real submissions will appear here once the API is connected
          </p>
        </div>
        <div className="adminPanel-empty">
          <span className="adminPanel-emptyIcon">
            <Archive size={26} strokeWidth={1.75} />
          </span>
          <p>No activity feed yet — this is a placeholder for future insights.</p>
        </div>
      </div>
    </>
  );
}
