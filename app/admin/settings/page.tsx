"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useState } from "react"

export default function SettingsPage() {
  const [failedAttempts, setFailedAttempts] = useState("3")
  const [emailTemplate, setEmailTemplate] = useState(
    "Your device has exited the campus. If this was not you, please report immediately.",
  )
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise((r) => setTimeout(r, 1000))
      toast.success("Settings saved successfully!")
    } catch (error) {
      toast.error("Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600 mt-1">Configure system parameters</p>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>Configure failed attempt limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="attempts">Max Failed Attempts Before Lock</Label>
            <Input
              id="attempts"
              type="number"
              value={failedAttempts}
              onChange={(e) => setFailedAttempts(e.target.value)}
              min="1"
              max="10"
            />
            <p className="text-xs text-gray-500">Maximum number of failed login/scan attempts before account lockout</p>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>Customize email template for device exit alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template">Email Template</Label>
            <Textarea
              id="template"
              value={emailTemplate}
              onChange={(e) => setEmailTemplate(e.target.value)}
              className="min-h-32"
              placeholder="Enter email template..."
            />
            <p className="text-xs text-gray-500">
              This message will be sent to students when their device exits the campus
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>System health and statistics</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">API Status</p>
            <p className="font-semibold text-green-600">Operational</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Database</p>
            <p className="font-semibold text-green-600">Connected</p>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSaveSettings} disabled={isSaving} className="mt-6 w-full">
        {isSaving ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  )
}
