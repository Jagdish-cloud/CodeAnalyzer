// Sample Data Population Script for Educational Management System
// This script will populate all screens with realistic sample data

const sampleData = {
  // 1. Roles Data
  roles: [
    { roleName: "Principal", status: "active" },
    { roleName: "Vice Principal", status: "active" },
    { roleName: "Head Teacher", status: "active" },
    { roleName: "Teacher", status: "active" },
    { roleName: "Assistant Teacher", status: "active" },
    { roleName: "Physical Education Teacher", status: "active" },
    { roleName: "Music Teacher", status: "active" },
    { roleName: "Art Teacher", status: "active" },
    { roleName: "Computer Teacher", status: "active" },
    { roleName: "Librarian", status: "active" },
    { roleName: "Lab Assistant", status: "active" },
    { roleName: "Administrative Staff", status: "active" }
  ],

  // 2. Subjects Data
  subjects: [
    { subjectName: "English", status: "active" },
    { subjectName: "Mathematics", status: "active" },
    { subjectName: "Science", status: "active" },
    { subjectName: "Social Science", status: "active" },
    { subjectName: "Hindi", status: "active" },
    { subjectName: "Physical Education", status: "active" },
    { subjectName: "Music", status: "active" },
    { subjectName: "Art & Craft", status: "active" },
    { subjectName: "Computer Science", status: "active" },
    { subjectName: "Environmental Studies", status: "active" },
    { subjectName: "Moral Education", status: "active" },
    { subjectName: "General Knowledge", status: "active" }
  ],

  // 3. Staff Data
  staff: [
    { name: "Dr. Rajesh Kumar", staffId: "STF001", role: "Principal", contactNumber: "9876543210", email: "principal@school.edu", address: "123 Education Lane, City", status: "active" },
    { name: "Mrs. Priya Sharma", staffId: "STF002", role: "Vice Principal", contactNumber: "9876543211", email: "vp@school.edu", address: "456 Teacher Street, City", status: "active" },
    { name: "Mr. Amit Singh", staffId: "STF003", role: "Head Teacher", contactNumber: "9876543212", email: "amit.singh@school.edu", address: "789 Academic Road, City", status: "active" },
    { name: "Ms. Sunita Devi", staffId: "STF004", role: "Teacher", contactNumber: "9876543213", email: "sunita.devi@school.edu", address: "321 School Avenue, City", status: "active" },
    { name: "Mr. Vikash Gupta", staffId: "STF005", role: "Teacher", contactNumber: "9876543214", email: "vikash.gupta@school.edu", address: "654 Education Park, City", status: "active" },
    { name: "Mrs. Meera Joshi", staffId: "STF006", role: "Teacher", contactNumber: "9876543215", email: "meera.joshi@school.edu", address: "987 Learning Center, City", status: "active" },
    { name: "Mr. Ravi Patel", staffId: "STF007", role: "Teacher", contactNumber: "9876543216", email: "ravi.patel@school.edu", address: "147 Knowledge Square, City", status: "active" },
    { name: "Ms. Kavita Verma", staffId: "STF008", role: "Teacher", contactNumber: "9876543217", email: "kavita.verma@school.edu", address: "258 Study Lane, City", status: "active" },
    { name: "Mr. Deepak Yadav", staffId: "STF009", role: "Physical Education Teacher", contactNumber: "9876543218", email: "deepak.yadav@school.edu", address: "369 Sports Complex, City", status: "active" },
    { name: "Mrs. Anita Khanna", staffId: "STF010", role: "Music Teacher", contactNumber: "9876543219", email: "anita.khanna@school.edu", address: "741 Music Hall, City", status: "active" },
    { name: "Mr. Suresh Mishra", staffId: "STF011", role: "Computer Teacher", contactNumber: "9876543220", email: "suresh.mishra@school.edu", address: "852 Tech Park, City", status: "active" },
    { name: "Ms. Pooja Agarwal", staffId: "STF012", role: "Librarian", contactNumber: "9876543221", email: "pooja.agarwal@school.edu", address: "963 Library Street, City", status: "active" }
  ],

  // 4. Class Mappings Data
  classMappings: [
    { year: "2025-26", class: "I", division: "A", subjects: ["English", "Mathematics", "Environmental Studies", "Hindi", "Art & Craft"] },
    { year: "2025-26", class: "I", division: "B", subjects: ["English", "Mathematics", "Environmental Studies", "Hindi", "Art & Craft"] },
    { year: "2025-26", class: "II", division: "A", subjects: ["English", "Mathematics", "Environmental Studies", "Hindi", "Art & Craft", "Music"] },
    { year: "2025-26", class: "II", division: "B", subjects: ["English", "Mathematics", "Environmental Studies", "Hindi", "Art & Craft", "Music"] },
    { year: "2025-26", class: "III", division: "A", subjects: ["English", "Mathematics", "Science", "Social Science", "Hindi", "Computer Science"] },
    { year: "2025-26", class: "III", division: "B", subjects: ["English", "Mathematics", "Science", "Social Science", "Hindi", "Computer Science"] },
    { year: "2025-26", class: "IV", division: "A", subjects: ["English", "Mathematics", "Science", "Social Science", "Hindi", "Physical Education"] },
    { year: "2025-26", class: "IV", division: "B", subjects: ["English", "Mathematics", "Science", "Social Science", "Hindi", "Physical Education"] },
    { year: "2025-26", class: "V", division: "A", subjects: ["English", "Mathematics", "Science", "Social Science", "Hindi", "Computer Science", "Music"] },
    { year: "2025-26", class: "V", division: "B", subjects: ["English", "Mathematics", "Science", "Social Science", "Hindi", "Computer Science", "Music"] }
  ],

  // 5. Teacher Mappings Data
  teacherMappings: [
    { class: "I", subject: "English", division: "A", teacherId: 4, isClassTeacher: true },
    { class: "I", subject: "Mathematics", division: "A", teacherId: 5, isClassTeacher: false },
    { class: "I", subject: "English", division: "B", teacherId: 6, isClassTeacher: true },
    { class: "I", subject: "Mathematics", division: "B", teacherId: 7, isClassTeacher: false },
    { class: "II", subject: "English", division: "A", teacherId: 8, isClassTeacher: true },
    { class: "II", subject: "Mathematics", division: "A", teacherId: 4, isClassTeacher: false },
    { class: "II", subject: "Music", division: "A", teacherId: 10, isClassTeacher: false },
    { class: "III", subject: "Science", division: "A", teacherId: 5, isClassTeacher: true },
    { class: "III", subject: "Mathematics", division: "A", teacherId: 6, isClassTeacher: false },
    { class: "III", subject: "Computer Science", division: "A", teacherId: 11, isClassTeacher: false },
    { class: "IV", subject: "English", division: "A", teacherId: 7, isClassTeacher: true },
    { class: "IV", subject: "Science", division: "A", teacherId: 8, isClassTeacher: false },
    { class: "IV", subject: "Physical Education", division: "A", teacherId: 9, isClassTeacher: false },
    { class: "V", subject: "Mathematics", division: "A", teacherId: 4, isClassTeacher: true },
    { class: "V", subject: "Social Science", division: "A", teacherId: 5, isClassTeacher: false },
    { class: "V", subject: "Computer Science", division: "A", teacherId: 11, isClassTeacher: false }
  ],

  // 6. Working Days Data
  workingDays: [
    { dayOfWeek: "Monday", dayType: "FullDay", timingFrom: "08:00", timingTo: "15:30", alternateWeeks: [] },
    { dayOfWeek: "Tuesday", dayType: "FullDay", timingFrom: "08:00", timingTo: "15:30", alternateWeeks: [] },
    { dayOfWeek: "Wednesday", dayType: "FullDay", timingFrom: "08:00", timingTo: "15:30", alternateWeeks: [] },
    { dayOfWeek: "Thursday", dayType: "FullDay", timingFrom: "08:00", timingTo: "15:30", alternateWeeks: [] },
    { dayOfWeek: "Friday", dayType: "FullDay", timingFrom: "08:00", timingTo: "15:30", alternateWeeks: [] },
    { dayOfWeek: "Saturday", dayType: "HalfDay", timingFrom: "08:00", timingTo: "12:00", alternateWeeks: [] },
    { dayOfWeek: "Sunday", dayType: "Holiday", timingFrom: "", timingTo: "", alternateWeeks: [] }
  ],

  // 7. School Schedule Data
  schoolSchedules: [
    // Monday
    { dayOfWeek: "Monday", type: "Others", name: "Prayer Assembly", timingFrom: "08:00", timingTo: "08:30" },
    { dayOfWeek: "Monday", type: "Period", name: "Period-1", timingFrom: "08:30", timingTo: "09:15" },
    { dayOfWeek: "Monday", type: "Period", name: "Period-2", timingFrom: "09:15", timingTo: "10:00" },
    { dayOfWeek: "Monday", type: "Break", name: "Break-1", timingFrom: "10:00", timingTo: "10:15" },
    { dayOfWeek: "Monday", type: "Period", name: "Period-3", timingFrom: "10:15", timingTo: "11:00" },
    { dayOfWeek: "Monday", type: "Period", name: "Period-4", timingFrom: "11:00", timingTo: "11:45" },
    { dayOfWeek: "Monday", type: "Break", name: "Lunch Break", timingFrom: "11:45", timingTo: "12:30" },
    { dayOfWeek: "Monday", type: "Period", name: "Period-5", timingFrom: "12:30", timingTo: "13:15" },
    { dayOfWeek: "Monday", type: "Period", name: "Period-6", timingFrom: "13:15", timingTo: "14:00" },
    { dayOfWeek: "Monday", type: "Period", name: "Period-7", timingFrom: "14:00", timingTo: "14:45" },
    { dayOfWeek: "Monday", type: "Period", name: "Period-8", timingFrom: "14:45", timingTo: "15:30" },

    // Tuesday
    { dayOfWeek: "Tuesday", type: "Others", name: "General Assembly", timingFrom: "08:00", timingTo: "08:20" },
    { dayOfWeek: "Tuesday", type: "Period", name: "Period-1", timingFrom: "08:20", timingTo: "09:05" },
    { dayOfWeek: "Tuesday", type: "Period", name: "Period-2", timingFrom: "09:05", timingTo: "09:50" },
    { dayOfWeek: "Tuesday", type: "Break", name: "Break-1", timingFrom: "09:50", timingTo: "10:05" },
    { dayOfWeek: "Tuesday", type: "Period", name: "Period-3", timingFrom: "10:05", timingTo: "10:50" },
    { dayOfWeek: "Tuesday", type: "Period", name: "Period-4", timingFrom: "10:50", timingTo: "11:35" },
    { dayOfWeek: "Tuesday", type: "Break", name: "Lunch Break", timingFrom: "11:35", timingTo: "12:20" },
    { dayOfWeek: "Tuesday", type: "Period", name: "Period-5", timingFrom: "12:20", timingTo: "13:05" },
    { dayOfWeek: "Tuesday", type: "Period", name: "Period-6", timingFrom: "13:05", timingTo: "13:50" },
    { dayOfWeek: "Tuesday", type: "Period", name: "Period-7", timingFrom: "13:50", timingTo: "14:35" },
    { dayOfWeek: "Tuesday", type: "Period", name: "Period-8", timingFrom: "14:35", timingTo: "15:20" },

    // Wednesday
    { dayOfWeek: "Wednesday", type: "Period", name: "Period-1", timingFrom: "08:00", timingTo: "08:45" },
    { dayOfWeek: "Wednesday", type: "Period", name: "Period-2", timingFrom: "08:45", timingTo: "09:30" },
    { dayOfWeek: "Wednesday", type: "Break", name: "Break-1", timingFrom: "09:30", timingTo: "09:45" },
    { dayOfWeek: "Wednesday", type: "Period", name: "Period-3", timingFrom: "09:45", timingTo: "10:30" },
    { dayOfWeek: "Wednesday", type: "Period", name: "Period-4", timingFrom: "10:30", timingTo: "11:15" },
    { dayOfWeek: "Wednesday", type: "Break", name: "Lunch Break", timingFrom: "11:15", timingTo: "12:00" },
    { dayOfWeek: "Wednesday", type: "Period", name: "Period-5", timingFrom: "12:00", timingTo: "12:45" },
    { dayOfWeek: "Wednesday", type: "Period", name: "Period-6", timingFrom: "12:45", timingTo: "13:30" },
    { dayOfWeek: "Wednesday", type: "Period", name: "Period-7", timingFrom: "13:30", timingTo: "14:15" },
    { dayOfWeek: "Wednesday", type: "Period", name: "Period-8", timingFrom: "14:15", timingTo: "15:00" },

    // Thursday & Friday (similar patterns)
    { dayOfWeek: "Thursday", type: "Period", name: "Period-1", timingFrom: "08:00", timingTo: "08:45" },
    { dayOfWeek: "Thursday", type: "Period", name: "Period-2", timingFrom: "08:45", timingTo: "09:30" },
    { dayOfWeek: "Thursday", type: "Break", name: "Break-1", timingFrom: "09:30", timingTo: "09:45" },
    { dayOfWeek: "Thursday", type: "Period", name: "Period-3", timingFrom: "09:45", timingTo: "10:30" },
    { dayOfWeek: "Thursday", type: "Period", name: "Period-4", timingFrom: "10:30", timingTo: "11:15" },
    { dayOfWeek: "Thursday", type: "Break", name: "Lunch Break", timingFrom: "11:15", timingTo: "12:00" },
    { dayOfWeek: "Thursday", type: "Period", name: "Period-5", timingFrom: "12:00", timingTo: "12:45" },
    { dayOfWeek: "Thursday", type: "Period", name: "Period-6", timingFrom: "12:45", timingTo: "13:30" },

    { dayOfWeek: "Friday", type: "Others", name: "Prayer Assembly", timingFrom: "08:00", timingTo: "08:30" },
    { dayOfWeek: "Friday", type: "Period", name: "Period-1", timingFrom: "08:30", timingTo: "09:15" },
    { dayOfWeek: "Friday", type: "Period", name: "Period-2", timingFrom: "09:15", timingTo: "10:00" },
    { dayOfWeek: "Friday", type: "Break", name: "Break-1", timingFrom: "10:00", timingTo: "10:15" },
    { dayOfWeek: "Friday", type: "Period", name: "Period-3", timingFrom: "10:15", timingTo: "11:00" },
    { dayOfWeek: "Friday", type: "Period", name: "Period-4", timingFrom: "11:00", timingTo: "11:45" },
    { dayOfWeek: "Friday", type: "Break", name: "Lunch Break", timingFrom: "11:45", timingTo: "12:30" },
    { dayOfWeek: "Friday", type: "Period", name: "Period-5", timingFrom: "12:30", timingTo: "13:15" },
    { dayOfWeek: "Friday", type: "Period", name: "Period-6", timingFrom: "13:15", timingTo: "14:00" },

    // Saturday (Half Day)
    { dayOfWeek: "Saturday", type: "Period", name: "Period-1", timingFrom: "08:00", timingTo: "08:40" },
    { dayOfWeek: "Saturday", type: "Period", name: "Period-2", timingFrom: "08:40", timingTo: "09:20" },
    { dayOfWeek: "Saturday", type: "Break", name: "Break-1", timingFrom: "09:20", timingTo: "09:30" },
    { dayOfWeek: "Saturday", type: "Period", name: "Period-3", timingFrom: "09:30", timingTo: "10:10" },
    { dayOfWeek: "Saturday", type: "Period", name: "Period-4", timingFrom: "10:10", timingTo: "10:50" },
    { dayOfWeek: "Saturday", type: "Period", name: "Period-5", timingFrom: "10:50", timingTo: "11:30" },
    { dayOfWeek: "Saturday", type: "Period", name: "Period-6", timingFrom: "11:30", timingTo: "12:00" }
  ],

  // 8. Students Data
  students: [
    // Class I-A
    { firstName: "Aarav", lastName: "Sharma", rollNumber: "IA001", className: "I", division: "A", dateOfBirth: "2019-03-15", gender: "Male", fatherName: "Rajesh Sharma", motherName: "Priya Sharma", contactNumber: "9876543301", address: "House No. 101, Green Park, City", status: "active" },
    { firstName: "Aditi", lastName: "Patel", rollNumber: "IA002", className: "I", division: "A", dateOfBirth: "2019-05-22", gender: "Female", fatherName: "Amit Patel", motherName: "Sunita Patel", contactNumber: "9876543302", address: "House No. 102, Blue Ridge, City", status: "active" },
    { firstName: "Arjun", lastName: "Kumar", rollNumber: "IA003", className: "I", division: "A", dateOfBirth: "2019-01-10", gender: "Male", fatherName: "Vikash Kumar", motherName: "Meera Kumar", contactNumber: "9876543303", address: "House No. 103, Red Hills, City", status: "active" },
    { firstName: "Avni", lastName: "Singh", rollNumber: "IA004", className: "I", division: "A", dateOfBirth: "2019-07-08", gender: "Female", fatherName: "Ravi Singh", motherName: "Kavita Singh", contactNumber: "9876543304", address: "House No. 104, Silver Heights, City", status: "active" },
    { firstName: "Dev", lastName: "Gupta", rollNumber: "IA005", className: "I", division: "A", dateOfBirth: "2019-04-18", gender: "Male", fatherName: "Deepak Gupta", motherName: "Anita Gupta", contactNumber: "9876543305", address: "House No. 105, Golden Valley, City", status: "active" },

    // Class I-B
    { firstName: "Diya", lastName: "Verma", rollNumber: "IB001", className: "I", division: "B", dateOfBirth: "2019-02-25", gender: "Female", fatherName: "Suresh Verma", motherName: "Pooja Verma", contactNumber: "9876543306", address: "House No. 106, Diamond Square, City", status: "active" },
    { firstName: "Harsh", lastName: "Joshi", rollNumber: "IB002", className: "I", division: "B", dateOfBirth: "2019-06-12", gender: "Male", fatherName: "Manoj Joshi", motherName: "Neha Joshi", contactNumber: "9876543307", address: "House No. 107, Pearl Gardens, City", status: "active" },
    { firstName: "Ishaan", lastName: "Agarwal", rollNumber: "IB003", className: "I", division: "B", dateOfBirth: "2019-08-30", gender: "Male", fatherName: "Rohit Agarwal", motherName: "Sita Agarwal", contactNumber: "9876543308", address: "House No. 108, Ruby Complex, City", status: "active" },
    { firstName: "Kavya", lastName: "Mishra", rollNumber: "IB004", className: "I", division: "B", dateOfBirth: "2019-11-14", gender: "Female", fatherName: "Ashok Mishra", motherName: "Rani Mishra", contactNumber: "9876543309", address: "House No. 109, Emerald Park, City", status: "active" },
    { firstName: "Kiran", lastName: "Yadav", rollNumber: "IB005", className: "I", division: "B", dateOfBirth: "2019-09-05", gender: "Male", fatherName: "Vijay Yadav", motherName: "Shanti Yadav", contactNumber: "9876543310", address: "House No. 110, Sapphire Heights, City", status: "active" },

    // Class II-A
    { firstName: "Manvi", lastName: "Khanna", rollNumber: "IIA001", className: "II", division: "A", dateOfBirth: "2018-03-20", gender: "Female", fatherName: "Sanjay Khanna", motherName: "Radha Khanna", contactNumber: "9876543311", address: "House No. 111, Topaz Villa, City", status: "active" },
    { firstName: "Nikhil", lastName: "Bansal", rollNumber: "IIA002", className: "II", division: "A", dateOfBirth: "2018-05-15", gender: "Male", fatherName: "Rakesh Bansal", motherName: "Manju Bansal", contactNumber: "9876543312", address: "House No. 112, Opal Residency, City", status: "active" },
    { firstName: "Priya", lastName: "Choudhary", rollNumber: "IIA003", className: "II", division: "A", dateOfBirth: "2018-07-28", gender: "Female", fatherName: "Dinesh Choudhary", motherName: "Kiran Choudhary", contactNumber: "9876543313", address: "House No. 113, Coral Gardens, City", status: "active" },
    { firstName: "Rahul", lastName: "Sinha", rollNumber: "IIA004", className: "II", division: "A", dateOfBirth: "2018-01-12", gender: "Male", fatherName: "Santosh Sinha", motherName: "Usha Sinha", contactNumber: "9876543314", address: "House No. 114, Amber Complex, City", status: "active" },
    { firstName: "Riya", lastName: "Pandey", rollNumber: "IIA005", className: "II", division: "A", dateOfBirth: "2018-09-08", gender: "Female", fatherName: "Umesh Pandey", motherName: "Gita Pandey", contactNumber: "9876543315", address: "House No. 115, Jade Heights, City", status: "active" },

    // Class III-A  
    { firstName: "Sameer", lastName: "Tiwari", rollNumber: "IIIA001", className: "III", division: "A", dateOfBirth: "2017-04-05", gender: "Male", fatherName: "Ramesh Tiwari", motherName: "Seema Tiwari", contactNumber: "9876543316", address: "House No. 116, Onyx Park, City", status: "active" },
    { firstName: "Sneha", lastName: "Dubey", rollNumber: "IIIA002", className: "III", division: "A", dateOfBirth: "2017-06-18", gender: "Female", fatherName: "Pramod Dubey", motherName: "Rekha Dubey", contactNumber: "9876543317", address: "House No. 117, Garnet Valley, City", status: "active" },
    { firstName: "Tanvi", lastName: "Saxena", rollNumber: "IIIA003", className: "III", division: "A", dateOfBirth: "2017-02-22", gender: "Female", fatherName: "Ajay Saxena", motherName: "Nisha Saxena", contactNumber: "9876543318", address: "House No. 118, Turquoise Square, City", status: "active" },
    { firstName: "Varun", lastName: "Shukla", rollNumber: "IIIA004", className: "III", division: "A", dateOfBirth: "2017-08-14", gender: "Male", fatherName: "Kamal Shukla", motherName: "Asha Shukla", contactNumber: "9876543319", address: "House No. 119, Amethyst Gardens, City", status: "active" },
    { firstName: "Yash", lastName: "Tripathi", rollNumber: "IIIA005", className: "III", division: "A", dateOfBirth: "2017-10-30", gender: "Male", fatherName: "Sunil Tripathi", motherName: "Laxmi Tripathi", contactNumber: "9876543320", address: "House No. 120, Citrine Complex, City", status: "active" },

    // Class IV-A
    { firstName: "Aakash", lastName: "Chandra", rollNumber: "IVA001", className: "IV", division: "A", dateOfBirth: "2016-01-15", gender: "Male", fatherName: "Mohan Chandra", motherName: "Sunita Chandra", contactNumber: "9876543321", address: "House No. 121, Quartz Heights, City", status: "active" },
    { firstName: "Ananya", lastName: "Jain", rollNumber: "IVA002", className: "IV", division: "A", dateOfBirth: "2016-03-28", gender: "Female", fatherName: "Naveen Jain", motherName: "Shweta Jain", contactNumber: "9876543322", address: "House No. 122, Moonstone Park, City", status: "active" },
    { firstName: "Divya", lastName: "Mehta", rollNumber: "IVA003", className: "IV", division: "A", dateOfBirth: "2016-05-12", gender: "Female", fatherName: "Vinod Mehta", motherName: "Anju Mehta", contactNumber: "9876543323", address: "House No. 123, Sunstone Villa, City", status: "active" },
    { firstName: "Gaurav", lastName: "Bhatia", rollNumber: "IVA004", className: "IV", division: "A", dateOfBirth: "2016-07-25", gender: "Male", fatherName: "Raman Bhatia", motherName: "Deepa Bhatia", contactNumber: "9876543324", address: "House No. 124, Bloodstone Gardens, City", status: "active" },
    { firstName: "Neha", lastName: "Kapoor", rollNumber: "IVA005", className: "IV", division: "A", dateOfBirth: "2016-09-08", gender: "Female", fatherName: "Ankit Kapoor", motherName: "Ritu Kapoor", contactNumber: "9876543325", address: "House No. 125, Jasper Complex, City", status: "active" },

    // Class V-A
    { firstName: "Akshay", lastName: "Malhotra", rollNumber: "VA001", className: "V", division: "A", dateOfBirth: "2015-02-18", gender: "Male", fatherName: "Pankaj Malhotra", motherName: "Kavita Malhotra", contactNumber: "9876543326", address: "House No. 126, Agate Heights, City", status: "active" },
    { firstName: "Bhavya", lastName: "Arora", rollNumber: "VA002", className: "V", division: "A", dateOfBirth: "2015-04-05", gender: "Female", fatherName: "Tarun Arora", motherName: "Priyanka Arora", contactNumber: "9876543327", address: "House No. 127, Carnelian Park, City", status: "active" },
    { firstName: "Chirag", lastName: "Bajaj", rollNumber: "VA003", className: "V", division: "A", dateOfBirth: "2015-06-22", gender: "Male", fatherName: "Ashish Bajaj", motherName: "Neetu Bajaj", contactNumber: "9876543328", address: "House No. 128, Malachite Square, City", status: "active" },
    { firstName: "Ishita", lastName: "Sethi", rollNumber: "VA004", className: "V", division: "A", dateOfBirth: "2015-08-15", gender: "Female", fatherName: "Rohit Sethi", motherName: "Smita Sethi", contactNumber: "9876543329", address: "House No. 129, Lapis Gardens, City", status: "active" },
    { firstName: "Kartik", lastName: "Goyal", rollNumber: "VA005", className: "V", division: "A", dateOfBirth: "2015-10-30", gender: "Male", fatherName: "Nitin Goyal", motherName: "Seema Goyal", contactNumber: "9876543330", address: "House No. 130, Hematite Complex, City", status: "active" }
  ]
};

console.log("Sample data structure created for all screens:");
console.log("- Roles: " + sampleData.roles.length + " entries");
console.log("- Subjects: " + sampleData.subjects.length + " entries");
console.log("- Staff: " + sampleData.staff.length + " entries");
console.log("- Class Mappings: " + sampleData.classMappings.length + " entries");
console.log("- Teacher Mappings: " + sampleData.teacherMappings.length + " entries");
console.log("- Working Days: " + sampleData.workingDays.length + " entries");
console.log("- School Schedules: " + sampleData.schoolSchedules.length + " entries");
console.log("- Students: " + sampleData.students.length + " entries");