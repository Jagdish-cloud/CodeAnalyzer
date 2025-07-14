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
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertPeriodicTestSchema } from "@shared/schema";
import type { ClassMapping, SyllabusMaster } from "@shared/schema";

const formSchema = insertPeriodicTestSchema.extend({
  divisions: z.array(z.string()).min(1, "At least one division must be selected"),
  chapters: z.array(z.string()).min(1, "At least one chapter must be selected"),
});

type FormData = z.infer<typeof formSchema>;

export default function AddPeriodicTestPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

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
      class: "",
      divisions: [],
      subject: "",
      chapters: [],
      testDate: "",
      testTime: "",
      status: "active",
    },
  });

  const selectedClass = form.watch("class");
  const selectedDivisions = form.watch("divisions");
  const selectedSubject = form.watch("subject");

  // Get available divisions for selected class
  const availableDivisions = selectedClass 
    ? Array.from(new Set(classMappings
        .filter(mapping => mapping.class === selectedClass)
        .map(mapping => mapping.division)))
    : [];

  // Get available subjects for selected class
  const availableSubjects = selectedClass
    ? Array.from(new Set(classMappings
        .filter(mapping => mapping.class === selectedClass)
        .flatMap(mapping => mapping.subjects)))
    : [];

  // Get available chapters for selected class, divisions, and subject
  const availableChapters = selectedClass && selectedDivisions.length > 0 && selectedSubject
    ? syllabusMasters
        .filter(syllabus => 
          syllabus.class === selectedClass &&
          syllabus.subject === selectedSubject &&
          syllabus.divisions.some(div => selectedDivisions.includes(div))
        )
        .map(syllabus => syllabus.chapterLessonNo)
    : [];

  // Validation logic
  useEffect(() => {
    const errors = [];
    
    // Check if only subjects mapped to class and division are shown
    if (selectedClass && selectedDivisions.length > 0) {
      const mappedSubjects = classMappings
        .filter(mapping => 
          mapping.class === selectedClass && 
          selectedDivisions.some(div => mapping.division === div)
        )
        .flatMap(mapping => mapping.subjects);
      
      if (mappedSubjects.length === 0) {
        errors.push("For Periodic Test only Subjects mapped to Class and Division should be shown");
      }
    }

    // Check if any other subjects are left for scheduling
    if (selectedClass && selectedDivisions.length > 0 && selectedSubject) {
      const hasOtherSubjects = classMappings
        .filter(mapping => 
          mapping.class === selectedClass && 
          selectedDivisions.some(div => mapping.division === div)
        )
        .flatMap(mapping => mapping.subjects)
        .some(subject => subject !== selectedSubject);

      if (hasOtherSubjects) {
        errors.push("It should prompt if any other subjects are left for scheduling(DO NOT THROW AN ERROR)");
      }
    }

    // Check multiselect validation
    if (selectedDivisions.length > 1 && selectedSubject) {
      const subjectInAllDivisions = selectedDivisions.every(division => 
        classMappings.some(mapping => 
          mapping.class === selectedClass && 
          mapping.division === division && 
          mapping.subjects.includes(selectedSubject)
        )
      );
      
      if (!subjectInAllDivisions) {
        errors.push("On Multiselect where the subjects on the divisions may not be the same. Ensure the conflict");
      }
    }

    setValidationErrors(errors);
  }, [selectedClass, selectedDivisions, selectedSubject, classMappings]);

  const createTestMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await apiRequest("POST", "/api/periodic-tests", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/periodic-tests"] });
      toast({
        title: "Success",
        description: "Periodic test scheduled successfully!",
      });
      navigate("/periodic-test");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to schedule periodic test",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: "Please resolve the validation issues before submitting",
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

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Card className="mb-6 bg-red-50/70 backdrop-blur-sm border-red-200 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-800 mb-2">Validations</h3>
                  <ul className="space-y-1 text-red-700">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form Card */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl text-gray-800">Test Schedule Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Select Year */}
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Select Year *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-gray-200 focus:border-orange-300 focus:ring-orange-200">
                              <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="2024-25">2024-25</SelectItem>
                            <SelectItem value="2025-26">2025-26</SelectItem>
                            <SelectItem value="2026-27">2026-27</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Select Class */}
                  <FormField
                    control={form.control}
                    name="class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Select Class *</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue("divisions", []);
                            form.setValue("subject", "");
                            form.setValue("chapters", []);
                          }} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="border-gray-200 focus:border-orange-300 focus:ring-orange-200">
                              <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from(new Set(classMappings.map(mapping => mapping.class))).map((className) => (
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

                  {/* Select Division */}
                  <FormField
                    control={form.control}
                    name="divisions"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Select Division(Multi select) *</FormLabel>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          {availableDivisions.map((division) => (
                            <FormField
                              key={division}
                              control={form.control}
                              name="divisions"
                              render={({ field }) => {
                                return (
                                  <FormItem key={division} className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(division)}
                                        onCheckedChange={(checked) => {
                                          const updated = checked
                                            ? [...field.value, division]
                                            : field.value?.filter((value) => value !== division);
                                          field.onChange(updated);
                                          form.setValue("subject", "");
                                          form.setValue("chapters", []);
                                        }}
                                        className="border-gray-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal text-gray-600">
                                      Division {division}
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Subjects */}
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Subjects *</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue("chapters", []);
                          }} 
                          defaultValue={field.value}
                          disabled={selectedDivisions.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger className="border-gray-200 focus:border-orange-300 focus:ring-orange-200">
                              <SelectValue placeholder={selectedDivisions.length === 0 ? "Select divisions first" : "Select subject"} />
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

                  {/* Chapters */}
                  <FormField
                    control={form.control}
                    name="chapters"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Chapters *</FormLabel>
                        <div className="grid grid-cols-2 gap-3 mt-2 max-h-32 overflow-y-auto">
                          {availableChapters.map((chapter) => (
                            <FormField
                              key={chapter}
                              control={form.control}
                              name="chapters"
                              render={({ field }) => {
                                return (
                                  <FormItem key={chapter} className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(chapter)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, chapter])
                                            : field.onChange(field.value?.filter((value) => value !== chapter))
                                        }}
                                        className="border-gray-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal text-gray-600">
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date of test */}
                  <FormField
                    control={form.control}
                    name="testDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Date of test *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="date"
                            className="border-gray-200 focus:border-orange-300 focus:ring-orange-200"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Time of Test */}
                  <FormField
                    control={form.control}
                    name="testTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Time of Test *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="time"
                            className="border-gray-200 focus:border-orange-300 focus:ring-orange-200"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Save Button */}
                <div className="flex justify-center pt-6 border-t border-gray-100">
                  <Button
                    type="submit"
                    disabled={createTestMutation.isPending}
                    className="px-12 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg transition-all duration-200"
                  >
                    {createTestMutation.isPending ? "Saving..." : "Save(Button)"}
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