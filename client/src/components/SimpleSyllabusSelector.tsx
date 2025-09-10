import React, { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown, X, BookOpen } from "lucide-react";
import { useSyllabusData } from "@/hooks/useSyllabusData";

interface SimpleSyllabusSelectorProps {
  selectedClass: string;
  selectedSubject: string;
  selectedChapters: string[];
  onChaptersChange: (chapters: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
  maxDisplayChapters?: number;
  division?: string;
}

export default function SimpleSyllabusSelector({
  selectedClass,
  selectedSubject,
  selectedChapters,
  onChaptersChange,
  disabled = false,
  placeholder = "Select chapters",
  maxDisplayChapters = 3,
  division = "all",
}: SimpleSyllabusSelectorProps) {
  const [open, setOpen] = useState(false);
  const { getChaptersForSubject, getSubjectsToQuery, isLoading, error } = useSyllabusData();

  // Get all subjects to query (handles both individual subjects and elective groups)
  const subjectsToQuery = getSubjectsToQuery(selectedClass, selectedSubject);
  
  // Get chapters from all relevant subjects
  const availableChapters = useMemo(() => {
    if (subjectsToQuery.length === 0) return [];
    
    // Collect chapters from all subjects
    const allChapters = subjectsToQuery.flatMap(subject => 
      getChaptersForSubject(selectedClass, subject, division)
    );
    
    // Remove duplicates based on chapter number
    const uniqueChapters = allChapters.filter((chapter, index, self) => 
      index === self.findIndex(c => c.chapterNo === chapter.chapterNo)
    );
    
    return uniqueChapters;
  }, [subjectsToQuery, selectedClass, division, getChaptersForSubject]);

  const handleChapterToggle = (chapterNo: string) => {
    if (disabled) return;
    
    const isSelected = selectedChapters.includes(chapterNo);
    if (isSelected) {
      onChaptersChange(selectedChapters.filter(ch => ch !== chapterNo));
    } else {
      onChaptersChange([...selectedChapters, chapterNo]);
    }
  };

  const handleSelectAll = () => {
    if (disabled) return;
    
    const allChapterNos = availableChapters.map(ch => ch.chapterNo);
    const allSelected = allChapterNos.every(ch => selectedChapters.includes(ch));
    
    if (allSelected) {
      onChaptersChange(selectedChapters.filter(ch => !allChapterNos.includes(ch)));
    } else {
      const newSelected = [...selectedChapters];
      allChapterNos.forEach(ch => {
        if (!newSelected.includes(ch)) {
          newSelected.push(ch);
        }
      });
      onChaptersChange(newSelected);
    }
  };

  const handleClearAll = () => {
    if (disabled) return;
    onChaptersChange([]);
  };

  if (isLoading) {
    return (
      <div className="text-sm text-gray-500 p-2">
        Loading syllabus...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-500 p-2">
        Error loading syllabus data
      </div>
    );
  }

  if (!selectedClass || !selectedSubject) {
    return (
      <div className="text-sm text-gray-500 p-2">
        {placeholder}
      </div>
    );
  }

  if (availableChapters.length === 0) {
    return (
      <div className="text-sm text-gray-500 p-2 flex items-center gap-2">
        <BookOpen className="h-4 w-4" />
        No syllabus chapters available
      </div>
    );
  }

  const selectedChapterObjects = availableChapters.filter(ch => 
    selectedChapters.includes(ch.chapterNo)
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-full justify-between ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={disabled}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <BookOpen className="h-4 w-4 flex-shrink-0" />
            {selectedChapters.length === 0 ? (
              <span className="text-gray-500">{placeholder}</span>
            ) : (
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-sm font-medium">
                  {selectedChapters.length} chapter{selectedChapters.length > 1 ? 's' : ''}
                </span>
                {selectedChapterObjects.slice(0, maxDisplayChapters).map((chapter, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {chapter.chapterNo}
                  </Badge>
                ))}
                {selectedChapters.length > maxDisplayChapters && (
                  <Badge variant="outline" className="text-xs">
                    +{selectedChapters.length - maxDisplayChapters} more
                  </Badge>
                )}
              </div>
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
          {/* Action buttons */}
          <div className="flex items-center justify-between border-b pb-2">
            <div className="text-sm font-medium text-gray-700">
              Select Chapters ({availableChapters.length} available)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="text-xs h-6 px-2"
                disabled={disabled}
              >
                {availableChapters.every(ch => selectedChapters.includes(ch.chapterNo))
                  ? "Deselect All"
                  : "Select All"
                }
              </Button>
              {selectedChapters.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-xs h-6 px-2"
                  disabled={disabled}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Chapters list */}
          <div className="space-y-2">
            {availableChapters.map((chapter) => (
              <div
                key={chapter.chapterNo}
                className={`flex items-start space-x-3 p-2 rounded border transition-colors ${
                  selectedChapters.includes(chapter.chapterNo)
                    ? "bg-blue-50 border-blue-200"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                onClick={() => handleChapterToggle(chapter.chapterNo)}
              >
                <Checkbox
                  checked={selectedChapters.includes(chapter.chapterNo)}
                  onChange={() => handleChapterToggle(chapter.chapterNo)}
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
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {chapter.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
