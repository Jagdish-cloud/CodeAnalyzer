import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  insertClassMappingSchema,
  type InsertClassMapping,
} from "@shared/schema";
import { Plus, ArrowLeft } from "lucide-react";

const formSchema = insertClassMappingSchema.extend({
  year: z.string().min(1, "Year is required"),
  class: z.string().min(1, "Class is required"),
  division: z.string().min(1, "Division is required"),
  subject: z.string().min(1, "Subject is required"),
});

type FormData = z.infer<typeof formSchema>;

const defaultYears = ["2022-23", "2023-24", "2024-25", "2025-26"];
const defaultClasses = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
];
const defaultDivisions = ["A", "B", "C", "D"];
const defaultSubjects = [
  "Mathematics",
  "English",
  "Science",
  "Social Studies",
  "Hindi",
  "Computer Science",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Geography",
  "Economics",
  "Physical Education",
  "Art",
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
      subject: "",
      status: "Current working",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const mappingData: InsertClassMapping = {
        year: data.year,
        class: data.class,
        division: data.division,
        subject: data.subject,
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
      setCustomClasses((prev) => [...prev, newClass.trim()]);
      form.setValue("class", newClass.trim());
      setNewClass("");
      setIsClassModalOpen(false);
    }
  };

  const handleAddDivision = () => {
    if (newDivision.trim()) {
      setCustomDivisions((prev) => [...prev, newDivision.trim()]);
      form.setValue("division", newDivision.trim());
      setNewDivision("");
      setIsDivisionModalOpen(false);
    }
  };

  const allClasses = [...defaultClasses, ...customClasses];
  const allDivisions = [...defaultDivisions, ...customDivisions];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          onClick={() => navigate("/class-mapping")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Add Class Mapping</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Create New Class Mapping</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Choose Year</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
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

              <div className="flex items-end space-x-2">
                <FormField
                  control={form.control}
                  name="class"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Select Class</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
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

                <Dialog
                  open={isClassModalOpen}
                  onOpenChange={setIsClassModalOpen}
                >
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Class
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Class</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Input
                          value={newClass}
                          onChange={(e) => setNewClass(e.target.value)}
                          placeholder="Enter class"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddClass();
                            }
                          }}
                        />
                      </div>
                      <Button onClick={handleAddClass} className="w-full">
                        Submit
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex items-end space-x-2">
                <FormField
                  control={form.control}
                  name="division"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Select Division</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
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

                <Dialog
                  open={isDivisionModalOpen}
                  onOpenChange={setIsDivisionModalOpen}
                >
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Division
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Division</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Input
                          value={newDivision}
                          onChange={(e) => setNewDivision(e.target.value)}
                          placeholder="Enter division"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddDivision();
                            }
                          }}
                        />
                      </div>
                      <Button onClick={handleAddDivision} className="w-full">
                        Submit
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Subject</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {defaultSubjects.map((subject) => (
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

              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/class-mapping")}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="flex-1"
                >
                  {mutation.isPending ? "Creating..." : "Create Mapping"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
