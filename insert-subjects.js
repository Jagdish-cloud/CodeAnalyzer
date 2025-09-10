const { db } = require('./server/database');
const { subjects } = require('./shared/schema');

const coreSubjects = [
  { subjectName: 'Mathematics', subjectType: 'core', status: 'active' },
  { subjectName: 'Science', subjectType: 'core', status: 'active' },
  { subjectName: 'English', subjectType: 'core', status: 'active' },
  { subjectName: 'Social Studies', subjectType: 'core', status: 'active' },
  { subjectName: 'Hindi', subjectType: 'core', status: 'active' },
  { subjectName: 'Physical Education', subjectType: 'core', status: 'active' }
];

const electiveSubjects = [
  { subjectName: 'French', subjectType: 'elective', status: 'active' },
  { subjectName: 'German', subjectType: 'elective', status: 'active' },
  { subjectName: 'Sanskrit', subjectType: 'elective', status: 'active' },
  { subjectName: 'Computer Science', subjectType: 'elective', status: 'active' },
  { subjectName: 'Fine Arts', subjectType: 'elective', status: 'active' },
  { subjectName: 'Music', subjectType: 'elective', status: 'active' },
  { subjectName: 'Dance', subjectType: 'elective', status: 'active' },
  { subjectName: 'Robotics', subjectType: 'elective', status: 'active' }
];

async function insertSubjects() {
  try {
    // Insert core subjects
    for (const subject of coreSubjects) {
      try {
        await db.insert(subjects).values(subject);
        console.log(`Added core subject: ${subject.subjectName}`);
      } catch (err) {
        if (err.code === '23505') { // Unique violation error code
          console.log(`Subject ${subject.subjectName} already exists, skipping...`);
        } else {
          console.error(`Error adding ${subject.subjectName}:`, err);
        }
      }
    }

    // Insert elective subjects
    for (const subject of electiveSubjects) {
      try {
        await db.insert(subjects).values(subject);
        console.log(`Added elective subject: ${subject.subjectName}`);
      } catch (err) {
        if (err.code === '23505') { // Unique violation error code
          console.log(`Subject ${subject.subjectName} already exists, skipping...`);
        } else {
          console.error(`Error adding ${subject.subjectName}:`, err);
        }
      }
    }

    console.log('All subjects have been processed');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

insertSubjects();
