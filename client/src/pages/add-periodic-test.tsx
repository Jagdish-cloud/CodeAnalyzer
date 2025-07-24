import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Calendar, Clock, Plus } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertPeriodicTestSchema } from "@shared/schema";
import type { ClassMapping, SyllabusMaster } from "@shared/schema";

const formSchema = z.object({
  year: z.string().min(1, "Year is required"),
  testName: z.string().min(1, "Test name is required"),
  class: z.string().min(1, "Class is required"),
  testDate: z.string().min(1, "Test start date is required"),
  testEndDate: z.string().min(1, "Test end date is required"),
  status: z.string().default("active"),
  testDays: z.array(z.object({
    date: z.string(),
    subject: z.string().min(1, "Subject is required"),
    maximumMarks: z.number().optional(),
    fromTime: z.string().min(1, "From time is required"),
    toTime: z.string().min(1, "To time is required"),
    duration: z.string().optional(),
    syllabusChapters: z.array(z.string()).optional().default([]),
  })).optional().default([]),
});

type FormData = z.infer<typeof formSchema>;

export default function AddPeriodicTestPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [syllabusModalOpen, setSyllabusModalOpen] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [tempSelectedChapters, setTempSelectedChapters] = useState<string[]>([]);

  const { data: classMappings = [], isLoading: isClassMappingsLoading } = useQuery<ClassMapping[]>({
    queryKey: ["/api/class-mappings"],
  });

  const { data: syllabusMasters = [], isLoading: isSyllabusLoading } = useQuery<SyllabusMaster[]>({
    queryKey: ["/api/syllabus-masters"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      year: new Date().getFullYear() + "-" + (new Date().getFullYear() + 1),
      testName: "",
      class: "",
      testDate: "",
      testEndDate: "",
      status: "active",
      testDays: [],
    },
  });

  const selectedClass = form.watch("class");
  const testStartDate = form.watch("testDate");
  const testEndDate = form.watch("testEndDate");
  const testDays = form.watch("testDays");

  // Calculate duration automatically
  const calculateDuration = (from: string, to: string): string => {
    if (!from || !to) return "";
    
    const [fromHour, fromMin] = from.split(':').map(Number);
    const [toHour, toMin] = to.split(':').map(Number);
    
    const fromMinutes = fromHour * 60 + fromMin;
    const toMinutes = toHour * 60 + toMin;
    
    if (toMinutes <= fromMinutes) {
      return "Invalid time range";
    }
    
    const diffMinutes = toMinutes - fromMinutes;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  };

  // Generate date rows excluding Sundays
  const generateDateRows = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return [];
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates = [];
    
    // Validate date range
    if (start > end) return [];
    
    let currentDate = new Date(start);
    while (currentDate <= end) {
      // Exclude Sundays (getDay() === 0)
      if (currentDate.getDay() !== 0) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short' });
        const formattedDate = currentDate.toLocaleDateString('en-GB', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        });
        
        dates.push({
          dateStr,
          dayName,
          formattedDate,
          displayText: `${formattedDate} (${dayName})`
        });
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };

  const dateRows = generateDateRows(testStartDate, testEndDate);

  // Update testDays array when date range changes
  useEffect(() => {
    if (testStartDate && testEndDate) {
      const newDateRows = generateDateRows(testStartDate, testEndDate);
      const newTestDays = newDateRows.map(dateRow => ({
        date: dateRow.dateStr,
        subject: "",
        maximumMarks: undefined,
        fromTime: "",
        toTime: "",
        duration: "",
        syllabusChapters: [],
      }));
      form.setValue("testDays", newTestDays);
    }
  }, [testStartDate, testEndDate, form]);

  // Calculate duration for a specific day
  const calculateDurationForDay = (fromTime: string, toTime: string): string => {
    return calculateDuration(fromTime, toTime);
  };

  // Open syllabus modal for specific day
  const openSyllabusModal = (dayIndex: number) => {
    setSelectedDayIndex(dayIndex);
    const currentDay = testDays[dayIndex];
    if (currentDay) {
      setTempSelectedChapters([...currentDay.syllabusChapters]);
    }
    setSyllabusModalOpen(true);
  };

  // Get available chapters for selected subject in modal
  const getAvailableChaptersForDay = (dayIndex: number) => {
    const currentDay = testDays[dayIndex];
    if (!currentDay || !currentDay.subject || !selectedClass) return [];
    
    return syllabusMasters
      .filter(syllabus => 
        syllabus.class === selectedClass && 
        syllabus.subject === currentDay.subject
      )
      .map(syllabus => syllabus.chapterLessonNo);
  };

  // Handle syllabus submission
  const handleSyllabusSubmit = () => {
    if (selectedDayIndex !== null) {
      form.setValue(`testDays.${selectedDayIndex}.syllabusChapters`, tempSelectedChapters);
    }
    setSyllabusModalOpen(false);
    setSelectedDayIndex(null);
    setTempSelectedChapters([]);
  };

  // Get available subjects for selected class (union of all subjects from all divisions)
  const availableSubjects = selectedClass
    ? Array.from(new Set(classMappings
        .filter(mapping => mapping.class === selectedClass)
        .flatMap(mapping => mapping.subjects)))
    : [];





  const createTestMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      // Create separate test entries for each day
      const testPromises = formData.testDays.map((dayData) => {
        return apiRequest("POST", "/api/periodic-tests", {
          year: formData.year,
          testName: formData.testName,
          class: formData.class,
          subject: dayData.subject,
          chapters: dayData.syllabusChapters.length > 0 ? dayData.syllabusChapters : ["No chapters available"],
          testDate: dayData.date,
          testEndDate: dayData.date, // Each day is its own test
          fromTime: dayData.fromTime,
          toTime: dayData.toTime,
          duration: dayData.duration,
          maximumMarks: dayData.maximumMarks || 50,
          status: formData.status,
        });
      });
      
      return Promise.all(testPromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/periodic-tests"] });
      toast({
        title: "Success",
        description: "Periodic tests have been created successfully",
      });
      navigate("/periodic-test");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create periodic tests",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    // Validate that we have test days
    if (!data.testDays || data.testDays.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select start and end dates to generate test schedule",
        variant: "destructive",
      });
      return;
    }

    // Validate each test day
    for (let i = 0; i < data.testDays.length; i++) {
      const day = data.testDays[i];
      if (!day.subject) {
        toast({
          title: "Validation Error",
          description: `Please select a subject for ${dateRows[i]?.displayText || `day ${i + 1}`}`,
          variant: "destructive",
        });
        return;
      }
      if (!day.fromTime || !day.toTime) {
        toast({
          title: "Validation Error",
          description: `Please set time range for ${dateRows[i]?.displayText || `day ${i + 1}`}`,
          variant: "destructive",
        });
        return;
      }
      if (day.duration === "Invalid time range") {
        toast({
          title: "Validation Error",
          description: `Invalid time range for ${dateRows[i]?.displayText || `day ${i + 1}`}. To Time must be after From Time`,
          variant: "destructive",
        });
        return;
      }
    }
    
    createTestMutation.mutate(data);
  };

  if (isClassMappingsLoading || isSyllabusLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-lg text-gray-600">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/periodic-test">
            <Button variant="ghost" className="mb-4 text-orange-600 hover:text-orange-700 hover:bg-orange-50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Periodic Tests
            </Button>
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Schedule Periodic Test
          </h1>
          <h2 className="text-lg text-gray-600 mt-2">
            Create a new periodic test schedule
          </h2>
        </div>

        <div className="mb-2" />

        {/* Form Card */}
        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl max-w-5xl mx-auto">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Add Periodic Test
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Row 1: Year and Class */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-semibold">Select Year</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-white border-slate-200" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-semibold">Select Class</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white border-slate-200">
                              <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from(new Set(classMappings.map(mapping => mapping.class)))
                              .sort()
                              .map((className) => (
                                <SelectItem key={className} value={className}>
                                  Class {className}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 2: Test Name */}
                <FormField
                  control={form.control}
                  name="testName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold">Period Test Name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Enter test name"
                          className="bg-white border-slate-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Row 3: Test Start Date and Test End Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="testDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-semibold">Test Start Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="bg-white border-slate-200"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="testEndDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-semibold">Test End Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="bg-white border-slate-200"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Table Section */}
                <div className="mt-8">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <table className="w-full border-collapse border border-slate-300">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="border border-slate-300 p-3 text-left font-semibold">Date / Day</th>
                          <th className="border border-slate-300 p-3 text-left font-semibold">Subject</th>
                          <th className="border border-slate-300 p-3 text-left font-semibold">Maximum Marks</th>
                          <th className="border border-slate-300 p-3 text-left font-semibold">Time From</th>
                          <th className="border border-slate-300 p-3 text-left font-semibold">Time To</th>
                          <th className="border border-slate-300 p-3 text-left font-semibold">Syllabus</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dateRows.length > 0 && testDays.length > 0 ? (
                          dateRows.map((dateRow, index) => (
                            <tr key={dateRow.dateStr}>
                              <td className="border border-slate-300 p-3">
                                <div className="text-slate-700 font-medium">
                                  {dateRow.displayText}
                                </div>
                              </td>
                              <td className="border border-slate-300 p-3">
                                <FormField
                                  control={form.control}
                                  name={`testDays.${index}.subject`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <Select onValueChange={field.onChange} value={field.value} disabled={!selectedClass}>
                                        <FormControl>
                                          <SelectTrigger className="bg-white border-slate-200">
                                            <SelectValue placeholder="Select subject" />
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
                              </td>
                              <td className="border border-slate-300 p-3">
                                <FormField
                                  control={form.control}
                                  name={`testDays.${index}.maximumMarks`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          {...field}
                                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                                          className="bg-white border-slate-200"
                                          placeholder="Enter marks"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </td>
                              <td className="border border-slate-300 p-3">
                                <FormField
                                  control={form.control}
                                  name={`testDays.${index}.fromTime`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          type="time"
                                          {...field}
                                          onChange={(e) => {
                                            field.onChange(e.target.value);
                                            // Auto-calculate duration
                                            const toTime = testDays[index]?.toTime || "";
                                            if (e.target.value && toTime) {
                                              const duration = calculateDurationForDay(e.target.value, toTime);
                                              form.setValue(`testDays.${index}.duration`, duration);
                                            }
                                          }}
                                          className="bg-white border-slate-200"
                                          placeholder="14:00"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </td>
                              <td className="border border-slate-300 p-3">
                                <FormField
                                  control={form.control}
                                  name={`testDays.${index}.toTime`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          type="time"
                                          {...field}
                                          onChange={(e) => {
                                            field.onChange(e.target.value);
                                            // Auto-calculate duration
                                            const fromTime = testDays[index]?.fromTime || "";
                                            if (fromTime && e.target.value) {
                                              const duration = calculateDurationForDay(fromTime, e.target.value);
                                              form.setValue(`testDays.${index}.duration`, duration);
                                            }
                                          }}
                                          className="bg-white border-slate-200"
                                          placeholder="15:00"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </td>
                              <td className="border border-slate-300 p-3">
                                <div className="flex flex-col space-y-2">
                                  <Button
                                    type="button"
                                    onClick={() => openSyllabusModal(index)}
                                    disabled={!testDays[index]?.subject}
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-xs px-3 py-1 rounded"
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add Syllabus
                                  </Button>
                                  {testDays[index]?.syllabusChapters?.length > 0 && (
                                    <div className="text-xs text-slate-600">
                                      {testDays[index].syllabusChapters.length} chapter{testDays[index].syllabusChapters.length > 1 ? 's' : ''} selected
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {testDays[index].syllabusChapters.slice(0, 2).map((chapter, idx) => (
                                          <span key={idx} className="bg-blue-100 text-blue-600 px-1 py-0.5 rounded text-xs">
                                            {chapter}
                                          </span>
                                        ))}
                                        {testDays[index].syllabusChapters.length > 2 && (
                                          <span className="text-blue-600 text-xs">+{testDays[index].syllabusChapters.length - 2} more</span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="border border-slate-300 p-6 text-center text-slate-500">
                              {testStartDate && testEndDate 
                                ? "No valid dates in range (excluding Sundays)"
                                : "Please select start and end dates to see the test schedule"
                              }
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  

                </div>



                {/* Submit Button */}
                <div className="flex justify-end pt-6">
                  <Button
                    type="submit"
                    disabled={createTestMutation.isPending}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-2 rounded-lg font-semibold shadow-lg"
                  >
                    {createTestMutation.isPending ? "Creating..." : "Create Test"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Syllabus Selection Modal */}
        <Dialog open={syllabusModalOpen} onOpenChange={setSyllabusModalOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-800">
                Select Syllabus Chapters
                {selectedDayIndex !== null && testDays[selectedDayIndex] && (
                  <span className="text-sm text-slate-600 ml-2">
                    - {testDays[selectedDayIndex].subject}
                  </span>
                )}
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              {selectedDayIndex !== null && (
                <div className="space-y-4">
                  {getAvailableChaptersForDay(selectedDayIndex).length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {getAvailableChaptersForDay(selectedDayIndex).map((chapter) => (
                        <div key={chapter} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                          <Checkbox
                            checked={tempSelectedChapters.includes(chapter)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setTempSelectedChapters([...tempSelectedChapters, chapter]);
                              } else {
                                setTempSelectedChapters(tempSelectedChapters.filter(ch => ch !== chapter));
                              }
                            }}
                            className="border-slate-300"
                          />
                          <label className="text-sm font-medium text-slate-700 cursor-pointer flex-1">
                            {chapter}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <p>No syllabus chapters available for this subject.</p>
                      <p className="text-sm mt-2">Please ensure syllabus is mapped for this class and subject.</p>
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSyllabusModalOpen(false);
                        setTempSelectedChapters([]);
                      }}
                      className="text-slate-600 border-slate-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSyllabusSubmit}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                    >
                      Submit
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}