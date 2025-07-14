import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Edit } from "lucide-react";
import type { PeriodicTest } from "@shared/schema";

export default function PeriodicTestPage() {
  const { data: periodicTests = [], isLoading } = useQuery<PeriodicTest[]>({
    queryKey: ["/api/periodic-tests"],
  });

  // Group tests by class/division combination
  const groupedTests = periodicTests.reduce((acc, test) => {
    const key = `${test.class}-${test.divisions.join(",")}`;
    if (!acc[key]) {
      acc[key] = {
        class: test.class,
        divisions: test.divisions,
        subjects: [],
        tests: [],
      };
    }
    
    // Add subject if not already present
    if (!acc[key].subjects.includes(test.subject)) {
      acc[key].subjects.push(test.subject);
    }
    
    acc[key].tests.push(test);
    return acc;
  }, {} as Record<string, { class: string; divisions: string[]; subjects: string[]; tests: PeriodicTest[] }>);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-lg text-gray-600">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Schedule Periodic Test
          </h1>
          <p className="text-gray-600 mt-2">
            Manage periodic test schedules for all classes and subjects
          </p>
        </div>

        {/* Add New Test Button */}
        <div className="mb-6">
          <Link href="/periodic-test/add">
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-md">
              <Plus className="w-4 h-4 mr-2" />
              Add New Test
            </Button>
          </Link>
        </div>

        {/* Tests Table */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">Scheduled Tests</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(groupedTests).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Class/Division</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Subjects</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(groupedTests).map((group, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-800">
                              Class {group.class}
                            </span>
                            <span className="text-sm text-gray-600">
                              {group.divisions.length > 1 
                                ? `Divisions: ${group.divisions.join(", ")}`
                                : `Division: ${group.divisions[0]}`
                              }
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-800">
                              {group.subjects.join(", ")}
                            </span>
                            <div className="text-sm text-gray-600 mt-1">
                              {group.tests.length} test{group.tests.length !== 1 ? 's' : ''} scheduled
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">No periodic tests scheduled yet.</p>
                <p className="text-gray-400 mb-6">Create your first test schedule to get started.</p>
                <Link href="/periodic-test/add">
                  <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule First Test
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}