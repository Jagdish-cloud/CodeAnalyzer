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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import {
  insertStudentSchema,
  type InsertStudent,
  type ClassMapping,
} from "@shared/schema";
import { Link } from "wouter";

const formSchema = insertStudentSchema
  .extend({
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    middleName: z.string().optional(),
    lastName: z.string().optional(),
    contactNumber: z.string().optional(),
    emailId: z
      .string()
      .email("Invalid email format")
      .optional()
      .or(z.literal("")),
    // Address fields validation
    flatBuildingNo: z.string().min(1, "Flat/Building No. is required"),
    areaLocality: z.string().min(1, "Area/Locality is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    pincode: z.string().min(1, "Pincode is required"),
    landmark: z.string().optional(),
    // Optional parent/guardian fields
    fatherName: z.string().optional(),
    fatherMobileNumber: z.string().optional(),
    fatherEmailId: z
      .string()
      .email("Invalid email format")
      .optional()
      .or(z.literal("")),
    motherName: z.string().optional(),
    motherMobileNumber: z.string().optional(),
    motherEmailId: z
      .string()
      .email("Invalid email format")
      .optional()
      .or(z.literal("")),
    guardianName: z.string().optional(),
    guardianMobileNumber: z.string().optional(),
    guardianEmailId: z
      .string()
      .email("Invalid email format")
      .optional()
      .or(z.literal("")),
    guardianRelation: z.string().optional(),
    // Elective selections field
    electiveSelections: z.record(z.string()).optional(),
  })
  .refine(
    (data) => {
      // At least one of father, mother, or guardian information must be provided
      const hasFather = data.fatherName && data.fatherName.trim().length > 0;
      const hasMother = data.motherName && data.motherName.trim().length > 0;
      const hasGuardian =
        data.guardianName && data.guardianName.trim().length > 0;

      return hasFather || hasMother || hasGuardian;
    },
    {
      message:
        "At least one of Father, Mother, or Guardian information must be provided",
      path: ["fatherName"], // This will show the error on the father name field
    },
  );

type FormData = z.infer<typeof formSchema>;

export default function AddStudent() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedClassMapping, setSelectedClassMapping] = useState<ClassMapping | null>(null);

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
      // Address fields
      flatBuildingNo: "",
      areaLocality: "",
      city: "",
      state: "",
      pincode: "",
      landmark: "",
      // Optional contact details
      contactNumber: "",
      emailId: "",
      class: "",
      division: "",
      // Father information
      fatherName: "",
      fatherMobileNumber: "",
      fatherEmailId: "",
      // Mother information
      motherName: "",
      motherMobileNumber: "",
      motherEmailId: "",
      // Guardian information
      guardianName: "",
      guardianMobileNumber: "",
      guardianEmailId: "",
      guardianRelation: "",
      apaarId: "",
      aadharNumber: "",
      electiveSelections: {},
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
        // Address fields
        flatBuildingNo: data.flatBuildingNo,
        areaLocality: data.areaLocality,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        landmark: data.landmark || undefined,
        // Optional contact details
        contactNumber: data.contactNumber || undefined,
        emailId: data.emailId || undefined,
        class: data.class,
        division: data.division,
        // Father information (optional)
        fatherName: data.fatherName || undefined,
        fatherMobileNumber: data.fatherMobileNumber || undefined,
        fatherEmailId: data.fatherEmailId || undefined,
        // Mother information (optional)
        motherName: data.motherName || undefined,
        motherMobileNumber: data.motherMobileNumber || undefined,
        motherEmailId: data.motherEmailId || undefined,
        // Guardian information (optional)
        guardianName: data.guardianName || undefined,
        guardianMobileNumber: data.guardianMobileNumber || undefined,
        guardianEmailId: data.guardianEmailId || undefined,
        guardianRelation: data.guardianRelation || undefined,
        apaarId: data.apaarId,
        aadharNumber: data.aadharNumber,
        selectedElectiveGroups: Object.entries(data.electiveSelections || {}).map(([groupName, selectedSubject]) => ({
          groupName,
          selectedSubject
        })),
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

  // Handle class-division selection to update available elective subjects
  const handleClassDivisionChange = (value: string) => {
    const [selectedClass, selectedDivision] = value.split("-");
    const mapping = classMappings?.find(
      (m) => m.class === selectedClass && m.division === selectedDivision
    );
    
    setSelectedClassMapping(mapping || null);
    
    // Clear any previously selected elective selections when class/division changes
    form.setValue("electiveSelections", {});
  };

  // Get unique class-division combinations
  const classDivisionOptions =
    classMappings?.map((mapping) => ({
      value: `${mapping.class}-${mapping.division}`,
      label: `Class ${mapping.class} - Division ${mapping.division}`,
    })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 dark:from-violet-950 dark:via-fuchsia-950 dark:to-pink-950">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8 flex flex-col items-center">
          {/* Header Section */}
          <div className="flex items-center gap-4">
            <Link href="/student-masters">
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Student Masters
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-2">
                Add Student
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-lg">
                Add a new student to the system
              </p>
            </div>
          </div>

          <Card className="max-w-5xl w-full border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader className="border-b border-slate-200 dark:border-slate-700 pb-6">
              <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
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
                              <Input
                                placeholder="Enter first name"
                                {...field}
                              />
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
                              <Input
                                placeholder="Enter middle name"
                                {...field}
                              />
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
                            <FormLabel>Gender *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Gender" />
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
                                      !field.value && "text-muted-foreground",
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
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={
                                    field.value
                                      ? new Date(field.value)
                                      : undefined
                                  }
                                  onSelect={(date) =>
                                    field.onChange(
                                      date ? format(date, "yyyy-MM-dd") : "",
                                    )
                                  }
                                  disabled={(date) =>
                                    date > new Date() ||
                                    date < new Date("1900-01-01")
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
                                <Input
                                  placeholder="Enter APAAR ID"
                                  {...field}
                                />
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
                                <Input
                                  placeholder="Enter Aadhar number"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Address Section */}
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-slate-700 dark:text-slate-300">
                        Address Information
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="flatBuildingNo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Flat/Building No. *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter flat/building number"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="areaLocality"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Area/Locality *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter area/locality"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter city" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter state" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="pincode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pincode *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter pincode" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="landmark"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Landmark (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter nearby landmark"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-slate-700 dark:text-slate-300">
                        Contact Information (Optional)
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="contactNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Student Mobile No. (Optional)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter student contact number"
                                  {...field}
                                />
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
                              <FormLabel>Student Email (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="Enter student email address"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
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
                              const [classValue, divisionValue] =
                                value.split("-");
                              field.onChange(classValue);
                              form.setValue("division", divisionValue);
                              handleClassDivisionChange(value);
                            }}
                            defaultValue={
                              field.value
                                ? `${field.value}-${form.watch("division")}`
                                : ""
                            }
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select class and division" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {classDivisionOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Elective Groups Selection */}
                    {(() => {
                      const electiveGroups = selectedClassMapping?.electiveGroups;
                      if (!electiveGroups || !Array.isArray(electiveGroups) || electiveGroups.length === 0) {
                        return null;
                      }
                      
                      return (
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-md font-medium text-slate-700 dark:text-slate-300">
                              Elective Groups Selection
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              Select one subject from each elective group
                            </p>
                          </div>

                          <FormField
                            control={form.control}
                            name="electiveSelections"
                            render={({ field }) => (
                              <FormItem>
                                <div className="space-y-6">
                                  {(electiveGroups as Array<{groupName: string, subjects: string[]}>).map((group, groupIndex: number) => (
                                    <div key={groupIndex} className="border border-purple-200 dark:border-purple-700 rounded-lg p-4 bg-purple-50/50 dark:bg-purple-900/10">
                                      <div className="mb-3">
                                        <h5 className="font-semibold text-slate-900 dark:text-slate-100">
                                          {group.groupName}
                                        </h5>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                          Choose one subject from this group
                                        </p>
                                      </div>
                                      
                                      <div className="space-y-2">
                                        {group.subjects?.map((subject: string) => (
                                          <div key={subject} className="flex items-center space-x-3">
                                            <input
                                              type="radio"
                                              id={`${group.groupName}-${subject}`}
                                              name={`elective-group-${groupIndex}`}
                                              checked={(field.value as Record<string, string>)?.[group.groupName] === subject}
                                              onChange={() => {
                                                const currentSelections = field.value as Record<string, string> || {};
                                                field.onChange({
                                                  ...currentSelections,
                                                  [group.groupName]: subject
                                                });
                                              }}
                                              className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 focus:ring-purple-500"
                                            />
                                            <label
                                              htmlFor={`${group.groupName}-${subject}`}
                                              className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                                            >
                                              {subject}
                                            </label>
                                          </div>
                                        )) || <div className="text-slate-500 dark:text-slate-400 text-sm">No subjects available in this group</div>}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      );
                    })()}
                  </div>

                  {/* Parent/Guardian Information */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2">
                        Parent/Guardian Information
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                        Please provide at least one of the following: Father's,
                        Mother's, or Guardian's information
                      </p>
                    </div>

                    {/* Father's Information */}
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-slate-700 dark:text-slate-300">
                        Father's Information (Optional)
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          control={form.control}
                          name="fatherName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Father's Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter father's name"
                                  {...field}
                                />
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
                              <FormLabel>Father's Mobile Number</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter father's mobile number"
                                  {...field}
                                />
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
                              <FormLabel>Father's Email ID</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="Enter father's email"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Mother's Information */}
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-slate-700 dark:text-slate-300">
                        Mother's Information (Optional)
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          control={form.control}
                          name="motherName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mother's Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter mother's name"
                                  {...field}
                                />
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
                              <FormLabel>Mother's Mobile Number</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter mother's mobile number"
                                  {...field}
                                />
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
                              <FormLabel>Mother's Email ID</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="Enter mother's email"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Guardian's Information */}
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-slate-700 dark:text-slate-300">
                        Guardian's Information (Optional)
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="guardianName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Guardian's Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter guardian's name"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="guardianRelation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Relation to Student</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., Uncle, Aunt, Grandfather"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="guardianMobileNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Guardian's Mobile Number</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter guardian's mobile number"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="guardianEmailId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Guardian's Email ID</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="Enter guardian's email"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-6">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={createStudentMutation.isPending}
                      className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {createStudentMutation.isPending
                        ? "Saving..."
                        : "Save Student"}
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
