import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle } from "lucide-react";
import type { Poll } from "@shared/schema";

export default function ViewPollPage() {
  const params = useParams<{ id: string }>();
  const pollId = parseInt(params?.id || "0");
  
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [submitted, setSubmitted] = useState(false);

  const { data: poll, isLoading } = useQuery<Poll>({
    queryKey: [`/api/polls/${pollId}`],
    enabled: !!pollId,
  });





  const handleSingleChoiceChange = (questionId: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleMultipleChoiceChange = (questionId: string, choiceId: string, checked: boolean) => {
    setResponses(prev => {
      const currentChoices = (prev[questionId] as string[]) || [];
      if (checked) {
        return {
          ...prev,
          [questionId]: [...currentChoices, choiceId]
        };
      } else {
        return {
          ...prev,
          [questionId]: currentChoices.filter(id => id !== choiceId)
        };
      }
    });
  };

  const handleSubmit = () => {
    // Here you would typically submit the responses to your backend
    console.log('Poll responses:', responses);
    setSubmitted(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-600">Poll Not Found</h1>
            <Link href="/polls">
              <Button className="mt-4">Back to Polls</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
            <CardContent className="p-12 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h1>
              <p className="text-gray-600 mb-6">Your response has been recorded successfully.</p>
              <Link href="/polls">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Polls
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
              {poll?.pollName || "Poll"}
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
              Mixed Question Types
            </span>
            <span>{poll?.questions?.length || 0} Questions</span>
            <span>{poll?.choices?.length || 0} Total Choices</span>
          </div>
        </div>

        {/* Poll Questions */}
        <div className="space-y-4">
          {poll?.questions && poll.questions.length > 0 ? (
            poll.questions.map((question, questionIndex) => {
              // Get choices for this specific question
              const questionChoices = poll?.choices?.filter(choice => 
                choice.questionId === question.id || choice.id?.startsWith(`${question.id}-`)
              ) || [];
              

              
              const pollType = question.pollType || "Single Choice";
              
              return (
                <div key={question.id} className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-lg p-6 shadow-xl">
                  {/* Question Header */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {questionIndex + 1}. {question.question}
                    </h3>
                  </div>

                  {/* Answer Options */}
                  <div className="space-y-3">
                    {pollType === "Single Choice" ? (
                      <RadioGroup
                        value={responses[question.id] as string || ""}
                        onValueChange={(value) => handleSingleChoiceChange(question.id, value)}
                        className="space-y-3"
                      >
                        {questionChoices.map((choice) => (
                          <div key={choice.id} className="flex items-center space-x-3">
                            <RadioGroupItem value={choice.id} id={`${question.id}-${choice.id}`} />
                            <Label 
                              htmlFor={`${question.id}-${choice.id}`} 
                              className="text-sm font-medium text-gray-700 cursor-pointer flex-1"
                            >
                              {choice.choice}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    ) : (
                      <div className="space-y-3">
                        {questionChoices.map((choice) => {
                          const isChecked = ((responses[question.id] as string[]) || []).includes(choice.id);
                          return (
                            <div key={choice.id} className="flex items-center space-x-3">
                              <Checkbox 
                                id={`${question.id}-${choice.id}`}
                                checked={isChecked}
                                onCheckedChange={(checked) => 
                                  handleMultipleChoiceChange(question.id, choice.id, checked as boolean)
                                }
                              />
                              <Label 
                                htmlFor={`${question.id}-${choice.id}`} 
                                className="text-sm font-medium text-gray-700 cursor-pointer flex-1"
                              >
                                {choice.choice}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No questions found in this poll.</p>
            </div>
          )}
        </div>

        {/* Submit Section */}
        <div className="mt-8 text-center">
          <Button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 text-lg"
            disabled={Object.keys(responses).length === 0}
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Submit Poll Response
          </Button>
        </div>
      </div>
    </div>
  );
}