import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Minus, Save } from "lucide-react";
import { insertSurveySchema } from "@shared/schema";

// Form schema
const formSchema = insertSurveySchema.extend({
  surveyName: z.string().min(1, "Survey name is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
}).refine((data) => {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  return endDate >= startDate;
}, {
  message: "End date must be on or after start date",
  path: ["endDate"],
});

type FormValues = z.infer<typeof formSchema>;

interface Question {
  id: string;
  question: string;
  surveyType: "Single Choice" | "Multiple Choices";
  choices: Choice[];
}

interface Choice {
  id: string;
  choice: string;
}

export default function AddSurveyPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [questions, setQuestions] = useState<Question[]>([
    { 
      id: "1", 
      question: "", 
      surveyType: "Single Choice",
      choices: [
        { id: "1", choice: "" },
        { id: "2", choice: "" }
      ]
    }
  ]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      surveyName: "",
      startDate: "",
      endDate: "",
      questions: [],
      choices: [],
    },
  });

  const createSurveyMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/surveys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create survey');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Survey Created",
        description: "The survey has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/surveys'] });
      setLocation('/surveys');
    },
    onError: (error: Error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addQuestion = () => {
    const newId = (questions.length + 1).toString();
    setQuestions([...questions, { 
      id: newId, 
      question: "", 
      surveyType: "Single Choice",
      choices: [
        { id: "1", choice: "" },
        { id: "2", choice: "" }
      ]
    }]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const updateQuestion = (id: string, question: string) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, question } : q));
  };

  const updateQuestionSurveyType = (id: string, surveyType: "Single Choice" | "Multiple Choices") => {
    setQuestions(questions.map(q => q.id === id ? { ...q, surveyType } : q));
  };

  const updateQuestionChoice = (questionId: string, choiceId: string, choice: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { ...q, choices: q.choices.map(c => c.id === choiceId ? { ...c, choice } : c) }
        : q
    ));
  };

  const updateQuestionNumChoices = (questionId: string, num: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newChoices: Choice[] = [];
        for (let i = 1; i <= num; i++) {
          const existingChoice = q.choices.find(c => c.id === i.toString());
          newChoices.push(existingChoice || { id: i.toString(), choice: "" });
        }
        return { ...q, choices: newChoices };
      }
      return q;
    }));
  };

  const onSubmit = (values: FormValues) => {
    // Validate questions
    const validQuestions = questions.filter(q => {
      const hasValidQuestion = q.question.trim();
      const hasValidChoices = q.choices.filter(c => c.choice.trim()).length >= 2;
      return hasValidQuestion && hasValidChoices;
    });

    if (validQuestions.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one question with at least two choices.",
        variant: "destructive",
      });
      return;
    }

    // Check for incomplete questions
    const incompleteQuestions = questions.filter(q => {
      const hasValidQuestion = q.question.trim();
      const hasValidChoices = q.choices.filter(c => c.choice.trim()).length >= 2;
      return q.question.trim() && (!hasValidQuestion || !hasValidChoices);
    });

    if (incompleteQuestions.length > 0) {
      toast({
        title: "Validation Error",
        description: "Please complete all questions with at least two choices each.",
        variant: "destructive",
      });
      return;
    }

    // Prepare data for submission
    const processedQuestions = validQuestions.map(q => ({
      id: q.id,
      question: q.question,
      surveyType: q.surveyType
    }));

    const allChoices = validQuestions.flatMap(q => 
      q.choices.filter(c => c.choice.trim()).map(c => ({
        id: `${q.id}-${c.id}`,
        choice: c.choice,
        questionId: q.id
      }))
    );

    const surveyData = {
      ...values,
      questions: processedQuestions,
      choices: allChoices,
    };

    createSurveyMutation.mutate(surveyData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/surveys">
              <Button variant="outline" size="sm" className="bg-white/70 backdrop-blur-sm border-white/20">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Surveys
              </Button>
            </Link>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Add Survey Details
            </h1>
          </div>
          <h2 className="text-xl font-semibold text-gray-700">
            Survey Description*
          </h2>
        </div>

        {/* Form Card */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader className="border-b border-white/20">
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Survey Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Survey Name */}
                <FormField
                  control={form.control}
                  name="surveyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Survey Name*</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter Survey Name"
                          className="bg-white/50 border-white/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Survey Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Survey Start Date*</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            className="bg-white/50 border-white/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Survey End Date*</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            className="bg-white/50 border-white/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Survey Questions Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-700">Survey Questions</h3>
                  
                  {questions.map((question, index) => (
                    <div key={question.id} className="border border-white/30 rounded-lg p-6 bg-white/30 backdrop-blur-sm space-y-4">
                      {/* Question Header */}
                      <div className="flex items-center justify-between">
                        <h4 className="text-md font-medium text-gray-700">
                          {index === 0 ? "Question" : `Question ${index + 1}`}
                        </h4>
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeQuestion(question.id)}
                            className="bg-red-50 hover:bg-red-100 border-red-200 text-red-600"
                          >
                            <Minus className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        )}
                      </div>

                      {/* Question Input */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Question*
                        </label>
                        <Textarea
                          placeholder={`Enter question ${index + 1}...`}
                          value={question.question}
                          onChange={(e) => updateQuestion(question.id, e.target.value)}
                          className="bg-white/50 border-white/20"
                          rows={3}
                        />
                        <div className="text-xs text-gray-500">
                          Characters: {question.question.length}
                        </div>
                      </div>

                      {/* Survey Type for this question */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Survey Type*</label>
                        <Select 
                          value={question.surveyType} 
                          onValueChange={(value: "Single Choice" | "Multiple Choices") => updateQuestionSurveyType(question.id, value)}
                        >
                          <SelectTrigger className="bg-white/50 border-white/20">
                            <SelectValue placeholder="Select Survey Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Single Choice">Single Choice</SelectItem>
                            <SelectItem value="Multiple Choices">Multiple Choices</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Choices for this question */}
                      <div className="space-y-4">
                        <h5 className="text-sm font-semibold text-gray-700">Choices</h5>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              No. Of Choices*
                            </label>
                            <Select 
                              value={question.choices.length.toString()} 
                              onValueChange={(value) => updateQuestionNumChoices(question.id, parseInt(value))}
                            >
                              <SelectTrigger className="bg-white/50 border-white/20">
                                <SelectValue placeholder="Select number of choices" />
                              </SelectTrigger>
                              <SelectContent>
                                {[2, 3, 4, 5, 6, 7, 8].map((num) => (
                                  <SelectItem key={num} value={num.toString()}>
                                    {num} Choices
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {question.choices.map((choice, choiceIndex) => (
                            <div key={choice.id}>
                              <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Choice {choiceIndex + 1}
                              </label>
                              <Input
                                placeholder={`Enter Choice ${choiceIndex + 1}`}
                                value={choice.choice}
                                onChange={(e) => updateQuestionChoice(question.id, choice.id, e.target.value)}
                                className="bg-white/50 border-white/20"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addQuestion}
                    className="bg-green-50 hover:bg-green-100 border-green-200 text-green-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add More Questions
                  </Button>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t border-white/20">
                  <Link href="/surveys">
                    <Button
                      type="button"
                      variant="outline"
                      className="bg-white/50 border-white/20"
                    >
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    disabled={createSurveyMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {createSurveyMutation.isPending ? "Creating..." : "Create Survey"}
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