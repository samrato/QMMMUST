"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Search } from "lucide-react"

interface Student {
  id: string
  name: string
  email: string
  registration_number: string
  is_active: boolean
  last_login: string
  created_at: string
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) throw new Error("No token found")

        const query = search ? `?search=${search}` : ""
        const res = await fetch(`/api/admin/students${query}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        setStudents(data.students || [])
      } catch (error) {
        console.error("Error fetching students:", error)
        toast.error("Failed to load students")
      } finally {
        setIsLoading(false)
      }
    }

    const timer = setTimeout(fetchStudents, 300)
    return () => clearTimeout(timer)
  }, [search])

  return (
    <div className="p-6">
      <div>
        <h1 className="text-3xl font-bold">Students</h1>
        <p className="text-gray-600 mt-1">Manage student accounts and access</p>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Student List</CardTitle>
          <CardDescription>All registered students in the system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name or registration number..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {students.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No students found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Registration No</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-semibold">{student.name}</TableCell>
                    <TableCell className="font-mono text-sm">{student.registration_number}</TableCell>
                    <TableCell className="text-sm">{student.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={student.is_active ? "default" : "secondary"}
                        className={student.is_active ? "bg-green-600" : "bg-red-600"}
                      >
                        {student.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {student.last_login ? new Date(student.last_login).toLocaleDateString() : "Never"}
                    </TableCell>
                    <TableCell className="text-sm">{new Date(student.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </TableCell>
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
