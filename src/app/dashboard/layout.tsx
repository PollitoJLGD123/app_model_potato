"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Leaf, Menu } from "@/components/ui-icons";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    setIsCheckingAuth(false);
  }, [router]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 to-emerald-50 text-gray-600">
        Verificando sesión...
      </div>
    );
  }

  const isActive = (path: string) =>
    pathname === path
      ? "bg-emerald-100 text-emerald-700"
      : "text-slate-700 hover:bg-slate-100";

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 selection:bg-emerald-200 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm shrink-0">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              className="lg:hidden p-2 rounded-md text-slate-500 hover:bg-slate-100"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu size={20} />
            </button>
            <button
              className="flex items-center space-x-2"
              onClick={() => router.push("/dashboard/modulos")}
            >
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                <Leaf size={20} />
              </div>
              <span className="font-bold text-xl text-slate-800 tracking-tight">
                Agro<span className="text-emerald-600">Vision</span>
              </span>
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-2 rounded-md"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden h-[calc(100vh-4rem)] relative">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/50 z-10 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <aside
          className={`w-72 bg-white border-r border-slate-200 shrink-0 flex flex-col transition-all h-full ${isSidebarOpen ? "block absolute z-20 shadow-xl" : "hidden lg:block"} lg:relative sticky top-0`}
        >
          <div className="p-3 border-b border-slate-200 bg-white space-y-1">
            <button
              onClick={() => router.push("/dashboard/modulos")}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === "/dashboard/modulos" ? "bg-emerald-100 text-emerald-700" : "text-slate-700 hover:bg-slate-100"}`}
            >
              Dashboard
            </button>

            <button
              onClick={() => router.push("/dashboard/evaluation-complete")}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/dashboard/evaluation-complete")}`}
            >
              Evaluación Completa
            </button>
            <button
              onClick={() => router.push("/dashboard/evaluation-batch")}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/dashboard/evaluation-batch")}`}
            >
              📂 Evaluación por Bloques
            </button>
            <button
              onClick={() => router.push("/dashboard/realtime")}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/dashboard/realtime")}`}
            >
              📹 Tiempo Real
            </button>
            <button
              onClick={() => router.push("/dashboard/recommendations")}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/dashboard/recommendations")}`}
            >
              🌿 Recomendaciones
            </button>
            <button
              onClick={() => router.push("/dashboard/dataset")}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/dashboard/dataset")}`}
            >
              📊 Dataset y Modelos
            </button>
            <button
              onClick={() => router.push("/dashboard/modulos")}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname.startsWith("/dashboard/modulos") ? "bg-emerald-100 text-emerald-700" : "text-slate-700 hover:bg-slate-100"}`}
            >
              📁 Módulos
            </button>
            <button
              onClick={() => router.push("/dashboard/history")}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/dashboard/history")}`}
            >
              🕘 Historial
            </button>
            <button
              onClick={() => router.push("/dashboard/diagnosis")}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/dashboard/diagnosis")}`}
            >
              🩺 Diagnóstico del Cultivo
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto w-full">{children}</main>
      </div>
    </div>
  );
}
