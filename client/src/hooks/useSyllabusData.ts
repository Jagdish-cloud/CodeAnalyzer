import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { SyllabusMaster, ClassMapping } from "@shared/schema";

interface SyllabusHookResult {
  syllabusMasters: SyllabusMaster[];
  classMappings: ClassMapping[];
  isLoading: boolean;
  error: Error | null;
  getSubjectsForClass: (className: string) => {
    coreSubjects: string[];
    electiveGroups: Array<{
      groupName: string;
      subjects: string[];
    }>;
    allSubjects: string[];
  };
  getChaptersForSubject: (className: string, subject: string, division?: string) => Array<{
    chapterNo: string;
    topic: string;
    description?: string;
    fullText: string;
  }>;
  isElectiveSubject: (className: string, subject: string) => boolean;
  getElectiveGroupInfo: (className: string, subject: string) => {
    groupName: string;
    subjects: string[];
  } | null;
  getSubjectsToQuery: (className: string, subjectOrGroupName: string) => string[];
}

export function useSyllabusData(): SyllabusHookResult {
  const { 
    data: syllabusMasters = [], 
    isLoading: isSyllabusLoading, 
    error: syllabusError 
  } = useQuery<SyllabusMaster[]>({
    queryKey: ["/api/syllabus-masters"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { 
    data: classMappings = [], 
    isLoading: isClassMappingsLoading, 
    error: classMappingsError 
  } = useQuery<ClassMapping[]>({
    queryKey: ["/api/class-mappings"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const isLoading = isSyllabusLoading || isClassMappingsLoading;
  const error = syllabusError || classMappingsError;

  const getSubjectsForClass = useMemo(() => {
    return (className: string) => {
      if (!className) return { coreSubjects: [], electiveGroups: [], allSubjects: [] };
      
      const mappingsForClass = classMappings.filter(mapping => mapping.class === className);
      
      // Get core subjects (union from all divisions)
      const coreSubjects = Array.from(new Set(
        mappingsForClass.flatMap(mapping => mapping.subjects || [])
      ));
      
      // Get elective groups (union from all divisions)
      const electiveGroupsMap = new Map();
      mappingsForClass.forEach(mapping => {
        ((mapping.electiveGroups as any[]) || []).forEach((group: any) => {
          if (group.groupName && group.subjects) {
            if (!electiveGroupsMap.has(group.groupName)) {
              electiveGroupsMap.set(group.groupName, new Set());
            }
            group.subjects.forEach((subject: string) => {
              electiveGroupsMap.get(group.groupName).add(subject);
            });
          }
        });
      });
      
      const electiveGroups = Array.from(electiveGroupsMap.entries()).map(([groupName, subjects]) => ({
        groupName: groupName.trim(),
        subjects: Array.from(subjects) as string[]
      }));

      const allSubjects = [...coreSubjects];
      electiveGroups.forEach(group => {
        allSubjects.push(...group.subjects);
      });
      
      return { 
        coreSubjects, 
        electiveGroups, 
        allSubjects: Array.from(new Set(allSubjects))
      };
    };
  }, [classMappings]);

  const getChaptersForSubject = useMemo(() => {
    return (className: string, subject: string, division?: string) => {
      if (!className || !subject) return [];

      let filteredSyllabus = syllabusMasters.filter(syllabus => 
        syllabus.class === className && 
        syllabus.subject === subject &&
        syllabus.status === "active"
      );

      // If a specific division is provided, filter by division
      if (division && division !== "all") {
        filteredSyllabus = filteredSyllabus.filter(syllabus =>
          syllabus.divisions.includes(division)
        );
      }

      const chapters = filteredSyllabus.map(syllabus => ({
        chapterNo: syllabus.chapterLessonNo,
        topic: syllabus.topic,
        description: syllabus.description || undefined,
        fullText: `${syllabus.chapterLessonNo} - ${syllabus.topic}${syllabus.description ? ` (${syllabus.description})` : ''}`,
      }))
      // Remove duplicates based on chapter number
      .filter((chapter, index, self) => 
        index === self.findIndex(c => c.chapterNo === chapter.chapterNo)
      )
      // Sort by chapter number
      .sort((a, b) => {
        // Try to parse as numbers first
        const aNum = parseFloat(a.chapterNo.replace(/[^\d.]/g, ''));
        const bNum = parseFloat(b.chapterNo.replace(/[^\d.]/g, ''));
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum;
        }
        
        // Fallback to string comparison
        return a.chapterNo.localeCompare(b.chapterNo);
      });

      return chapters;
    };
  }, [syllabusMasters]);

  const isElectiveSubject = useMemo(() => {
    return (className: string, subject: string) => {
      if (!className || !subject) return false;
      
      const { electiveGroups } = getSubjectsForClass(className);
      // Check if it's an individual elective subject
      const isIndividualElective = electiveGroups.some(group => group.subjects.includes(subject));
      // Check if it's an elective group name
      const isElectiveGroup = electiveGroups.some(group => group.groupName === subject);
      
      return isIndividualElective || isElectiveGroup;
    };
  }, [getSubjectsForClass]);

  const getElectiveGroupInfo = useMemo(() => {
    return (className: string, subject: string) => {
      if (!className || !subject) return null;
      
      const { electiveGroups } = getSubjectsForClass(className);
      
      // First check if subject is an elective group name
      let group = electiveGroups.find(group => group.groupName === subject);
      
      // If not found, check if it's an individual subject within a group
      if (!group) {
        group = electiveGroups.find(group => group.subjects.includes(subject));
      }
      
      return group || null;
    };
  }, [getSubjectsForClass]);

  const getSubjectsToQuery = useMemo(() => {
    return (className: string, subjectOrGroupName: string) => {
      if (!className || !subjectOrGroupName) return [];
      
      const electiveGroupInfo = getElectiveGroupInfo(className, subjectOrGroupName);
      
      if (electiveGroupInfo) {
        // If it's an elective group (either group name or individual subject), return all subjects in the group
        return electiveGroupInfo.subjects;
      } else {
        // If it's a core subject, return just that subject
        return [subjectOrGroupName];
      }
    };
  }, [getElectiveGroupInfo]);

  return {
    syllabusMasters,
    classMappings,
    isLoading,
    error,
    getSubjectsForClass,
    getChaptersForSubject,
    isElectiveSubject,
    getElectiveGroupInfo,
    getSubjectsToQuery,
  };
}
