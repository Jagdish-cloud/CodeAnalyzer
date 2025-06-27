import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Eye, Edit, Users } from "lucide-react";
import type { Staff } from "@shared/schema";

// Function to generate sample staff data structure
const generateMockStaff = (): Staff[] => {
  const firstNames = [
    "John", "Jane", "Michael", "Emily", "David", "Sarah", "Robert", "Lisa", "James", "Emma"
  ];
  const lastNames = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Garcia", "Rodriguez", "Wilson"
  ];
  const statuses = ["Current working", "On leave", "Terminated", "Retired"];
  const roles = ["Subject Teacher", "Classroom Teacher", "Librarian", "Administrative Assistant", "Custodian"];

  return Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
    staffId: `STF${String(i + 1).padStart(3, '0')}`,
    role: roles[Math.floor(Math.random() * roles.length)],
    newRole: null,
    mobileNumber: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    email: `staff${i + 1}@example.com`,
    managerName: "Principal Smith",
    status: statuses[Math.floor(Math.random() * statuses.length)],
    lastWorkingDay: null,
  }));
};

const mockStaff = generateMockStaff();

export default function Staff() {
  const {
    data: staff,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/staff"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/staff");
        if (!response.ok) {
          throw new Error("Failed to fetch staff");
        }
        return response.json() as Promise<Staff[]>;
      } catch (err) {
        // Return mock data if API fails
        return mockStaff;
      }
    },
    // Uncomment this line to always use mock data for testing
    initialData: mockStaff,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                Staff Management
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-lg">
                Manage your educational staff and their information
              </p>
            </div>
            <Link href="/staff/add">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus className="h-5 w-5 mr-2" />
                Add Staff Member
              </Button>
            </Link>
          </div>

          {/* Staff Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Staff</p>
                    <p className="text-3xl font-bold">{staff?.length || 0}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium">Active Staff</p>
                    <p className="text-3xl font-bold">
                      {staff?.filter(s => s.status === "Current working").length || 0}
                    </p>
                  </div>
                  <Eye className="h-8 w-8 text-emerald-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">On Leave</p>
                    <p className="text-3xl font-bold">
                      {staff?.filter(s => s.status === "On leave").length || 0}
                    </p>
                  </div>
                  <Plus className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Departments</p>
                    <p className="text-3xl font-bold">
                      {new Set(staff?.map(s => s.role)).size || 0}
                    </p>
                  </div>
                  <Edit className="h-8 w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Staff Table */}
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader className="border-b border-slate-200 dark:border-slate-700 pb-6">
              <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                Staff Members
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-3 w-[150px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-16">
                  <div className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
                    <Users className="h-12 w-12 text-red-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Connection Error
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Unable to load staff data. Please check your connection.
                  </p>
                </div>
              ) : staff && staff.length > 0 ? (
                <div className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                        <TableHead className="font-semibold text-slate-900 dark:text-slate-100 py-4">Name</TableHead>
                        <TableHead className="font-semibold text-slate-900 dark:text-slate-100 py-4">Role</TableHead>
                        <TableHead className="font-semibold text-slate-900 dark:text-slate-100 py-4">Status</TableHead>
                        <TableHead className="font-semibold text-slate-900 dark:text-slate-100 py-4 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staff.map((member) => (
                        <TableRow key={member.id} className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <TableCell className="py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                                {member.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 dark:text-slate-100">{member.name}</div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">{member.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="font-medium text-slate-700 dark:text-slate-300">
                              {member.role}
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge
                              variant={member.status === "Current working" ? "default" : "secondary"}
                              className={
                                member.status === "Current working"
                                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400"
                                  : member.status === "On leave"
                                    ? "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
                                    : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                              }
                            >
                              {member.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="mx-auto w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-full flex items-center justify-center mb-6">
                    <Users className="h-12 w-12 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    No staff members yet
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-8">
                    Add your first staff member to get started with team management
                  </p>
                  <Link href="/staff/add">
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0">
                      <Plus className="h-5 w-5 mr-2" />
                      Add First Staff Member
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
