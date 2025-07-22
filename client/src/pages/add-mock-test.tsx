import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2, MoveUp, MoveDown, Upload, X } from "lucide-react";
import { insertMockTestSchema } from "@shared/schema";
import type { ClassMapping, Subject } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface MockTestQuestion {
  id: string;
  questionText: string;
  isRequired: boolean;
  hasOtherOption: boolean;
  options: Array<{
    id: string;
    text: string;
    score: number;
  }>;
}

const addMockTestSchema = insertMockTestSchema.extend({
  class: z.array(z.string()).min(1, "At least one class is required"),
  division: z.array(z.string()).min(1, "At least one division is required"),
  subjects: z.array(z.string()).min(1, "At least one subject is required"),
  questions: z.array(z.object({
    id: z.string(),
    questionText: z.string().min(1, "Question text is required"),
    isRequired: z.boolean(),
    hasOtherOption: z.boolean(),
    options: z.array(z.object({
      id: z.string(),
      text: z.string().min(1, "Option text is required"),
      score: z.number().min(0, "Score must be 0 or higher"),
    })).min(2, "At least 2 options are required"),
  })),
});

type AddMockTestFormData = z.infer<typeof addMockTestSchema>;

function AddMockTest() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const [questions, setQuestions] = useState<MockTestQuestion[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [availableDivisions, setAvailableDivisions] = useState<string[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [otherSubject, setOtherSubject] = useState<string>("");

  // Initialize with one default question
  useEffect(() => {
    if (questions.length === 0) {
      const defaultQuestion: MockTestQuestion = {
        id: `question-${Date.now()}`,
        questionText: "",
        isRequired: false,
        hasOtherOption: false,
        options: [
          { id: `option-${Date.now()}-1`, text: "", score: 0 },
          { id: `option-${Date.now()}-2`, text: "", score: 0 }
        ]
      };
      setQuestions([defaultQuestion]);
    }
  }, []);

  const { data: classMappings } = useQuery<ClassMapping[]>({
    queryKey: ["/api/class-mappings"],
  });

  const { data: subjects } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const form = useForm<AddMockTestFormData>({
    resolver: zodResolver(addMockTestSchema),
    defaultValues: {
      mockName: "",
      description: "",
      mockStartDate: "",
      mockEndDate: "",
      class: [],
      division: [],
      subjects: [],
      hasFileUpload: false,
      questions: [],
    },
  });

  const createMockTestMutation = useMutation({
    mutationFn: async (data: AddMockTestFormData) => {
      const formData = new FormData();
      
      // Add all form fields, but use our questions state instead of form data
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'subjects') {
          // Handle subjects array and replace "OTHERS" with actual custom subject
          let subjects = Array.isArray(value) ? [...value] : [];
          if (subjects.includes("OTHERS") && otherSubject.trim()) {
            subjects = subjects.filter(s => s !== "OTHERS");
            subjects.push(otherSubject.trim());
          }
          formData.append(key, JSON.stringify(subjects));
        } else if (key === 'class' || key === 'division') {
          // Handle arrays for class and division
          formData.append(key, JSON.stringify(value));
        } else if (key === 'questions') {
          // Use the questions from our state instead of form data
          formData.append(key, JSON.stringify(questions));
        } else if (key === 'hasFileUpload') {
          // Handle boolean conversion for hasFileUpload
          formData.append(key, value ? 'true' : 'false');
        } else if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      // Add file if present
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const response = await fetch("/api/mock-tests", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mock-tests"] });
      toast({
        title: "Success",
        description: "Mock test created successfully",
      });
      setLocation("/mock-tests");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create mock test",
        variant: "destructive",
      });
    },
  });

  const handleClassChange = (classes: string[]) => {
    // Update selected classes
    setSelectedClasses(classes);
    form.setValue("class", classes);
    
    // Get all available divisions and subjects from selected classes
    const allDivisions = new Set<string>();
    const allSubjects = new Set<string>();
    
    classes.forEach(selectedClass => {
      const mappings = classMappings?.filter(m => m.class === selectedClass) || [];
      mappings.forEach(mapping => {
        allDivisions.add(mapping.division);
        mapping.subjects.forEach(subject => allSubjects.add(subject));
      });
    });
    
    setAvailableDivisions(Array.from(allDivisions));
    setAvailableSubjects(Array.from(allSubjects));
    
    // Reset selections when classes change
    setSelectedDivisions([]);
    setSelectedSubjects([]);
    form.setValue("division", []);
    form.setValue("subjects", []);
    setOtherSubject("");
  };

  const handleDivisionChange = (divisions: string[]) => {
    setSelectedDivisions(divisions);
    form.setValue("division", divisions);
  };

  const handleSubjectChange = (subjects: string[]) => {
    setSelectedSubjects(subjects);
    form.setValue("subjects", subjects);
    
    // Clear other subject if "OTHERS" is not selected
    if (!subjects.includes("OTHERS")) {
      setOtherSubject("");
    }
  };

  const addQuestion = () => {
    const newQuestion: MockTestQuestion = {
      id: `question-${Date.now()}`,
      questionText: "",
      isRequired: false,
      hasOtherOption: false,
      options: [
        { id: `option-${Date.now()}-1`, text: "", score: 0 },
        { id: `option-${Date.now()}-2`, text: "", score: 0 },
      ],
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (questionId: string, updates: Partial<MockTestQuestion>) => {
    setQuestions(questions.map(q => q.id === questionId ? { ...q, ...updates } : q));
  };

  const deleteQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const moveQuestion = (questionId: string, direction: 'up' | 'down') => {
    const index = questions.findIndex(q => q.id === questionId);
    if (
      (direction === 'up' && index > 0) ||
      (direction === 'down' && index < questions.length - 1)
    ) {
      const newQuestions = [...questions];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
      setQuestions(newQuestions);
    }
  };

  const addOption = (questionId: string) => {
    updateQuestion(questionId, {
      options: [
        ...questions.find(q => q.id === questionId)!.options,
        { id: `option-${Date.now()}`, text: "", score: 0 },
      ],
    });
  };

  const updateOption = (questionId: string, optionId: string, updates: Partial<MockTestQuestion['options'][0]>) => {
    const question = questions.find(q => q.id === questionId);
    if (question) {
      updateQuestion(questionId, {
        options: question.options.map(opt => 
          opt.id === optionId ? { ...opt, ...updates } : opt
        ),
      });
    }
  };

  const deleteOption = (questionId: string, optionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options.length > 2) {
      updateQuestion(questionId, {
        options: question.options.filter(opt => opt.id !== optionId),
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const onSubmit = (data: AddMockTestFormData) => {
    // Validate that we have at least one question with valid data
    if (questions.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one question is required",
        variant: "destructive",
      });
      return;
    }

    // Validate that all questions have text and valid options
    for (const question of questions) {
      if (!question.questionText.trim()) {
        toast({
          title: "Validation Error",
          description: "All questions must have question text",
          variant: "destructive",
        });
        return;
      }

      if (question.options.length < 2) {
        toast({
          title: "Validation Error", 
          description: "Each question must have at least 2 options",
          variant: "destructive",
        });
        return;
      }

      for (const option of question.options) {
        if (!option.text.trim()) {
          toast({
            title: "Validation Error",
            description: "All options must have text",
            variant: "destructive",
          });
          return;
        }
      }
    }

    // If validation passes, submit the form
    createMockTestMutation.mutate(data);
  };

  const uniqueClasses = Array.from(new Set(classMappings?.map(mapping => mapping.class) || []));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950 dark:via-pink-950 dark:to-blue-950 p-6">
      <div className="container mx-auto max-w-5xl">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/mock-tests")}
            className="mr-4 hover:bg-purple-100 dark:hover:bg-purple-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Mock Tests
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Add Mock Test
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Create a new mock test with questions and settings
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Mock Information Section */}
            <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                  Mock Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="mockName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mock Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter mock test name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="class"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Classes</FormLabel>
                          <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-3">
                            {uniqueClasses.map((className) => (
                              <div key={className} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`class-${className}`}
                                  checked={selectedClasses.includes(className)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      const newClasses = [...selectedClasses, className];
                                      handleClassChange(newClasses);
                                    } else {
                                      const newClasses = selectedClasses.filter(c => c !== className);
                                      handleClassChange(newClasses);
                                    }
                                  }}
                                />
                                <Label htmlFor={`class-${className}`} className="text-sm font-normal">
                                  Class {className}
                                </Label>
                              </div>
                            ))}
                            <div className="flex items-center space-x-2 border-t pt-2 mt-2">
                              <Checkbox
                                id="class-all"
                                checked={selectedClasses.length === uniqueClasses.length}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    handleClassChange([...uniqueClasses]);
                                  } else {
                                    handleClassChange([]);
                                  }
                                }}
                              />
                              <Label htmlFor="class-all" className="text-sm font-medium text-blue-600">
                                ALL
                              </Label>
                            </div>
                          </div>
                          {selectedClasses.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500">
                                Selected: {selectedClasses.map(c => `Class ${c}`).join(", ")}
                              </p>
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="division"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Divisions</FormLabel>
                          <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-3">
                            {availableDivisions.length > 0 ? (
                              <>
                                {availableDivisions.map((division) => (
                                  <div key={division} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`division-${division}`}
                                      checked={selectedDivisions.includes(division)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          const newDivisions = [...selectedDivisions, division];
                                          handleDivisionChange(newDivisions);
                                        } else {
                                          const newDivisions = selectedDivisions.filter(d => d !== division);
                                          handleDivisionChange(newDivisions);
                                        }
                                      }}
                                    />
                                    <Label htmlFor={`division-${division}`} className="text-sm font-normal">
                                      Division {division}
                                    </Label>
                                  </div>
                                ))}
                                <div className="flex items-center space-x-2 border-t pt-2 mt-2">
                                  <Checkbox
                                    id="division-all"
                                    checked={selectedDivisions.length === availableDivisions.length}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        handleDivisionChange([...availableDivisions]);
                                      } else {
                                        handleDivisionChange([]);
                                      }
                                    }}
                                  />
                                  <Label htmlFor="division-all" className="text-sm font-medium text-blue-600">
                                    ALL
                                  </Label>
                                </div>
                              </>
                            ) : (
                              <p className="text-sm text-gray-500">Select classes first to see available divisions</p>
                            )}
                          </div>
                          {selectedDivisions.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500">
                                Selected: {selectedDivisions.map(d => `Division ${d}`).join(", ")}
                              </p>
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter mock test description"
                          className="min-h-[100px]"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="mockStartDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mock Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mockEndDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mock End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Subject */}
                <FormField
                  control={form.control}
                  name="subjects"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subjects</FormLabel>
                      <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-3">
                        {availableSubjects.length > 0 ? (
                          <>
                            {availableSubjects.map((subject) => (
                              <div key={subject} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`subject-${subject}`}
                                  checked={selectedSubjects.includes(subject)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      const newSubjects = [...selectedSubjects, subject];
                                      handleSubjectChange(newSubjects);
                                    } else {
                                      const newSubjects = selectedSubjects.filter(s => s !== subject);
                                      handleSubjectChange(newSubjects);
                                    }
                                  }}
                                />
                                <Label htmlFor={`subject-${subject}`} className="text-sm font-normal">
                                  {subject}
                                </Label>
                              </div>
                            ))}
                            <div className="flex items-center space-x-2 border-t pt-2 mt-2">
                              <Checkbox
                                id="subject-all"
                                checked={selectedSubjects.length === availableSubjects.length && !selectedSubjects.includes("OTHERS")}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    handleSubjectChange([...availableSubjects]);
                                  } else {
                                    handleSubjectChange([]);
                                  }
                                }}
                              />
                              <Label htmlFor="subject-all" className="text-sm font-medium text-blue-600">
                                ALL
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 border-t pt-2 mt-1">
                              <Checkbox
                                id="subject-others"
                                checked={selectedSubjects.includes("OTHERS")}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    const newSubjects = [...selectedSubjects, "OTHERS"];
                                    handleSubjectChange(newSubjects);
                                  } else {
                                    const newSubjects = selectedSubjects.filter(s => s !== "OTHERS");
                                    handleSubjectChange(newSubjects);
                                    setOtherSubject("");
                                  }
                                }}
                              />
                              <Label htmlFor="subject-others" className="text-sm font-medium text-orange-600">
                                OTHERS
                              </Label>
                            </div>
                          </>
                        ) : (
                          <p className="text-sm text-gray-500">Select classes first to see available subjects</p>
                        )}
                      </div>
                      
                      {/* OTHERS text input */}
                      {selectedSubjects.includes("OTHERS") && (
                        <div className="mt-3">
                          <Label htmlFor="other-subject" className="text-sm font-medium">
                            Specify Other Subject:
                          </Label>
                          <Input
                            id="other-subject"
                            placeholder="Enter custom subject name"
                            value={otherSubject}
                            onChange={(e) => setOtherSubject(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      )}
                      
                      {selectedSubjects.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">
                            Selected: {selectedSubjects.map(s => s === "OTHERS" && otherSubject ? otherSubject : s).join(", ")}
                          </p>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* File Upload Section */}
                <div>
                  <FormField
                    control={form.control}
                    name="hasFileUpload"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Any file to upload?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) => field.onChange(value === "yes")}
                            value={field.value ? "yes" : "no"}
                            className="flex flex-row space-x-6 mt-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="file-yes" />
                              <Label htmlFor="file-yes">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="file-no" />
                              <Label htmlFor="file-no">No</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("hasFileUpload") && (
                    <div className="mt-4 space-y-4">
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                        <div className="text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-4">
                            <Label htmlFor="file-upload" className="cursor-pointer">
                              <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
                                Upload a file
                              </span>
                            </Label>
                            <Input
                              id="file-upload"
                              type="file"
                              className="hidden"
                              onChange={handleFileChange}
                              accept=".pdf,.doc,.docx,.txt"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {selectedFile && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {selectedFile.name}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={removeFile}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Questions Section */}
            <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 border border-white/20 shadow-xl">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                    Questions
                  </CardTitle>
                  <Button
                    type="button"
                    onClick={addQuestion}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {questions.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8"
                  >
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      No questions added yet. Click "Add Question" to start.
                    </p>
                  </motion.div>
                ) : (
                  <AnimatePresence mode="wait">
                    {questions.map((question, questionIndex) => (
                      <motion.div 
                        key={question.id}
                        layout
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0, 
                          scale: 1,
                          transition: {
                            type: "spring",
                            stiffness: 300,
                            damping: 30
                          }
                        }}
                        exit={{ 
                          opacity: 0, 
                          y: -20, 
                          scale: 0.95,
                          transition: {
                            duration: 0.2
                          }
                        }}
                        whileHover={{ scale: 1.01 }}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4 bg-gradient-to-br from-white/50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50"
                      >
                          <div className="flex justify-between items-start">
                            <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                              Question {questionIndex + 1}
                            </h4>
                            <div className="flex space-x-2">
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => moveQuestion(question.id, 'up')}
                                  disabled={questionIndex === 0}
                                >
                                  <MoveUp className="w-4 h-4" />
                                </Button>
                              </motion.div>
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => moveQuestion(question.id, 'down')}
                                  disabled={questionIndex === questions.length - 1}
                                >
                                  <MoveDown className="w-4 h-4" />
                                </Button>
                              </motion.div>
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteQuestion(question.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </motion.div>
                            </div>
                          </div>

                          <div>
                            <Label>Question Text</Label>
                            <Input
                              placeholder="Enter question text"
                              value={question.questionText}
                              onChange={(e) => updateQuestion(question.id, { questionText: e.target.value })}
                              className="mt-1"
                            />
                          </div>

                          <div className="flex space-x-6">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`required-${question.id}`}
                                checked={question.isRequired}
                                onCheckedChange={(checked) => 
                                  updateQuestion(question.id, { isRequired: checked as boolean })
                                }
                              />
                              <Label htmlFor={`required-${question.id}`}>Required Question</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`other-${question.id}`}
                                checked={question.hasOtherOption}
                                onCheckedChange={(checked) => 
                                  updateQuestion(question.id, { hasOtherOption: checked as boolean })
                                }
                              />
                              <Label htmlFor={`other-${question.id}`}>Add Other Option</Label>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <Label>Options</Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addOption(question.id)}
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Option
                              </Button>
                            </div>
                            <div className="space-y-3">
                              {question.options.map((option, optionIndex) => (
                                <motion.div 
                                  key={option.id} 
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 20 }}
                                  className="flex items-center space-x-3"
                                >
                                  <div className="flex-1 grid grid-cols-3 gap-3">
                                    <div className="col-span-2">
                                      <Input
                                        placeholder={`Option ${optionIndex + 1} text`}
                                        value={option.text}
                                        onChange={(e) => 
                                          updateOption(question.id, option.id, { text: e.target.value })
                                        }
                                      />
                                    </div>
                                    <div>
                                      <Input
                                        type="number"
                                        placeholder="Score"
                                        value={option.score}
                                        min="0"
                                        onChange={(e) => 
                                          updateOption(question.id, option.id, { score: parseInt(e.target.value) || 0 })
                                        }
                                      />
                                    </div>
                                  </div>
                                  {question.options.length > 2 && (
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => deleteOption(question.id, option.id)}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </motion.div>
                                  )}
                                </motion.div>
                              ))}
                            </div>
                          </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </CardContent>
            </Card>

            {/* Footer Buttons */}
            <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 border border-white/20 shadow-xl">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/mock-tests")}
                    className="order-3 sm:order-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      form.reset();
                      const defaultQuestion: MockTestQuestion = {
                        id: `question-${Date.now()}`,
                        questionText: "",
                        isRequired: false,
                        hasOtherOption: false,
                        options: [
                          { id: `option-${Date.now()}-1`, text: "", score: 0 },
                          { id: `option-${Date.now()}-2`, text: "", score: 0 }
                        ]
                      };
                      setQuestions([defaultQuestion]);
                      setSelectedClasses([]);
                      setSelectedDivisions([]);
                      setSelectedSubjects([]);
                      setOtherSubject("");
                      setSelectedFile(null);
                    }}
                    className="order-2"
                  >
                    Reset Form
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMockTestMutation.isPending}
                    className="order-1 sm:order-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {createMockTestMutation.isPending ? "Saving..." : "Save Mock"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default AddMockTest;