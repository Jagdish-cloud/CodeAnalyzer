/**
 * Demo script to test subject verification functionality
 * This demonstrates how to fetch all subjects and cross-verify with PDF subjects
 */

import { 
  useClassSubjects, 
  usePeriodicTestSubjects, 
  verifyPDFSubjects,
  formatSubjectsForDisplay,
  logSubjectVerification,
  type ClassSubjectInfo,
  type SubjectVerificationResult 
} from './subjectVerification';

/**
 * Demo function to test subject verification
 */
export const runSubjectVerificationDemo = () => {
  console.log('=== Subject Verification Demo ===');
  
  // Mock data for demonstration
  const mockClassMappings = [
    {
      id: 1,
      class: "12",
      division: "A",
      year: "2024",
      subjects: ["Mathematics", "Physics", "Chemistry", "English", "Computer Science"],
      electiveGroups: [
        {
          groupName: "Elective I",
          subjects: ["Biology", "Economics", "History"]
        },
        {
          groupName: "Elective II",
          subjects: ["French", "German", "Spanish"]
        }
      ]
    },
    {
      id: 2,
      class: "12",
      division: "B",
      year: "2024",
      subjects: ["Mathematics", "Physics", "Chemistry", "English", "Computer Science"],
      electiveGroups: [
        {
          groupName: "Elective I",
          subjects: ["Biology", "Economics", "History"]
        },
        {
          groupName: "Elective II",
          subjects: ["French", "German", "Spanish"]
        }
      ]
    }
  ];

  const mockPeriodicTests = [
    {
      id: 1,
      testName: "Unit Test 1",
      year: "2024",
      class: "12",
      subject: "Mathematics",
      divisions: ["A", "B"]
    },
    {
      id: 2,
      testName: "Unit Test 1",
      year: "2024",
      class: "12",
      subject: "Physics",
      divisions: ["A", "B"]
    },
    {
      id: 3,
      testName: "Unit Test 1",
      year: "2024",
      class: "12",
      subject: "Elective I",
      divisions: ["A", "B"]
    }
  ];

  // Test 1: Fetch all subjects for Class 12, Division A
  console.log('\n--- Test 1: Fetch Class Subjects ---');
  const classSubjectInfo = getClassSubjectsFromMock(mockClassMappings, "12", "A");
  console.log('Class Subject Info:', classSubjectInfo);
  console.log('Formatted Display:', formatSubjectsForDisplay(classSubjectInfo));

  // Test 2: Fetch periodic test subjects
  console.log('\n--- Test 2: Fetch Periodic Test Subjects ---');
  const periodicTestSubjects = getPeriodicTestSubjectsFromMock(mockPeriodicTests, "Unit Test 1", "2024", "12");
  console.log('Periodic Test Subjects:', periodicTestSubjects);

  // Test 3: Perfect match verification
  console.log('\n--- Test 3: Perfect Match Verification ---');
  const perfectPDFSubjects = [
    "Mathematics",
    "Physics", 
    "Chemistry",
    "English",
    "Computer Science",
    "Elective I: Biology, Economics, History",
    "Elective II: French, German, Spanish"
  ];
  
  const perfectResult = verifyPDFSubjects(perfectPDFSubjects, classSubjectInfo, periodicTestSubjects);
  logSubjectVerification(perfectResult);

  // Test 4: Missing subjects verification
  console.log('\n--- Test 4: Missing Subjects Verification ---');
  const missingPDFSubjects = [
    "Mathematics",
    "Physics",
    "Elective I: Biology, Economics, History"
    // Missing: Chemistry, English, Computer Science, Elective II
  ];
  
  const missingResult = verifyPDFSubjects(missingPDFSubjects, classSubjectInfo, periodicTestSubjects);
  logSubjectVerification(missingResult);

  // Test 5: Extra subjects verification
  console.log('\n--- Test 5: Extra Subjects Verification ---');
  const extraPDFSubjects = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "English",
    "Computer Science",
    "Elective I: Biology, Economics, History",
    "Elective II: French, German, Spanish",
    "Extra Subject 1",
    "Extra Elective: Subject A, Subject B"
  ];
  
  const extraResult = verifyPDFSubjects(extraPDFSubjects, classSubjectInfo, periodicTestSubjects);
  logSubjectVerification(extraResult);

  // Test 6: Mixed issues verification
  console.log('\n--- Test 6: Mixed Issues Verification ---');
  const mixedPDFSubjects = [
    "Mathematics",
    "Physics",
    "Extra Subject",
    "Elective I: Biology, Economics, History"
    // Missing: Chemistry, English, Computer Science, Elective II
    // Extra: Extra Subject
  ];
  
  const mixedResult = verifyPDFSubjects(mixedPDFSubjects, classSubjectInfo, periodicTestSubjects);
  logSubjectVerification(mixedResult);

  console.log('\n=== Demo Complete ===');
};

/**
 * Mock function to get class subjects (simulates the hook)
 */
const getClassSubjectsFromMock = (classMappings: any[], targetClass: string, targetDivision?: string): ClassSubjectInfo => {
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

/**
 * Mock function to get periodic test subjects (simulates the hook)
 */
const getPeriodicTestSubjectsFromMock = (periodicTests: any[], testName: string, targetYear: string, className?: string): string[] => {
  const testsForName = periodicTests.filter(test => 
    test.testName === testName && 
    test.year === targetYear &&
    (!className || test.class === className)
  );
  
  return Array.from(new Set(testsForName.map(test => test.subject)));
};

/**
 * Function to test with real data from the application
 */
export const testWithRealData = async () => {
  console.log('=== Testing with Real Application Data ===');
  
  try {
    // This would be called from within a React component with actual hooks
    console.log('To test with real data, use the SubjectVerificationTest component or the test-result-verification page');
    console.log('These components will fetch real data from the API and perform verification');
  } catch (error) {
    console.error('Error testing with real data:', error);
  }
};

/**
 * Utility function to compare two subject lists
 */
export const compareSubjectLists = (list1: string[], list2: string[]): {
  onlyInList1: string[];
  onlyInList2: string[];
  common: string[];
} => {
  const set1 = new Set(list1);
  const set2 = new Set(list2);
  
  return {
    onlyInList1: list1.filter(item => !set2.has(item)),
    onlyInList2: list2.filter(item => !set1.has(item)),
    common: list1.filter(item => set2.has(item))
  };
};

/**
 * Function to generate a detailed report of subject verification
 */
export const generateVerificationReport = (result: SubjectVerificationResult): string => {
  let report = '=== Subject Verification Report ===\n\n';
  
  report += `Overall Status: ${result.isMatch ? 'PASS' : 'FAIL'}\n`;
  report += `Core Subjects Match: ${result.coreSubjectsMatch ? 'PASS' : 'FAIL'}\n`;
  report += `Elective Groups Match: ${result.electiveGroupsMatch ? 'PASS' : 'FAIL'}\n\n`;
  
  if (result.missingInPDF.length > 0) {
    report += `Missing in PDF (${result.missingInPDF.length}):\n`;
    result.missingInPDF.forEach(subject => {
      report += `  - ${subject}\n`;
    });
    report += '\n';
  }
  
  if (result.extraInPDF.length > 0) {
    report += `Extra in PDF (${result.extraInPDF.length}):\n`;
    result.extraInPDF.forEach(subject => {
      report += `  - ${subject}\n`;
    });
    report += '\n';
  }
  
  report += `Class Mapping Subjects:\n`;
  report += `  Core: ${result.details.classMappingSubjects.coreSubjects.join(', ')}\n`;
  report += `  Elective Groups: ${result.details.classMappingSubjects.electiveGroups.length}\n`;
  report += `  Total Subjects: ${result.details.classMappingSubjects.allSubjects.length}\n\n`;
  
  report += `PDF Subjects (${result.details.pdfSubjects.length}):\n`;
  result.details.pdfSubjects.forEach(subject => {
    report += `  - ${subject}\n`;
  });
  report += '\n';
  
  report += `Periodic Test Subjects (${result.details.periodicTestSubjects.length}):\n`;
  result.details.periodicTestSubjects.forEach(subject => {
    report += `  - ${subject}\n`;
  });
  
  report += '\n=== End of Report ===';
  
  return report;
};

// Export the demo function for easy testing
export default runSubjectVerificationDemo;
