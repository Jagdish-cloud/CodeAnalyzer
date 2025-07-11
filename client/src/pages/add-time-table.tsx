import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, Save, Clock, Users, BookOpen } from "lucide-react";
import { useLocation } from "wouter";
import type { 
  ClassMapping, 
  SchoolSchedule, 
  Subject, 
  Staff, 
  TeacherMapping,
  WorkingDay,
  InsertTimeTable, 
  InsertTimeTableEntry 
} from "@shared/schema";

const days = [
  "Monday",
  "Tuesday", 
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const timeTableFormSchema = z.object({
  academicYear: z.string().min(1, "Academic year is required"),
  classDivision: z.string().min(1, "Class division is required"),
});

type TimeTableFormData = z.infer<typeof timeTableFormSchema>;

interface TeacherSubjectOption {
  value: string;
  label: string;
  subjectId: number | null;
  teacherId: number | null;
}

export default function AddTimeTable() {
  const [, setLocation] = useLocation();
  const [selectedClassDivision, setSelectedClassDivision] = useState("");
  const [scheduleEntries, setScheduleEntries] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch class mappings
  const { data: classMappings = [] } = useQuery({
    queryKey: ["/api/class-mappings"],
    queryFn: async () => {
      const response = await fetch("/api/class-mappings");
      if (!response.ok) throw new Error("Failed to fetch class mappings");
      return response.json() as Promise<ClassMapping[]>;
    },
  });

  // Fetch school schedules
  const { data: schedules = [] } = useQuery({
    queryKey: ["/api/school-schedules"],
    queryFn: async () => {
      const response = await fetch("/api/school-schedules");
      if (!response.ok) throw new Error("Failed to fetch school schedules");
      return response.json() as Promise<SchoolSchedule[]>;
    },
  });

  // Fetch subjects
  const { data: subjects = [] } = useQuery({
    queryKey: ["/api/subjects"],
    queryFn: async () => {
      const response = await fetch("/api/subjects");
      if (!response.ok) throw new Error("Failed to fetch subjects");
      return response.json() as Promise<Subject[]>;
    },
  });

  // Fetch staff (teachers)
  const { data: staff = [] } = useQuery({
    queryKey: ["/api/staff"],
    queryFn: async () => {
      const response = await fetch("/api/staff");
      if (!response.ok) throw new Error("Failed to fetch staff");
      return response.json() as Promise<Staff[]>;
    },
  });

  // Fetch teacher mappings
  const { data: teacherMappings = [] } = useQuery({
    queryKey: ["/api/teacher-mappings"],
    queryFn: async () => {
      const response = await fetch("/api/teacher-mappings");
      if (!response.ok) throw new Error("Failed to fetch teacher mappings");
      return response.json() as Promise<TeacherMapping[]>;
    },
  });

  // Fetch working days
  const { data: workingDays = [] } = useQuery({
    queryKey: ["/api/working-days"],
    queryFn: async () => {
      const response = await fetch("/api/working-days");
      if (!response.ok) throw new Error("Failed to fetch working days");
      return response.json() as Promise<WorkingDay[]>;
    },
  });

  const form = useForm<TimeTableFormData>({
    resolver: zodResolver(timeTableFormSchema),
    defaultValues: {
      academicYear: "",
      classDivision: "",
    },
  });

  // Create time table mutation
  const createTimeTableMutation = useMutation({
    mutationFn: async (data: { timeTable: InsertTimeTable; entries: InsertTimeTableEntry[] }) => {
      // First create the time table
      const timeTableResponse = await apiRequest("POST", "/api/time-tables", data.timeTable);

      const timeTable = await timeTableResponse.json();

      // Then create all the entries
      const entryPromises = data.entries.map(entry => 
        apiRequest("POST", "/api/time-table-entries", { ...entry, timeTableId: timeTable.id })
      );

      await Promise.all(entryPromises);
      return timeTable;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Time table created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/time-tables"] });
      setLocation("/time-table");
    },
    onError: (error: Error) => {
      toast({
        title: "Error", 
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Generate class division options
  const classDivisionOptions = classMappings
    .filter(mapping => mapping.class && mapping.division) // Filter out empty values
    .map(mapping => ({
      value: `${mapping.class}-${mapping.division}`,
      label: `Class ${mapping.class} - Division ${mapping.division}`,
      subjects: mapping.subjects || [],
    }));

  // Get working days that have schedules configured
  const getWorkingDaysWithSchedules = () => {
    // Get days that have school schedules configured
    const daysWithSchedules = Array.from(new Set(schedules.map(s => s.dayOfWeek)));
    
    // Filter working days to only include those with schedules and are not holidays
    const validWorkingDays = workingDays.filter(wd => 
      daysWithSchedules.includes(wd.dayOfWeek) && wd.dayType !== "Holiday"
    );
    
    return validWorkingDays.map(wd => wd.dayOfWeek);
  };

  // Get schedule slots for the selected class division - organized by day
  const getScheduleSlotsForDay = (day: string) => {
    // Get schedules for this specific day, sorted by timing
    const daySchedules = schedules
      .filter(s => s.dayOfWeek === day)
      .sort((a, b) => a.timingFrom.localeCompare(b.timingFrom));
    
    return daySchedules.map(schedule => ({
      name: schedule.name,
      timing: `${schedule.timingFrom} - ${schedule.timingTo}`,
      type: schedule.type,
      timingFrom: schedule.timingFrom,
      timingTo: schedule.timingTo
    }));
  };

  // Get maximum number of schedule slots across all days for table structure
  const getMaxScheduleSlots = () => {
    const workingDays = getWorkingDaysWithSchedules();
    let maxSlots = 0;
    
    workingDays.forEach(day => {
      const daySlots = getScheduleSlotsForDay(day);
      maxSlots = Math.max(maxSlots, daySlots.length);
    });
    
    return maxSlots;
  };

  // Generate teacher-subject options with conflict detection
  const getTeacherSubjectOptions = (day: string, timeFrom: string, timeTo: string): TeacherSubjectOption[] => {
    if (!selectedClassDivision) return [];
    
    const [className, division] = selectedClassDivision.split('-');
    
    const options: TeacherSubjectOption[] = [
      { value: "no-assignment", label: "No assignment", subjectId: null, teacherId: null }
    ];

    // Get teacher mappings for the selected class
    const relevantMappings = teacherMappings.filter(mapping => mapping.class === className);

    relevantMappings.forEach(mapping => {
      const subject = subjects.find(s => s.subjectName === mapping.subject);
      if (subject && mapping.divisions) {
        // Check if the mapping has divisions data
        const divisions = Array.isArray(mapping.divisions) ? mapping.divisions : [];
        
        // Find the specific division
        const divisionData = divisions.find((div: any) => div.division === division);
        
        // Only add if teacher is assigned
        if (divisionData && divisionData.teacherId) {
          // Get teacher details
          const teacher = staff.find(s => s.id === divisionData.teacherId);
          
          if (teacher) {
            // Check for teacher conflicts on the same day and time
            const hasConflict = checkTeacherConflict(teacher.id, day, timeFrom, timeTo);
            
            options.push({
              value: `subject-${subject.id}-teacher-${teacher.id}`,
              label: hasConflict 
                ? `${mapping.subject} - ${teacher.name} (Conflict!)` 
                : `${mapping.subject} - ${teacher.name}`,
              subjectId: subject.id,
              teacherId: teacher.id,
            });
          }
        }
      }
    });

    return options;
  };

  // Check if teacher has a conflict at the given time
  const checkTeacherConflict = (teacherId: number, day: string, timeFrom: string, timeTo: string): boolean => {
    // Check existing schedule entries for conflicts
    for (const [key, value] of Object.entries(scheduleEntries)) {
      if (value && value.includes(`teacher-${teacherId}`)) {
        const [entryDay, slotName] = key.split('-');
        if (entryDay === day) {
          // Find the schedule for this slot to get timing
          const slotSchedule = schedules.find(s => s.dayOfWeek === day && s.name === slotName);
          if (slotSchedule) {
            // Check for time overlap
            if (timesOverlap(timeFrom, timeTo, slotSchedule.timingFrom, slotSchedule.timingTo)) {
              return true;
            }
          }
        }
      }
    }
    return false;
  };

  // Helper function to check if two time ranges overlap
  const timesOverlap = (start1: string, end1: string, start2: string, end2: string): boolean => {
    return start1 < end2 && start2 < end1;
  };

  const onSubmit = (data: TimeTableFormData) => {
    if (!selectedClassDivision) {
      toast({
        title: "Error",
        description: "Please select a class division",
        variant: "destructive",
      });
      return;
    }

    const [className, division] = selectedClassDivision.split('-');

    // Create time table
    const timeTableData: InsertTimeTable = {
      academicYear: data.academicYear,
      className,
      division,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    // Create entries from schedule entries
    const entries: InsertTimeTableEntry[] = [];
    
    Object.entries(scheduleEntries).forEach(([key, value]) => {
      if (value && value !== "no-assignment") {
        const [day, slot] = key.split('-');
        const option = getTeacherSubjectOptions().find(opt => opt.value === value);
        
        if (option && option.subjectId) {
          entries.push({
            timeTableId: 0, // Will be set after time table creation
            dayOfWeek: day,
            scheduleSlot: slot,
            subjectId: option.subjectId,
            teacherId: option.teacherId,
          });
        }
      }
    });

    createTimeTableMutation.mutate({ timeTable: timeTableData, entries });
  };

  const handleClassDivisionChange = (value: string) => {
    setSelectedClassDivision(value);
    setScheduleEntries({}); // Clear previous entries
    form.setValue("classDivision", value);
  };

  const handleScheduleEntryChange = (day: string, slot: string, value: string) => {
    const key = `${day}-${slot}`;
    setScheduleEntries(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const scheduleSlots = getScheduleSlots();
  const teacherSubjectOptions = getTeacherSubjectOptions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Create Time Table
          </h1>
          <p className="text-blue-700 dark:text-blue-300">
            Build comprehensive class schedules with teacher assignments
          </p>
        </div>

        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-blue-200 dark:border-blue-800 shadow-2xl shadow-blue-200/50 dark:shadow-blue-900/30 max-w-5xl mx-auto">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl text-blue-700 dark:text-blue-300 flex items-center">
              <Calendar className="mr-2 h-6 w-6" />
              Time Table Details
            </CardTitle>
            <CardDescription className="text-blue-600 dark:text-blue-400">
              Create a new time table with automated teacher conflict detection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="academicYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-700 dark:text-blue-300">
                          Academic Year
                        </FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="border-blue-200 focus:border-blue-400 dark:border-blue-700">
                              <SelectValue placeholder="Select academic year" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="2024-25">2024-25</SelectItem>
                              <SelectItem value="2025-26">2025-26</SelectItem>
                              <SelectItem value="2026-27">2026-27</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="classDivision"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-700 dark:text-blue-300">
                          Class Division
                        </FormLabel>
                        <FormControl>
                          <Select 
                            onValueChange={handleClassDivisionChange} 
                            value={field.value}
                          >
                            <SelectTrigger className="border-blue-200 focus:border-blue-400 dark:border-blue-700">
                              <SelectValue placeholder="Select class division" />
                            </SelectTrigger>
                            <SelectContent>
                              {classDivisionOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Schedule Grid */}
                {selectedClassDivision && getMaxScheduleSlots() > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-4 flex items-center">
                      <Clock className="mr-2 h-5 w-5" />
                      Weekly Schedule
                    </h3>
                    
                    <div className="overflow-x-auto">
                      <Table className="min-w-full border border-blue-200 dark:border-blue-700">
                        <TableHeader>
                          {/* Header Row 1: Schedule Numbers */}
                          <TableRow className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900">
                            <TableHead className="text-blue-700 dark:text-blue-300 font-semibold min-w-[100px] border-r border-blue-200 dark:border-blue-700">
                              Days
                            </TableHead>
                            {Array.from({ length: getMaxScheduleSlots() }, (_, index) => (
                              <TableHead 
                                key={`schedule-${index + 1}`}
                                className="text-blue-700 dark:text-blue-300 font-semibold min-w-[200px] text-center border-r border-blue-200 dark:border-blue-700"
                              >
                                Schedule-{index + 1}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getWorkingDaysWithSchedules().map((day) => {
                            const daySlots = getScheduleSlotsForDay(day);
                            return (
                              <React.Fragment key={day}>
                                {/* Period/Break Names Row */}
                                <TableRow className="bg-blue-50 dark:bg-blue-950/30">
                                  <TableCell className="border-r border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 font-medium text-center py-1">
                                    
                                  </TableCell>
                                  {Array.from({ length: getMaxScheduleSlots() }, (_, index) => {
                                    const slot = daySlots[index];
                                    return (
                                      <TableCell 
                                        key={`${day}-period-${index}`}
                                        className="border-r border-blue-200 dark:border-blue-700 text-center py-1 text-sm font-medium text-blue-600 dark:text-blue-400"
                                      >
                                        {slot ? slot.name : ''}
                                      </TableCell>
                                    );
                                  })}
                                </TableRow>
                                
                                {/* Timing Row */}
                                <TableRow className="bg-blue-50 dark:bg-blue-950/30">
                                  <TableCell className="border-r border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 font-medium text-center py-1">
                                    
                                  </TableCell>
                                  {Array.from({ length: getMaxScheduleSlots() }, (_, index) => {
                                    const slot = daySlots[index];
                                    return (
                                      <TableCell 
                                        key={`${day}-timing-${index}`}
                                        className="border-r border-blue-200 dark:border-blue-700 text-center py-1 text-xs text-blue-500 dark:text-blue-400"
                                      >
                                        {slot ? slot.timing : ''}
                                      </TableCell>
                                    );
                                  })}
                                </TableRow>
                                
                                {/* Assignment Row */}
                                <TableRow className="hover:bg-blue-50 dark:hover:bg-blue-950/50 border-b-2 border-blue-200 dark:border-blue-700">
                                  <TableCell className="font-bold text-blue-700 dark:text-blue-300 border-r border-blue-200 dark:border-blue-700 py-3">
                                    {day}
                                  </TableCell>
                                  {Array.from({ length: getMaxScheduleSlots() }, (_, index) => {
                                    const slot = daySlots[index];
                                    return (
                                      <TableCell 
                                        key={`${day}-assignment-${index}`}
                                        className="p-2 border-r border-blue-200 dark:border-blue-700"
                                      >
                                        {!slot ? (
                                          <div className="text-center text-gray-400 dark:text-gray-600 py-2 italic text-sm">
                                            No schedule
                                          </div>
                                        ) : slot.type === "Break" ? (
                                          <div className="text-center text-gray-500 dark:text-gray-400 py-2 font-medium">
                                            No Assignment
                                          </div>
                                        ) : (
                                          <Select
                                            value={scheduleEntries[`${day}-${slot.name}`] || ""}
                                            onValueChange={(value) => 
                                              handleScheduleEntryChange(day, slot.name, value)
                                            }
                                          >
                                            <SelectTrigger className="w-full border-blue-200 focus:border-blue-400 dark:border-blue-700">
                                              <SelectValue placeholder="Select Teacher & Subject" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {getTeacherSubjectOptions(day, slot.timingFrom, slot.timingTo).map((option) => (
                                                <SelectItem 
                                                  key={option.value} 
                                                  value={option.value}
                                                  className={option.label.includes('Conflict!') ? 'text-red-600 dark:text-red-400' : ''}
                                                >
                                                  {option.label}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        )}
                                      </TableCell>
                                    );
                                  })}
                                </TableRow>
                              </React.Fragment>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end pt-6 border-t border-blue-200 dark:border-blue-700">
                  <Button
                    type="submit"
                    disabled={createTimeTableMutation.isPending || !selectedClassDivision}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-2"
                  >
                    {createTimeTableMutation.isPending ? (
                      <>Creating...</>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Time Table
                      </>
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