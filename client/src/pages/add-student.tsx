import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { CalendarIcon, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { insertStudentSchema, type InsertStudent, type ClassMapping } from "@shared/schema";
import { Link } from "wouter";

const formSchema = insertStudentSchema.extend({
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  middleName: z.string().optional(),
  lastName: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function AddStudent() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch class mappings to populate class/division dropdown
  const { data: classMappings } = useQuery({
    queryKey: ["/api/class-mappings"],
    queryFn: async () => {
      const response = await fetch("/api/class-mappings");
      if (!response.ok) {
        throw new Error("Failed to fetch class mappings");
      }
      return response.json() as Promise<ClassMapping[]>;
    },
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      sex: "",
      dateOfBirth: "",
      address: "",
      contactNumber: "",
      emailId: "",
      class: "",
      division: "",
      fatherName: "",
      fatherMobileNumber: "",
      fatherEmailId: "",
      motherName: "",
      motherMobileNumber: "",
      motherEmailId: "",
      apaarId: "",
      aadharNumber: "",
    },
  });

  const createStudentMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const studentData: InsertStudent = {
        firstName: data.firstName,
        middleName: data.middleName || undefined,
        lastName: data.lastName || undefined,
        sex: data.sex,
        dateOfBirth: data.dateOfBirth,
        address: data.address,
        contactNumber: data.contactNumber,
        emailId: data.emailId,
        class: data.class,
        division: data.division,
        fatherName: data.fatherName,
        fatherMobileNumber: data.fatherMobileNumber,
        fatherEmailId: data.fatherEmailId,
        motherName: data.motherName,
        motherMobileNumber: data.motherMobileNumber,
        motherEmailId: data.motherEmailId,
        apaarId: data.apaarId,
        aadharNumber: data.aadharNumber,
      };

      return apiRequest("POST", "/api/students", studentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/students/stats"] });
      // Force refresh of all student class/division queries
      queryClient.invalidateQueries({ queryKey: ["/api/students", "class"] });
      toast({
        title: "Success",
        description: "Student added successfully",
      });
      setLocation("/student-masters");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add student",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createStudentMutation.mutate(data);
  };

  // Get unique class-division combinations
  const classDivisionOptions = classMappings?.map(mapping => ({
    value: `${mapping.class}-${mapping.division}`,
    label: `Class ${mapping.class} - Division ${mapping.division}`
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 dark:from-violet-950 dark:via-fuchsia-950 dark:to-pink-950">
      <div className="container mx-auto px-[5px] py-8">
        <div className="max-w-4xl mx-auto space-y-8 flex flex-col items-center">
          {/* Header Section */}
          <div className="flex items-center gap-4">
            <Link href="/student-masters">
              <Button variant="outline" size="sm" className="hover:bg-slate-50 dark:hover:bg-slate-800">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Student Masters
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                Add Student
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-lg">
                Add a new student to the system
              </p>
            </div>
          </div>

          <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader className="border-b border-slate-200 dark:border-slate-700 pb-6">
              <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Personal Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2">
                      Personal Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter first name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="middleName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Middle Name (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter middle name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter last name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="sex"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sex *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select sex" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Others">Others</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Date of Birth *</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(new Date(field.value), "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value ? new Date(field.value) : undefined}
                                  onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                                  disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address *</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter complete address" {...field} rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="contactNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter contact number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="emailId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email ID *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter email address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Academic Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2">
                      Academic Information
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="class"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Class/Division *</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              const [classValue, divisionValue] = value.split('-');
                              field.onChange(classValue);
                              form.setValue('division', divisionValue);
                            }} 
                            defaultValue={field.value ? `${field.value}-${form.watch('division')}` : ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select class and division" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {classDivisionOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Father's Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2">
                      Father's Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="fatherName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Father's Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter father's name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="fatherMobileNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Father's Mobile Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter father's mobile number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="fatherEmailId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Father's Email ID *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter father's email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Mother's Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2">
                      Mother's Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="motherName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mother's Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter mother's name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="motherMobileNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mother's Mobile Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter mother's mobile number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="motherEmailId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mother's Email ID *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter mother's email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Identity Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2">
                      Identity Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="apaarId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>APAAR ID *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter APAAR ID" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="aadharNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Aadhar Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter Aadhar number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-6">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={createStudentMutation.isPending}
                      className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {createStudentMutation.isPending ? "Saving..." : "Save Student"}
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