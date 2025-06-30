import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Edit } from "lucide-react";
import type { Role } from "@shared/schema";

export default function Roles() {
  const { data: roles, isLoading, error } = useQuery<Role[]>({
    queryKey: ['/api/roles'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-rose-900/20">
        <div className="container mx-auto py-8 px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/4"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-rose-900/20">
        <div className="container mx-auto py-8 px-4">
          <div className="text-center text-red-600 dark:text-red-400">
            Error loading roles. Please try again.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-rose-900/20">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent mb-2">
              Roles Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage and organize system roles
            </p>
          </div>
          <Link href="/add-role">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <Plus className="w-4 h-4 mr-2" />
              Add Roles
            </Button>
          </Link>
        </div>

        <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border-0 shadow-xl">
          <CardHeader className="border-b border-gray-200/50 dark:border-gray-700/50">
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              All Roles
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Complete list of system roles and their current status
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {roles && roles.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-200/50 dark:border-gray-700/50">
                    <TableHead className="text-gray-700 dark:text-gray-300 font-medium">Role</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300 font-medium">Status</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300 font-medium text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow 
                      key={role.id}
                      className="border-b border-gray-100/50 dark:border-gray-700/30 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                        {role.roleName}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={role.status === "active" ? "default" : "secondary"}
                          className={
                            role.status === "active" 
                              ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300" 
                              : "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 dark:from-gray-700/30 dark:to-slate-700/30 dark:text-gray-300"
                          }
                        >
                          {role.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
                  <Plus className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No roles found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Get started by creating your first role
                </p>
                <Link href="/add-role">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Role
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}