import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Plus } from "lucide-react";
import type { ClassMapping, SyllabusMaster } from "@shared/schema";

export default function SyllabusMasterPage() {
  const { data: classMappings = [], isLoading: isClassMappingsLoading } = useQuery<ClassMapping[]>({
    queryKey: ["/api/class-mappings"],
  });

  const { data: syllabusMasters = [], isLoading: isSyllabusMastersLoading } = useQuery<SyllabusMaster[]>({
    queryKey: ["/api/syllabus-masters"],
  });

  // Group syllabus masters by class
  const syllabusGroupedByClass = syllabusMasters.reduce((acc, syllabus) => {
    if (!acc[syllabus.class]) {
      acc[syllabus.class] = [];
    }
    acc[syllabus.class].push(syllabus);
    return acc;
  }, {} as Record<string, SyllabusMaster[]>);

  // Get unique classes from class mappings
  const uniqueClasses = Array.from(new Set(classMappings.map(mapping => mapping.class)));

  if (isClassMappingsLoading || isSyllabusMastersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-lg text-gray-600">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Syllabus Master
          </h1>
          <p className="text-gray-600 mt-2">
            Manage syllabus content by class and division
          </p>
        </div>

        {/* Class Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {uniqueClasses.map((className) => {
            const classData = classMappings.filter(mapping => mapping.class === className);
            const uniqueDivisions = Array.from(new Set(classData.map(mapping => mapping.division)));
            const syllabusData = syllabusGroupedByClass[className] || [];

            return (
              <Card key={className} className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-semibold text-gray-800">
                    Class {className}
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    {uniqueDivisions.length} Division{uniqueDivisions.length !== 1 ? 's' : ''} • {syllabusData.length} Syllabus Item{syllabusData.length !== 1 ? 's' : ''}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <strong>Divisions:</strong> {uniqueDivisions.join(", ")}
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Subjects:</strong> {Array.from(new Set([
                        ...classData.flatMap(mapping => mapping.subjects || []),
                        ...classData.flatMap(mapping => 
                          (mapping.electiveGroups as any[] || []).flatMap((group: any) => group.subjects || [])
                        )
                      ])).join(", ")}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Link href={`/syllabus-master/class/${className}`}>
                      <Button 
                        size="sm" 
                        className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 shadow-md"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/syllabus-master/add?class=${className}`}>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {uniqueClasses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No classes found.</p>
            <p className="text-gray-400">Please add class mappings first to create syllabus content.</p>
            <Link href="/class-mapping">
              <Button className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white">
                Go to Class Mapping
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}