import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Eye } from "lucide-react";
import type { Poll } from "@shared/schema";

export default function PollsPage() {
  const { data: polls = [], isLoading } = useQuery<Poll[]>({
    queryKey: ['/api/polls'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Polls Management
            </h1>
            <Link href="/add-poll">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add New Poll
              </Button>
            </Link>
          </div>
          <p className="text-gray-600">
            Manage and view all polls created for the institution.
          </p>
        </div>

        {/* Polls Table */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader className="border-b border-white/20">
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              All Polls
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {polls.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Polls Found</h3>
                <p className="text-gray-500 mb-4">Create your first poll to get started.</p>
                <Link href="/add-poll">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Poll
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20">
                    <TableHead className="font-semibold text-gray-700">Poll Name</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {polls.map((poll) => (
                    <TableRow key={poll.id} className="border-white/20 hover:bg-white/30 transition-colors">
                      <TableCell className="font-medium text-gray-800">
                        <div className="space-y-1">
                          <div className="font-semibold text-lg text-blue-700">
                            {poll.pollName}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Questions:</span> {poll.questions?.length || 0}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Total Choices:</span> {poll.choices?.length || 0}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Question Types:</span> {
                              poll.questions?.map(q => q.pollType || "Single Choice").join(", ") || "Mixed"
                            }
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Link href={`/view-poll/${poll.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-600"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}