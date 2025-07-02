import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";

import { insertRoleSchema, type InsertRole, type Role } from "@shared/schema";

const formSchema = insertRoleSchema.extend({
  roleName: z.string().min(1, "Role name is required").trim(),
});

type FormData = z.infer<typeof formSchema>;

export default function AddRole() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing roles to check for duplicates
  const { data: existingRoles } = useQuery({
    queryKey: ["/api/roles"],
    queryFn: async () => {
      const response = await fetch("/api/roles");
      if (!response.ok) {
        throw new Error("Failed to fetch roles");
      }
      return response.json() as Promise<Role[]>;
    },
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roleName: "",
      status: "active",
    },
  });

  const createRoleMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Check for duplicate role names
      if (existingRoles) {
        const isDuplicate = existingRoles.some(
          (role) => role.roleName.toLowerCase() === data.roleName.toLowerCase()
        );
        
        if (isDuplicate) {
          throw new Error("A role with this name already exists. Please choose a different name.");
        }
      }

      const roleData: InsertRole = {
        roleName: data.roleName.trim(),
        status: data.status || "active",
      };
      
      const response = await fetch("/api/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create role");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      toast({
        title: "Success",
        description: "Role created successfully!",
      });
      setLocation("/roles");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createRoleMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-rose-900/20">
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/roles")}
            className="mb-4 hover:bg-white/50 dark:hover:bg-gray-800/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Roles
          </Button>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent mb-2">
            Add New Role
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Create a new system role
          </p>
        </div>

        <Card className="max-w-5xl w-full backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border-0 shadow-xl">
          <CardHeader className="border-b border-gray-200/50 dark:border-gray-700/50">
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Role Information
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Fill in the details for the new role
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="roleName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">
                        Role Name
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter role name"
                          className="bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:ring-purple-500 dark:focus:ring-purple-400"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/roles")}
                    className="flex-1 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createRoleMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {createRoleMutation.isPending ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Creating...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Save className="w-4 h-4 mr-2" />
                        Create Role
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}