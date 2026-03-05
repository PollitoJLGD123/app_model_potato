"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Verificar si hay token
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const isActive = (path: string) => {
    return pathname === path
      ? "bg-green-100 text-green-700 border-l-4 border-green-600"
      : "text-gray-700 hover:bg-gray-50";
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg min-h-screen fixed left-0 top-0">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">
              Sistema de Detección
            </h2>
            <p className="text-sm text-gray-500 mt-1">Tizón Tardío</p>
          </div>

          <nav className="mt-6">
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 px-6 py-3 transition-colors ${isActive(
                "/dashboard",
              )}`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span className="font-medium">Dashboard</span>
            </Link>

            <Link
              href="/dashboard/evaluation"
              className={`flex items-center gap-3 px-6 py-3 transition-colors ${isActive(
                "/dashboard/evaluation",
              )}`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="font-medium">Evaluación</span>
            </Link>

            <Link
              href="/dashboard/evaluation-complete"
              className={`flex items-center gap-3 px-6 py-3 transition-colors ${isActive(
                "/dashboard/evaluation-complete",
              )}`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 9l2 2 4-4"
                />
              </svg>
              <span className="font-medium">Evaluación Completa</span>
            </Link>
          </nav>

          <div className="absolute bottom-0 w-full p-6 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 ml-64">{children}</main>
      </div>
    </div>
  );
}
