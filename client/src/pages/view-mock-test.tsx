import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, Calendar, User, Book, FileText } from "lucide-react";
import type { MockTest } from "@shared/schema";

function ViewMockTest() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/mock-tests/view/:id");
  
  const { data: mockTest, isLoading } = useQuery<MockTest>({
    queryKey: [`/api/mock-tests/${params?.id}`],
    enabled: !!params?.id,
  });

  if (!match || !params?.id) {
    return <div>Mock test not found</div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950 dark:via-pink-950 dark:to-blue-950 p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!mockTest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950 dark:via-pink-950 dark:to-blue-950 p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Mock Test Not Found</h1>
            <Button onClick={() => setLocation("/mock-tests")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Mock Tests
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950 dark:via-pink-950 dark:to-blue-950 p-6">
      <div className="container mx-auto max-w-4xl">
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
              {mockTest.mockName}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Mock Test Details and Questions
            </p>
          </div>
        </div>

        {/* Mock Test Header Information */}
        <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 border border-white/20 shadow-xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
              <Book className="w-6 h-6 mr-2 text-purple-600" />
              Mock Test Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Class & Division</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Class {mockTest.class} - Division {mockTest.division}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Test Period</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {mockTest.mockStartDate} to {mockTest.mockEndDate}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Subjects</p>
                  <div className="flex flex-wrap gap-2">
                    {mockTest.subjects.map((subject, index) => (
                      <Badge 
                        key={index} 
                        className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-800 dark:to-pink-800 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700"
                      >
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>

                {mockTest.hasFileUpload && mockTest.fileName && (
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Attached File</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {mockTest.fileName}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {mockTest.description && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Description</p>
                <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  {mockTest.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mock Test Questions */}
        <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 border border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="w-6 h-6 mr-2 text-purple-600" />
                Test Questions
              </div>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {mockTest.questions?.length || 0} Questions
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!mockTest.questions || mockTest.questions.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-800 dark:to-pink-800 rounded-full flex items-center justify-center mx-auto">
                    <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  No questions added to this mock test yet
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {mockTest.questions?.map((question, questionIndex) => (
                  <div key={question.id || questionIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white/50 dark:bg-gray-800/50">
                    <div className="mb-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          Question {questionIndex + 1}
                          {question.isRequired && (
                            <Badge variant="destructive" className="ml-2 text-xs">
                              Required
                            </Badge>
                          )}
                          {question.hasOtherOption && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Has Other Option
                            </Badge>
                          )}
                        </h3>
                      </div>
                      <p className="text-gray-800 dark:text-gray-200 text-base leading-relaxed">
                        {question.questionText}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                        Answer Options:
                      </p>
                      <RadioGroup className="space-y-3">
                        {question.options?.map((option, optionIndex) => (
                          <div 
                            key={option.id || optionIndex} 
                            className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                          >
                            <RadioGroupItem 
                              value={option.id || optionIndex.toString()} 
                              id={`question-${questionIndex}-option-${optionIndex}`}
                              disabled
                            />
                            <Label 
                              htmlFor={`question-${questionIndex}-option-${optionIndex}`}
                              className="flex-1 cursor-default"
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-gray-900 dark:text-gray-100">
                                  {option.text}
                                </span>
                                <Badge 
                                  variant="outline" 
                                  className="ml-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700"
                                >
                                  {option.score} pts
                                </Badge>
                              </div>
                            </Label>
                          </div>
                        ))}
                        
                        {question.hasOtherOption && (
                          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            <RadioGroupItem 
                              value="other" 
                              id={`question-${questionIndex}-option-other`}
                              disabled
                            />
                            <Label 
                              htmlFor={`question-${questionIndex}-option-other`}
                              className="flex-1 cursor-default text-gray-900 dark:text-gray-100"
                            >
                              Other (Please specify)
                            </Label>
                          </div>
                        )}
                      </RadioGroup>
                    </div>

                    {questionIndex < (mockTest.questions?.length || 0) - 1 && (
                      <Separator className="mt-6" />
                    )}
                  </div>
                ))}
                
                {/* Mock Test Summary */}
                <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg border border-purple-200 dark:border-purple-700">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Test Summary
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {mockTest.questions.length}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Questions</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {mockTest.questions.filter(q => q.isRequired).length}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Required Questions</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {mockTest.questions?.reduce((total, question) => 
                          total + (question.options?.reduce((sum, option) => Math.max(sum, option.score), 0) || 0), 0
                        ) || 0}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Maximum Score</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center">
          <Button
            onClick={() => setLocation("/mock-tests")}
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Mock Tests
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ViewMockTest;