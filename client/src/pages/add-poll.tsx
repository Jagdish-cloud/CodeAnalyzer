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
import { insertPollSchema } from "@shared/schema";

// Form schema
const formSchema = insertPollSchema.extend({
  pollName: z.string().min(1, "Poll name is required"),
  pollType: z.enum(["Single Choice", "Multiple Choices"], {
    required_error: "Please select a poll type",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface Question {
  id: string;
  question: string;
}

interface Choice {
  id: string;
  choice: string;
}

export default function AddPollPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [questions, setQuestions] = useState<Question[]>([
    { id: "1", question: "" }
  ]);
  const [choices, setChoices] = useState<Choice[]>([
    { id: "1", choice: "" },
    { id: "2", choice: "" }
  ]);
  const [numChoices, setNumChoices] = useState(2);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pollName: "",
      pollType: undefined,
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

  const addQuestion = () => {
    const newId = (questions.length + 1).toString();
    setQuestions([...questions, { id: newId, question: "" }]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const updateQuestion = (id: string, question: string) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, question } : q));
  };

  const updateChoice = (id: string, choice: string) => {
    setChoices(choices.map(c => c.id === id ? { ...c, choice } : c));
  };

  const updateNumChoices = (num: number) => {
    setNumChoices(num);
    const newChoices: Choice[] = [];
    for (let i = 1; i <= num; i++) {
      const existingChoice = choices.find(c => c.id === i.toString());
      newChoices.push(existingChoice || { id: i.toString(), choice: "" });
    }
    setChoices(newChoices);
  };

  const onSubmit = (values: FormValues) => {
    // Validate questions
    const validQuestions = questions.filter(q => q.question.trim());
    if (validQuestions.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one question.",
        variant: "destructive",
      });
      return;
    }

    // Validate choices
    const validChoices = choices.filter(c => c.choice.trim());
    if (validChoices.length < 2) {
      toast({
        title: "Validation Error",
        description: "Please add at least two choices.",
        variant: "destructive",
      });
      return;
    }

    const pollData = {
      ...values,
      questions: validQuestions,
      choices: validChoices,
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
            Poll Description*
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

                {/* Poll Questions Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700">Poll Questions</h3>
                  
                  {questions.map((question, index) => (
                    <div key={question.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          {index === 0 ? "Poll Question*" : `Additional Question ${index}`}
                        </label>
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

                {/* Poll Type */}
                <FormField
                  control={form.control}
                  name="pollType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Poll Type*</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/50 border-white/20">
                            <SelectValue placeholder="Select Poll Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Single Choice">Single Choice</SelectItem>
                          <SelectItem value="Multiple Choices">Multiple Choices</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Choices Section */}
                <div className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700">Choices</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          No. Of Choices*
                        </label>
                        <Select value={numChoices.toString()} onValueChange={(value) => updateNumChoices(parseInt(value))}>
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
                      {choices.map((choice, index) => (
                        <div key={choice.id}>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Choice {index + 1}
                          </label>
                          <Input
                            placeholder={`Enter Choice ${index + 1}`}
                            value={choice.choice}
                            onChange={(e) => updateChoice(choice.id, e.target.value)}
                            className="bg-white/50 border-white/20"
                          />
                        </div>
                      ))}
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