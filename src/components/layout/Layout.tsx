import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAppStore } from "@/store";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { clsx } from "clsx";

export default function Layout() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const location = useLocation();
  const setCurrentModule = useAppStore((s) => s.setCurrentModule);

  useEffect(() => {
    const parts = location.pathname.split("/").filter(Boolean);
    setCurrentModule(parts[0] ?? null);
  }, [location.pathname, setCurrentModule]);

  return (
    <div className="flex h-screen bg-sand-50 dark:bg-gray-950 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => useAppStore.getState().setSidebarOpen(false)}
        />
      )}

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main
          className={clsx(
            "flex-1 overflow-y-auto overflow-x-hidden",
            "p-4 md:p-6 lg:p-8",
            "animate-fade-in"
          )}
        >
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
