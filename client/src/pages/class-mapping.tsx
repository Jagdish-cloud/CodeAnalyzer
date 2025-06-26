import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
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
import { Plus, Eye, Edit } from "lucide-react";
import type { ClassMapping } from "@shared/schema";

export default function ClassMapping() {
  const { data: mappings, isLoading } = useQuery<ClassMapping[]>({
    queryKey: ["/api/class-mappings"],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Class/Subject/Div Mapping</h1>
        <Link href="/add-class-mapping">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Class Mappings
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Class Mappings</CardTitle>
        </CardHeader>
        <CardContent>
          {!mappings || mappings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No class mappings found</p>
              <Link href="/add-class-mapping">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Mapping
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class (Grade)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mappings.map((mapping) => (
                  <TableRow key={mapping.id}>
                    <TableCell className="font-medium">
                      {mapping.class} - {mapping.division} ({mapping.subject})
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          mapping.status === "Current working"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {mapping.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
