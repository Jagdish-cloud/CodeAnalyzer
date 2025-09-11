import { useQuery } from "@tanstack/react-query";

// Types for subject verification
export interface ClassSubjectInfo {
  coreSubjects: string[];
  electiveGroups: Array<{
    groupName: string;
    subjects: string[];
  }>;
  allSubjects: string[]; // Combined list of all subjects
  subjectAvailability: { [subject: string]: string[] }; // Which divisions have which subjects
}

export interface SubjectVerificationResult {
  isMatch: boolean;
  missingInPDF: string[];
  extraInPDF: string[];
  coreSubjectsMatch: boolean;
  electiveGroupsMatch: boolean;
  details: {
    classMappingSubjects: ClassSubjectInfo;
    pdfSubjects: string[];
    periodicTestSubjects: string[];
  };
}

/**
 * Fetches all subjects (core + elective) for a specific class and division
 */
export const useClassSubjects = (className: string, division?: string) => {
  const { data: classMappings = [] } = useQuery<any[]>({
    queryKey: ['/api/class-mappings'],
  });

  const { data: subjects = [] } = useQuery<any[]>({
    queryKey: ['/api/subjects'],
  });

  const getClassSubjects = (targetClass: string, targetDivision?: string): ClassSubjectInfo => {
    // Find class mappings for the target class
    const relevantMappings = classMappings.filter(mapping => 
      mapping.class === targetClass && 
      (!targetDivision || mapping.division === targetDivision)
    );

    if (relevantMappings.length === 0) {
      return {
        coreSubjects: [],
        electiveGroups: [],
        allSubjects: [],
        subjectAvailability: {}
      };
    }

    // Extract core subjects
    const coreSubjects = Array.from(
      new Set(relevantMappings.flatMap(mapping => mapping.subjects || []))
    );

    // Extract elective groups
    const electiveGroups = Array.from(
      new Set(
        relevantMappings.flatMap(mapping => 
          (mapping.electiveGroups as any[] || []).map((group: any) => ({
            groupName: group.groupName,
            subjects: group.subjects || []
          }))
        )
      )
    );

    // Get all individual subjects from elective groups
    const electiveSubjects = Array.from(
      new Set(
        electiveGroups.flatMap(group => group.subjects)
      )
    );

    // Combine all subjects
    const allSubjects = [...coreSubjects, ...electiveSubjects];

    // Create subject availability map
    const subjectAvailability: { [subject: string]: string[] } = {};
    
    // Add core subjects availability
    coreSubjects.forEach(subject => {
      const divisionsWithSubject = classMappings
        .filter(mapping => 
          mapping.class === targetClass &&
          mapping.subjects && 
          mapping.subjects.includes(subject)
        )
        .map(mapping => mapping.division);
      subjectAvailability[subject] = Array.from(new Set(divisionsWithSubject));
    });

    // Add elective groups availability
    electiveGroups.forEach(group => {
      const groupDisplay = `${group.groupName}: ${group.subjects.join(', ')}`;
      const divisionsWithGroup = classMappings
        .filter(mapping => 
          mapping.class === targetClass &&
          mapping.electiveGroups &&
          mapping.electiveGroups.some((eg: any) => eg.groupName === group.groupName)
        )
        .map(mapping => mapping.division);
      subjectAvailability[groupDisplay] = Array.from(new Set(divisionsWithGroup));
    });

    return {
      coreSubjects,
      electiveGroups,
      allSubjects,
      subjectAvailability
    };
  };

  return {
    classMappings,
    subjects,
    getClassSubjects
  };
};

/**
 * Fetches subjects from periodic tests for a specific test
 */
export const usePeriodicTestSubjects = (periodicTestId: string, year: string) => {
  const { data: periodicTests = [] } = useQuery<any[]>({
    queryKey: ['/api/periodic-tests'],
  });

  const getPeriodicTestSubjects = (testName: string, targetYear: string, className?: string): {
    coreSubjects: string[];
    electiveGroups: string[];
    allSubjects: string[];
  } => {
    const testsForName = periodicTests.filter(test => 
      test.testName === testName && 
      test.year === targetYear &&
      (!className || test.class === className)
    );
    
    // Separate core and elective subjects
    const coreSubjects = Array.from(new Set(
      testsForName
        .filter(test => test.subjectType === 'core')
        .map(test => test.subject)
    ));
    
    const electiveGroups = Array.from(new Set(
      testsForName
        .filter(test => test.subjectType === 'elective' && test.groupElectiveName)
        .map(test => test.groupElectiveName)
    ));
    
    const allSubjects = [...coreSubjects, ...electiveGroups];
    
    return {
      coreSubjects,
      electiveGroups,
      allSubjects
    };
  };

  return {
    periodicTests,
    getPeriodicTestSubjects
  };
};

/**
 * Cross-verifies PDF subjects with actual class subjects
 */
export const verifyPDFSubjects = (
  pdfSubjects: string[],
  classSubjectInfo: ClassSubjectInfo,
  periodicTestSubjects: { coreSubjects: string[]; electiveGroups: string[]; allSubjects: string[] }
): SubjectVerificationResult => {
  // Parse PDF subjects to separate core and elective groups
  const pdfCoreSubjects: string[] = [];
  const pdfElectiveGroups: string[] = [];
  
  pdfSubjects.forEach(subject => {
    if (subject.includes(': ')) {
      // This is an elective group format: "Elective Group Name: Subject1, Subject2"
      pdfElectiveGroups.push(subject);
    } else {
      // This is a core subject
      pdfCoreSubjects.push(subject);
    }
  });

  // Check core subjects match (compare with periodic test core subjects)
  const coreSubjectsMatch = pdfCoreSubjects.every(subject => 
    periodicTestSubjects.coreSubjects.includes(subject)
  ) && periodicTestSubjects.coreSubjects.every(subject => 
    pdfCoreSubjects.includes(subject)
  );

  // Check elective groups match (compare with periodic test elective groups)
  const electiveGroupsMatch = pdfElectiveGroups.every(pdfGroup => {
    const [groupName] = pdfGroup.split(': ');
    return periodicTestSubjects.electiveGroups.includes(groupName);
  });

  // Find missing subjects in PDF
  const missingInPDF: string[] = [];
  
  // Check missing core subjects
  periodicTestSubjects.coreSubjects.forEach(subject => {
    if (!pdfCoreSubjects.includes(subject)) {
      missingInPDF.push(subject);
    }
  });

  // Check missing elective groups
  periodicTestSubjects.electiveGroups.forEach(groupName => {
    const groupDisplay = `${groupName}: [Elective Subjects]`;
    const hasMatchingGroup = pdfElectiveGroups.some(pdfGroup => {
      const [pdfGroupName] = pdfGroup.split(': ');
      return pdfGroupName === groupName;
    });
    if (!hasMatchingGroup) {
      missingInPDF.push(groupDisplay);
    }
  });

  // Find extra subjects in PDF
  const extraInPDF: string[] = [];
  
  // Check extra core subjects
  pdfCoreSubjects.forEach(subject => {
    if (!periodicTestSubjects.coreSubjects.includes(subject)) {
      extraInPDF.push(subject);
    }
  });

  // Check extra elective groups
  pdfElectiveGroups.forEach(pdfGroup => {
    const [groupName] = pdfGroup.split(': ');
    const hasMatchingGroup = periodicTestSubjects.electiveGroups.includes(groupName);
    if (!hasMatchingGroup) {
      extraInPDF.push(pdfGroup);
    }
  });

  // Overall match
  const isMatch = coreSubjectsMatch && electiveGroupsMatch && missingInPDF.length === 0 && extraInPDF.length === 0;

  return {
    isMatch,
    missingInPDF,
    extraInPDF,
    coreSubjectsMatch,
    electiveGroupsMatch,
    details: {
      classMappingSubjects: classSubjectInfo,
      pdfSubjects,
      periodicTestSubjects: periodicTestSubjects.allSubjects
    }
  };
};

/**
 * Main hook for subject verification
 */
export const useSubjectVerification = (
  className: string,
  division: string,
  testName: string,
  year: string
) => {
  const { getClassSubjects } = useClassSubjects(className, division);
  const { getPeriodicTestSubjects } = usePeriodicTestSubjects(testName, year);

  const verifySubjects = (pdfSubjects: string[]): SubjectVerificationResult => {
    const classSubjectInfo = getClassSubjects(className, division);
    const periodicTestSubjects = getPeriodicTestSubjects(testName, year, className);
    
    return verifyPDFSubjects(pdfSubjects, classSubjectInfo, periodicTestSubjects);
  };

  return {
    getClassSubjects: () => getClassSubjects(className, division),
    getPeriodicTestSubjects: () => getPeriodicTestSubjects(testName, year, className),
    verifySubjects
  };
};

/**
 * Utility function to format subjects for display
 */
export const formatSubjectsForDisplay = (subjectInfo: ClassSubjectInfo): string => {
  const parts: string[] = [];
  
  if (subjectInfo.coreSubjects.length > 0) {
    parts.push(`Core: ${subjectInfo.coreSubjects.join(', ')}`);
  }
  
  if (subjectInfo.electiveGroups.length > 0) {
    const electiveDisplay = subjectInfo.electiveGroups.map(group => 
      `${group.groupName} (${group.subjects.join(', ')})`
    ).join('; ');
    parts.push(`Elective: ${electiveDisplay}`);
  }
  
  return parts.join(' | ');
};

/**
 * Debug function to log subject verification details
 */
export const logSubjectVerification = (result: SubjectVerificationResult) => {
  console.log('=== Subject Verification Results ===');
  console.log('Overall Match:', result.isMatch);
  console.log('Core Subjects Match:', result.coreSubjectsMatch);
  console.log('Elective Groups Match:', result.electiveGroupsMatch);
  
  if (result.missingInPDF.length > 0) {
    console.log('Missing in PDF:', result.missingInPDF);
  }
  
  if (result.extraInPDF.length > 0) {
    console.log('Extra in PDF:', result.extraInPDF);
  }
  
  console.log('Class Mapping Subjects:', result.details.classMappingSubjects);
  console.log('PDF Subjects:', result.details.pdfSubjects);
  console.log('Periodic Test Subjects:', result.details.periodicTestSubjects);
  console.log('=====================================');
};
