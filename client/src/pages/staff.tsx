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

export default function Staff() {
  const { data: staff, isLoading, error } = useQuery({
    queryKey: ["/api/staff"],
    queryFn: async () => {
      const response = await fetch("/api/staff");
      if (!response.ok) {
        throw new Error("Failed to fetch staff");
      }
      return response.json() as Promise<Staff[]>;
    },
  });

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
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
                Failed to load staff data. Please try again.
              </div>
            ) : staff && staff.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant={member.status === "Current working" ? "default" : "secondary"}
                          className={
                            member.status === "Current working"
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          }
                        >
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
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
                No staff members found. Add your first staff member to get started.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}