import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { ClassMapping, Staff, InsertTeacherMapping } from "@shared/schema";

const formSchema = z.object({
  class: z.string().min(1, "Class is required"),
  subject: z.string().min(1, "Subject is required"),
  divisions: z.array(z.object({
    division: z.string(),
    teacherId: z.number().optional(),
    teacherName: z.string().optional(),
  })).min(1, "At least one division assignment is required"),
  status: z.string().default("Current working"),
});

type FormData = z.infer<typeof formSchema>;

interface DivisionAssignment {
  division: string;
  teacherId?: number;
  teacherName?: string;
}

export default function AddTeacherMapping() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [availableDivisions, setAvailableDivisions] = useState<DivisionAssignment[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      class: "",
      subject: "",
      divisions: [],
      status: "Current working",
    },
  });

  // Fetch class mappings to get available classes, subjects, and divisions
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

  // Fetch staff data for teacher dropdown
  const { data: staffData } = useQuery({
    queryKey: ["/api/staff"],
    queryFn: async () => {
      const response = await fetch("/api/staff");
      if (!response.ok) {
        throw new Error("Failed to fetch staff");
      }
      return response.json() as Promise<Staff[]>;
    },
  });

  // Get unique classes from class mappings
  const availableClasses = classMappings 
    ? classMappings.map(mapping => mapping.class)
        .filter((className, index, array) => array.indexOf(className) === index)
        .sort()
    : [];

  // Get teachers with "Current working" status
  const availableTeachers = staffData 
    ? staffData.filter(staff => staff.status === "Current working")
    : [];

  // Update available subjects when class changes
  useEffect(() => {
    if (selectedClass && classMappings) {
      const classSubjects = classMappings
        .filter(mapping => mapping.class === selectedClass)
        .map(mapping => mapping.subject);
      const uniqueSubjects = classSubjects
        .filter((subject, index, array) => array.indexOf(subject) === index)
        .sort();
      setAvailableSubjects(uniqueSubjects);
      
      // Reset subject when class changes
      form.setValue("subject", "");
      setAvailableDivisions([]);
      form.setValue("divisions", []);
    }
  }, [selectedClass, classMappings, form]);

  // Update available divisions when subject changes
  useEffect(() => {
    const selectedSubject = form.watch("subject");
    if (selectedClass && selectedSubject && classMappings) {
      const classDivisions = classMappings
        .filter(mapping => mapping.class === selectedClass && mapping.subject === selectedSubject)
        .map(mapping => mapping.division);
      const uniqueDivisions = classDivisions
        .filter((division, index, array) => array.indexOf(division) === index)
        .sort();
      
      const divisionAssignments: DivisionAssignment[] = uniqueDivisions.map(division => ({
        division,
        teacherId: undefined,
        teacherName: undefined,
      }));
      
      setAvailableDivisions(divisionAssignments);
      form.setValue("divisions", divisionAssignments);
    }
  }, [form.watch("subject"), selectedClass, classMappings, form]);

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const teacherMappingData: InsertTeacherMapping = {
        class: data.class,
        subject: data.subject,
        divisions: data.divisions,
        status: data.status,
      };

      const response = await fetch("/api/teacher-mappings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teacherMappingData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create teacher mapping");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teacher-mappings"] });
      toast({
        title: "Success",
        description: "Teacher mapping created successfully",
      });
      setLocation("/teacher-mapping");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  const updateTeacherAssignment = (divisionIndex: number, teacherId: number, teacherName: string) => {
    const currentDivisions = form.getValues("divisions");
    const updatedDivisions = [...currentDivisions];
    updatedDivisions[divisionIndex] = {
      ...updatedDivisions[divisionIndex],
      teacherId,
      teacherName,
    };
    form.setValue("divisions", updatedDivisions);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-teal-950 dark:via-cyan-950 dark:to-blue-950">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center mb-8">
          <Link href="/teacher-mapping">
            <Button variant="ghost" className="mr-4 hover:bg-white/20 dark:hover:bg-white/10 rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Teacher Mappings
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
              Add Teacher Mapping
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Create a new teacher assignment for class, subject, and divisions
            </p>
          </div>
        </div>

        <Card className="glass-morphism border-white/20 dark:border-slate-700/20 shadow-2xl max-w-4xl">
          <CardHeader className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border-b border-white/10 dark:border-slate-700/10">
            <CardTitle className="text-slate-800 dark:text-slate-200">
              Teacher Mapping Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                          Class
                        </FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedClass(value);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white/60 dark:bg-slate-800/60 border-white/40 dark:border-slate-700/40 backdrop-blur-sm rounded-xl">
                              <SelectValue placeholder="Select a class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableClasses.map((className) => (
                              <SelectItem key={className} value={className}>
                                {className}
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
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                          Subject
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!selectedClass}>
                          <FormControl>
                            <SelectTrigger className="bg-white/60 dark:bg-slate-800/60 border-white/40 dark:border-slate-700/40 backdrop-blur-sm rounded-xl">
                              <SelectValue placeholder="Select a subject" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableSubjects.map((subject) => (
                              <SelectItem key={subject} value={subject}>
                                {subject}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {availableDivisions.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                      Division Teacher Assignments
                    </h3>
                    <Card className="bg-white/50 dark:bg-slate-800/50 border-white/30 dark:border-slate-700/30">
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200/50 dark:border-slate-700/50">
                              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                                Division
                              </TableHead>
                              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                                Assigned Teacher
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {availableDivisions.map((division, index) => (
                              <TableRow key={division.division} className="border-b border-slate-200/30 dark:border-slate-700/30">
                                <TableCell className="font-medium text-slate-800 dark:text-slate-200">
                                  {division.division}
                                </TableCell>
                                <TableCell>
                                  <Select
                                    onValueChange={(value) => {
                                      const selectedTeacher = availableTeachers.find(t => t.id.toString() === value);
                                      if (selectedTeacher) {
                                        updateTeacherAssignment(index, selectedTeacher.id, selectedTeacher.name);
                                      }
                                    }}
                                  >
                                    <SelectTrigger className="bg-white/60 dark:bg-slate-800/60 border-white/40 dark:border-slate-700/40 backdrop-blur-sm rounded-lg">
                                      <SelectValue placeholder="Select teacher" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {availableTeachers.map((teacher) => (
                                        <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                          {teacher.name} ({teacher.role})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <div className="flex justify-end space-x-4 pt-6">
                  <Link href="/teacher-mapping">
                    <Button variant="outline" type="button" className="rounded-xl">
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {createMutation.isPending ? "Creating..." : "Submit"}
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