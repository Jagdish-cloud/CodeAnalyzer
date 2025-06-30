import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { insertClassMappingSchema, type InsertClassMapping } from "@shared/schema";
import { Plus, ArrowLeft } from "lucide-react";

const formSchema = insertClassMappingSchema.extend({
  year: z.string().min(1, "Year is required"),
  class: z.string().min(1, "Class is required"),
  division: z.string().min(1, "Division is required"),
  subjects: z.array(z.string()).min(1, "At least one subject is required"),
});

type FormData = z.infer<typeof formSchema>;

const defaultYears = ["2022-23", "2023-24", "2024-25", "2025-26"];
const defaultClasses = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
const defaultDivisions = ["A", "B", "C", "D"];
const defaultSubjects = [
  "Mathematics", "English", "Science", "Social Studies", "Hindi", "Computer Science",
  "Physics", "Chemistry", "Biology", "History", "Geography", "Economics", "Physical Education", "Art"
];

export default function AddClassMapping() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [customClasses, setCustomClasses] = useState<string[]>([]);
  const [customDivisions, setCustomDivisions] = useState<string[]>([]);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isDivisionModalOpen, setIsDivisionModalOpen] = useState(false);
  const [newClass, setNewClass] = useState("");
  const [newDivision, setNewDivision] = useState("");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      year: "",
      class: "",
      division: "",
      subjects: [],
      status: "Current working",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const mappingData: InsertClassMapping = {
        year: data.year,
        class: data.class,
        division: data.division,
        subjects: data.subjects,
        status: data.status || "Current working",
      };
      
      const response = await fetch("/api/class-mappings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mappingData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create class mapping");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/class-mappings"] });
      toast({
        title: "Success",
        description: "Class mapping created successfully",
      });
      navigate("/class-mapping");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create class mapping",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  const handleAddClass = () => {
    if (newClass.trim()) {
      setCustomClasses(prev => [...prev, newClass.trim()]);
      form.setValue("class", newClass.trim());
      setNewClass("");
      setIsClassModalOpen(false);
    }
  };

  const handleAddDivision = () => {
    if (newDivision.trim()) {
      setCustomDivisions(prev => [...prev, newDivision.trim()]);
      form.setValue("division", newDivision.trim());
      setNewDivision("");
      setIsDivisionModalOpen(false);
    }
  };

  const allClasses = [...defaultClasses, ...customClasses];
  const allDivisions = [...defaultDivisions, ...customDivisions];

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-green-50 to-emerald-50 dark:from-lime-950 dark:via-green-950 dark:to-emerald-950">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center mb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/class-mapping")}
            className="mr-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Mappings
          </Button>
          <div className="space-y-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Add Class Mapping
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Create a new academic class mapping
            </p>
          </div>
        </div>

        <Card className="max-w-3xl border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700 pb-6">
            <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Class Mapping Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-900 dark:text-slate-100 font-medium">Choose Year</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                            <SelectValue placeholder="Select academic year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {defaultYears.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="class"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-900 dark:text-slate-100 font-medium">Select Class</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                <SelectValue placeholder="Select class" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {allClasses.map((cls) => (
                                <SelectItem key={cls} value={cls}>
                                  {cls}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Dialog open={isClassModalOpen} onOpenChange={setIsClassModalOpen}>
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline" className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Custom Class
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                        <DialogHeader>
                          <DialogTitle className="text-slate-900 dark:text-slate-100">Add New Class</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Class</label>
                            <Input
                              value={newClass}
                              onChange={(e) => setNewClass(e.target.value)}
                              placeholder="Enter class name"
                              className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 mt-1"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddClass();
                                }
                              }}
                            />
                          </div>
                          <Button onClick={handleAddClass} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                            Submit
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="division"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-900 dark:text-slate-100 font-medium">Select Division</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                <SelectValue placeholder="Select division" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {allDivisions.map((div) => (
                                <SelectItem key={div} value={div}>
                                  {div}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Dialog open={isDivisionModalOpen} onOpenChange={setIsDivisionModalOpen}>
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline" className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Custom Division
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                        <DialogHeader>
                          <DialogTitle className="text-slate-900 dark:text-slate-100">Add New Division</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Division</label>
                            <Input
                              value={newDivision}
                              onChange={(e) => setNewDivision(e.target.value)}
                              placeholder="Enter division name"
                              className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 mt-1"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddDivision();
                                }
                              }}
                            />
                          </div>
                          <Button onClick={handleAddDivision} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                            Submit
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="subjects"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-900 dark:text-slate-100 font-medium">Select Subjects</FormLabel>
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">
                          {field.value && field.value.length > 0 ? (
                            field.value.map((subject: string) => (
                              <Badge key={subject} variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {subject}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newSubjects = field.value.filter((s: string) => s !== subject);
                                    field.onChange(newSubjects);
                                  }}
                                  className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                                >
                                  ×
                                </button>
                              </Badge>
                            ))
                          ) : (
                            <span className="text-slate-500 dark:text-slate-400">No subjects selected</span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border border-slate-200 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-900">
                          {defaultSubjects.map((subject) => (
                            <div key={subject} className="flex items-center space-x-2">
                              <Checkbox
                                id={subject}
                                checked={field.value?.includes(subject) || false}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...(field.value || []), subject]);
                                  } else {
                                    field.onChange(field.value?.filter((s: string) => s !== subject) || []);
                                  }
                                }}
                              />
                              <label
                                htmlFor={subject}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-slate-700 dark:text-slate-300"
                              >
                                {subject}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/class-mapping")}
                    className="flex-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    {mutation.isPending ? "Creating..." : "Create Mapping"}
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