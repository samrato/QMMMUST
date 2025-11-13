"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface Log {
  id: string
  users: { name: string; registration_number: string }
  devices: { device_name: string; rfid_tag: string }
  gate_name: string
  gate_direction: string
  status: string
  created_at: string
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [status, setStatus] = useState<string>("all") // Updated default value to 'all'
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) throw new Error("No token found")

        const query = status !== "all" ? `?status=${status}` : "" // Modified query condition
        const res = await fetch(`/api/admin/logs${query}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        setLogs(data.logs || [])
      } catch (error) {
        console.error("Error fetching logs:", error)
        toast.error("Failed to load logs")
      } finally {
        setIsLoading(false)
      }
    }

    const timer = setTimeout(fetchLogs, 300)
    return () => clearTimeout(timer)
  }, [status])

  return (
    <div className="p-6">
      <div>
        <h1 className="text-3xl font-bold">Asset Logs</h1>
        <p className="text-gray-600 mt-1">Gate pass activities and device tracking</p>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Movement Logs</CardTitle>
          <CardDescription>All device entry and exit records</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem> {/* Updated value prop */}
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="denied">Denied</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>

          {logs.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No logs found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Gate</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date & Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{log.users?.name || "N/A"}</p>
                        <p className="text-xs text-gray-500">{log.users?.registration_number || "N/A"}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{log.devices?.device_name || "N/A"}</p>
                        <p className="text-xs text-gray-500 font-mono">{log.devices?.rfid_tag || "N/A"}</p>
                      </div>
                    </TableCell>
                    <TableCell>{log.gate_name}</TableCell>
                    <TableCell className="capitalize">{log.gate_direction}</TableCell>
                    <TableCell>
                      <Badge
                        variant={log.status === "approved" ? "default" : "secondary"}
                        className={
                          log.status === "approved"
                            ? "bg-green-600"
                            : log.status === "denied"
                              ? "bg-red-600"
                              : "bg-yellow-600"
                        }
                      >
                        {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{new Date(log.created_at).toLocaleString()}</TableCell>
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
