"use client";

import type React from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Home,
  Smartphone,
  QrCode,
  ActivityIcon as ActivityLog,
  User,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";

export function StudentSidebarNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    router.push("/");
  };

  return (
    <div className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-blue-700">
        <h1 className="text-xl font-bold">QMMUST</h1>
        <p className="text-xs text-blue-200">Gate Pass System</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <NavLink href="/student/dashboard" pathname={pathname} icon={Home}>
          Dashboard
        </NavLink>
        <NavLink
          href="/student/generate-pass"
          pathname={pathname}
          icon={QrCode}
        >
          Generate Pass
        </NavLink>
        <NavLink href="/student/devices" pathname={pathname} icon={Smartphone}>
          My Devices
        </NavLink>
        <NavLink
          href="/student/movements"
          pathname={pathname}
          icon={ActivityLog}
        >
          Movement Logs
        </NavLink>
        <NavLink href="/student/profile" pathname={pathname} icon={User}>
          Profile
        </NavLink>
      </nav>

      <div className="p-4 border-t border-blue-700">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-white hover:bg-blue-700"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
function NavLink({
  href,
  pathname,
  icon: Icon, // ✅ receives a component, not an element
  children,
}: {
  href: string;
  pathname: string;
  icon: React.ElementType; // ✅ CHANGE THIS
  children: React.ReactNode;
}) {
  const isActive = pathname.startsWith(href);
  return (
    <Link href={href}>
      <Button
        variant={isActive ? "default" : "ghost"}
        className={`w-full justify-start ${
          isActive
            ? "bg-blue-500 hover:bg-blue-600"
            : "text-blue-100 hover:bg-blue-700"
        }`}
      >
        {/* ✅ Use it as a JSX component */}
        <Icon className="w-4 h-4 mr-2" />
        <span>{children}</span>
      </Button>
    </Link>
  );
}
