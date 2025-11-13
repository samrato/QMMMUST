"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Users, Package, CogIcon as LogIcon, AlertTriangle } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { useRealtime } from "@/lib/hooks/use-realtime"

interface DashboardStats {
  totalStudents: number | null
  registeredAssets: number | null
  gatePassLogs: number | null
  suspiciousAttempts: number | null
}

interface Movement {
  id: string
  users: { name: string }
  devices: { device_name: string }
  gate_name: string
  status: string
  created_at: string
}

interface Alert {
  id: string
  message: string
  alert_type: string
  created_at: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: null,
    registeredAssets: null,
    gatePassLogs: null,
    suspiciousAttempts: null,
  })
  const [recentMovements, setRecentMovements] = useState<Movement[]>([])
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useRealtime("movements", "student_id", null, (payload) => {
    console.log("[Realtime Update] New movement:", payload)
    // Refetch data or update UI in real-time
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) throw new Error("No token found")

        const res = await fetch("/api/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()

        setStats(data.stats)
        setRecentMovements(data.recentMovements || [])
        setRecentAlerts(data.recentAlerts || [])
      } catch (error) {
        console.error("Error fetching dashboard:", error)
        toast.error("Failed to load dashboard")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const chartData = [
    { name: "Mon", logs: 340 },
    { name: "Tue", logs: 420 },
    { name: "Wed", logs: 380 },
    { name: "Thu", logs: 460 },
    { name: "Fri", logs: 520 },
    { name: "Sat", logs: 290 },
    { name: "Sun", logs: 180 },
  ]

  const pieData = [
    { name: "Approved", value: 85 },
    { name: "Pending", value: 10 },
    { name: "Denied", value: 5 },
  ]

  const COLORS = ["#22c55e", "#eab308", "#ef4444"]

  return (
    <div className="w-full space-y-6 p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">System overview and statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{stats.totalStudents || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Active students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-600 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Registered Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{stats.registeredAssets || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Devices tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-600 flex items-center gap-2">
              <LogIcon className="w-4 h-4" />
              Gate Pass Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{stats.gatePassLogs || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Total movements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Suspicious Attempts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-red-600">{stats.suspiciousAttempts || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Failed attempts</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Weekly Activity</CardTitle>
            <CardDescription className="text-xs md:text-sm">Gate pass logs per day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-80 md:h-96 overflow-x-auto">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="logs" fill="#0e4d92" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Pass Status</CardTitle>
            <CardDescription className="text-xs md:text-sm">Distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={{ fontSize: 12 }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Recent Movements</CardTitle>
          <CardDescription className="text-xs md:text-sm">Latest gate pass activities</CardDescription>
        </CardHeader>
        <CardContent>
          {recentMovements.length === 0 ? (
            <p className="text-center text-gray-500 py-8 text-sm">No recent activities</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs md:text-sm">Student</TableHead>
                    <TableHead className="text-xs md:text-sm hidden md:table-cell">Device</TableHead>
                    <TableHead className="text-xs md:text-sm">Gate</TableHead>
                    <TableHead className="text-xs md:text-sm">Status</TableHead>
                    <TableHead className="text-xs md:text-sm hidden lg:table-cell">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentMovements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell className="font-semibold text-xs md:text-sm">
                        {movement.users?.name || "N/A"}
                      </TableCell>
                      <TableCell className="font-mono text-xs hidden md:table-cell">
                        {movement.devices?.device_name || "N/A"}
                      </TableCell>
                      <TableCell className="text-xs md:text-sm">{movement.gate_name}</TableCell>
                      <TableCell>
                        <Badge
                          variant={movement.status === "approved" ? "default" : "secondary"}
                          className={`text-xs ${movement.status === "approved" ? "bg-green-600" : "bg-red-600"}`}
                        >
                          {movement.status.charAt(0).toUpperCase() + movement.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs hidden lg:table-cell">
                        {new Date(movement.created_at).toLocaleTimeString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
