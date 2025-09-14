import { useState, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, FileText, CheckCircle, AlertCircle, Eye } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import * as XLSX from 'xlsx';

interface ParsedTestData {
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
  subjects: string[];
  students: Array<{
    rollNumber: number;
    studentName: string;
    division: string;
    scores: { [subject: string]: string };
  }>;
  errors: string[];
  warnings: string[];
}

export default function ImportTestResultsPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedTestData | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [editableScores, setEditableScores] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch periodic tests to match with uploaded data
  const { data: periodicTests = [] } = useQuery<any[]>({
    queryKey: ['/api/periodic-tests'],
  });

  // Fetch students to validate roll numbers
  const { data: students = [] } = useQuery<any[]>({
    queryKey: ['/api/students'],
  });

  // Initialize editable scores when data is parsed
  const initializeEditableScores = (data: ParsedTestData) => {
    const scores: { [key: string]: string } = {};
    data.students.forEach((student, studentIndex) => {
      data.subjects.forEach((subject) => {
        const key = `${studentIndex}-${subject}`;
        scores[key] = student.scores[subject] || '';
      });
    });
    setEditableScores(scores);
  };

  // Update a specific score
  const updateScore = (studentIndex: number, subject: string, value: string) => {
    const key = `${studentIndex}-${subject}`;
    setEditableScores(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Get updated parsed data with editable scores
  const getUpdatedParsedData = (): ParsedTestData | null => {
    if (!parsedData) return null;
    
    const updatedStudents = parsedData.students.map((student, studentIndex) => ({
      ...student,
      scores: parsedData.subjects.reduce((acc, subject) => {
        const key = `${studentIndex}-${subject}`;
        acc[subject] = editableScores[key] || student.scores[subject] || '';
        return acc;
      }, {} as { [subject: string]: string })
    }));

    return {
      ...parsedData,
      students: updatedStudents
    };
  };

  const parseXLSX = (file: File): Promise<ParsedTestData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first worksheet
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert to JSON array
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
          
          // Process the data similar to CSV parsing
          const parsed = processExcelData(jsonData as any[][]);
          resolve(parsed);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const processExcelData = (data: any[][]): ParsedTestData => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Parse header information
    const testInfo = {
      schoolName: data[0]?.[0] || '',
      testName: data[1]?.[0] || '',
      class: '',
      division: '',
      year: '',
      fromDate: '',
      toDate: '',
      duration: ''
    };

    // Extract class, division, year, dates, duration
    console.log('Excel data for parsing:', data.slice(0, 15)); // Debug: show first 15 rows
    
    for (let i = 0; i < Math.min(15, data.length); i++) {
      const row = data[i];
      const firstCell = row?.[0] || '';
      console.log(`Row ${i}: "${firstCell}"`); // Debug: show each row being processed
      
      if (firstCell.toString().startsWith('Class:')) {
        testInfo.class = firstCell.toString().replace('Class:', '').trim();
        console.log('✅ Parsed class:', testInfo.class);
      } else if (firstCell.toString().startsWith('Division:')) {
        testInfo.division = firstCell.toString().replace('Division:', '').trim();
        console.log('✅ Parsed division:', testInfo.division);
      } else if (firstCell.toString().startsWith('Year:')) {
        testInfo.year = firstCell.toString().replace('Year:', '').trim();
        console.log('✅ Parsed year:', testInfo.year);
      } else if (firstCell.toString().startsWith('From Date:')) {
        testInfo.fromDate = firstCell.toString().replace('From Date:', '').trim();
      } else if (firstCell.toString().startsWith('To Date:')) {
        testInfo.toDate = firstCell.toString().replace('To Date:', '').trim();
      } else if (firstCell.toString().startsWith('Duration:')) {
        testInfo.duration = firstCell.toString().replace('Duration:', '').trim();
      }
    }
    
    console.log('Final parsed test info:', testInfo);
    
    // Validate that we have the required fields
    if (!testInfo.class || !testInfo.division || !testInfo.year) {
      console.error('Missing required fields:', {
        class: testInfo.class,
        division: testInfo.division,
        year: testInfo.year
      });
      throw new Error(`Missing required fields in Excel file. Class: "${testInfo.class}", Division: "${testInfo.division}", Year: "${testInfo.year}"`);
    }

    // Find the header row (contains "Roll No", "Student Name", etc.)
    let headerRowIndex = -1;
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (row && row[0]?.toString().includes('Roll No') && row[1]?.toString().includes('Student Name')) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) {
      errors.push('Could not find header row with "Roll No" and "Student Name"');
      return { testInfo, subjects: [], students: [], errors, warnings };
    }

    // Parse subjects from header row
    const headerRow = data[headerRowIndex];
    const subjects = headerRow.slice(3).map(col => col?.toString().trim() || '').filter(col => col); // Skip Roll No, Student Name, Division

    // Parse student data
    const students: ParsedTestData['students'] = [];
    for (let i = headerRowIndex + 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length < 3) continue;

      const rollNumber = parseInt(row[0]?.toString() || '');
      if (isNaN(rollNumber)) {
        warnings.push(`Row ${i + 1}: Invalid roll number "${row[0]}"`);
        continue;
      }

      const studentName = row[1]?.toString().trim() || '';
      const division = row[2]?.toString().trim() || '';
      const scores: { [subject: string]: string } = {};

      // Parse scores for each subject
      subjects.forEach((subject, index) => {
        const scoreIndex = 3 + index;
        scores[subject] = row[scoreIndex]?.toString().trim() || '';
      });

      students.push({
        rollNumber,
        studentName,
        division,
        scores
      });
    }

    // Check if periodic test exists
    const matchingTests = periodicTests.filter(test => 
      test.testName === testInfo.testName && 
      test.class === testInfo.class && 
      test.year === testInfo.year
    );

    if (matchingTests.length === 0) {
      // Debug: Log available tests for troubleshooting
      const availableTests = periodicTests.filter(test => 
        test.testName === testInfo.testName && test.year === testInfo.year
      );
      const availableClasses = Array.from(new Set(availableTests.map(test => test.class)));
      
      warnings.push(`No matching periodic test found for "${testInfo.testName}" in class "${testInfo.class}" for year "${testInfo.year}". Available classes for this test: ${availableClasses.join(', ')}`);
    } else {
      // Check if all subjects in Excel have corresponding periodic tests
      const testSubjects = matchingTests.map(test => test.subject);
      
      // Filter out elective group columns from missing subjects check
      const coreSubjects = subjects.filter(subject => !subject.includes('Elective') || (subject.includes('Elective') && !subject.includes('(')));
      const missingSubjects = coreSubjects.filter(subject => !testSubjects.includes(subject));
      
      if (missingSubjects.length > 0) {
        warnings.push(`No periodic test found for subjects: ${missingSubjects.join(', ')}`);
      }
      
      // Log elective group columns for debugging
      const electiveGroupColumns = subjects.filter(subject => subject.includes('Elective') && subject.includes('(') && subject.includes(')'));
      if (electiveGroupColumns.length > 0) {
        console.log('Elective group columns found:', electiveGroupColumns);
        console.log('These will be mapped to individual subjects based on student selections');
      }
    }

    return { testInfo, subjects, students, errors, warnings };
  };

  const parseCSV = (csvContent: string): ParsedTestData => {
    const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line);
    const errors: string[] = [];
    const warnings: string[] = [];

    // Parse header information
    const testInfo = {
      schoolName: lines[0]?.replace(/"/g, '') || '',
      testName: lines[1]?.replace(/"/g, '') || '',
      class: '',
      division: '',
      year: '',
      fromDate: '',
      toDate: '',
      duration: ''
    };

    // Extract class, division, year, dates, duration
    console.log('CSV lines for parsing:', lines.slice(0, 15)); // Debug: show first 15 lines
    
    for (let i = 0; i < Math.min(15, lines.length); i++) {
      const line = lines[i]?.replace(/"/g, '') || '';
      console.log(`Line ${i}: "${line}"`); // Debug: show each line being processed
      
      if (line.startsWith('Class:')) {
        testInfo.class = line.replace('Class:', '').trim();
        console.log('✅ Parsed class:', testInfo.class);
      } else if (line.startsWith('Division:')) {
        testInfo.division = line.replace('Division:', '').trim();
        console.log('✅ Parsed division:', testInfo.division);
      } else if (line.startsWith('Year:')) {
        testInfo.year = line.replace('Year:', '').trim();
        console.log('✅ Parsed year:', testInfo.year);
      } else if (line.startsWith('From Date:')) {
        testInfo.fromDate = line.replace('From Date:', '').trim();
      } else if (line.startsWith('To Date:')) {
        testInfo.toDate = line.replace('To Date:', '').trim();
      } else if (line.startsWith('Duration:')) {
        testInfo.duration = line.replace('Duration:', '').trim();
      }
    }
    
    console.log('Final parsed test info:', testInfo);
    
    // Validate that we have the required fields
    if (!testInfo.class || !testInfo.division || !testInfo.year) {
      console.error('Missing required fields:', {
        class: testInfo.class,
        division: testInfo.division,
        year: testInfo.year
      });
      throw new Error(`Missing required fields in CSV. Class: "${testInfo.class}", Division: "${testInfo.division}", Year: "${testInfo.year}"`);
    }

    // Find the header row (contains "Roll No", "Student Name", etc.)
    let headerRowIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('"Roll No"') && lines[i].includes('"Student Name"')) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) {
      errors.push('Could not find header row with "Roll No" and "Student Name"');
      return { testInfo, subjects: [], students: [], errors, warnings };
    }

    // Parse subjects from header row
    const headerLine = lines[headerRowIndex];
    const headerColumns = headerLine.split(',').map(col => col.replace(/"/g, '').trim());
    const subjects = headerColumns.slice(3); // Skip Roll No, Student Name, Division

    // Parse student data
    const students: ParsedTestData['students'] = [];
    for (let i = headerRowIndex + 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      const columns = line.split(',').map(col => col.replace(/"/g, '').trim());
      
      if (columns.length < 3) {
        warnings.push(`Row ${i + 1}: Insufficient columns`);
        continue;
      }

      const rollNumber = parseInt(columns[0]);
      if (isNaN(rollNumber)) {
        warnings.push(`Row ${i + 1}: Invalid roll number "${columns[0]}"`);
        continue;
      }

      const studentName = columns[1];
      const division = columns[2];
      const scores: { [subject: string]: string } = {};

      // Parse scores for each subject
      subjects.forEach((subject, index) => {
        const scoreIndex = 3 + index;
        scores[subject] = columns[scoreIndex] || '';
      });

      students.push({
        rollNumber,
        studentName,
        division,
        scores
      });
    }

    // Note: Student validation will be done during import since we need access to the database students

    // Check if periodic test exists
    const matchingTests = periodicTests.filter(test => 
      test.testName === testInfo.testName && 
      test.class === testInfo.class && 
      test.year === testInfo.year
    );

    if (matchingTests.length === 0) {
      // Debug: Log available tests for troubleshooting
      const availableTests = periodicTests.filter(test => 
        test.testName === testInfo.testName && test.year === testInfo.year
      );
      const availableClasses = Array.from(new Set(availableTests.map(test => test.class)));
      
      warnings.push(`No matching periodic test found for "${testInfo.testName}" in class "${testInfo.class}" for year "${testInfo.year}". Available classes for this test: ${availableClasses.join(', ')}`);
    } else {
      // Check if all subjects in CSV have corresponding periodic tests
      const testSubjects = matchingTests.map(test => test.subject);
      
      // Filter out elective group columns from missing subjects check
      const coreSubjects = subjects.filter(subject => !subject.includes('Elective') || (subject.includes('Elective') && !subject.includes('(')));
      const missingSubjects = coreSubjects.filter(subject => !testSubjects.includes(subject));
      
      if (missingSubjects.length > 0) {
        warnings.push(`No periodic test found for subjects: ${missingSubjects.join(', ')}`);
      }
      
      // Log elective group columns for debugging
      const electiveGroupColumns = subjects.filter(subject => subject.includes('Elective') && subject.includes('(') && subject.includes(')'));
      if (electiveGroupColumns.length > 0) {
        console.log('Elective group columns found:', electiveGroupColumns);
        console.log('These will be mapped to individual subjects based on student selections');
      }
    }

    return { testInfo, subjects, students, errors, warnings };
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.xlsx') && !file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an XLSX or CSV file.",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    setIsPreviewMode(false);
    setParsedData(null);

    // Handle XLSX files
    if (file.name.toLowerCase().endsWith('.xlsx')) {
      parseXLSX(file)
        .then((parsed) => {
          setParsedData(parsed);
          initializeEditableScores(parsed);
          setIsPreviewMode(true);
        })
        .catch((error) => {
          console.error('Error parsing XLSX:', error);
          toast({
            title: "Error Parsing File",
            description: error.message || "Failed to parse XLSX file.",
            variant: "destructive",
          });
        });
    } else {
      // Handle CSV files (existing logic)
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvContent = e.target?.result as string;
        const parsed = parseCSV(csvContent);
        setParsedData(parsed);
        initializeEditableScores(parsed);
        setIsPreviewMode(true);
      };
      reader.readAsText(file);
    }
  };

  const importMutation = useMutation({
    mutationFn: async () => {
      const data = getUpdatedParsedData();
      if (!data) throw new Error('No data to import');
      // Find the matching periodic tests
      const matchingTests = periodicTests.filter(test => 
        test.testName === data.testInfo.testName && 
        test.class === data.testInfo.class && 
        test.year === data.testInfo.year
      );

      if (matchingTests.length === 0) {
        // Debug: Log available tests for troubleshooting
        const availableTests = periodicTests.filter(test => 
          test.testName === data.testInfo.testName && test.year === data.testInfo.year
        );
        const availableClasses = Array.from(new Set(availableTests.map(test => test.class)));
        
        throw new Error(`No matching periodic test found for "${data.testInfo.testName}" in class "${data.testInfo.class}" for year "${data.testInfo.year}". Available classes for this test: ${availableClasses.join(', ')}`);
      }

      // Prepare test results data
      const testResults = [];
      
      // Debug: Log available students for the class (across all divisions)
      const availableStudents = students.filter(s => s.class === data.testInfo.class);
      console.log(`Available students for class "${data.testInfo.class}" (all divisions):`, 
        availableStudents.map(s => ({ 
          rollNumber: s.rollNumber, 
          firstName: s.firstName, 
          class: s.class, 
          division: s.division 
        }))
      );
      
      for (const student of data.students) {
        console.log(students);
        
        // Find the student in the system using the division from the student row, not the header
        const systemStudent = students.find(s => 
          s.rollNumber === student.rollNumber && 
          s.class === data.testInfo.class && 
          s.division === student.division  // Use student.division instead of data.testInfo.division
        );

        if (!systemStudent) {
          console.warn(`Student not found: ${student.studentName} (Roll: ${student.rollNumber})`);
          console.warn(`Looking for: rollNumber=${student.rollNumber}, class="${data.testInfo.class}", division="${student.division}"`);
          continue;
        }
        
        console.log(`✅ Found student: ${systemStudent.firstName} (Roll: ${systemStudent.rollNumber})`);

        // Create test result entries for each subject
        for (const subject of data.subjects) {
          const score = student.scores[subject];
          const marks = score && score.trim() !== '' && score !== 'N/A' ? parseInt(score) : null;
          
          // Check if this is an elective group column (format: "ElectiveGroupName(Subject1,Subject2)")
          const isElectiveGroup = subject.includes('Elective') && subject.includes('(') && subject.includes(')');
          
          if (isElectiveGroup) {
            // This is an elective group column, extract the group name from format "ElectiveGroupName(Subject1,Subject2)"
            const groupName = subject.split('(')[0]; // Extract "ElectiveGroupName" from "ElectiveGroupName(Subject1,Subject2)"
            console.log(`Processing elective group: "${subject}" -> Group name: "${groupName}"`);
            
            const studentElectives = systemStudent.selectedElectiveGroups || [];
            const selectedElective = studentElectives.find((elective: any) => 
              elective.groupName === groupName
            );
            
            if (selectedElective) {
              // Student has selected a subject from this group
              const selectedSubject = selectedElective.selectedSubject;
              console.log(`Student ${student.studentName}: Elective group "${groupName}" maps to subject "${selectedSubject}"`);
              
              // Find the periodic test for the selected subject
              const subjectTest = periodicTests.find(test => 
                test.testName === data.testInfo.testName && 
                test.class === data.testInfo.class && 
                test.year === data.testInfo.year &&
                test.subject === selectedSubject
              );
              
              if (subjectTest) {
                testResults.push({
                  year: data.testInfo.year,
                  periodicTestId: subjectTest.id,
                  periodicTestName: data.testInfo.testName,
                  class: data.testInfo.class,
                  division: student.division, // Use individual student division, not "All"
                  subject: selectedSubject, // Store the actual subject, not the group name
                  subjectType: subjectTest.subjectType || 'elective',
                  studentId: systemStudent.id,
                  studentName: `${systemStudent.firstName} ${systemStudent.middleName ? systemStudent.middleName + ' ' : ''}${systemStudent.lastName || ''}`.trim(),
                  rollNumber: student.rollNumber,
                  marks: marks,
                  maxMarks: subjectTest.maximumMarks || 100,
                  // grade: removed as requested
                  remarks: null
                });
                console.log(`✅ Created test result for ${selectedSubject} with marks: ${marks}`);
              } else {
                console.warn(`❌ No periodic test found for subject "${selectedSubject}" in test "${data.testInfo.testName}" for class "${data.testInfo.class}" and year "${data.testInfo.year}"`);
              }
            } else {
              console.log(`Student ${student.studentName}: No elective selection found for group "${groupName}"`);
            }
          } else {
            // This is a core subject or individual elective subject
            const subjectTest = periodicTests.find(test => 
              test.testName === data.testInfo.testName && 
              test.class === data.testInfo.class && 
              test.year === data.testInfo.year &&
              test.subject === subject
            );

            if (subjectTest) {
              // Check if this is an elective subject and if the student has selected it
              if (subjectTest.subjectType === 'elective' && subjectTest.groupElectiveName) {
                // Check if student has selected this elective subject
                const studentElectives = systemStudent.selectedElectiveGroups || [];
                const hasSelectedElective = studentElectives.some((elective: any) => 
                  elective.selectedSubject === subject
                );
                
                if (!hasSelectedElective) {
                  // Student hasn't selected this elective, mark as N/A
                  testResults.push({
                    year: data.testInfo.year,
                    periodicTestId: subjectTest.id,
                    periodicTestName: data.testInfo.testName,
                    class: data.testInfo.class,
                    division: student.division, // Use individual student division, not "All"
                    subject: subject,
                    subjectType: subjectTest.subjectType || 'elective',
                    studentId: systemStudent.id,
                    studentName: `${systemStudent.firstName} ${systemStudent.middleName ? systemStudent.middleName + ' ' : ''}${systemStudent.lastName || ''}`.trim(),
                    rollNumber: student.rollNumber,
                    marks: null, // N/A for unselected electives
                    maxMarks: subjectTest.maximumMarks || 100,
                    // grade: removed as requested
                    remarks: 'N/A - Not selected by student'
                  });
                  continue;
                }
              }

              testResults.push({
                year: data.testInfo.year,
                periodicTestId: subjectTest.id,
                periodicTestName: data.testInfo.testName,
                class: data.testInfo.class,
                division: student.division, // Use individual student division, not "All"
                subject: subject,
                subjectType: subjectTest.subjectType || 'core',
                studentId: systemStudent.id,
                studentName: `${systemStudent.firstName} ${systemStudent.middleName ? systemStudent.middleName + ' ' : ''}${systemStudent.lastName || ''}`.trim(),
                rollNumber: student.rollNumber,
                marks: marks,
                maxMarks: subjectTest.maximumMarks || 100,
                // grade: removed as requested
                remarks: null
              });
            }
          }
        }
      }

      // Debug: Log the test results being sent
      console.log('Test results being sent to API:', testResults);
      console.log('Number of test results:', testResults.length);
      
      if (testResults.length === 0) {
        throw new Error('No test results to import. Please check if students were found and matched correctly.');
      }
      
      // Send to API
      const response = await apiRequest('POST', '/api/test-results/import', { testResults });
      
      console.log('API Response:', response);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Import Successful",
        description: "Test results have been imported successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/test-results'] });
      setUploadedFile(null);
      setParsedData(null);
      setEditableScores({});
      setIsPreviewMode(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error: any) => {
      console.error('Import error details:', error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import test results.",
        variant: "destructive",
      });
    },
  });

  // calculateGrade function removed as grade field is no longer used

  const canImport = parsedData && parsedData.errors.length === 0 && parsedData.students.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 dark:from-slate-900 dark:via-emerald-900/20 dark:to-slate-900">
      <div className="container mx-auto p-6 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg mb-4">
            <Upload className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Import Test Results
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Upload CSV files to import test results for students
          </p>
        </div>

        <div className="mb-2" />

        {/* Navigation Tabs */}
        <Tabs value="import" className="w-full max-w-5xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-0 h-14">
            <TabsTrigger 
              value="landing" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white text-base font-semibold transition-all duration-300"
              asChild
            >
              <Link href="/test-results">Landing</Link>
            </TabsTrigger>
            <TabsTrigger 
              value="add" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white text-base font-semibold transition-all duration-300"
              asChild
            >
              <Link href="/test-results/add">Add</Link>
            </TabsTrigger>
            <TabsTrigger 
              value="import" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white text-base font-semibold transition-all duration-300"
            >
              Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="mt-8">
            <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-2xl max-w-5xl mx-auto">
              <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-teal-600/10 rounded-t-lg">
                <CardTitle className="text-2xl text-slate-800 dark:text-slate-200 flex items-center gap-3">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/test-results">
                      <ArrowLeft className="h-4 w-4" />
                    </Link>
                  </Button>
                  Import Test Results
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-8">
                <div className="space-y-8">
                  
                  {/* File Upload Section */}
                  {!isPreviewMode && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 hover:border-emerald-500 transition-colors">
                          <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Upload XLSX/CSV File
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400 mb-4">
                            Select an XLSX or CSV file containing test results data
                          </p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.csv"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <Button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Choose File
                          </Button>
                        </div>
                      </div>

                      {/* Instructions */}
                      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                        <CardContent className="p-6">
                          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            XLSX/CSV Format Requirements
                          </h4>
                          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                            <li>• File must be in XLSX or CSV format (.xlsx or .csv extension)</li>
                            <li>• First row should contain school name</li>
                            <li>• Second row should contain test name (e.g., "Final Semester")</li>
                            <li>• Rows 4-9 should contain class, division, year (2025-2026), dates, and duration</li>
                            <li>• Header row should contain: Roll No, Student Name, Division, and subject columns</li>
                            <li>• Data rows should contain student information and scores</li>
                            <li>• Year format should match database format (e.g., "2025-2026")</li>
                            <li>• Elective subjects will be marked as N/A for students who haven't selected them</li>
                            <li>• Elective groups should be in format: ElectiveGroupName(Subject1,Subject2)</li>
                          </ul>
                          <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                            <p className="text-xs text-blue-800 dark:text-blue-200">
                              <strong>Note:</strong> The system will automatically match students by roll number, class, and division. 
                              For elective subjects, only students who have selected those subjects will have their scores imported.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Preview Section */}
                  {isPreviewMode && parsedData && (
                    <div className="space-y-6">
                      {/* Test Information */}
                      <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
                        <CardHeader>
                          <CardTitle className="text-lg text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                            <Eye className="h-5 w-5" />
                            Test Information Preview
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm ">
                            <div><span className="font-medium">School:</span> {parsedData.testInfo.schoolName}</div>
                            <div><span className="font-medium">Test:</span> {parsedData.testInfo.testName}</div>
                            <div><span className="font-medium">Class:</span> {parsedData.testInfo.class}</div>
                            <div><span className="font-medium">Division:</span> {parsedData.testInfo.division}</div>
                            <div><span className="font-medium">Year:</span> {parsedData.testInfo.year}</div>
                            <div><span className="font-medium">Duration:</span> {parsedData.testInfo.duration}</div>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Date Range:</span> {parsedData.testInfo.fromDate} to {parsedData.testInfo.toDate}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Subjects:</span> {parsedData.subjects.join(', ')}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Students:</span> {parsedData.students.length} students found
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Total Records:</span> {parsedData.students.length * parsedData.subjects.length} test result entries will be created
                          </div>
                        </CardContent>
                      </Card>

                      {/* Errors and Warnings */}
                      {parsedData.errors.length > 0 && (
                        <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <AlertDescription className="text-red-800 dark:text-red-200">
                            <div className="font-semibold mb-2">Errors found:</div>
                            <ul className="list-disc list-inside space-y-1">
                              {parsedData.errors.map((error, index) => (
                                <li key={index}>{error}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}

                      {parsedData.warnings.length > 0 && (
                        <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                            <div className="font-semibold mb-2">Warnings:</div>
                            <ul className="list-disc list-inside space-y-1">
                              {parsedData.warnings.map((warning, index) => (
                                <li key={index}>{warning}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Editable Data Preview */}
                      {parsedData.students.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Eye className="h-5 w-5" />
                              Editable Data Preview ({parsedData.students.length} students)
                            </CardTitle>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              You can edit the scores before importing. Click on any score cell to edit.
                            </p>
                          </CardHeader>
                          <CardContent>
                            <div className="overflow-x-auto max-h-96 overflow-y-auto">
                              <table className="w-full border-collapse border border-slate-300 dark:border-slate-600">
                                <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 z-10">
                                  <tr>
                                    <th className="border border-slate-300 dark:border-slate-600 p-2 text-left left-0 bg-slate-100 dark:bg-slate-800">Roll No</th>
                                    <th className="border border-slate-300 dark:border-slate-600 p-2 text-left left-16 bg-slate-100 dark:bg-slate-800">Student Name</th>
                                    <th className="border border-slate-300 dark:border-slate-600 p-2 text-left left-32 bg-slate-100 dark:bg-slate-800">Division</th>
                                    {parsedData.subjects.map((subject) => (
                                      <th key={subject} className="border border-slate-300 dark:border-slate-600 p-2 text-left min-w-auto">
                                        <div className="text-xs font-medium">{subject}</div>
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {parsedData.students.map((student, index) => (
                                    <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                      <td className="border border-slate-300 dark:border-slate-600 p-2 left-0 bg-white dark:bg-slate-900 font-medium">
                                        {student.rollNumber}
                                      </td>
                                      <td className="border border-slate-300 dark:border-slate-600 p-2 left-16 bg-white dark:bg-slate-900">
                                        {student.studentName}
                                      </td>
                                      <td className="border border-slate-300 dark:border-slate-600 p-2 left-48 bg-white dark:bg-slate-900 mr-4">
                                        {student.division}
                                      </td>
                                      {parsedData.subjects.map((subject) => {
                                        const key = `${index}-${subject}`;
                                        const currentValue = editableScores[key] || student.scores[subject] || '';
                                        return (
                                          <td key={subject} className="border border-slate-300 dark:border-slate-600 p-1">
                                            <Input
                                              value={currentValue}
                                              onChange={(e) => updateScore(index, subject, e.target.value)}
                                              className="w-full h-8 text-xs border-0 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-transparent"
                                              placeholder="Score"
                                              type="text"
                                            />
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <p className="text-sm text-blue-800 dark:text-blue-200">
                                <strong>Note:</strong> Edit any scores above before importing. Empty cells will be treated as no score. 
                                Leave cells empty for "N/A" values.
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Action Buttons */}
                      <div className="flex justify-between gap-4 pt-6">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsPreviewMode(false);
                            setParsedData(null);
                            setUploadedFile(null);
                            setEditableScores({});
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                        >
                          Upload Different File
                        </Button>
                        
                        <div className="flex gap-4">
                          {parsedData.errors.length === 0 && (
                            <Button
                              onClick={() => importMutation.mutate()}
                              disabled={!canImport || importMutation.isPending}
                              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                            >
                              {importMutation.isPending ? (
                                "Importing..."
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Import Test Results
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
