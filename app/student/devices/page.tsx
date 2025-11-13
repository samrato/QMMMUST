"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Plus, Trash2, Smartphone } from "lucide-react"
import { AddDeviceModal } from "@/components/student/add-device-modal"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Device {
  id: string
  device_name: string
  rfid_tag: string
  device_type: string
  created_at: string
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchDevices = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No token found")

      const res = await fetch("/api/student/devices", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setDevices(data.devices || [])
    } catch (error) {
      console.error("Error fetching devices:", error)
      toast.error("Failed to load devices")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDevices()
  }, [])

  const handleDeleteDevice = async (deviceId: string) => {
    if (!confirm("Are you sure you want to delete this device?")) return

    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No token found")

      const res = await fetch(`/api/student/devices/${deviceId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error("Failed to delete device")

      toast.success("Device deleted successfully")
      fetchDevices()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete device")
    }
  }

  return (
    <div className="w-full space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My Devices</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Manage your registered devices</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Register Device
        </Button>
      </div>

      {devices.length === 0 && !isLoading && (
        <Alert>
          <Smartphone className="h-4 w-4" />
          <AlertDescription>No devices registered yet. Register your first device to get started.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Registered Devices</CardTitle>
          <CardDescription>All your registered laptops and devices</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading devices...</div>
          ) : devices.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No devices registered yet</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device Name</TableHead>
                    <TableHead>Device Type</TableHead>
                    <TableHead>Reg No</TableHead>
                    <TableHead className="hidden md:table-cell">Registered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell className="font-semibold">{device.device_name}</TableCell>
                      <TableCell className="text-sm">{device.device_type}</TableCell>
                      <TableCell className="font-mono text-xs md:text-sm">{device.rfid_tag}</TableCell>
                      <TableCell className="text-sm hidden md:table-cell">
                        {new Date(device.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleDeleteDevice(device.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AddDeviceModal open={isModalOpen} onOpenChange={setIsModalOpen} onDeviceAdded={fetchDevices} />
    </div>
  )
}
