import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Calendar, User, Book } from "lucide-react";
import type { MockTest } from "@shared/schema";

function MockTestsLanding() {
  const { data: mockTests, isLoading } = useQuery<MockTest[]>({
    queryKey: ["/api/mock-tests"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950 dark:via-pink-950 dark:to-blue-950 p-6">
        <div className="container mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950 dark:via-pink-950 dark:to-blue-950 p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Mock Tests
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Manage and create mock tests for students
            </p>
          </div>
          <Link href="/mock-tests/add">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Mock Test
            </Button>
          </Link>
        </div>

        <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 border border-white/20 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
              Mock Test Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!mockTests || mockTests.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-800 dark:to-pink-800 rounded-full flex items-center justify-center mx-auto">
                    <Book className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                  No mock tests created yet
                </p>
                <Link href="/mock-tests/add">
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    Create Your First Mock Test
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-4 px-4 font-semibold text-gray-800 dark:text-gray-200">
                        Mock Name
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-800 dark:text-gray-200">
                        Class/Subject/Division
                      </th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-800 dark:text-gray-200">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockTests.map((mockTest) => (
                      <tr 
                        key={mockTest.id} 
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex flex-col space-y-1">
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {mockTest.mockName}
                            </span>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{mockTest.mockStartDate} - {mockTest.mockEndDate}</span>
                              </div>
                              {mockTest.hasFileUpload && (
                                <Badge variant="secondary" className="text-xs">
                                  File Upload
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Class {mockTest.class} - Division {mockTest.division}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {mockTest.subjects.map((subject, index) => (
                                <Badge 
                                  key={index} 
                                  variant="outline"
                                  className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-800 dark:to-pink-800 border-purple-200 dark:border-purple-700"
                                >
                                  {subject}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-center">
                            <Link href={`/mock-tests/view/${mockTest.id}`}>
                              <Button 
                                variant="outline"
                                size="sm"
                                className="border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default MockTestsLanding;