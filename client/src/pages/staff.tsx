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
import { Plus, Eye, Edit } from "lucide-react";
import type { Staff } from "@shared/schema";

// Function to generate random staff data
const generateMockStaff = (): Staff[] => {
  const firstNames = [
    "John",
    "Jane",
    "Michael",
    "Emily",
    "David",
    "Sarah",
    "Robert",
    "Lisa",
    "James",
    "Emma",
  ];
  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Miller",
    "Davis",
    "Garcia",
    "Rodriguez",
    "Wilson",
  ];
  const statuses = ["Current working", "On leave", "Terminated", "Retired"];

  return Array.from({ length: 8 }, (_, i) => ({
    id: `staff-${i + 1}`,
    name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    position: [
      "Subject Teacher",
      "Classroom Teacher",
      "Librarian",
      "Administrative Assistant",
      "Custodian",
    ][Math.floor(Math.random() * 5)],
    email: `staff${i + 1}@example.com`,
    phone: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    hireDate: new Date(
      Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 365 * 5),
    ).toISOString(),
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
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-3xl font-bold text-slate-800">Staff Data</h1>
          <Link href="/staff/add">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Staff
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Staff Members</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[100px]" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                Failed to load staff data from API. Showing mock data instead.
              </div>
            ) : staff && staff.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.name}
                      </TableCell>
                      <TableCell>{member.position}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            member.status === "Current working"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            member.status === "Current working"
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : member.status === "On leave"
                                ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                : "bg-red-100 text-red-800 hover:bg-red-200"
                          }
                        >
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-slate-600">
                No staff members found. Add your first staff member to get
                started.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
