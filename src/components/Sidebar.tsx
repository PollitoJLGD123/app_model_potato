"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Layers,
  CheckCircle,
  Camera,
  Info,
  ImageIcon,
  Map,
  ArrowLeft,
} from "@/components/ui-icons";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type NavItem = {
  label: string;
  path: string;
  icon?: React.ReactElement;
};

const navItems: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: <Layers /> },
  {
    label: "Evaluación Completa",
    path: "/dashboard/evaluation-complete",
    icon: <CheckCircle />,
  },
  { label: "Tiempo Real", path: "/dashboard/realtime", icon: <Camera /> },
  {
    label: "Recomendaciones",
    path: "/dashboard/recommendations",
    icon: <Info />,
  },
  {
    label: "Dataset y Modelos",
    path: "/dashboard/dataset",
    icon: <ImageIcon />,
  },
  { label: "Módulos", path: "/dashboard/modulos", icon: <Map /> },
  { label: "Periodos", path: "/dashboard/periodos", icon: <Layers /> },
  { label: "Historial", path: "/dashboard/history", icon: <ArrowLeft /> },
  {
    label: "Diagnóstico del Cultivo",
    path: "/dashboard/diagnosis",
    icon: <Info />,
  },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigate = (path: string) => {
    router.push(path);
    onClose(); // close the drawer on mobile
  };

  return (
    <aside
      className={`w-72 bg-white border-r border-slate-200 shrink-0 flex flex-col transition-all h-full ${
        isOpen ? "block absolute z-20 shadow-xl" : "hidden lg:block"
      } lg:relative`}
    >
      {/* mobile close icon */}
      <div className="lg:hidden p-2 flex justify-end">
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-500 hover:bg-slate-100"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="p-3 border-b border-slate-200 bg-white space-y-1">
        {navItems.map((item) => {
          let active = false;
          if (item.path === "/dashboard") {
            active = pathname === "/dashboard" || pathname === "/dashboard/";
          } else {
            active =
              pathname === item.path || pathname.startsWith(item.path + "/");
          }
          const baseClasses =
            `w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors ` +
            (active
              ? "bg-emerald-100 text-emerald-700"
              : "text-slate-700 hover:bg-slate-100");

          return (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={baseClasses}
            >
              {item.icon &&
                React.cloneElement(item.icon as React.ReactElement<any>, {
                  className: active ? "text-emerald-700" : "text-slate-400",
                  size: 20,
                })}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
