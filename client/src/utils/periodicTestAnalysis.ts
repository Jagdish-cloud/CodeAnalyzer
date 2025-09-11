/**
 * Analysis utility for periodic tests and elective group structure
 * Based on the actual database structure provided
 */

import { useQuery } from "@tanstack/react-query";

export interface PeriodicTestAnalysis {
  testName: string;
  year: string;
  class: string;
  coreSubjects: string[];
  electiveGroups: Array<{
    groupName: string;
    subjects: string[];
    testIds: number[];
  }>;
  allSubjects: string[];
  missingElectiveGroups: string[];
}

/**
 * Analyzes periodic tests to identify core and elective subjects
 */
export const usePeriodicTestAnalysis = (testName: string, year: string, className: string) => {
  const { data: periodicTests = [] } = useQuery<any[]>({
    queryKey: ['/api/periodic-tests'],
  });

  const { data: classMappings = [] } = useQuery<any[]>({
    queryKey: ['/api/class-mappings'],
  });

  const analyzePeriodicTests = (): PeriodicTestAnalysis => {
    // Filter tests for the specific test name, year, and class
    const relevantTests = periodicTests.filter(test => 
      test.testName === testName && 
      test.year === year &&
      test.class === className
    );

    // Get core subjects
    const coreSubjects = Array.from(new Set(
      relevantTests
        .filter(test => test.subjectType === 'core')
        .map(test => test.subject)
    ));

    // Group elective subjects by group_elective_name
    const electiveGroupsMap = new Map<string, { subjects: string[]; testIds: number[] }>();
    
    relevantTests
      .filter(test => test.subjectType === 'elective' && test.groupElectiveName)
      .forEach(test => {
        const groupName = test.groupElectiveName;
        if (!electiveGroupsMap.has(groupName)) {
          electiveGroupsMap.set(groupName, { subjects: [], testIds: [] });
        }
        const group = electiveGroupsMap.get(groupName)!;
        group.subjects.push(test.subject);
        group.testIds.push(test.id);
      });

    // Convert map to array
    const electiveGroups = Array.from(electiveGroupsMap.entries()).map(([groupName, data]) => ({
      groupName,
      subjects: Array.from(new Set(data.subjects)),
      testIds: data.testIds
    }));

    // Get all subjects (core + elective group names)
    const allSubjects = [...coreSubjects, ...electiveGroups.map(g => g.groupName)];

    // Find class mapping for this class
    const classMapping = classMappings.find(mapping => 
      mapping.class === className && 
      mapping.year === year
    );

    // Find missing elective groups (groups in class mapping but not in periodic tests)
    const missingElectiveGroups: string[] = [];
    if (classMapping && classMapping.electiveGroups) {
      const classElectiveGroups = (classMapping.electiveGroups as any[]).map((g: any) => g.groupName);
      const periodicElectiveGroups = electiveGroups.map(g => g.groupName);
      
      classElectiveGroups.forEach(classGroup => {
        if (!periodicElectiveGroups.includes(classGroup)) {
          missingElectiveGroups.push(classGroup);
        }
      });
    }

    return {
      testName,
      year,
      class: className,
      coreSubjects,
      electiveGroups,
      allSubjects,
      missingElectiveGroups
    };
  };

  return {
    periodicTests,
    classMappings,
    analyzePeriodicTests
  };
};

/**
 * Generates the expected PDF subjects based on periodic tests
 */
export const generateExpectedPDFSubjects = (analysis: PeriodicTestAnalysis): string[] => {
  const subjects: string[] = [];
  
  // Add core subjects
  subjects.push(...analysis.coreSubjects);
  
  // Add elective groups (just the group names, not individual subjects)
  subjects.push(...analysis.electiveGroups.map(g => g.groupName));
  
  return subjects;
};

/**
 * Analyzes the discrepancy between class mappings and periodic tests
 */
export const analyzeDiscrepancy = (analysis: PeriodicTestAnalysis) => {
  const issues: string[] = [];
  
  if (analysis.missingElectiveGroups.length > 0) {
    issues.push(`Missing elective groups in periodic tests: ${analysis.missingElectiveGroups.join(', ')}`);
  }
  
  if (analysis.electiveGroups.length === 0) {
    issues.push('No elective groups found in periodic tests');
  }
  
  if (analysis.coreSubjects.length === 0) {
    issues.push('No core subjects found in periodic tests');
  }
  
  return {
    hasIssues: issues.length > 0,
    issues
  };
};

/**
 * Debug function to log detailed analysis
 */
export const logPeriodicTestAnalysis = (analysis: PeriodicTestAnalysis) => {
  console.log('=== Periodic Test Analysis ===');
  console.log(`Test: ${analysis.testName} (${analysis.year}) - Class ${analysis.class}`);
  console.log(`Core Subjects (${analysis.coreSubjects.length}):`, analysis.coreSubjects);
  console.log(`Elective Groups (${analysis.electiveGroups.length}):`);
  analysis.electiveGroups.forEach(group => {
    console.log(`  - ${group.groupName}: ${group.subjects.join(', ')} (Test IDs: ${group.testIds.join(', ')})`);
  });
  console.log(`All Subjects:`, analysis.allSubjects);
  
  if (analysis.missingElectiveGroups.length > 0) {
    console.log(`Missing Elective Groups:`, analysis.missingElectiveGroups);
  }
  
  const discrepancy = analyzeDiscrepancy(analysis);
  if (discrepancy.hasIssues) {
    console.log('Issues Found:');
    discrepancy.issues.forEach(issue => console.log(`  - ${issue}`));
  }
  
  console.log('===============================');
};

/**
 * Based on your sample data, this is what should be generated for Class II, Final Semester test:
 */
export const getExpectedSubjectsForClassII = (): string[] => {
  return [
    'Mathematics',    // Core subject
    'Science',        // Core subject  
    'Hindi',          // Core subject
    'Elective 2 I',   // Elective group (Dance, Music)
    'Elective 2 II'   // Elective group (Sanskrit, French, German)
  ];
};

/**
 * Sample analysis based on your data
 */
export const sampleAnalysis = () => {
  console.log('=== Sample Analysis for Class II, Final Semester ===');
  
  const expectedSubjects = getExpectedSubjectsForClassII();
  console.log('Expected PDF Subjects:', expectedSubjects);
  
  console.log('\nBased on your periodic_tests data:');
  console.log('Core Subjects: Mathematics, Science, Hindi');
  console.log('Elective Groups:');
  console.log('  - Elective 2 I: Dance, Music');
  console.log('  - Elective 2 II: Sanskrit, French, German');
  
  console.log('\nThe PDF should show 5 columns:');
  console.log('1. Roll No');
  console.log('2. Student Name'); 
  console.log('3. Division');
  console.log('4. Mathematics');
  console.log('5. Science');
  console.log('6. Hindi');
  console.log('7. Elective 2 I');
  console.log('8. Elective 2 II');
  
  console.log('\nIf only 3 subject columns are showing, the issue is in the PDF generation logic.');
  console.log('====================================================');
};
