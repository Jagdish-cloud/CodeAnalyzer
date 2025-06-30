import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { InsertStaff, Role, Staff } from "@shared/schema";

// Validation schema
const staffSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    staffId: z.string().min(1, "Staff ID is required"),
    role: z.string().min(1, "Role is required"),
    newRole: z.string().optional(),
    mobileNumber: z
      .string()
      .min(10, "Mobile number must be at least 10 digits")
      .max(15, "Mobile number must not exceed 15 digits")
      .regex(/^[0-9+\-\s()]+$/, "Invalid mobile number format"),
    email: z.string().email("Invalid email address"),
    managerName: z.string().optional(),
    status: z.enum(["Current working", "Resigned"]),
    lastWorkingDay: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.status === "Resigned" && !data.lastWorkingDay) {
        return false;
      }
      return true;
    },
    {
      message: "Last working day is required when status is Resigned",
      path: ["lastWorkingDay"],
    },
  );

type StaffFormData = z.infer<typeof staffSchema>;

export default function AddStaff() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch roles from the Roles system
  const { data: roles, isLoading: rolesLoading } = useQuery<Role[]>({
    queryKey: ['/api/roles'],
  });

  // Fetch staff members to populate manager dropdown
  const { data: staff, isLoading: staffLoading } = useQuery<Staff[]>({
    queryKey: ['/api/staff'],
  });

  const form = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      name: "",
      staffId: "",
      role: undefined,
      newRole: undefined,
      mobileNumber: "",
      email: "",
      managerName: undefined,
      status: "Current working",
      lastWorkingDay: "",
    },
  });

  const watchStatus = form.watch("status");

  const mutation = useMutation({
    mutationFn: async (data: StaffFormData) => {
      const staffData: InsertStaff = {
        name: data.name,
        staffId: data.staffId,
        role: data.role,
        newRole: data.newRole || null,
        mobileNumber: data.mobileNumber,
        email: data.email,
        managerName: data.managerName && data.managerName !== "none" ? data.managerName : null,
        status: data.status,
        lastWorkingDay: data.lastWorkingDay || null,
      };

      const response = await fetch("/api/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(staffData),
      });

      if (!response.ok) {
        throw new Error("Failed to create staff member");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      toast({
        title: "Success",
        description: "Staff member added successfully!",
      });
      setLocation("/staff");
    },
    onError: (error) => {
      console.error("Staff creation error:", error);
      toast({
        title: "Error",
        description: "Failed to add staff member. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: StaffFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950">
      <div className="container mx-auto px-6 py-8 flex flex-col items-center">
        <div className="w-full max-w-2xl space-y-8">
          <div className="flex items-center gap-6">
            <Button
            variant="outline"
            onClick={() => setLocation("/staff")}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Staff
          </Button>
          <div className="space-y-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-2">
              Add Staff Member
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Create a new staff member profile
            </p>
          </div>
          </div>

        <Card className="max-w-5xl w-full glass-morphism card-hover">
          <CardHeader>
            <CardTitle className="text-slate-800 dark:text-slate-200 text-xl">Staff Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="staffId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Staff ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter staff ID" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter current role" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem> 
                    )}
                  />*/}

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Role</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {rolesLoading ? (
                              <SelectItem value="loading" disabled>Loading roles...</SelectItem>
                            ) : roles && roles.length > 0 ? (
                              roles.map((role) => (
                                <SelectItem key={role.id.toString()} value={role.roleName}>
                                  {role.roleName}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-roles" disabled>No roles available</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mobileNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter mobile number"
                            type="tel"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter email address"
                            type="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="managerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manager Name (Optional)</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select manager (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">No manager</SelectItem>
                            {staffLoading ? (
                              <SelectItem value="loading" disabled>Loading staff...</SelectItem>
                            ) : staff && staff.length > 0 ? (
                              staff.map((staffMember) => (
                                <SelectItem key={staffMember.id.toString()} value={staffMember.name}>
                                  {staffMember.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-staff" disabled>No staff members available</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Current working">
                              Current working
                            </SelectItem>
                            <SelectItem value="Resigned">Resigned</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchStatus === "Resigned" && (
                    <FormField
                      control={form.control}
                      name="lastWorkingDay"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Working Day</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <div className="flex justify-end gap-4 pt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/staff")}
                    className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className="btn-modern bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {mutation.isPending ? "Saving..." : "Save Staff"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
