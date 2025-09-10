import { db } from '../server/database';
import { timeTables, timeTableEntries, staff, subjects } from '../shared/schema';
import { eq } from 'drizzle-orm';

// Helper function to get current academic year
function getCurrentAcademicYear() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // JavaScript months are 0-based
  
  // If we're before April, we're in the previous year's academic year
  if (month < 4) {
    return `${year-1}-${year}`;
  }
  return `${year}-${year+1}`;
}

// Class 2A subject-teacher mapping
const class2ASubjects = [
  { subject: 'Mathematics', teacherName: 'Mr. David Brown' },
  { subject: 'English', teacherName: 'Mrs. Lisa Anderson' },
  { subject: 'Science', teacherName: 'Ms. Jennifer Wilson' },
  { subject: 'Hindi', teacherName: 'Mrs. Emily Davis' }, // HOD taking some classes
  { subject: 'Physical Education', teacherName: 'Mr. James Taylor' }
];

// Weekly schedule template for Class 2A
const weeklySchedule = {
  'Monday': [
    { period: 'Period-1', subject: 'Mathematics' },
    { period: 'Period-2', subject: 'English' },
    { period: 'Period-3', subject: 'Science' },
    { period: 'Period-4', subject: 'Hindi' },
    { period: 'Period-5', subject: 'Mathematics' },
    { period: 'Period-6', subject: 'Physical Education' },
    { period: 'Period-7', subject: 'English' }
  ],
  'Tuesday': [
    { period: 'Period-1', subject: 'Science' },
    { period: 'Period-2', subject: 'Mathematics' },
    { period: 'Period-3', subject: 'Hindi' },
    { period: 'Period-4', subject: 'English' },
    { period: 'Period-5', subject: 'Science' },
    { period: 'Period-6', subject: 'Mathematics' },
    { period: 'Period-7', subject: 'Physical Education' }
  ],
  'Wednesday': [
    { period: 'Period-1', subject: 'Hindi' },
    { period: 'Period-2', subject: 'Science' },
    { period: 'Period-3', subject: 'Mathematics' },
    { period: 'Period-4', subject: 'English' },
    { period: 'Period-5', subject: 'Hindi' },
    { period: 'Period-6', subject: 'Science' },
    { period: 'Period-7', subject: 'Mathematics' }
  ],
  'Thursday': [
    { period: 'Period-1', subject: 'English' },
    { period: 'Period-2', subject: 'Hindi' },
    { period: 'Period-3', subject: 'Science' },
    { period: 'Period-4', subject: 'Mathematics' },
    { period: 'Period-5', subject: 'English' },
    { period: 'Period-6', subject: 'Hindi' },
    { period: 'Period-7', subject: 'Science' }
  ],
  'Friday': [
    { period: 'Period-1', subject: 'Mathematics' },
    { period: 'Period-2', subject: 'English' },
    { period: 'Period-3', subject: 'Hindi' },
    { period: 'Period-4', subject: 'Science' },
    { period: 'Period-5', subject: 'Physical Education' },
    { period: 'Period-6', subject: 'Mathematics' },
    { period: 'Period-7', subject: 'English' }
  ],
  'Saturday': [
    { period: 'Period-1', subject: 'Science' },
    { period: 'Period-2', subject: 'Mathematics' },
    { period: 'Period-3', subject: 'English' },
    { period: 'Period-4', subject: 'Hindi' }
  ]
};

async function seedTimeTable() {
  try {
    // Step 1: Create time table record for Class 2A
    const timeTableData = {
      academicYear: getCurrentAcademicYear(),
      className: '2',
      division: 'A',
      status: 'active',
      createdAt: new Date().toISOString()
    };

    const timeTableResult = await db.insert(timeTables).values(timeTableData).returning();
    const timeTableId = timeTableResult[0].id;
    console.log(`Created time table for Class 2A with ID: ${timeTableId}`);

    // Step 2: Get all required teachers and subjects
    const teacherData = new Map();
    const subjectData = new Map();

    // Get teachers
    for (const mapping of class2ASubjects) {
      const teacherResult = await db.select().from(staff).where(eq(staff.name, mapping.teacherName)).limit(1);
      if (teacherResult.length > 0) {
        teacherData.set(mapping.teacherName, teacherResult[0].id);
      }

      const subjectResult = await db.select().from(subjects).where(eq(subjects.subjectName, mapping.subject)).limit(1);
      if (subjectResult.length > 0) {
        subjectData.set(mapping.subject, subjectResult[0].id);
      }
    }

    // Step 3: Create time table entries for each day and period
    for (const [day, periods] of Object.entries(weeklySchedule)) {
      for (const periodData of periods) {
        const subject = periodData.subject;
        const teacherName = class2ASubjects.find(s => s.subject === subject)?.teacherName;
        
        if (!teacherName) continue;

        const teacherId = teacherData.get(teacherName);
        const subjectId = subjectData.get(subject);

        if (!teacherId || !subjectId) {
          console.log(`Missing teacher or subject data for ${subject} on ${day} ${periodData.period}`);
          continue;
        }

        const entry = {
          timeTableId,
          dayOfWeek: day,
          scheduleSlot: periodData.period,
          subjectId,
          teacherId
        };

        try {
          await db.insert(timeTableEntries).values(entry);
          console.log(`Added entry for ${day} ${periodData.period}: ${subject} by ${teacherName}`);
        } catch (err: any) {
          console.error(`Error adding entry for ${day} ${periodData.period}:`, err.message);
        }
      }
    }

    console.log('Time table creation completed');
  } catch (err) {
    console.error('Error:', err);
    throw err;
  }
}

seedTimeTable();
