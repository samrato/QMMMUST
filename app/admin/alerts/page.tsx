"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface Alert {
  id: string
  users: { name: string }
  devices: { device_name: string; rfid_tag: string }
  alert_type: string
  message: string
  is_sent: boolean
  created_at: string
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) throw new Error("No token found")

        const res = await fetch("/api/admin/alerts", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        setAlerts(data.alerts || [])
      } catch (error) {
        console.error("Error fetching alerts:", error)
        toast.error("Failed to load alerts")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAlerts()
  }, [])

  return (
    <div className="p-6">
      <div>
        <h1 className="text-3xl font-bold">Alerts & Notifications</h1>
        <p className="text-gray-600 mt-1">Email alerts and system notifications</p>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
          <CardDescription>All triggered email notifications</CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No alerts found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Alert Type</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date & Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>{alert.users?.name || "N/A"}</TableCell>
                    <TableCell className="font-mono text-sm">{alert.devices?.rfid_tag || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{alert.alert_type}</Badge>
                    </TableCell>
                    <TableCell className="text-sm max-w-xs truncate">{alert.message}</TableCell>
                    <TableCell>
                      <Badge
                        variant={alert.is_sent ? "default" : "secondary"}
                        className={alert.is_sent ? "bg-blue-600" : "bg-gray-600"}
                      >
                        {alert.is_sent ? "Sent" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{new Date(alert.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
