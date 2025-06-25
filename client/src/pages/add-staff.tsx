import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import type { InsertStaff } from "@shared/schema";

// Validation schema
const staffSchema = z.object({
  name: z.string().min(1, "Name is required"),
  staffId: z.string().min(1, "Staff ID is required"),
  role: z.string().min(1, "Role is required"),
  newRole: z.string().optional(),
  mobileNumber: z.string()
    .min(10, "Mobile number must be at least 10 digits")
    .max(15, "Mobile number must not exceed 15 digits")
    .regex(/^[0-9+\-\s()]+$/, "Invalid mobile number format"),
  email: z.string().email("Invalid email address"),
  managerName: z.string().min(1, "Manager name is required"),
  status: z.enum(["Current working", "Resigned"]),
  lastWorkingDay: z.string().optional(),
}).refine((data) => {
  if (data.status === "Resigned" && !data.lastWorkingDay) {
    return false;
  }
  return true;
}, {
  message: "Last working day is required when status is Resigned",
  path: ["lastWorkingDay"],
});

type StaffFormData = z.infer<typeof staffSchema>;

// Sample data for dropdowns
const roles = [
  "Software Developer",
  "Senior Developer",
  "Team Lead",
  "Project Manager",
  "QA Engineer",
  "DevOps Engineer",
  "UI/UX Designer",
  "Business Analyst",
  "HR Manager",
  "Finance Manager",
];

const managers = [
  "Alice Thompson",
  "Robert Garcia",
  "Jennifer Martinez",
  "William Anderson",
  "Lisa Rodriguez",
  "James Wilson",
  "Maria Lopez",
  "David Taylor",
  "Susan Clark",
  "Christopher Lewis",
];

export default function AddStaff() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      name: "",
      staffId: "",
      role: "",
      newRole: "",
      mobileNumber: "",
      email: "",
      managerName: "",
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
        managerName: data.managerName,
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
    <Layout>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/staff")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Staff
          </Button>
          <h1 className="text-3xl font-bold text-slate-800">Add New Staff Member</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Staff Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

                  <FormField
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
                  />

                  <FormField
                    control={form.control}
                    name="newRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Add New Role</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ))}
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
                        <FormLabel>Manager Name</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select manager" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {managers.map((manager) => (
                              <SelectItem key={manager} value={manager}>
                                {manager}
                              </SelectItem>
                            ))}
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
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Current working">Current working</SelectItem>
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
                            <Input 
                              type="date"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <div className="flex justify-end gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/staff")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={mutation.isPending} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {mutation.isPending ? "Saving..." : "Save Staff"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}