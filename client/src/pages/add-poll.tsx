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
import { ArrowLeft, Save } from "lucide-react";
import { insertPollSchema } from "@shared/schema";

// Form schema
const formSchema = insertPollSchema.extend({
  pollName: z.string().min(1, "Poll name is required"),
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
  pollType: "Single Choice" | "Multiple Choices";
  choices: Choice[];
}

interface Choice {
  id: string;
  choice: string;
}

export default function AddPollPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [question, setQuestion] = useState<Question>({
    id: "1", 
    question: "", 
    pollType: "Single Choice",
    choices: [
      { id: "1", choice: "" },
      { id: "2", choice: "" }
    ]
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pollName: "",
      startDate: "",
      endDate: "",
      questions: [],
      choices: [],
    },
  });

  const createPollMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/polls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create poll');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Poll Created",
        description: "The poll has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/polls'] });
      setLocation('/polls');
    },
    onError: (error: Error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateQuestion = (questionText: string) => {
    setQuestion(prev => ({ ...prev, question: questionText }));
  };

  const updateQuestionPollType = (pollType: "Single Choice" | "Multiple Choices") => {
    setQuestion(prev => ({ ...prev, pollType }));
  };

  const updateQuestionChoice = (choiceId: string, choice: string) => {
    setQuestion(prev => ({
      ...prev,
      choices: prev.choices.map(c => c.id === choiceId ? { ...c, choice } : c)
    }));
  };

  const updateQuestionNumChoices = (num: number) => {
    setQuestion(prev => {
      const newChoices: Choice[] = [];
      for (let i = 1; i <= num; i++) {
        const existingChoice = prev.choices.find(c => c.id === i.toString());
        newChoices.push(existingChoice || { id: i.toString(), choice: "" });
      }
      return { ...prev, choices: newChoices };
    });
  };

  const onSubmit = (values: FormValues) => {
    // Validate the single question
    const hasValidQuestion = question.question.trim();
    const validChoices = question.choices.filter(c => c.choice.trim());
    const hasValidChoices = validChoices.length >= 2;

    if (!hasValidQuestion) {
      toast({
        title: "Validation Error",
        description: "Please enter a question.",
        variant: "destructive",
      });
      return;
    }

    if (!hasValidChoices) {
      toast({
        title: "Validation Error",
        description: "Please provide at least two choices for the question.",
        variant: "destructive",
      });
      return;
    }

    // Prepare data for submission
    const processedQuestions = [{
      id: question.id,
      question: question.question,
      pollType: question.pollType
    }];

    const allChoices = validChoices.map(c => ({
      id: `${question.id}-${c.id}`,
      choice: c.choice,
      questionId: question.id
    }));

    const pollData = {
      ...values,
      questions: processedQuestions,
      choices: allChoices,
    };

    createPollMutation.mutate(pollData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/polls">
              <Button variant="outline" size="sm" className="bg-white/70 backdrop-blur-sm border-white/20">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Polls
              </Button>
            </Link>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Add Poll Details
            </h1>
          </div>
          <h2 className="text-xl font-semibold text-gray-700">
            Create a Poll with One Question*
          </h2>
        </div>

        {/* Form Card */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader className="border-b border-white/20">
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Poll Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Poll Name */}
                <FormField
                  control={form.control}
                  name="pollName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Poll Name*</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter Poll Name"
                          className="bg-white/50 border-white/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Poll Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Poll Start Date*</FormLabel>
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
                        <FormLabel className="text-sm font-medium text-gray-700">Poll End Date*</FormLabel>
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

                {/* Poll Question Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-700">Poll Question</h3>
                  
                  <div className="border border-white/30 rounded-lg p-6 bg-white/30 backdrop-blur-sm space-y-4">
                    {/* Question Header */}
                    <div className="flex items-center justify-between">
                      <h4 className="text-md font-medium text-gray-700">Question</h4>
                    </div>

                    {/* Question Input */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Question*
                      </label>
                      <Textarea
                        placeholder="Enter your poll question..."
                        value={question.question}
                        onChange={(e) => updateQuestion(e.target.value)}
                        className="bg-white/50 border-white/20"
                        rows={3}
                      />
                      <div className="text-xs text-gray-500">
                        Characters: {question.question.length}
                      </div>
                    </div>

                    {/* Poll Type for this question */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Poll Type*</label>
                      <Select 
                        value={question.pollType} 
                        onValueChange={(value: "Single Choice" | "Multiple Choices") => updateQuestionPollType(value)}
                      >
                        <SelectTrigger className="bg-white/50 border-white/20">
                          <SelectValue placeholder="Select Poll Type" />
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
                            onValueChange={(value) => updateQuestionNumChoices(parseInt(value))}
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
                              onChange={(e) => updateQuestionChoice(choice.id, e.target.value)}
                              className="bg-white/50 border-white/20"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t border-white/20">
                  <Link href="/polls">
                    <Button
                      type="button"
                      variant="outline"
                      className="bg-white/50 hover:bg-white/70 border-white/20"
                    >
                      Back
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={createPollMutation.isPending}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    {createPollMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Submit
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