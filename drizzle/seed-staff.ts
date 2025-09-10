import { db } from '../server/database';
import { staff } from '../shared/schema';

const staffData = [
  // Principal
  {
    name: "Dr. Sarah Johnson",
    staffId: "PRIN001",
    role: "Principal",
    mobileNumber: "9876543210",
    email: "principal@school.edu",
    status: "Current working"
  },

  // Vice Principals
  {
    name: "Mr. Robert Williams",
    staffId: "VP001",
    role: "Vice Principal",
    mobileNumber: "9876543211",
    email: "vp.academics@school.edu",
    managerName: "Dr. Sarah Johnson",
    status: "Current working"
  },

  // Department Heads
  {
    name: "Mrs. Emily Davis",
    staffId: "HOD001",
    role: "Head of Science Department",
    mobileNumber: "9876543212",
    email: "science.hod@school.edu",
    managerName: "Mr. Robert Williams",
    status: "Current working"
  },
  {
    name: "Mr. Michael Chen",
    staffId: "HOD002",
    role: "Head of Mathematics Department",
    mobileNumber: "9876543213",
    email: "math.hod@school.edu",
    managerName: "Mr. Robert Williams",
    status: "Current working"
  },

  // Teachers
  {
    name: "Ms. Jennifer Wilson",
    staffId: "TCH001",
    role: "Science Teacher",
    mobileNumber: "9876543214",
    email: "jennifer.wilson@school.edu",
    managerName: "Mrs. Emily Davis",
    status: "Current working"
  },
  {
    name: "Mr. David Brown",
    staffId: "TCH002",
    role: "Mathematics Teacher",
    mobileNumber: "9876543215",
    email: "david.brown@school.edu",
    managerName: "Mr. Michael Chen",
    status: "Current working"
  },
  {
    name: "Mrs. Lisa Anderson",
    staffId: "TCH003",
    role: "English Teacher",
    mobileNumber: "9876543216",
    email: "lisa.anderson@school.edu",
    managerName: "Mr. Robert Williams",
    status: "Current working"
  },
  {
    name: "Mr. James Taylor",
    staffId: "TCH004",
    role: "Physical Education Teacher",
    mobileNumber: "9876543217",
    email: "james.taylor@school.edu",
    managerName: "Mr. Robert Williams",
    status: "Current working"
  },

  // Administrative Staff
  {
    name: "Mrs. Patricia Martinez",
    staffId: "ADM001",
    role: "Administrative Officer",
    mobileNumber: "9876543218",
    email: "admin.officer@school.edu",
    managerName: "Dr. Sarah Johnson",
    status: "Current working"
  },
  {
    name: "Mr. Thomas Clark",
    staffId: "ADM002",
    role: "Accountant",
    mobileNumber: "9876543219",
    email: "accounts@school.edu",
    managerName: "Mrs. Patricia Martinez",
    status: "Current working"
  },

  // Support Staff
  {
    name: "Mr. George White",
    staffId: "SUP001",
    role: "IT Support Specialist",
    mobileNumber: "9876543220",
    email: "it.support@school.edu",
    managerName: "Mrs. Patricia Martinez",
    status: "Current working"
  },
  {
    name: "Mrs. Susan Lee",
    staffId: "SUP002",
    role: "Librarian",
    mobileNumber: "9876543221",
    email: "librarian@school.edu",
    managerName: "Mr. Robert Williams",
    status: "Current working"
  },

  // Staff with different status
  {
    name: "Mr. Richard Moore",
    staffId: "TCH005",
    role: "History Teacher",
    newRole: "Senior History Teacher",
    mobileNumber: "9876543222",
    email: "richard.moore@school.edu",
    managerName: "Mr. Robert Williams",
    status: "Promotion pending"
  },
  {
    name: "Ms. Karen Rodriguez",
    staffId: "TCH006",
    role: "Art Teacher",
    mobileNumber: "9876543223",
    email: "karen.rodriguez@school.edu",
    managerName: "Mr. Robert Williams",
    status: "On leave",
    lastWorkingDay: "2024-06-30"
  }
];

async function seedStaff() {
  try {
    // Insert staff members
    for (const member of staffData) {
      try {
        await db.insert(staff).values(member);
        console.log(`Added staff member: ${member.name} (${member.role})`);
      } catch (err: any) {
        if (err.code === '23505') { // Unique violation error code
          console.log(`Staff member with ID ${member.staffId} or email ${member.email} already exists, skipping...`);
        } else {
          console.error(`Error adding ${member.name}:`, err);
        }
      }
    }

    console.log('All staff members have been processed');
  } catch (err) {
    console.error('Error:', err);
    throw err;
  }
}

seedStaff();
