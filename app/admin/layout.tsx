"use client"

import type React from "react"

import { AdminSidebarNav } from "@/components/admin/sidebar-nav"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")

    if (!token || role !== "admin") {
      router.replace("/")
      return
    }

    setIsAuthenticated(true)
  }, [router])

  if (isAuthenticated === null) {
    return null
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebarNav />
      <main className="flex-1">{children}</main>
    </div>
  )
}
