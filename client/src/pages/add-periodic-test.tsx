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
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertPeriodicTestSchema } from "@shared/schema";
import type { ClassMapping, SyllabusMaster } from "@shared/schema";

const formSchema = insertPeriodicTestSchema.extend({
  chapters: z.array(z.string()).optional().default([]),
  fromTime: z.string().min(1, "From time is required"),
  toTime: z.string().min(1, "To time is required"),
  duration: z.string().optional(),
  maximumMarks: z.number().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function AddPeriodicTestPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

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
      subject: "",
      chapters: [],
      testDate: "",
      fromTime: "",
      toTime: "",
      duration: "",
      maximumMarks: undefined,
      status: "active",
    },
  });

  const selectedClass = form.watch("class");
  const selectedSubject = form.watch("subject");
  const fromTime = form.watch("fromTime");
  const toTime = form.watch("toTime");

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

  // Update duration when times change
  useEffect(() => {
    const duration = calculateDuration(fromTime, toTime);
    if (duration !== form.getValues("duration")) {
      form.setValue("duration", duration);
    }
  }, [fromTime, toTime]);

  // Get available subjects for selected class (union of all subjects from all divisions)
  const availableSubjects = selectedClass
    ? Array.from(new Set(classMappings
        .filter(mapping => mapping.class === selectedClass)
        .flatMap(mapping => mapping.subjects)))
    : [];

  // Get available chapters for selected class and subject
  const availableChapters = selectedClass && selectedSubject
    ? syllabusMasters
        .filter(syllabus => 
          syllabus.class === selectedClass &&
          syllabus.subject === selectedSubject
        )
        .map(syllabus => syllabus.chapterLessonNo)
    : [];

  // Clear subject when class changes
  useEffect(() => {
    if (selectedClass) {
      form.setValue("subject", "");
      form.setValue("chapters", []);
    }
  }, [selectedClass, form]);

  const createTestMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return apiRequest("POST", "/api/periodic-tests", {
        ...formData,
        chapters: formData.chapters.length > 0 ? formData.chapters : ["No chapters available"],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/periodic-tests"] });
      toast({
        title: "Success",
        description: "Periodic test has been created successfully",
      });
      navigate("/periodic-test");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create periodic test",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    // Validate time range
    if (data.duration === "Invalid time range") {
      toast({
        title: "Validation Error",
        description: "To Time must be after From Time",
        variant: "destructive",
      });
      return;
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

                  <div>
                    <Label className="text-slate-700 font-semibold">Test End Date</Label>
                    <Input
                      type="date"
                      className="bg-white border-slate-200 mt-2"
                      placeholder="End date (auto-calculated)"
                      disabled
                    />
                  </div>
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
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-slate-300 p-3">
                            <div className="text-slate-600">Date range from Start Date to End Date</div>
                            <div className="text-xs text-slate-500 mt-1">(Excluding Sundays)</div>
                          </td>
                          <td className="border border-slate-300 p-3">
                            <FormField
                              control={form.control}
                              name="subject"
                              render={({ field }) => (
                                <FormItem>
                                  <Select onValueChange={field.onChange} value={field.value} disabled={!selectedClass}>
                                    <FormControl>
                                      <SelectTrigger className="bg-white border-slate-200">
                                        <SelectValue placeholder="Drop Down (all subject of class VIII of all divisions)" />
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
                              name="maximumMarks"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      {...field}
                                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                              name="fromTime"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="time"
                                      {...field}
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
                              name="toTime"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="time"
                                      {...field}
                                      className="bg-white border-slate-200"
                                      placeholder="15:00"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  

                </div>

                {/* Chapters Section */}
                {availableChapters.length > 0 && (
                  <FormField
                    control={form.control}
                    name="chapters"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-semibold">Select Chapters (Optional)</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                          {availableChapters.map((chapter) => (
                            <FormField
                              key={chapter}
                              control={form.control}
                              name="chapters"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={chapter}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(chapter)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, chapter])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== chapter
                                                )
                                              )
                                        }}
                                        className="border-slate-300"
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal text-slate-600">
                                      {chapter}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Duration Display */}
                {form.watch("duration") && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-blue-800 font-medium">
                        Test Duration: {form.watch("duration")}
                      </span>
                    </div>
                  </div>
                )}

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
      </div>
    </div>
  );
}