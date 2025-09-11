/**
 * Fixed PDF generation logic for test results
 * This fixes the issue where elective groups are not appearing in the PDF
 */

import { useQuery } from "@tanstack/react-query";

export interface FixedPDFData {
  testInfo: {
    schoolName: string;
    testName: string;
    class: string;
    division: string;
    year: string;
    fromDate: string;
    toDate: string;
    duration: string;
  };
  students: Array<{
    rollNumber: number;
    studentName: string;
    division: string;
    selectedElectiveGroups: any[];
  }>;
  subjects: string[];
  subjectAvailability: { [subject: string]: string[] };
}

/**
 * Fixed version of the generateDataStructure function
 */
export const useFixedPDFGeneration = () => {
  const { data: periodicTests = [] } = useQuery<any[]>({
    queryKey: ['/api/periodic-tests'],
  });

  const { data: classMappings = [] } = useQuery<any[]>({
    queryKey: ['/api/class-mappings'],
  });

  const { data: students = [] } = useQuery<any[]>({
    queryKey: ['/api/students'],
  });

  const generateFixedDataStructure = (
    formData: {
      year: string;
      periodicTestId: string;
      class: string;
      division: string;
    },
    selectedTest: any
  ): FixedPDFData => {
    if (!selectedTest) throw new Error("No test selected");
    
    console.log('=== Fixed PDF Generation ===');
    console.log('Form data:', formData);
    console.log('Selected test:', selectedTest);
    
    // Get all tests for the selected test name, class, and year
    const testsForName = periodicTests.filter(test => 
      test.testName === selectedTest.testName && 
      test.class === formData.class &&
      test.year === formData.year
    );
    
    console.log('Tests for name:', testsForName);
    
    // FIXED LOGIC: Use group_elective_name column for elective groups
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
    
    // Combine subjects for PDF display
    const subjects = [...coreSubjects, ...electiveGroups];
    
    console.log('Core subjects:', coreSubjects);
    console.log('Elective groups:', electiveGroups);
    console.log('Final subjects for PDF:', subjects);
    
    // Handle subject availability for "All" divisions
    let subjectAvailability: { [subject: string]: string[] } = {};
    if (formData.division === "All") {
      // For core subjects
      coreSubjects.forEach(subject => {
        const divisionsWithSubject = classMappings
          .filter(mapping => 
            mapping.class === formData.class &&
            mapping.subjects && 
            mapping.subjects.includes(subject)
          )
          .map(mapping => mapping.division);
        subjectAvailability[subject] = Array.from(new Set(divisionsWithSubject));
      });
      
      // For elective groups
      electiveGroups.forEach(groupName => {
        const divisionsWithGroup = classMappings
          .filter(mapping => 
            mapping.class === formData.class &&
            mapping.electiveGroups &&
            mapping.electiveGroups.some((eg: any) => eg.groupName === groupName)
          )
          .map(mapping => mapping.division);
        subjectAvailability[groupName] = Array.from(new Set(divisionsWithGroup));
      });
    }
    
    // Process students
    const processedStudents = students
      .filter(student => {
        if (formData.division === "All") {
          return student.class === formData.class;
        }
        return student.class === formData.class && student.division === formData.division;
      })
      .map(student => ({
        rollNumber: student.rollNumber,
        studentName: `${student.firstName} ${student.middleName ? student.middleName + ' ' : ''}${student.lastName || ''}`.trim(),
        division: student.division,
        selectedElectiveGroups: student.selectedElectiveGroups || [],
      }))
      .sort((a, b) => a.rollNumber - b.rollNumber);
    
    console.log('Processed students:', processedStudents);
    
    return {
      testInfo: {
        schoolName: "Greenwood International School",
        testName: selectedTest.testName,
        class: formData.class,
        division: formData.division,
        year: formData.year,
        fromDate: selectedTest.testDate,
        toDate: selectedTest.testEndDate || selectedTest.testDate,
        duration: selectedTest.duration,
      },
      students: processedStudents,
      subjects,
      subjectAvailability,
    };
  };

  return {
    periodicTests,
    classMappings,
    students,
    generateFixedDataStructure
  };
};

/**
 * Fixed PDF generation function that properly handles elective groups
 */
export const generateFixedPDF = (data: FixedPDFData) => {
  console.log('=== Generating Fixed PDF ===');
  console.log('PDF Data:', data);
  
  // Import jsPDF dynamically
  import('jspdf').then(({ default: jsPDF }) => {
    import('jspdf-autotable').then(({ default: autoTable }) => {
      const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
      
      // School Header
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(data.testInfo.schoolName, doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
      
      // Test Header
      doc.setFontSize(16);
      doc.text(data.testInfo.testName, doc.internal.pageSize.getWidth() / 2, 25, { align: 'center' });
      
      // Basic Info
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const infoY = 35;
      doc.text(`Class: ${data.testInfo.class}`, 20, infoY);
      doc.text(`Division: ${data.testInfo.division}`, 80, infoY);
      doc.text(`Year: ${data.testInfo.year}`, 140, infoY);
      doc.text(`From Date: ${data.testInfo.fromDate}`, 20, infoY + 8);
      doc.text(`To Date: ${data.testInfo.toDate}`, 80, infoY + 8);
      doc.text(`Duration: ${data.testInfo.duration}`, 140, infoY + 8);
      
      // Prepare table headers
      const tableHeaders = ['Roll No', 'Student Name', 'Division', ...data.subjects];
      
      // Prepare table data
      const tableData = data.students.map(student => {
        const row = [
          student.rollNumber,
          student.studentName,
          student.division || '',
        ];
        
        // Add empty cells for each subject (to be filled manually)
        data.subjects.forEach(() => {
          row.push('');
        });
        
        return row;
      });
      
      // Create table
      autoTable(doc, {
        head: [tableHeaders],
        body: tableData,
        startY: infoY + 20,
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [180, 180, 180],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
        }
      });
      
      // Save the PDF
      doc.save(`test-result-sheet-${data.testInfo.class}-${data.testInfo.division}-${data.testInfo.year}.pdf`);
      
      console.log('Fixed PDF generated successfully!');
      console.log('Subjects included:', data.subjects);
    });
  });
};

/**
 * Test function to verify the fix works with your data
 */
export const testFixedGeneration = () => {
  console.log('=== Testing Fixed Generation with Your Data ===');
  
  // Simulate your data
  const mockPeriodicTests = [
    { id: 36, testName: "Final Semester", year: "2025-2026", class: "II", subject: "Mathematics", subjectType: "core", groupElectiveName: null, testDate: "2025-09-15", testEndDate: "2025-09-15", duration: "1h" },
    { id: 37, testName: "Final Semester", year: "2025-2026", class: "II", subject: "Science", subjectType: "core", groupElectiveName: null, testDate: "2025-09-16", testEndDate: "2025-09-16", duration: "1h" },
    { id: 38, testName: "Final Semester", year: "2025-2026", class: "II", subject: "Hindi", subjectType: "core", groupElectiveName: null, testDate: "2025-09-17", testEndDate: "2025-09-17", duration: "1h" },
    { id: 39, testName: "Final Semester", year: "2025-2026", class: "II", subject: "Dance", subjectType: "elective", groupElectiveName: "Elective 2 I", testDate: "2025-09-18", testEndDate: "2025-09-18", duration: "1h" },
    { id: 40, testName: "Final Semester", year: "2025-2026", class: "II", subject: "Music", subjectType: "elective", groupElectiveName: "Elective 2 I", testDate: "2025-09-18", testEndDate: "2025-09-18", duration: "1h" },
    { id: 41, testName: "Final Semester", year: "2025-2026", class: "II", subject: "Sanskrit", subjectType: "elective", groupElectiveName: "Elective 2 II", testDate: "2025-09-19", testEndDate: "2025-09-19", duration: "2h" },
    { id: 42, testName: "Final Semester", year: "2025-2026", class: "II", subject: "French", subjectType: "elective", groupElectiveName: "Elective 2 II", testDate: "2025-09-19", testEndDate: "2025-09-19", duration: "2h" },
    { id: 43, testName: "Final Semester", year: "2025-2026", class: "II", subject: "German", subjectType: "elective", groupElectiveName: "Elective 2 II", testDate: "2025-09-19", testEndDate: "2025-09-19", duration: "2h" }
  ];
  
  const formData = {
    year: "2025-2026",
    periodicTestId: "Final Semester",
    class: "II",
    division: "All"
  };
  
  const selectedTest = { testName: "Final Semester", testDate: "2025-09-15", testEndDate: "2025-09-19", duration: "2h" };
  
  // Test the fixed logic
  const coreSubjects = Array.from(new Set(
    mockPeriodicTests
      .filter(test => test.subjectType === 'core')
      .map(test => test.subject)
  ));
  
  const electiveGroups = Array.from(new Set(
    mockPeriodicTests
      .filter(test => test.subjectType === 'elective' && test.groupElectiveName)
      .map(test => test.groupElectiveName)
  ));
  
  const subjects = [...coreSubjects, ...electiveGroups];
  
  console.log('Test Results:');
  console.log('Core subjects:', coreSubjects);
  console.log('Elective groups:', electiveGroups);
  console.log('Final subjects:', subjects);
  console.log('Expected PDF columns: Roll No, Student Name, Division, Mathematics, Science, Hindi, Elective 2 I, Elective 2 II');
  
  console.log('===============================================');
};
