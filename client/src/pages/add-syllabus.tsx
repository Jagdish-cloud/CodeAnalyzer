import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertSyllabusMasterSchema } from "@shared/schema";
import type { ClassMapping, Subject } from "@shared/schema";

const formSchema = insertSyllabusMasterSchema.extend({
  divisions: z.array(z.string()).min(1, "At least one division must be selected"),
  description: z.string().optional(),
  allDivisions: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function AddSyllabusPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedClass = urlParams.get('class') || '';
  const preselectedSubject = urlParams.get('subject') || '';

  const { data: classMappings = [], isLoading: isClassMappingsLoading } = useQuery<ClassMapping[]>({
    queryKey: ["/api/class-mappings"],
  });

  const { data: subjects = [], isLoading: isSubjectsLoading } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      year: new Date().getFullYear() + "-" + (new Date().getFullYear() + 1),
      class: preselectedClass,
      subject: preselectedSubject,
      divisions: [],
      chapterLessonNo: "",
      topic: "",
      description: "",
      status: "active",
      allDivisions: false,
    },
  });

  const selectedClass = form.watch("class");
  const selectedSubject = form.watch("subject");

  // Get available divisions for selected class
  const availableDivisions = selectedClass 
    ? Array.from(new Set(classMappings
        .filter(mapping => mapping.class === selectedClass)
        .map(mapping => mapping.division)))
    : [];

  // Get available subjects for selected class (including elective subjects from groups)
  const classData = selectedClass ? classMappings.filter(mapping => mapping.class === selectedClass) : [];
  
  // Get elective subjects from groups
  const electiveSubjects = Array.from(new Set(
    classData.flatMap(mapping => 
      (mapping.electiveGroups as any[] || []).flatMap((group: any) => group.subjects || [])
    )
  ));
  
  // Get core subjects (excluding elective subjects)
  const coreSubjects = Array.from(new Set(
    classData.flatMap(mapping => mapping.subjects || [])
      .filter(subject => !electiveSubjects.includes(subject))
  ));
  
  const availableSubjects = [...coreSubjects, ...electiveSubjects];
  
  // Check if selected subject is elective
  const isSelectedSubjectElective = selectedSubject && electiveSubjects.includes(selectedSubject);

  const createSyllabusMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await apiRequest("POST", "/api/syllabus-masters", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/syllabus-masters"] });
      toast({
        title: "Success",
        description: "Syllabus created successfully!",
      });
      navigate("/syllabus-master");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create syllabus",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    // If subject is elective, set divisions to all available divisions
    if (isSelectedSubjectElective) {
      data.divisions = availableDivisions;
    } else if (data.allDivisions) {
      // If "All Divisions" is checked for core subjects, set divisions to all available divisions
      data.divisions = availableDivisions;
    }
    
    // Remove the allDivisions field as it's not part of the schema
    const { allDivisions, ...submitData } = data;
    createSyllabusMutation.mutate(submitData);
  };

  if (isClassMappingsLoading || isSubjectsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-lg text-gray-600">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/syllabus-master">
            <Button variant="ghost" className="mb-4 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Syllabus Master
            </Button>
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Add New Syllabus
          </h1>
          <h2 className="text-lg text-gray-600 mt-2">
            Create syllabus content for a specific class and subject
          </h2>
        </div>

        {/* Form Card */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl text-gray-800">Syllabus Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Class Selection */}
                  <FormField
                    control={form.control}
                    name="class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Class *</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue("subject", "");
                            form.setValue("divisions", []);
                          }} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="border-gray-200 focus:border-indigo-300 focus:ring-indigo-200">
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

                  {/* Subject Selection */}
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Subject *</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={!selectedClass}
                        >
                          <FormControl>
                            <SelectTrigger className="border-gray-200 focus:border-indigo-300 focus:ring-indigo-200">
                              <SelectValue placeholder={selectedClass ? "Select subject" : "Select class first"} />
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

                {/* Divisions Selection */}
                {selectedClass && availableDivisions.length > 0 && !isSelectedSubjectElective && (
                  <>
                    {/* All Divisions Checkbox for Core Subjects */}
                    <FormField
                      control={form.control}
                      name="allDivisions"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                                if (checked) {
                                  // If "All Divisions" is checked, clear individual division selections
                                  form.setValue("divisions", []);
                                }
                              }}
                              className="border-gray-300 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Apply to All Divisions
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    {/* Individual Division Selection (only show if "All Divisions" is not checked) */}
                    {!form.watch("allDivisions") && (
                      <FormField
                        control={form.control}
                        name="divisions"
                        render={() => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium">Divisions *</FormLabel>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
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
                                              return checked
                                                ? field.onChange([...field.value, division])
                                                : field.onChange(field.value?.filter((value) => value !== division))
                                            }}
                                            className="border-gray-300 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
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
                    )}
                  </>
                )}

                {/* Info message for elective subjects */}
                {isSelectedSubjectElective && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <p className="text-sm text-purple-700 font-medium">
                        Elective Subject - Automatically applies to all divisions
                      </p>
                    </div>
                    <p className="text-xs text-purple-600 mt-1 ml-4">
                      Elective subjects are common across all divisions in the class.
                    </p>
                  </div>
                )}

                {/* Chapter/Lesson No. */}
                <FormField
                  control={form.control}
                  name="chapterLessonNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Chapter/Lesson No. *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter chapter or lesson number (e.g., Ch-1, Lesson-5)"
                          className="border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Topic */}
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Topic *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter syllabus topic"
                          className="border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Enter detailed description of the syllabus content (optional)"
                          className="border-gray-200 focus:border-indigo-300 focus:ring-indigo-200 min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-gray-200 focus:border-indigo-300 focus:ring-indigo-200">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <div className="flex justify-end pt-6 border-t border-gray-100">
                  <Button
                    type="submit"
                    disabled={createSyllabusMutation.isPending}
                    className="px-8 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg transition-all duration-200"
                  >
                    {createSyllabusMutation.isPending ? "Creating..." : "Create Syllabus"}
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