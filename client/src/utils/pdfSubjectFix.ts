/**
 * Fix for PDF subject generation to properly handle elective groups
 * Based on the actual database structure with group_elective_name column
 */

import { useQuery } from "@tanstack/react-query";

export interface PDFSubjectFix {
  coreSubjects: string[];
  electiveGroups: string[];
  allSubjects: string[];
  issues: string[];
  recommendations: string[];
}

/**
 * Analyzes and fixes the PDF subject generation logic
 */
export const usePDFSubjectFix = (testName: string, year: string, className: string) => {
  const { data: periodicTests = [] } = useQuery<any[]>({
    queryKey: ['/api/periodic-tests'],
  });

  const { data: classMappings = [] } = useQuery<any[]>({
    queryKey: ['/api/class-mappings'],
  });

  const analyzeAndFix = (): PDFSubjectFix => {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Filter tests for the specific test name, year, and class
    const relevantTests = periodicTests.filter(test => 
      test.testName === testName && 
      test.year === year &&
      test.class === className
    );

    console.log('=== PDF Subject Fix Analysis ===');
    console.log('Relevant tests:', relevantTests);

    // Get core subjects
    const coreSubjects = Array.from(new Set(
      relevantTests
        .filter(test => test.subjectType === 'core')
        .map(test => test.subject)
    ));

    // Get elective groups using group_elective_name column
    const electiveGroups = Array.from(new Set(
      relevantTests
        .filter(test => test.subjectType === 'elective' && test.groupElectiveName)
        .map(test => test.groupElectiveName)
    ));

    // Combine all subjects
    const allSubjects = [...coreSubjects, ...electiveGroups];

    console.log('Core subjects:', coreSubjects);
    console.log('Elective groups:', electiveGroups);
    console.log('All subjects:', allSubjects);

    // Analyze issues
    if (electiveGroups.length === 0) {
      issues.push('No elective groups found in periodic tests');
      recommendations.push('Check if group_elective_name column is properly populated in periodic_tests table');
    }

    if (coreSubjects.length === 0) {
      issues.push('No core subjects found in periodic tests');
      recommendations.push('Check if core subjects are properly configured in periodic_tests table');
    }

    // Check if class mapping has elective groups but periodic tests don't
    const classMapping = classMappings.find(mapping => 
      mapping.class === className && 
      mapping.year === year
    );

    if (classMapping && classMapping.electiveGroups) {
      const classElectiveGroups = (classMapping.electiveGroups as any[]).map((g: any) => g.groupName);
      const missingGroups = classElectiveGroups.filter(classGroup => 
        !electiveGroups.includes(classGroup)
      );

      if (missingGroups.length > 0) {
        issues.push(`Elective groups in class mapping but not in periodic tests: ${missingGroups.join(', ')}`);
        recommendations.push('Create periodic test entries for missing elective groups with proper group_elective_name');
      }
    }

    return {
      coreSubjects,
      electiveGroups,
      allSubjects,
      issues,
      recommendations
    };
  };

  return {
    periodicTests,
    classMappings,
    analyzeAndFix
  };
};

/**
 * Fixed version of the PDF subject generation logic
 */
export const generateFixedPDFSubjects = (
  periodicTests: any[],
  testName: string,
  year: string,
  className: string
): string[] => {
  // Filter tests for the specific test name, year, and class
  const relevantTests = periodicTests.filter(test => 
    test.testName === testName && 
    test.year === year &&
    test.class === className
  );

  const subjects: string[] = [];

  // Add core subjects
  const coreSubjects = Array.from(new Set(
    relevantTests
      .filter(test => test.subjectType === 'core')
      .map(test => test.subject)
  ));
  subjects.push(...coreSubjects);

  // Add elective groups using group_elective_name column
  const electiveGroups = Array.from(new Set(
    relevantTests
      .filter(test => test.subjectType === 'elective' && test.groupElectiveName)
      .map(test => test.groupElectiveName)
  ));
  subjects.push(...electiveGroups);

  console.log('Fixed PDF subjects generation:');
  console.log('Core subjects:', coreSubjects);
  console.log('Elective groups:', electiveGroups);
  console.log('Final subjects:', subjects);

  return subjects;
};

/**
 * Sample analysis based on your data
 */
export const analyzeYourData = () => {
  console.log('=== Analysis of Your Data ===');
  
  // Based on your periodic_tests sample data
  const sampleTests = [
    { id: 36, testName: "Final Semester", year: "2025-2026", class: "II", subject: "Mathematics", subjectType: "core", groupElectiveName: null },
    { id: 37, testName: "Final Semester", year: "2025-2026", class: "II", subject: "Science", subjectType: "core", groupElectiveName: null },
    { id: 38, testName: "Final Semester", year: "2025-2026", class: "II", subject: "Hindi", subjectType: "core", groupElectiveName: null },
    { id: 39, testName: "Final Semester", year: "2025-2026", class: "II", subject: "Dance", subjectType: "elective", groupElectiveName: "Elective 2 I" },
    { id: 40, testName: "Final Semester", year: "2025-2026", class: "II", subject: "Music", subjectType: "elective", groupElectiveName: "Elective 2 I" },
    { id: 41, testName: "Final Semester", year: "2025-2026", class: "II", subject: "Sanskrit", subjectType: "elective", groupElectiveName: "Elective 2 II" },
    { id: 42, testName: "Final Semester", year: "2025-2026", class: "II", subject: "French", subjectType: "elective", groupElectiveName: "Elective 2 II" },
    { id: 43, testName: "Final Semester", year: "2025-2026", class: "II", subject: "German", subjectType: "elective", groupElectiveName: "Elective 2 II" }
  ];

  const fixedSubjects = generateFixedPDFSubjects(sampleTests, "Final Semester", "2025-2026", "II");
  
  console.log('Expected PDF subjects for your data:', fixedSubjects);
  console.log('Should show 5 columns: Roll No, Student Name, Division, Mathematics, Science, Hindi, Elective 2 I, Elective 2 II');
  
  console.log('\nThe issue is in the current PDF generation logic:');
  console.log('1. It tries to match individual subjects (Dance, Music) with group names (Elective 2 I)');
  console.log('2. It should use the group_elective_name column instead');
  console.log('3. The group_elective_name column contains the actual group names that should appear in PDF');
  
  console.log('\nFix needed:');
  console.log('- Change the logic to use test.groupElectiveName instead of trying to match test.subject with group.groupName');
  console.log('- For elective subjects, use the group_elective_name as the column header');
  console.log('- For core subjects, use the subject name as the column header');
  
  console.log('===============================');
};

/**
 * Debug function to show the difference between current and fixed logic
 */
export const debugCurrentVsFixed = () => {
  console.log('=== Current vs Fixed Logic Comparison ===');
  
  console.log('\nCURRENT LOGIC (BROKEN):');
  console.log('1. Gets raw subjects: ["Mathematics", "Science", "Hindi", "Dance", "Music", "Sanskrit", "French", "German"]');
  console.log('2. Tries to match "Dance" with "Elective 2 I" - FAILS');
  console.log('3. Tries to match "Music" with "Elective 2 I" - FAILS');
  console.log('4. Result: Only core subjects appear in PDF');
  
  console.log('\nFIXED LOGIC:');
  console.log('1. Gets core subjects: ["Mathematics", "Science", "Hindi"]');
  console.log('2. Gets elective groups from group_elective_name: ["Elective 2 I", "Elective 2 II"]');
  console.log('3. Combines: ["Mathematics", "Science", "Hindi", "Elective 2 I", "Elective 2 II"]');
  console.log('4. Result: All subjects appear in PDF');
  
  console.log('\nThe key difference:');
  console.log('- Current: Uses test.subject (individual subject names)');
  console.log('- Fixed: Uses test.groupElectiveName (group names) for elective subjects');
  
  console.log('==========================================');
};
