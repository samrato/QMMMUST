"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Smartphone, Zap, Clock } from "lucide-react"

interface StudentProfile {
  name: string
  email: string
  registration_number: string
}

interface Movement {
  id: string
  rfid_tag: string
  gate_name: string
  status: string
  created_at: string
}

export default function StudentDashboard() {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [devicesCount, setDevicesCount] = useState(0)
  const [recentMovement, setRecentMovement] = useState<Movement | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) throw new Error("No token found")

        // Fetch profile
        const profileRes = await fetch("/api/student/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const profileData = await profileRes.json()
        setProfile(profileData.user)

        // Fetch devices
        const devicesRes = await fetch("/api/student/devices", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const devicesData = await devicesRes.json()
        setDevicesCount(devicesData.devices?.length || 0)

        // Fetch recent movement
        const movementsRes = await fetch("/api/student/movements?limit=1", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const movementsData = await movementsRes.json()
        if (movementsData.movements?.[0]) {
          setRecentMovement(movementsData.movements[0])
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast.error("Failed to load dashboard")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {profile?.name || "Student"}!</h1>
        <p className="text-gray-600 mt-1">Your registration: {profile?.registration_number}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Registered Devices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{devicesCount}</div>
            <p className="text-xs text-gray-500 mt-1">Total devices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">Active</div>
            <p className="text-xs text-gray-500 mt-1">Account is active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Last Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">—</div>
            <p className="text-xs text-gray-500 mt-1">
              {recentMovement ? new Date(recentMovement.created_at).toLocaleDateString() : "No activity"}
            </p>
          </CardContent>
        </Card>
      </div>

      {recentMovement && (
        <Card>
          <CardHeader>
            <CardTitle>Last Gate Pass Record</CardTitle>
            <CardDescription>Most recent movement log</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Device RFID</p>
                <p className="font-semibold">{recentMovement.rfid_tag}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Gate</p>
                <p className="font-semibold">{recentMovement.gate_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p
                  className={`font-semibold ${recentMovement.status === "approved" ? "text-green-600" : "text-red-600"}`}
                >
                  {recentMovement.status.charAt(0).toUpperCase() + recentMovement.status.slice(1)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="font-semibold">{new Date(recentMovement.created_at).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
