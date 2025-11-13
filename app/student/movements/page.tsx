"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface Movement {
  id: string
  rfid_tag: string
  gate_name: string
  gate_direction: string
  status: string
  created_at: string
}

export default function MovementsPage() {
  const [movements, setMovements] = useState<Movement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) throw new Error("No token found")

        const res = await fetch("/api/student/movements", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        setMovements(data.movements || [])
      } catch (error) {
        console.error("Error fetching movements:", error)
        toast.error("Failed to load movements")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMovements()
  }, [])

  return (
    <div className="p-6">
      <div>
        <h1 className="text-3xl font-bold">Movement Logs</h1>
        <p className="text-gray-600 mt-1">Track your device movements</p>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Gate Pass History</CardTitle>
          <CardDescription>All your device entry and exit records</CardDescription>
        </CardHeader>
        <CardContent>
          {movements.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No movement records found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>RFID Tag</TableHead>
                  <TableHead>Gate</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date & Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell className="font-mono text-sm">{movement.rfid_tag}</TableCell>
                    <TableCell>{movement.gate_name}</TableCell>
                    <TableCell className="capitalize">{movement.gate_direction}</TableCell>
                    <TableCell>
                      <Badge
                        variant={movement.status === "approved" ? "default" : "secondary"}
                        className={movement.status === "approved" ? "bg-green-600" : "bg-red-600"}
                      >
                        {movement.status.charAt(0).toUpperCase() + movement.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{new Date(movement.created_at).toLocaleString()}</TableCell>
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
