"use client"

import type React from "react"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, Activity, Bell, Settings, LogOut } from "lucide-react"
import { toast } from "sonner"

export function AdminSidebarNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    localStorage.removeItem("user")
    toast.success("Logged out successfully")
    router.push("/")
  }

  return (
    <div className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold">QMMUST Admin</h1>
        <p className="text-xs text-slate-300">Gate Pass System</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <NavLink href="/admin/dashboard" pathname={pathname} icon={LayoutDashboard}>
          Dashboard
        </NavLink>
        <NavLink href="/admin/students" pathname={pathname} icon={Users}>
          Students
        </NavLink>
        <NavLink href="/admin/logs" pathname={pathname} icon={Activity}>
          Asset Logs
        </NavLink>
        <NavLink href="/admin/alerts" pathname={pathname} icon={Bell}>
          Alerts
        </NavLink>
        <NavLink href="/admin/settings" pathname={pathname} icon={Settings}>
          Settings
        </NavLink>
      </nav>

      <div className="p-4 border-t border-slate-700">
        <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-white hover:bg-slate-700">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  )
}
function NavLink({
  href,
  pathname,
  icon: Icon,
  children,
}: {
  href: string
  pathname: string
  icon: React.ElementType // ✅ use ElementType instead of ReactNode
  children: React.ReactNode
}) {
  const isActive = pathname.startsWith(href)

  return (
    <Link href={href}>
      <Button
        variant={isActive ? "default" : "ghost"}
        className={`w-full justify-start ${
          isActive ? "bg-slate-600 hover:bg-slate-700" : "text-slate-300 hover:bg-slate-700"
        }`}
      >
        {/* ✅ Render the icon as a component */}
        <Icon className="w-4 h-4 mr-2" />
        <span>{children}</span>
      </Button>
    </Link>
  )
}
