import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Eye, Edit2, Trash2, Plus, Users } from "lucide-react";
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

  // Group teacher mappings by class-division combinations
  const groupedMappings = teacherMappings?.reduce((acc, mapping) => {
    const divisions = mapping.divisions as Array<{ division: string; teacherId?: number; teacherName?: string }>;
    const classDivisionKey = `${mapping.class}-${divisions[0]?.division || ''}`;
    
    if (!acc[classDivisionKey]) {
      acc[classDivisionKey] = {
        class: mapping.class,
        division: divisions[0]?.division || '',
        subjects: [],
        status: mapping.status,
        mappingIds: []
      };
    }
    
    acc[classDivisionKey].subjects.push(mapping.subject);
    acc[classDivisionKey].mappingIds.push(mapping.id);
    
    return acc;
  }, {} as Record<string, {
    class: string;
    division: string;
    subjects: string[];
    status: string;
    mappingIds: number[];
  }>) || {};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-teal-950 dark:via-cyan-950 dark:to-blue-950">
        <div className="container mx-auto px-[5px] py-8">
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

  const groupedMappingsArray = Object.entries(groupedMappings);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-teal-950 dark:via-cyan-950 dark:to-blue-950">
      <div className="container mx-auto px-[5px] py-8">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                Teacher Subject/Class/Div Mapping
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-lg">
                Manage teacher assignments across classes, subjects, and divisions
              </p>
            </div>
            <Link href="/add-teacher-mapping">
              <Button size="lg" className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus className="h-5 w-5 mr-2" />
                Add Teacher Mapping
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-500 to-teal-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teal-100 text-sm font-medium">Total Mappings</p>
                    <p className="text-3xl font-bold">{groupedMappingsArray.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-teal-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-100 text-sm font-medium">Active Mappings</p>
                    <p className="text-3xl font-bold">
                      {groupedMappingsArray.filter(([_, group]) => group.status === "Current working").length}
                    </p>
                  </div>
                  <Eye className="h-8 w-8 text-cyan-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Unique Classes</p>
                    <p className="text-3xl font-bold">
                      {new Set(groupedMappingsArray.map(([_, group]) => group.class)).size}
                    </p>
                  </div>
                  <Edit2 className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Table */}
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader className="border-b border-slate-200 dark:border-slate-700 pb-6">
              <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                Teacher Subject/Class/Div Mappings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {groupedMappingsArray.length === 0 ? (
                <div className="text-center py-16">
                  <div className="mx-auto w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-full flex items-center justify-center mb-6">
                    <Users className="h-12 w-12 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    No teacher mappings yet
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-8">
                    Add your first teacher mapping to get started with subject assignments
                  </p>
                  <Link href="/add-teacher-mapping">
                    <Button size="lg" className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white border-0">
                      <Plus className="h-5 w-5 mr-2" />
                      Add First Teacher Mapping
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200/50 dark:border-slate-700/50">
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                          Class Details
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
                      {groupedMappingsArray.map(([key, group]) => (
                        <TableRow
                          key={key}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors duration-200 border-b border-slate-200/30 dark:border-slate-700/30"
                        >
                          <TableCell className="font-medium text-slate-800 dark:text-slate-200">
                            <div className="space-y-1">
                              <div className="font-semibold">
                                Class {group.class} - Division {group.division}
                              </div>
                              <div className="text-sm text-slate-600 dark:text-slate-400">
                                Subject: {group.subjects.join(', ')}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={group.status === "Current working" ? "default" : "secondary"}
                              className={
                                group.status === "Current working"
                                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                  : "bg-gradient-to-r from-gray-500 to-slate-500 text-white"
                              }
                            >
                              {group.status}
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
                              <Button
                                variant="outline"
                                size="sm"
                                className="hover:bg-green-50 hover:border-green-300 dark:hover:bg-green-900/20"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-900/20"
                                    disabled={deletingId !== null}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Teacher Mappings</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete all teacher mappings for Class {group.class} - Division {group.division}? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => {
                                        group.mappingIds.forEach(id => handleDelete(id));
                                      }}
                                      className="bg-red-600 hover:bg-red-700 text-white"
                                    >
                                      Delete All
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
    </div>
  );
}