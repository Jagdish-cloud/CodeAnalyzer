// Simple script to list all subjects associated with Class 1 (including electives)
// Based on the sample data structure

// Sample data for Class 1 (from sample-data.js)
const class1Data = {
  // Core subjects for Class 1 (from sample data)
  coreSubjects: ["English", "Mathematics", "Environmental Studies", "Hindi", "Art & Craft"],
  
  // Elective groups (based on the images you provided)
  electiveGroups: [
    {
      groupName: "Elective 1 Test",
      subjects: ["German", "French"]
    },
    {
      groupName: "Elective 2", 
      subjects: ["Dance", "Music"]
    }
  ]
};

console.log('📚 ALL SUBJECTS ASSOCIATED WITH CLASS 1');
console.log('='.repeat(50));
console.log('');

// Display core subjects
console.log('📖 CORE SUBJECTS:');
class1Data.coreSubjects.forEach((subject, index) => {
  console.log(`   ${index + 1}. ${subject}`);
});
console.log('');

// Display elective groups
console.log('🎯 ELECTIVE GROUPS:');
class1Data.electiveGroups.forEach((group, groupIndex) => {
  console.log(`   ${groupIndex + 1}. ${group.groupName}:`);
  group.subjects.forEach((subject, subjectIndex) => {
    console.log(`      ${subjectIndex + 1}. ${subject}`);
  });
  console.log('');
});

// Display all elective subjects
console.log('🎨 ALL ELECTIVE SUBJECTS:');
const allElectiveSubjects = class1Data.electiveGroups.flatMap(group => group.subjects);
allElectiveSubjects.forEach((subject, index) => {
  console.log(`   ${index + 1}. ${subject}`);
});
console.log('');

// Summary
console.log('📊 SUMMARY:');
console.log(`   • Core subjects: ${class1Data.coreSubjects.length}`);
console.log(`   • Elective groups: ${class1Data.electiveGroups.length}`);
console.log(`   • Total elective subjects: ${allElectiveSubjects.length}`);
console.log(`   • Total subjects: ${class1Data.coreSubjects.length + allElectiveSubjects.length}`);
console.log('');

// Complete list of all subjects
console.log('📋 COMPLETE LIST OF ALL SUBJECTS:');
const allSubjects = [...class1Data.coreSubjects, ...allElectiveSubjects];
allSubjects.forEach((subject, index) => {
  const isCore = class1Data.coreSubjects.includes(subject);
  const type = isCore ? 'Core' : 'Elective';
  console.log(`   ${index + 1}. ${subject} (${type})`);
});
console.log('');

// Subjects by type
console.log('📋 SUBJECTS BY TYPE:');
console.log('   Core Subjects:');
class1Data.coreSubjects.forEach(subject => {
  console.log(`      • ${subject}`);
});
console.log('   Elective Subjects:');
allElectiveSubjects.forEach(subject => {
  console.log(`      • ${subject}`);
});
console.log('');

// Elective groups breakdown
console.log('📋 ELECTIVE GROUPS BREAKDOWN:');
class1Data.electiveGroups.forEach((group, index) => {
  console.log(`   ${group.groupName}:`);
  group.subjects.forEach(subject => {
    console.log(`      • ${subject}`);
  });
  if (index < class1Data.electiveGroups.length - 1) {
    console.log('');
  }
}); 