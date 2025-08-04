import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, FileDown, Plus } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const testResultFormSchema = z.object({
  year: z.string().min(1, "Year is required"),
  periodicTestId: z.string().min(1, "Periodic Test is required"),
  class: z.string().min(1, "Class is required"),
  division: z.string().min(1, "Division is required"),
});

type TestResultFormData = z.infer<typeof testResultFormSchema>;

export default function AddTestResultPage() {
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const { toast } = useToast();

  const form = useForm<TestResultFormData>({
    resolver: zodResolver(testResultFormSchema),
    defaultValues: {
      year: new Date().getFullYear().toString(),
      periodicTestId: "",
      class: "",
      division: "",
    },
  });

  const watchedValues = form.watch();

  // Fetch periodic tests
  const { data: periodicTests = [], isLoading: isLoadingTests } = useQuery<any[]>({
    queryKey: ['/api/periodic-tests'],
  });

  // Fetch class mappings for classes
  const { data: classMappings = [] } = useQuery<any[]>({
    queryKey: ['/api/class-mappings'],
  });

  // Fetch subjects for elective group processing
  const { data: subjects = [] } = useQuery<any[]>({
    queryKey: ['/api/subjects'],
  });

  // Fetch students based on selected class and division
  const studentsQueryKey = watchedValues.division === "All" 
    ? [`/api/students`] 
    : [`/api/students/class/${watchedValues.class}/division/${watchedValues.division}`];
  
  const { data: allStudents = [], isLoading: isLoadingStudents } = useQuery<any[]>({
    queryKey: studentsQueryKey,
    enabled: !!(watchedValues.class && watchedValues.division),
  });

  // Filter students for class if "All" divisions selected
  const students = watchedValues.division === "All" 
    ? allStudents.filter(student => student.class === watchedValues.class)
    : allStudents;

  // Get unique years and classes
  const years = Array.from(new Set(periodicTests.map(test => test.year))).sort().reverse();
  const availableClasses = Array.from(new Set(classMappings.map(mapping => mapping.class))).sort();

  // Get unique test names from periodic tests for the selected year
  const uniqueTestNames = Array.from(new Set(
    periodicTests
      .filter(test => test.year === watchedValues.year)
      .map(test => test.testName)
  )).sort();

  // Filter periodic tests based on selected year
  const filteredPeriodicTests = periodicTests.filter(test => test.year === watchedValues.year);

  // Get available classes for selected test (if test is selected)
  const testsForSelectedTestName = watchedValues.periodicTestId 
    ? periodicTests.filter(t => t.testName === watchedValues.periodicTestId && t.year === watchedValues.year)
    : [];
  const classesForSelectedTest = Array.from(new Set(testsForSelectedTestName.map(t => t.class))).sort();
  
  // Use classes from selected test if available, otherwise use all available classes
  const availableClassesForForm = watchedValues.periodicTestId && classesForSelectedTest.length > 0 
    ? classesForSelectedTest 
    : availableClasses;

  // Get divisions for selected class
  const selectedClassMappings = classMappings.filter(mapping => mapping.class === watchedValues.class);
  const availableDivisions = Array.from(new Set(selectedClassMappings.flatMap(mapping => mapping.division))).sort();

  // Update selected test when periodicTestId or class changes
  useEffect(() => {
    if (watchedValues.periodicTestId && watchedValues.year) {
      // Get all classes for this test name
      const testsForName = periodicTests.filter(t => 
        t.testName === watchedValues.periodicTestId && 
        t.year === watchedValues.year
      );
      const classesForTest = Array.from(new Set(testsForName.map(t => t.class)));
      
      // Only auto-populate class if there's only one class for this test
      if (classesForTest.length === 1 && !watchedValues.class) {
        form.setValue("class", classesForTest[0]);
      }
      
      // Find specific test when both test name and class are selected
      if (watchedValues.class) {
        const specificTest = periodicTests.find(t => 
          t.testName === watchedValues.periodicTestId && 
          t.year === watchedValues.year && 
          t.class === watchedValues.class
        );
        setSelectedTest(specificTest);
      } else {
        // Use first test for basic info display
        const firstTest = testsForName[0];
        setSelectedTest(firstTest);
      }
    }
  }, [watchedValues.periodicTestId, watchedValues.class, watchedValues.year, periodicTests, form]);

  // Clear division when class changes
  useEffect(() => {
    if (watchedValues.class) {
      form.setValue("division", "");
    }
  }, [watchedValues.class, form]);

  // Helper functions for elective group processing
  const getStructuredSubjects = (formData?: TestResultFormData) => {
    const targetClass = formData?.class || watchedValues.class;
    const targetYear = formData?.year || watchedValues.year;
    
    // Get class mapping for the target class to identify elective groups
    const classMapping = classMappings.find(mapping => 
      mapping.class === targetClass
    );
    
    if (!classMapping || !classMapping.electiveGroups) {
      return { coreSubjects: subjects.filter(s => s.subjectType === 'Core').map(s => s.subjectName), electiveGroups: [] };
    }
    
    // Get all elective subjects from groups
    const allElectiveSubjects = classMapping.electiveGroups.flatMap((group: any) => group.subjects);
    
    // Filter core subjects (exclude those in elective groups)
    const coreSubjects = subjects
      .filter(subject => 
        subject.subjectType === 'Core' && 
        !allElectiveSubjects.includes(subject.subjectName)
      )
      .map(subject => subject.subjectName);
    
    return {
      coreSubjects,
      electiveGroups: classMapping.electiveGroups || []
    };
  };

  const isElectiveGroup = (subject: string, formData?: TestResultFormData) => {
    const { electiveGroups } = getStructuredSubjects(formData);
    return electiveGroups.some((group: any) => group.groupName === subject);
  };

  const formatSubjectName = (subject: string, formData?: TestResultFormData) => {
    if (isElectiveGroup(subject, formData)) {
      const { electiveGroups } = getStructuredSubjects(formData);
      const group = electiveGroups.find((g: any) => g.groupName === subject);
      if (group && group.subjects) {
        // Return individual subjects from the elective group
        return group.subjects;
      }
    }
    return subject;
  };

  const expandElectiveSubjects = (subjects: string[], formData?: TestResultFormData) => {
    const expandedSubjects: string[] = [];
    
    subjects.forEach(subject => {
      if (isElectiveGroup(subject, formData)) {
        const { electiveGroups } = getStructuredSubjects(formData);
        const group = electiveGroups.find((g: any) => g.groupName === subject);
        if (group && group.subjects) {
          // Add each individual subject from the elective group
          expandedSubjects.push(...group.subjects);
        }
      } else {
        expandedSubjects.push(subject);
      }
    });
    
    return expandedSubjects;
  };

  const generateDataStructure = (formData: TestResultFormData) => {
    if (!selectedTest) throw new Error("No test selected");
    
    // Get all subjects for the selected test name, class, and division
    const testsForName = periodicTests.filter(test => 
      test.testName === selectedTest.testName && 
      test.class === formData.class &&
      test.year === formData.year
    );
    
    const rawSubjects = Array.from(new Set(testsForName.map(test => test.subject)));
    console.log("Debug - Raw subjects from tests:", rawSubjects);
    console.log("Debug - Class mappings:", classMappings);
    console.log("Debug - Selected class mapping for", formData.class, ":", classMappings.find(m => m.class === formData.class));
    
    const testSubjects = expandElectiveSubjects(rawSubjects, formData); // Expand elective groups into individual subjects
    console.log("Debug - Expanded subjects:", testSubjects);
    
    console.log("Debug - Total students before processing:", students.length);
    console.log("Debug - Students data:", students.map(s => ({ name: s.firstName, class: s.class, division: s.division })));

    // If "All" divisions selected, get subjects available for each division
    let subjectAvailability: { [subject: string]: string[] } = {};
    if (formData.division === "All") {
      // Handle both core subjects and elective groups separately
      const { coreSubjects, electiveGroups } = getStructuredSubjects(formData);
      
      // Handle core subjects - check which divisions have them mapped
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
      
      // Handle elective groups - for each group, create an entry with group name and comma-separated subjects
      electiveGroups.forEach((group: any) => {
        if (rawSubjects.includes(group.groupName)) {
          // Check which divisions have this elective group
          const divisionsWithGroup = classMappings
            .filter(mapping => 
              mapping.class === formData.class &&
              mapping.electiveGroups &&
              mapping.electiveGroups.some((eg: any) => eg.groupName === group.groupName)
            )
            .map(mapping => mapping.division);
          
          // Create combined display: "Elective Group Name: Subject1, Subject2, Subject3"
          const groupDisplay = `${group.groupName}: ${group.subjects.join(', ')}`;
          subjectAvailability[groupDisplay] = Array.from(new Set(divisionsWithGroup));
        }
      });
    }

    const processedStudents = students
      .filter(student => {
        // If "All" divisions selected, include all students from the class
        if (formData.division === "All") {
          return student.class === formData.class;
        }
        // Otherwise, include only students from the specific division
        return student.class === formData.class && student.division === formData.division;
      })
      .map(student => ({
        rollNumber: student.rollNumber,
        studentName: `${student.firstName} ${student.middleName ? student.middleName + ' ' : ''}${student.lastName || ''}`.trim(),
        division: student.division,
      }))
      .sort((a, b) => a.rollNumber - b.rollNumber);
        
    console.log("Debug - Final processed students:", processedStudents);
    
    // Create structured subjects array for display (combining core subjects and elective groups)
    const structuredSubjects: string[] = [];
    if (formData.division === "All") {
      const { coreSubjects, electiveGroups } = getStructuredSubjects(formData);
      
      // Add core subjects
      coreSubjects.forEach(subject => {
        structuredSubjects.push(subject);
      });
      
      // Add elective groups with their subjects formatted as "GroupName: Subject1, Subject2"
      electiveGroups.forEach((group: any) => {
        if (rawSubjects.includes(group.groupName)) {
          const groupDisplay = `${group.groupName}: ${group.subjects.join(', ')}`;
          structuredSubjects.push(groupDisplay);
        }
      });
    } else {
      // For specific division, use the expanded subjects
      structuredSubjects.push(...testSubjects);
    }

    return {
      testInfo: {
        schoolName: "Greenwood International School",
        testName: selectedTest.testName, // This will be the periodic test name like "Unit Test 1"
        class: formData.class,
        division: formData.division,
        year: formData.year,
        fromDate: selectedTest.testDate,
        toDate: selectedTest.testEndDate || selectedTest.testDate,
        duration: selectedTest.duration,
      },
      students: processedStudents,
      subjects: structuredSubjects,
      subjectAvailability: subjectAvailability,
    };
  };

  const createPDFMutation = useMutation({
    mutationFn: async (formData: TestResultFormData) => {
      const pdfData = generateDataStructure(formData);
      generatePDF(pdfData);
      return pdfData;
    },
    onSuccess: () => {
      toast({
        title: "PDF Generated Successfully",
        description: "The printable PDF sheet has been downloaded.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate PDF",
        variant: "destructive",
      });
    },
  });

  const createExcelMutation = useMutation({
    mutationFn: async (formData: TestResultFormData) => {
      const excelData = generateDataStructure(formData);
      generateExcel(excelData);
      return excelData;
    },
    onSuccess: () => {
      toast({
        title: "Excel Generated Successfully",
        description: "The Excel file has been downloaded.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate Excel",
        variant: "destructive",
      });
    },
  });

  const generatePDF = (data: any) => {
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation for better table fit
    
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
    
    // Process headers for elective groups - create multi-row header structure
    const processHeadersForElectives = () => {
      const basicHeaders = ['Roll No', 'Student Name', 'Division'];
      const electiveGroupInfo: { [key: string]: string[] } = {};
      const coreSubjects: string[] = [];
      
      // Get class mapping for elective groups structure from database
      const classMapping = classMappings.find(mapping => 
        mapping.class === data.testInfo.class && 
        (data.testInfo.division === "All" || mapping.division === data.testInfo.division)
      );
      
      // Process core subjects first
      data.subjects.forEach((subject: string) => {
        if (!subject.includes(': ')) {
          coreSubjects.push(subject);
        }
      });
      
      // Process elective groups from database structure
      if (classMapping?.electiveGroups && Array.isArray(classMapping.electiveGroups)) {
        classMapping.electiveGroups.forEach((group: any) => {
          if (group.groupName && group.subjects && Array.isArray(group.subjects)) {
            electiveGroupInfo[group.groupName] = group.subjects;
          }
        });
      }
      
      // Also handle the legacy format from data.subjects (backward compatibility)
      data.subjects.forEach((subject: string) => {
        if (subject.includes(': ')) {
          const [groupName, subjectsStr] = subject.split(': ');
          const subjectsList = subjectsStr.split(', ').map(s => s.trim());
          electiveGroupInfo[groupName] = subjectsList;
        }
      });
      
      // Build final headers structure
      const finalHeaders: string[] = [];
      const secondRowHeaders: string[] = [];
      
      // Add core subjects
      coreSubjects.forEach(subject => {
        finalHeaders.push(subject);
        secondRowHeaders.push('');
      });
      
      // Add elective groups
      Object.entries(electiveGroupInfo).forEach(([groupName, subjectsList]) => {
        finalHeaders.push(...subjectsList);
        // First subject gets the group name, others get empty string for merging
        secondRowHeaders.push(groupName);
        for (let i = 1; i < subjectsList.length; i++) {
          secondRowHeaders.push('');
        }
      });
      
      return {
        basicHeaders,
        finalHeaders,
        secondRowHeaders,
        electiveGroupInfo,
        coreSubjects
      };
    };
    
    const { basicHeaders, finalHeaders, secondRowHeaders, electiveGroupInfo, coreSubjects } = processHeadersForElectives();
    
    // Prepare table headers - basic headers + processed subject headers
    const tableHeaders = [...basicHeaders, ...finalHeaders];
    
    // Prepare table data
    const tableData = data.students.map((student: any) => [
      student.rollNumber,
      student.studentName,
      student.division || '',
      ...finalHeaders.map(() => '') // Empty cells for scores
    ]);

    // Create a properly formatted table with elective group headers
    const createElectiveTable = () => {
      const hasElectiveGroups = Object.keys(electiveGroupInfo).length > 0;
      
      if (!hasElectiveGroups) {
        // Simple case: no elective groups, use standard autoTable
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
          },
          columnStyles: {
            0: { cellWidth: 20 }, // Roll No
            1: { cellWidth: 50 }, // Student Name  
            2: { cellWidth: 20 }, // Division
          },
        });
        return;
      }
      
      // Build the proper header structure for elective groups
      const headerRow1: string[] = [...basicHeaders]; // Roll No, Student Name, Division
      const headerRow2: string[] = ['', '', '']; // Empty for basic columns in second row
      
      // Add core subjects (single row headers)
      coreSubjects.forEach(subject => {
        headerRow1.push(subject);
        headerRow2.push('');
      });
      
      // Add elective groups (two-row headers with proper spanning)
      Object.entries(electiveGroupInfo).forEach(([groupName, subjectsList]) => {
        // First subject gets the group name, others get empty for spanning
        headerRow1.push(groupName);
        for (let i = 1; i < subjectsList.length; i++) {
          headerRow1.push('');
        }
        
        // Add individual subjects in second row
        subjectsList.forEach(subject => {
          headerRow2.push(subject);
        });
      });
      
      // Create the table with proper styling and column widths
      const totalCols = basicHeaders.length + coreSubjects.length + 
        Object.values(electiveGroupInfo).reduce((sum, subjects) => sum + subjects.length, 0);
      
      // Calculate dynamic column widths
      const basicColWidth = 20;
      const nameColWidth = 50;
      const divisionColWidth = 20;
      const subjectColWidth = Math.max(15, (250 - basicColWidth - nameColWidth - divisionColWidth) / 
        (totalCols - 3));
      
      const columnStyles: any = {
        0: { cellWidth: basicColWidth },
        1: { cellWidth: nameColWidth },
        2: { cellWidth: divisionColWidth },
      };
      
      // Set widths for subject columns
      for (let i = 3; i < totalCols; i++) {
        columnStyles[i] = { cellWidth: subjectColWidth };
      }
      
      autoTable(doc, {
        head: [headerRow1, headerRow2],
        body: tableData,
        startY: infoY + 20,
        styles: {
          fontSize: 9,
          cellPadding: 3,
          lineColor: [0, 0, 0],
          lineWidth: 0.5,
        },
        headStyles: {
          fillColor: [180, 180, 180],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle',
        },
        columnStyles: columnStyles,
        didDrawCell: function (data) {
          if (data.row.section === 'head' && data.row.index === 0) {
            // Draw spanning borders for elective groups in first header row
            let currentCol = basicHeaders.length + coreSubjects.length;
            
            Object.entries(electiveGroupInfo).forEach(([groupName, subjectsList]) => {
              if (data.column.index >= currentCol && data.column.index < currentCol + subjectsList.length) {
                if (data.column.index === currentCol && subjectsList.length > 1) {
                  // This is the first cell of an elective group - draw spanning border
                  const spanWidth = subjectColWidth * subjectsList.length;
                  
                  // Clear the default borders for spanning
                  doc.setFillColor(180, 180, 180);
                  doc.rect(data.cell.x, data.cell.y, spanWidth, data.cell.height, 'F');
                  
                  // Draw the group border
                  doc.setDrawColor(0, 0, 0);
                  doc.setLineWidth(0.5);
                  doc.rect(data.cell.x, data.cell.y, spanWidth, data.cell.height, 'S');
                  
                  // Add the group name text centered
                  doc.setTextColor(0, 0, 0);
                  doc.setFontSize(9);
                  doc.setFont('helvetica', 'bold');
                  doc.text(groupName, data.cell.x + spanWidth/2, data.cell.y + data.cell.height/2 + 2, {
                    align: 'center'
                  });
                }
              }
              currentCol += subjectsList.length;
            });
          }
        }
      });
    };
    
    createElectiveTable();
    
    // Save the PDF
    doc.save(`test-result-sheet-${data.testInfo.class}-${data.testInfo.division}-${data.testInfo.year}.pdf`);
  };

  const generateExcel = (data: any) => {
    // Process headers for elective groups for Excel
    const processExcelHeaders = () => {
      const basicHeaders = ['Roll No', 'Student Name', 'Division'];
      const electiveGroupInfo: { [key: string]: string[] } = {};
      const finalHeaders: string[] = [];
      
      // Parse subjects to identify elective groups
      data.subjects.forEach((subject: string) => {
        if (subject.includes(': ')) {
          // This is an elective group format: "Elective 1: Dance, Music, Art"
          const [groupName, subjectsStr] = subject.split(': ');
          const subjectsList = subjectsStr.split(', ').map(s => s.trim());
          electiveGroupInfo[groupName] = subjectsList;
        } else {
          // Regular subject
          finalHeaders.push(subject);
        }
      });
      
      // Add elective group headers
      Object.entries(electiveGroupInfo).forEach(([groupName, subjectsList]) => {
        finalHeaders.push(...subjectsList);
      });
      
      return {
        basicHeaders,
        finalHeaders,
        electiveGroupInfo
      };
    };
    
    const { basicHeaders, finalHeaders, electiveGroupInfo } = processExcelHeaders();
    
    // Create Excel content as CSV format
    const csvContent = [
      // Header rows
      [data.testInfo.schoolName],
      [data.testInfo.testName],
      [],
      [`Class: ${data.testInfo.class}`],
      [`Division: ${data.testInfo.division}`],
      [`Year: ${data.testInfo.year}`],
      [`From Date: ${data.testInfo.fromDate}`],
      [`To Date: ${data.testInfo.toDate}`],
      [`Duration: ${data.testInfo.duration}`],
      [],
    ];
    
    // Handle headers differently if there are elective groups
    if (Object.keys(electiveGroupInfo).length > 0) {
      // First row: basic headers + elective group names (spanning)
      const firstRow = [...basicHeaders];
      
      // Add regular subjects first
      data.subjects.forEach((subject: string) => {
        if (!subject.includes(': ')) {
          firstRow.push(subject);
        }
      });
      
      // Add elective group names (spanning)
      Object.entries(electiveGroupInfo).forEach(([groupName, subjectsList]) => {
        firstRow.push(groupName);
        for (let i = 1; i < subjectsList.length; i++) {
          firstRow.push(''); // Empty cells for spanning
        }
      });
      
      // Second row: basic headers + individual subjects
      const secondRow = [...basicHeaders];
      
      // Add regular subjects
      data.subjects.forEach((subject: string) => {
        if (!subject.includes(': ')) {
          secondRow.push('');
        }
      });
      
      // Add individual elective subjects
      Object.entries(electiveGroupInfo).forEach(([groupName, subjectsList]) => {
        subjectsList.forEach(subject => {
          secondRow.push(subject);
        });
      });
      
      csvContent.push(firstRow, secondRow);
    } else {
      // Simple headers without elective groups
      csvContent.push([...basicHeaders, ...finalHeaders]);
    }
    
    // Student rows
    csvContent.push(...data.students.map((student: any) => [
      student.rollNumber,
      student.studentName,
      student.division || '',
      ...finalHeaders.map(() => '') // Empty cells for scores
    ]));

    // Convert to CSV string
    const csvString = csvContent
      .map(row => row.map((cell: any) => `"${cell}"`).join(','))
      .join('\n');

    // Create a blob and download
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-result-sheet-${data.testInfo.class}-${data.testInfo.division}-${data.testInfo.year}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const onSubmitPDF = (data: TestResultFormData) => {
    createPDFMutation.mutate(data);
  };

  const onSubmitExcel = (data: TestResultFormData) => {
    createExcelMutation.mutate(data);
  };

  const canGeneratePDF = watchedValues.year && watchedValues.periodicTestId && watchedValues.class && watchedValues.division && students.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 dark:from-slate-900 dark:via-emerald-900/20 dark:to-slate-900">
      <div className="container mx-auto p-6 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg mb-4">
            <Plus className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Add Test Result
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Generate printable PDF sheets for test result entry
          </p>
        </div>

        <div className="mb-2" />

        {/* Navigation Tabs */}
        <Tabs value="add" className="w-full max-w-5xl mx-auto">
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
              value="view" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white text-base font-semibold transition-all duration-300"
              asChild
            >
              <Link href="/test-results/view">View</Link>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="mt-8">
            <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-2xl max-w-5xl mx-auto">
              <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-teal-600/10 rounded-t-lg">
                <CardTitle className="text-2xl text-slate-800 dark:text-slate-200 flex items-center gap-3">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/test-results">
                      <ArrowLeft className="h-4 w-4" />
                    </Link>
                  </Button>
                  Add Test Result
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-8">
                <Form {...form}>
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Year Field */}
                      <FormField
                        control={form.control}
                        name="year"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold">Year</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                                  <SelectValue placeholder="Select year" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {years.map((year) => (
                                  <SelectItem key={year} value={year}>
                                    {year}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Periodic Test Field */}
                      <FormField
                        control={form.control}
                        name="periodicTestId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold">Periodic Test</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={!watchedValues.year}>
                              <FormControl>
                                <SelectTrigger className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                                  <SelectValue placeholder="Select periodic test" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {uniqueTestNames.map((testName) => (
                                  <SelectItem key={testName} value={testName}>
                                    {testName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Class Field */}
                      <FormField
                        control={form.control}
                        name="class"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold">Class</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={!watchedValues.periodicTestId}>
                              <FormControl>
                                <SelectTrigger className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                                  <SelectValue placeholder="Select class" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {availableClassesForForm.map((className) => (
                                  <SelectItem key={className} value={className}>
                                    Class {className}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Division Field */}
                      <FormField
                        control={form.control}
                        name="division"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold">Division</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={!watchedValues.class}>
                              <FormControl>
                                <SelectTrigger className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                                  <SelectValue placeholder="Select division" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="All">All Divisions</SelectItem>
                                {availableDivisions.map((division) => (
                                  <SelectItem key={division} value={division}>
                                    Division {division}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Selected Test Info */}
                    {selectedTest && (
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-6 space-y-3">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">Test Information</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div><span className="font-medium">Subject:</span> {selectedTest.subject}</div>
                          <div><span className="font-medium">Date:</span> {selectedTest.testDate}</div>
                          <div><span className="font-medium">Duration:</span> {selectedTest.duration}</div>
                          <div><span className="font-medium">Chapters:</span> {selectedTest.chapters?.join(', ')}</div>
                        </div>
                      </div>
                    )}

                    {/* Student Count Info */}
                    {watchedValues.class && watchedValues.division && (
                      <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Students Found</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {isLoadingStudents ? 'Loading...' : 
                                watchedValues.division === "All" 
                                  ? `${students.length} students in Class ${watchedValues.class} - All Divisions`
                                  : `${students.length} students in Class ${watchedValues.class} - Division ${watchedValues.division}`
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Submit Buttons */}
                    <div className="flex justify-end gap-4 pt-6">
                      <Button
                        type="button"
                        onClick={form.handleSubmit(onSubmitExcel)}
                        disabled={!canGeneratePDF || createExcelMutation.isPending}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {createExcelMutation.isPending ? (
                          "Generating Excel..."
                        ) : (
                          <>
                            <FileDown className="h-5 w-5 mr-2" />
                            Download Excel File
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        onClick={form.handleSubmit(onSubmitPDF)}
                        disabled={!canGeneratePDF || createPDFMutation.isPending}
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {createPDFMutation.isPending ? (
                          "Generating PDF..."
                        ) : (
                          <>
                            <FileDown className="h-5 w-5 mr-2" />
                            Create Printable PDF Sheet
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}