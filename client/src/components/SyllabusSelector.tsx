import React, { useState, useMemo, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, CheckSquare, X, BookOpen, GraduationCap } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSyllabusData } from "@/hooks/useSyllabusData";

interface SubjectGroup {
  subject: string;
  subjectType: "core" | "elective";
  chapters: {
    chapterNo: string;
    chapterName: string;
    topic: string;
    description?: string;
    fullText: string;
  }[];
}

interface SyllabusSelectorProps {
  selectedClass: string;
  selectedSubject: string;
  selectedChapters: string[];
  onChaptersChange: (chapters: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

// Format for unique chapter identification: "subject|chapterNo"
const createChapterKey = (subject: string, chapterNo: string) => `${subject}|${chapterNo}`;
const parseChapterKey = (key: string) => {
  const parts = key.split('|');
  return { subject: parts[0], chapterNo: parts[1] || key };
};

export default function SyllabusSelector({
  selectedClass,
  selectedSubject,
  selectedChapters,
  onChaptersChange,
  disabled = false,
  placeholder = "Select syllabus chapters",
  className = "",
}: SyllabusSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDivision, setSelectedDivision] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Use custom hook for syllabus data
  const {
    classMappings,
    isLoading,
    error,
    getSubjectsForClass,
    getChaptersForSubject,
    isElectiveSubject,
    getElectiveGroupInfo,
    getSubjectsToQuery,
  } = useSyllabusData();

  // Get available divisions for the selected class
  const availableDivisions = useMemo(() => {
    if (!selectedClass) return [];
    return Array.from(new Set(
      classMappings
        .filter(mapping => mapping.class === selectedClass)
        .map(mapping => mapping.division)
    )).sort();
  }, [classMappings, selectedClass]);

  // Check if subject is elective and get group info
  const isElective = isElectiveSubject(selectedClass, selectedSubject);
  const electiveGroupInfo = getElectiveGroupInfo(selectedClass, selectedSubject);

  // Get subjects to query for chapters using the helper function
  const subjectsToQueryArray = getSubjectsToQuery(selectedClass, selectedSubject);

  // Get filtered chapters grouped by subject
  const subjectGroups = useMemo(() => {
    if (!selectedClass || subjectsToQueryArray.length === 0) return [];

    const groups: SubjectGroup[] = subjectsToQueryArray.map((subject: string) => {
      const chapters = getChaptersForSubject(selectedClass, subject, selectedDivision).map(chapter => ({
        chapterNo: chapter.chapterNo,
        chapterName: chapter.description || chapter.topic || `Chapter ${chapter.chapterNo}`,
        topic: chapter.topic,
        description: chapter.description,
        fullText: chapter.fullText,
      }));

      return {
        subject,
        subjectType: isElective ? "elective" : "core",
        chapters,
      };
    });

    return groups.filter(group => group.chapters.length > 0);
  }, [selectedClass, subjectsToQueryArray, selectedDivision, isElective, getChaptersForSubject]);

  // Filter chapters based on search term
  const filteredSubjectGroups = useMemo(() => {
    if (!searchTerm.trim()) return subjectGroups;

    return subjectGroups.map(group => ({
      ...group,
      chapters: group.chapters.filter(chapter =>
        chapter.fullText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chapter.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chapter.chapterNo.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(group => group.chapters.length > 0);
  }, [subjectGroups, searchTerm]);

  // Handle chapter selection with subject-specific keys
  const handleChapterToggle = (subject: string, chapterNo: string) => {
    if (disabled) return;
    
    const chapterKey = createChapterKey(subject, chapterNo);
    const isSelected = selectedChapters.includes(chapterKey);
    if (isSelected) {
      onChaptersChange(selectedChapters.filter(ch => ch !== chapterKey));
    } else {
      onChaptersChange([...selectedChapters, chapterKey]);
    }
  };

  // Handle select all for a subject
  const handleSelectAllForSubject = (subject: string) => {
    if (disabled) return;
    
    const subjectGroup = filteredSubjectGroups.find(group => group.subject === subject);
    if (!subjectGroup) return;
    
    const subjectChapterKeys = subjectGroup.chapters.map(ch => createChapterKey(subject, ch.chapterNo));
    const allSelected = subjectChapterKeys.every(key => selectedChapters.includes(key));
    
    if (allSelected) {
      // Deselect all chapters from this subject
      onChaptersChange(selectedChapters.filter(ch => !subjectChapterKeys.includes(ch)));
    } else {
      // Select all chapters from this subject
      const newSelected = [...selectedChapters];
      subjectChapterKeys.forEach(key => {
        if (!newSelected.includes(key)) {
          newSelected.push(key);
        }
      });
      onChaptersChange(newSelected);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (disabled) return;
    
    const allChapterKeys = filteredSubjectGroups.flatMap(group => 
      group.chapters.map(ch => createChapterKey(group.subject, ch.chapterNo))
    );
    
    const allSelected = allChapterKeys.every(key => selectedChapters.includes(key));
    
    if (allSelected) {
      // Deselect all visible chapters
      onChaptersChange(selectedChapters.filter(ch => !allChapterKeys.includes(ch)));
    } else {
      // Select all visible chapters
      const newSelected = [...selectedChapters];
      allChapterKeys.forEach(key => {
        if (!newSelected.includes(key)) {
          newSelected.push(key);
        }
      });
      onChaptersChange(newSelected);
    }
  };

  // Handle clear all
  const handleClearAll = () => {
    if (disabled) return;
    onChaptersChange([]);
  };

  // Reset division filter when class or subject changes
  useEffect(() => {
    setSelectedDivision("all");
    setSearchTerm("");
  }, [selectedClass, selectedSubject]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Loading syllabus data...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <p>Error loading syllabus data</p>
            <p className="text-sm mt-2">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!selectedClass || !selectedSubject) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            {placeholder}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (filteredSubjectGroups.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5" />
            Syllabus Chapters
            {isElective && (
              <Badge variant="secondary" className="text-xs">
                <GraduationCap className="h-3 w-3 mr-1" />
                Elective
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No syllabus chapters available</p>
            <p className="text-sm mt-2">
              Please ensure syllabus is configured for{" "}
              <span className="font-medium">Class {selectedClass}</span> -{" "}
              <span className="font-medium">{selectedSubject}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} flex flex-col h-full`}>
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5" />
            Syllabus Chapters
            {isElective && (
              <Badge variant="secondary" className="text-xs">
                <GraduationCap className="h-3 w-3 mr-1" />
                Elective Group
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="text-xs"
            >
              <Filter className="h-3 w-3 mr-1" />
              Filters
            </Button>
          </div>
        </div>
        
        {/* Show elective group info */}
        {isElective && electiveGroupInfo && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <p className="text-blue-800 font-medium">
              {electiveGroupInfo.groupName}
            </p>
            <p className="text-blue-600 text-xs mt-1">
              Includes: {electiveGroupInfo.subjects.join(", ")}
            </p>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden">
        {/* Search and Filters */}
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search chapters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              disabled={disabled}
            />
          </div>
          
          {/* Filters */}
          {showFilters && (
            <div className="bg-gray-50 rounded-lg p-3 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Division Filter */}
                {availableDivisions.length > 1 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Division Filter
                    </label>
                    <Select
                      value={selectedDivision}
                      onValueChange={setSelectedDivision}
                      disabled={disabled}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Divisions</SelectItem>
                        {availableDivisions.map(division => (
                          <SelectItem key={division} value={division}>
                            Division {division}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2 pb-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            disabled={disabled}
            className="text-xs"
          >
            <CheckSquare className="h-3 w-3 mr-1" />
            Select All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            disabled={disabled || selectedChapters.length === 0}
            className="text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear All
          </Button>
          
          {selectedChapters.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {selectedChapters.length} selected
            </Badge>
          )}
        </div>
        
        {/* Chapters List */}
        <ScrollArea className="flex-1 w-full border rounded-lg h-0 min-h-[100px]">
          <div className="p-4 space-y-6">
            {filteredSubjectGroups.map((group, groupIndex) => (
              <div key={group.subject} className="space-y-3">
                {/* Subject Header (only show if multiple subjects) */}
                {filteredSubjectGroups.length > 1 && (
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                      {group.subject}
                      <Badge 
                        variant={group.subjectType === "elective" ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {group.subjectType}
                      </Badge>
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSelectAllForSubject(group.subject)}
                      disabled={disabled}
                      className="text-xs h-6 px-2"
                    >
                      {group.chapters.every(ch => selectedChapters.includes(createChapterKey(group.subject, ch.chapterNo)))
                        ? "Deselect All"
                        : "Select All"
                      }
                    </Button>
                  </div>
                )}
                
                {/* Chapters */}
                <div className="grid gap-2">
                  {group.chapters.map((chapter) => {
                    const chapterKey = createChapterKey(group.subject, chapter.chapterNo);
                    const isSelected = selectedChapters.includes(chapterKey);
                    
                    return (
                      <div
                        key={chapterKey}
                        className={`flex items-start space-x-3 p-3 border rounded-lg transition-all ${
                          isSelected
                            ? "bg-blue-50 border-blue-200"
                            : "bg-white border-gray-200 hover:bg-gray-50"
                        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        onClick={() => handleChapterToggle(group.subject, chapter.chapterNo)}
                      >
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleChapterToggle(group.subject, chapter.chapterNo)}
                          disabled={disabled}
                          className="mt-0.5"
                        />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {chapter.chapterNo}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {chapter.topic}
                          </Badge>
                        </div>
                        {chapter.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {chapter.description}
                          </p>
                        )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {groupIndex < filteredSubjectGroups.length - 1 && (
                  <Separator className="my-4" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
