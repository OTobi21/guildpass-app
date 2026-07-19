"use client";

import { useState, useCallback } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import type { Session } from "@/lib/auth/session";

/**
 * DashboardLayout wraps every dashboard page with the shared Sidebar + Header.
 *
 * On mobile (&lt;md) the sidebar is hidden by default and slides in as an overlay
 * when toggled via the hamburger button in the Header.  On desktop (&gt;=md) the
 * sidebar is permanently visible inline — no behavioural change.
 *
 * The optional `session` prop is forwarded to the Sidebar so it can display
 * the current user's role and conditionally render permission-aware elements.
 */
export default function DashboardLayout({
  title,
  children,
  session,
}: {
  title: string;
  children: React.ReactNode;
  /** Active user session — forwarded to the Sidebar for role display. */
  session?: Session;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <Sidebar session={session} isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Backdrop overlay (mobile only) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Main content area */}
      <div className="flex-1 ml-0 md:ml-64">
        <Header title={title} onToggleSidebar={toggleSidebar} />
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
