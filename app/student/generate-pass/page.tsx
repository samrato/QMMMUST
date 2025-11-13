"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Download, RefreshCw } from "lucide-react"

interface Device {
  id: string
  device_name: string
  rfid_tag: string
  device_type: string
}

interface GatePass {
  id: string
  qr_code: string
  pin: string
  expires_at: string
}

export default function GeneratePassPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>("")
  const [gatePass, setGatePass] = useState<GatePass | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
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
      }
    }

    fetchDevices()
  }, [])

  const handleGeneratePass = async () => {
    if (!selectedDevice) {
      toast.error("Please select a device")
      return
    }

    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No token found")

      const res = await fetch("/api/student/generate-pass", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ device_id: selectedDevice }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      setGatePass(data.gatePass)
      toast.success("Gate pass generated successfully!")
    } catch (error) {
      console.error("Error generating pass:", error)
      toast.error("Failed to generate gate pass")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadQR = () => {
    if (!gatePass) return

    const link = document.createElement("a")
    link.href = gatePass.qr_code
    link.download = `gate-pass-qr-${Date.now()}.png`
    link.click()
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Generate Gate Pass</h1>
          <p className="text-gray-600 mt-1">Create QR code and PIN for device entry</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Device</CardTitle>
            <CardDescription>Choose a device to generate gate pass for</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedDevice} onValueChange={setSelectedDevice}>
              <SelectTrigger>
                <SelectValue placeholder="Select a device" />
              </SelectTrigger>
              <SelectContent>
                {devices.map((device) => (
                  <SelectItem key={device.id} value={device.id}>
                    {device.device_name} ({device.rfid_tag})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={handleGeneratePass} disabled={isLoading || !selectedDevice} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              {isLoading ? "Generating..." : "Generate Pass"}
            </Button>
          </CardContent>
        </Card>

        {gatePass && (
          <Card>
            <CardHeader>
              <CardTitle>Your Gate Pass</CardTitle>
              <CardDescription>Valid until {new Date(gatePass.expires_at).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center">
                <img
                  src={gatePass.qr_code || "/placeholder.svg"}
                  alt="QR Code"
                  className="w-48 h-48 border-4 border-gray-200 rounded-lg"
                />
                <Button onClick={handleDownloadQR} variant="outline" className="mt-4 bg-transparent">
                  <Download className="w-4 h-4 mr-2" />
                  Download QR Code
                </Button>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600">PIN Code</p>
                <p className="text-3xl font-mono font-bold text-blue-900 tracking-widest mt-2">{gatePass.pin}</p>
                <p className="text-xs text-gray-500 mt-2">Keep this PIN secure and don't share it</p>
              </div>

              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                <p className="font-semibold mb-1">How to use:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Show QR code at the gate scanner</li>
                  <li>Enter PIN when prompted</li>
                  <li>Wait for approval</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
