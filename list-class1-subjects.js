// Script to list all subjects associated with Class 1 (including electives) from database
const { DatabaseStorage } = require('./server/databaseStorage');

async function listClass1Subjects() {
  const storage = new DatabaseStorage();
  
  try {
    console.log('🔍 Fetching all class mappings...');
    const allClassMappings = await storage.getAllClassMappings();
    
    // Filter for Class 1
    const class1Mappings = allClassMappings.filter(mapping => mapping.class === 'I');
    
    if (class1Mappings.length === 0) {
      console.log('❌ No class mappings found for Class 1');
      return;
    }
    
    console.log(`✅ Found ${class1Mappings.length} class mapping(s) for Class 1`);
    console.log('');
    
    // Process each division
    class1Mappings.forEach((mapping, index) => {
      console.log(`📚 Class 1 - Division ${mapping.division} (${mapping.year})`);
      console.log(`   Status: ${mapping.status}`);
      console.log('');
      
      // Core subjects
      console.log('   📖 Core Subjects:');
      if (mapping.subjects && mapping.subjects.length > 0) {
        mapping.subjects.forEach(subject => {
          console.log(`      • ${subject}`);
        });
      } else {
        console.log('      • No core subjects defined');
      }
      console.log('');
      
      // Elective groups
      console.log('   🎯 Elective Groups:');
      if (mapping.electiveGroups && mapping.electiveGroups.length > 0) {
        mapping.electiveGroups.forEach((group, groupIndex) => {
          console.log(`      ${groupIndex + 1}. ${group.groupName}:`);
          if (group.subjects && group.subjects.length > 0) {
            group.subjects.forEach(subject => {
              console.log(`         • ${subject}`);
            });
          } else {
            console.log('         • No subjects in this group');
          }
        });
      } else {
        console.log('      • No elective groups defined');
      }
      console.log('');
      
      // Summary
      const totalCoreSubjects = mapping.subjects ? mapping.subjects.length : 0;
      const totalElectiveSubjects = mapping.electiveGroups ? 
        mapping.electiveGroups.reduce((total, group) => total + (group.subjects ? group.subjects.length : 0), 0) : 0;
      
      console.log(`   📊 Summary:`);
      console.log(`      • Core subjects: ${totalCoreSubjects}`);
      console.log(`      • Elective groups: ${mapping.electiveGroups ? mapping.electiveGroups.length : 0}`);
      console.log(`      • Total elective subjects: ${totalElectiveSubjects}`);
      console.log(`      • Total subjects: ${totalCoreSubjects + totalElectiveSubjects}`);
      
      if (index < class1Mappings.length - 1) {
        console.log('');
        console.log('─'.repeat(60));
        console.log('');
      }
    });
    
    // Overall summary for Class 1
    console.log('🎓 OVERALL SUMMARY FOR CLASS 1:');
    const allCoreSubjects = new Set();
    const allElectiveSubjects = new Set();
    const allElectiveGroups = new Set();
    
    class1Mappings.forEach(mapping => {
      // Collect core subjects
      if (mapping.subjects) {
        mapping.subjects.forEach(subject => allCoreSubjects.add(subject));
      }
      
      // Collect elective subjects and groups
      if (mapping.electiveGroups) {
        mapping.electiveGroups.forEach(group => {
          allElectiveGroups.add(group.groupName);
          if (group.subjects) {
            group.subjects.forEach(subject => allElectiveSubjects.add(subject));
          }
        });
      }
    });
    
    console.log(`   • Total unique core subjects: ${allCoreSubjects.size}`);
    console.log(`   • Total unique elective groups: ${allElectiveGroups.size}`);
    console.log(`   • Total unique elective subjects: ${allElectiveSubjects.size}`);
    console.log(`   • Total unique subjects: ${allCoreSubjects.size + allElectiveSubjects.size}`);
    console.log('');
    
    console.log('📋 ALL UNIQUE CORE SUBJECTS:');
    Array.from(allCoreSubjects).sort().forEach(subject => {
      console.log(`   • ${subject}`);
    });
    console.log('');
    
    console.log('📋 ALL UNIQUE ELECTIVE SUBJECTS:');
    Array.from(allElectiveSubjects).sort().forEach(subject => {
      console.log(`   • ${subject}`);
    });
    console.log('');
    
    console.log('📋 ALL UNIQUE ELECTIVE GROUPS:');
    Array.from(allElectiveGroups).sort().forEach(group => {
      console.log(`   • ${group}`);
    });
    
  } catch (error) {
    console.error('❌ Error fetching class mappings:', error);
  }
}

// Run the script
listClass1Subjects().then(() => {
  console.log('');
  console.log('✅ Script completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
}); 