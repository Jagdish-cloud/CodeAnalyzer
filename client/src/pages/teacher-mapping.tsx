import { useState } from "react";
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
import { Plus, Eye, Edit2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { TeacherMapping } from "@shared/schema";

export default function TeacherMapping() {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: teacherMappings, isLoading } = useQuery({
    queryKey: ["/api/teacher-mappings"],
    queryFn: async () => {
      const response = await fetch("/api/teacher-mappings");
      if (!response.ok) {
        throw new Error("Failed to fetch teacher mappings");
      }
      return response.json() as Promise<TeacherMapping[]>;
    },
  });

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      const response = await fetch(`/api/teacher-mappings/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete teacher mapping");
      }

      await queryClient.invalidateQueries({ queryKey: ["/api/teacher-mappings"] });
      toast({
        title: "Success",
        description: "Teacher mapping deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete teacher mapping",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const formatClassSubject = (teacherMapping: TeacherMapping) => {
    return `${teacherMapping.class} - ${teacherMapping.subject}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-teal-950 dark:via-cyan-950 dark:to-blue-950">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading teacher mappings...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-teal-950 dark:via-cyan-950 dark:to-blue-950">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
              Teacher Subject/Class/Div Mapping
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Manage teacher assignments to classes, subjects, and divisions
            </p>
          </div>
          <Link href="/add-teacher-mapping">
            <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="w-4 h-4 mr-2" />
              Add Teacher Mapping
            </Button>
          </Link>
        </div>

        <Card className="glass-morphism border-white/20 dark:border-slate-700/20 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border-b border-white/10 dark:border-slate-700/10">
            <CardTitle className="text-slate-800 dark:text-slate-200">
              Teacher Mappings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {!teacherMappings || teacherMappings.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                  No teacher mappings found
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Get started by creating your first teacher mapping
                </p>
                <Link href="/add-teacher-mapping">
                  <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Teacher Mapping
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200/50 dark:border-slate-700/50">
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                        Class - Subject
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                        Status
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teacherMappings.map((mapping) => (
                      <TableRow
                        key={mapping.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors duration-200 border-b border-slate-200/30 dark:border-slate-700/30"
                      >
                        <TableCell className="font-medium text-slate-800 dark:text-slate-200">
                          {formatClassSubject(mapping)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={mapping.status === "Current working" ? "default" : "secondary"}
                            className={
                              mapping.status === "Current working"
                                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                : "bg-gradient-to-r from-gray-500 to-slate-500 text-white"
                            }
                          >
                            {mapping.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Link href={`/edit-teacher-mapping/${mapping.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="hover:bg-green-50 hover:border-green-300 dark:hover:bg-green-900/20"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            </Link>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-900/20"
                                  disabled={deletingId === mapping.id}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="glass-morphism">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Teacher Mapping</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this teacher mapping? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(mapping.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}