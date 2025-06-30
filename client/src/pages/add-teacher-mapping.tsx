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
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { ClassMapping, Staff, InsertTeacherMapping } from "@shared/schema";

const formSchema = z.object({
  classDivision: z.string().min(1, "Class-Division is required"),
  subjectAssignments: z.array(z.object({
    subject: z.string(),
    teacherId: z.number().optional(),
    teacherName: z.string().optional(),
    isClassTeacher: z.boolean().default(false),
  })),
  status: z.string().default("Current working"),
});

type FormData = z.infer<typeof formSchema>;

interface SubjectAssignment {
  subject: string;
  teacherId?: number;
  teacherName?: string;
  isClassTeacher: boolean;
}

export default function AddTeacherMapping() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedClassDivision, setSelectedClassDivision] = useState<string>("");
  const [subjectAssignments, setSubjectAssignments] = useState<SubjectAssignment[]>([]);

  // Fetch class mappings to get available class-division combinations
  const { data: classMappings, isLoading: classMappingsLoading } = useQuery<ClassMapping[]>({
    queryKey: ["/api/class-mappings"],
  });

  // Fetch staff members for teacher selection
  const { data: staff, isLoading: staffLoading } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      classDivision: "",
      subjectAssignments: [],
      status: "Current working",
    },
  });

  // Get unique class-division combinations
  const classDivisionOptions = Array.from(
    new Set(
      classMappings?.map(mapping => `${mapping.class}-${mapping.division}`) || []
    )
  ).map(classDivision => {
    const [cls, division] = classDivision.split('-');
    return {
      value: classDivision,
      label: `Class ${cls} - Division ${division}`,
      class: cls,
      division: division
    };
  });

  // When class-division is selected, load available subjects
  useEffect(() => {
    if (selectedClassDivision) {
      const [selectedClass, selectedDivision] = selectedClassDivision.split("-");
      
      // Get all subjects for this class-division combination
      const relevantMappings = classMappings?.filter(
        mapping => mapping.class === selectedClass && mapping.division === selectedDivision
      ) || [];
      
      // Extract all unique subjects from the mappings
      const subjects = Array.from(
        new Set(
          relevantMappings.flatMap(mapping => mapping.subjects || [])
        )
      );
      
      const assignments: SubjectAssignment[] = subjects.map(subject => ({
        subject,
        teacherId: undefined,
        teacherName: undefined,
        isClassTeacher: false,
      }));
      
      setSubjectAssignments(assignments);
      form.setValue("classDivision", selectedClassDivision);
      form.setValue("subjectAssignments", assignments);
    }
  }, [selectedClassDivision, classMappings, form]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Convert to the existing teacher mapping format for backend compatibility
      const [selectedClass, selectedDivision] = data.classDivision.split("-");
      
      // Create a teacher mapping for each subject that has a teacher assigned
      const promises = data.subjectAssignments
        .filter(assignment => assignment.teacherId)
        .map(async (assignment) => {
          const teacherMappingData: InsertTeacherMapping = {
            class: selectedClass,
            subject: assignment.subject,
            divisions: [{
              division: selectedDivision,
              teacherId: assignment.teacherId!,
              teacherName: assignment.teacherName || "",
            }],
            status: data.status || "Current working",
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
        });

      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teacher-mappings"] });
      toast({
        title: "Success",
        description: "Teacher mappings created successfully",
      });
      navigate("/teacher-mapping");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create teacher mappings",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  const updateSubjectTeacher = (subjectIndex: number, teacherId: number, teacherName: string) => {
    const updatedAssignments = [...subjectAssignments];
    updatedAssignments[subjectIndex] = {
      ...updatedAssignments[subjectIndex],
      teacherId,
      teacherName,
    };
    setSubjectAssignments(updatedAssignments);
    form.setValue("subjectAssignments", updatedAssignments);
  };

  const toggleClassTeacher = (subjectIndex: number, isClassTeacher: boolean) => {
    const updatedAssignments = [...subjectAssignments];
    
    // If setting as class teacher, unset all others
    if (isClassTeacher) {
      updatedAssignments.forEach((assignment, index) => {
        assignment.isClassTeacher = index === subjectIndex;
      });
    } else {
      updatedAssignments[subjectIndex].isClassTeacher = false;
    }
    
    setSubjectAssignments(updatedAssignments);
    form.setValue("subjectAssignments", updatedAssignments);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-teal-950 dark:via-cyan-950 dark:to-blue-950">
      <div className="container mx-auto px-6 py-8 flex flex-col items-center">
        <div className="max-w-6xl w-full space-y-8">
          {/* Header */}
          <div className="flex items-center gap-6">
            <Link href="/teacher-mapping">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Teacher Mappings
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-2">
                Add Teacher Mapping
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-lg mt-2">
                Assign teachers to subjects for class divisions
              </p>
            </div>
          </div>

          {/* Main Form */}
          <Card className="max-w-5xl w-full border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader className="border-b border-slate-200 dark:border-slate-700 pb-6">
              <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                Teacher Assignment Form
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Class-Division Selection */}
                  <FormField
                    control={form.control}
                    name="classDivision"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-900 dark:text-slate-100 font-medium text-lg">
                          Class-Division
                        </FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedClassDivision(value);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-12">
                              <SelectValue placeholder="Select class and division" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60">
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

                  {/* Subject Assignments Table */}
                  {subjectAssignments.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                        Subject Teacher Assignments
                      </h3>
                      <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                              <TableHead className="font-semibold text-slate-900 dark:text-slate-100 py-4">
                                Subject
                              </TableHead>
                              <TableHead className="font-semibold text-slate-900 dark:text-slate-100 py-4">
                                Assign Teacher
                              </TableHead>
                              <TableHead className="font-semibold text-slate-900 dark:text-slate-100 py-4 text-center">
                                Class Teacher
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {subjectAssignments.map((assignment, index) => (
                              <TableRow key={assignment.subject} className="border-slate-200 dark:border-slate-700">
                                <TableCell className="py-4">
                                  <div className="font-medium text-slate-900 dark:text-slate-100">
                                    {assignment.subject}
                                  </div>
                                </TableCell>
                                <TableCell className="py-4">
                                  <Select
                                    onValueChange={(value) => {
                                      if (value && value !== "none") {
                                        const teacher = staff?.find(s => s.id.toString() === value);
                                        if (teacher) {
                                          updateSubjectTeacher(index, teacher.id, teacher.name);
                                        }
                                      } else {
                                        updateSubjectTeacher(index, 0, "");
                                      }
                                    }}
                                    value={assignment.teacherId?.toString() || "none"}
                                  >
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                      <SelectValue placeholder="Select teacher" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">No teacher assigned</SelectItem>
                                      {staff?.map((teacher) => (
                                        <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                          {teacher.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell className="py-4 text-center">
                                  <Checkbox
                                    checked={assignment.isClassTeacher}
                                    onCheckedChange={(checked) => 
                                      toggleClassTeacher(index, checked as boolean)
                                    }
                                    disabled={!assignment.teacherId}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  {/* Submit Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/teacher-mapping")}
                      className="flex-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={mutation.isPending || subjectAssignments.length === 0}
                      className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white"
                    >
                      {mutation.isPending ? "Creating..." : "Create Teacher Mappings"}
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