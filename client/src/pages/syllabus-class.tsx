import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";
import type { ClassMapping, SyllabusMaster } from "@shared/schema";

export default function SyllabusClassPage() {
  const [, params] = useRoute("/syllabus-master/class/:className");
  const className = params?.className || "";

  const { data: classMappings = [], isLoading: isClassMappingsLoading } = useQuery<ClassMapping[]>({
    queryKey: ["/api/class-mappings"],
  });

  const { data: syllabusMasters = [], isLoading: isSyllabusMastersLoading } = useQuery<SyllabusMaster[]>({
    queryKey: ["/api/syllabus-masters"],
  });

  // Filter class mappings for this class
  const classData = classMappings.filter(mapping => mapping.class === className);
  const uniqueDivisions = Array.from(new Set(classData.map(mapping => mapping.division)));
  const allSubjects = Array.from(new Set(classData.flatMap(mapping => mapping.subjects)));

  // Filter syllabus masters for this class
  const classSyllabusMasters = syllabusMasters.filter(syllabus => syllabus.class === className);

  // Group by subject
  const syllabusGroupedBySubject = classSyllabusMasters.reduce((acc, syllabus) => {
    if (!acc[syllabus.subject]) {
      acc[syllabus.subject] = [];
    }
    acc[syllabus.subject].push(syllabus);
    return acc;
  }, {} as Record<string, SyllabusMaster[]>);

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
          <Link href="/syllabus-master">
            <Button variant="ghost" className="mb-4 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Syllabus Master
            </Button>
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Class {className} - Syllabus Master
          </h1>
          <p className="text-gray-600 mt-2">
            Manage syllabus content for Class {className} across all divisions and subjects
          </p>
        </div>

        {/* Class Info */}
        <Card className="mb-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">Class Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Divisions</h4>
                <div className="flex flex-wrap gap-2">
                  {uniqueDivisions.map((division) => (
                    <Badge key={division} variant="secondary" className="bg-indigo-100 text-indigo-800">
                      {division}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Subjects</h4>
                <div className="flex flex-wrap gap-2">
                  {allSubjects.map((subject) => (
                    <Badge key={subject} variant="outline" className="border-purple-200 text-purple-700">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add New Syllabus Button */}
        <div className="mb-6">
          <Link href={`/syllabus-master/add?class=${className}`}>
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md">
              <Plus className="w-4 h-4 mr-2" />
              Add New Syllabus
            </Button>
          </Link>
        </div>

        {/* Syllabus by Subject */}
        <div className="space-y-6">
          {allSubjects.map((subject) => {
            const subjectSyllabi = syllabusGroupedBySubject[subject] || [];
            
            return (
              <Card key={subject} className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl text-gray-800">{subject}</CardTitle>
                    <Badge 
                      variant={subjectSyllabi.length > 0 ? "default" : "secondary"}
                      className={subjectSyllabi.length > 0 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
                    >
                      {subjectSyllabi.length} Syllabus Item{subjectSyllabi.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {subjectSyllabi.length > 0 ? (
                    <div className="space-y-3">
                      {subjectSyllabi.map((syllabus) => (
                        <div key={syllabus.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">{syllabus.topic}</h4>
                            <p className="text-sm text-gray-600 mt-1">{syllabus.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>Divisions: {syllabus.divisions.join(", ")}</span>
                              <Badge 
                                variant={syllabus.status === "active" ? "default" : "secondary"}
                                className={syllabus.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
                              >
                                {syllabus.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No syllabus content created for {subject} yet.</p>
                      <Link href={`/syllabus-master/add?class=${className}&subject=${subject}`}>
                        <Button 
                          variant="outline" 
                          className="mt-3 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Syllabus for {subject}
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {allSubjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No subjects found for Class {className}.</p>
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