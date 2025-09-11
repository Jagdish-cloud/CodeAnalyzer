import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { 
  useSubjectVerification, 
  formatSubjectsForDisplay, 
  logSubjectVerification,
  type SubjectVerificationResult 
} from '@/utils/subjectVerification';

interface SubjectVerificationTestProps {
  className?: string;
  division?: string;
  testName?: string;
  year?: string;
}

export default function SubjectVerificationTest({ 
  className = "12", 
  division = "A", 
  testName = "Unit Test 1", 
  year = "2024" 
}: SubjectVerificationTestProps) {
  const [verificationResult, setVerificationResult] = useState<SubjectVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const { 
    getClassSubjects, 
    getPeriodicTestSubjects, 
    verifySubjects 
  } = useSubjectVerification(className, division, testName, year);

  // Get class subjects and periodic test subjects
  const classSubjectInfo = getClassSubjects();
  const periodicTestSubjects = getPeriodicTestSubjects();

  // Simulate PDF subjects (this would come from the actual PDF generation)
  const simulatePDFSubjects = () => {
    const { coreSubjects, electiveGroups } = classSubjectInfo;
    const pdfSubjects: string[] = [];
    
    // Add core subjects
    pdfSubjects.push(...coreSubjects);
    
    // Add elective groups in the format used by PDF generation
    electiveGroups.forEach(group => {
      const groupDisplay = `${group.groupName}: ${group.subjects.join(', ')}`;
      pdfSubjects.push(groupDisplay);
    });
    
    return pdfSubjects;
  };

  const handleVerifySubjects = async () => {
    setIsVerifying(true);
    
    try {
      // Simulate PDF subjects (in real usage, this would come from the PDF generation)
      const pdfSubjects = simulatePDFSubjects();
      
      // Perform verification
      const result = verifySubjects(pdfSubjects);
      
      // Log detailed results
      logSubjectVerification(result);
      
      setVerificationResult(result);
    } catch (error) {
      console.error('Error during subject verification:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyWithMissingSubjects = async () => {
    setIsVerifying(true);
    
    try {
      // Simulate PDF with missing subjects
      const { coreSubjects, electiveGroups } = classSubjectInfo;
      const pdfSubjects: string[] = [];
      
      // Add only first half of core subjects
      pdfSubjects.push(...coreSubjects.slice(0, Math.ceil(coreSubjects.length / 2)));
      
      // Add only first elective group
      if (electiveGroups.length > 0) {
        const firstGroup = electiveGroups[0];
        const groupDisplay = `${firstGroup.groupName}: ${firstGroup.subjects.join(', ')}`;
        pdfSubjects.push(groupDisplay);
      }
      
      const result = verifySubjects(pdfSubjects);
      logSubjectVerification(result);
      setVerificationResult(result);
    } catch (error) {
      console.error('Error during subject verification:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyWithExtraSubjects = async () => {
    setIsVerifying(true);
    
    try {
      // Simulate PDF with extra subjects
      const { coreSubjects, electiveGroups } = classSubjectInfo;
      const pdfSubjects: string[] = [];
      
      // Add all actual subjects
      pdfSubjects.push(...coreSubjects);
      electiveGroups.forEach(group => {
        const groupDisplay = `${group.groupName}: ${group.subjects.join(', ')}`;
        pdfSubjects.push(groupDisplay);
      });
      
      // Add some extra subjects
      pdfSubjects.push('Extra Subject 1', 'Extra Subject 2');
      pdfSubjects.push('Extra Elective Group: Subject A, Subject B');
      
      const result = verifySubjects(pdfSubjects);
      logSubjectVerification(result);
      setVerificationResult(result);
    } catch (error) {
      console.error('Error during subject verification:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Subject Verification Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>Class:</strong> {className}</div>
            <div><strong>Division:</strong> {division}</div>
            <div><strong>Test:</strong> {testName}</div>
            <div><strong>Year:</strong> {year}</div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">Class Subjects:</h4>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {formatSubjectsForDisplay(classSubjectInfo)}
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">Periodic Test Subjects:</h4>
            <div className="flex flex-wrap gap-1">
              {periodicTestSubjects.length > 0 ? (
                periodicTestSubjects.map((subject, index) => (
                  <Badge key={index} variant="outline">{subject}</Badge>
                ))
              ) : (
                <span className="text-sm text-slate-500">No subjects found</span>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleVerifySubjects}
              disabled={isVerifying}
              className="bg-green-600 hover:bg-green-700"
            >
              {isVerifying ? 'Verifying...' : 'Verify Complete Match'}
            </Button>
            <Button 
              onClick={handleVerifyWithMissingSubjects}
              disabled={isVerifying}
              variant="outline"
            >
              Test Missing Subjects
            </Button>
            <Button 
              onClick={handleVerifyWithExtraSubjects}
              disabled={isVerifying}
              variant="outline"
            >
              Test Extra Subjects
            </Button>
          </div>
        </CardContent>
      </Card>

      {verificationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {verificationResult.isMatch ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              Verification Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={verificationResult.isMatch ? "default" : "destructive"}>
                {verificationResult.isMatch ? 'MATCH' : 'MISMATCH'}
              </Badge>
              <Badge variant={verificationResult.coreSubjectsMatch ? "default" : "destructive"}>
                Core: {verificationResult.coreSubjectsMatch ? '✓' : '✗'}
              </Badge>
              <Badge variant={verificationResult.electiveGroupsMatch ? "default" : "destructive"}>
                Elective: {verificationResult.electiveGroupsMatch ? '✓' : '✗'}
              </Badge>
            </div>

            {verificationResult.missingInPDF.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Missing in PDF:</strong>
                  <ul className="mt-2 list-disc list-inside">
                    {verificationResult.missingInPDF.map((subject, index) => (
                      <li key={index} className="text-sm">{subject}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {verificationResult.extraInPDF.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Extra in PDF:</strong>
                  <ul className="mt-2 list-disc list-inside">
                    {verificationResult.extraInPDF.map((subject, index) => (
                      <li key={index} className="text-sm">{subject}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <h4 className="font-semibold">PDF Subjects:</h4>
              <div className="flex flex-wrap gap-1">
                {verificationResult.details.pdfSubjects.map((subject, index) => (
                  <Badge key={index} variant="outline">{subject}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
