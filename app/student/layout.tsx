"use client"

import type React from "react"

import { StudentSidebarNav } from "@/components/student/sidebar-nav"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")

    if (!token || role !== "student") {
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
      <StudentSidebarNav />
      <main className="flex-1">{children}</main>
    </div>
  )
}
