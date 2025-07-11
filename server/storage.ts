import {
  users,
  staff,
  classMappings,
  teacherMappings,
  roles,
  subjects,
  students,
  workingDays,
  schoolSchedule,
  type User,
  type InsertUser,
  type Staff,
  type InsertStaff,
  type ClassMapping,
  type InsertClassMapping,
  type TeacherMapping,
  type InsertTeacherMapping,
  type Role,
  type InsertRole,
  type Subject,
  type InsertSubject,
  type Student,
  type InsertStudent,
  type WorkingDay,
  type InsertWorkingDay,
  type SchoolSchedule,
  type InsertSchoolSchedule,
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getStaff(id: number): Promise<Staff | undefined>;
  getAllStaff(): Promise<Staff[]>;
  createStaff(staff: InsertStaff): Promise<Staff>;
  updateStaff(
    id: number,
    staff: Partial<InsertStaff>,
  ): Promise<Staff | undefined>;
  deleteStaff(id: number): Promise<boolean>;
  getClassMapping(id: number): Promise<ClassMapping | undefined>;
  getAllClassMappings(): Promise<ClassMapping[]>;
  createClassMapping(mapping: InsertClassMapping): Promise<ClassMapping>;
  updateClassMapping(
    id: number,
    mapping: Partial<InsertClassMapping>,
  ): Promise<ClassMapping | undefined>;
  deleteClassMapping(id: number): Promise<boolean>;
  getTeacherMapping(id: number): Promise<TeacherMapping | undefined>;
  getAllTeacherMappings(): Promise<TeacherMapping[]>;
  createTeacherMapping(mapping: InsertTeacherMapping): Promise<TeacherMapping>;
  updateTeacherMapping(
    id: number,
    mapping: Partial<InsertTeacherMapping>,
  ): Promise<TeacherMapping | undefined>;
  deleteTeacherMapping(id: number): Promise<boolean>;
  getRole(id: number): Promise<Role | undefined>;
  getAllRoles(): Promise<Role[]>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: number, role: Partial<InsertRole>): Promise<Role | undefined>;
  deleteRole(id: number): Promise<boolean>;
  getSubject(id: number): Promise<Subject | undefined>;
  getAllSubjects(): Promise<Subject[]>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  updateSubject(
    id: number,
    subject: Partial<InsertSubject>,
  ): Promise<Subject | undefined>;
  deleteSubject(id: number): Promise<boolean>;
  getStudent(id: number): Promise<Student | undefined>;
  getAllStudents(): Promise<Student[]>;
  getStudentsByClassDivision(
    classname: string,
    division: string,
  ): Promise<Student[]>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(
    id: number,
    student: Partial<InsertStudent>,
  ): Promise<Student | undefined>;
  deleteStudent(id: number): Promise<boolean>;
  getClassDivisionStats(): Promise<
    Array<{ class: string; division: string; studentCount: number }>
  >;
  getWorkingDay(id: number): Promise<WorkingDay | undefined>;
  getAllWorkingDays(): Promise<WorkingDay[]>;
  createWorkingDay(workingDay: InsertWorkingDay): Promise<WorkingDay>;
  updateWorkingDay(
    id: number,
    workingDay: Partial<InsertWorkingDay>,
  ): Promise<WorkingDay | undefined>;
  deleteWorkingDay(id: number): Promise<boolean>;
  getWorkingDayByDay(dayOfWeek: string): Promise<WorkingDay | undefined>;
  upsertWorkingDay(workingDay: InsertWorkingDay): Promise<WorkingDay>;
  getSchoolSchedule(id: number): Promise<SchoolSchedule | undefined>;
  getAllSchoolSchedules(): Promise<SchoolSchedule[]>;
  getSchoolSchedulesByDay(dayOfWeek: string): Promise<SchoolSchedule[]>;
  createSchoolSchedule(schedule: InsertSchoolSchedule): Promise<SchoolSchedule>;
  updateSchoolSchedule(
    id: number,
    schedule: Partial<InsertSchoolSchedule>,
  ): Promise<SchoolSchedule | undefined>;
  deleteSchoolSchedule(id: number): Promise<boolean>;
  getTimeTable(id: number): Promise<TimeTable | undefined>;
  getAllTimeTables(): Promise<TimeTable[]>;
  getTimeTableByClassDivision(
    className: string,
    division: string,
  ): Promise<TimeTable | undefined>;
  createTimeTable(timeTable: InsertTimeTable): Promise<TimeTable>;
  updateTimeTable(
    id: number,
    timeTable: Partial<InsertTimeTable>,
  ): Promise<TimeTable | undefined>;
  deleteTimeTable(id: number): Promise<boolean>;
  getTimeTableEntries(timeTableId: number): Promise<TimeTableEntry[]>;
  createTimeTableEntry(entry: InsertTimeTableEntry): Promise<TimeTableEntry>;
  updateTimeTableEntry(
    id: number,
    entry: Partial<InsertTimeTableEntry>,
  ): Promise<TimeTableEntry | undefined>;
  deleteTimeTableEntry(id: number): Promise<boolean>;
  getTimeTableEntriesByTimeTable(
    timeTableId: number,
  ): Promise<TimeTableEntry[]>;
  checkTeacherConflict(
    dayOfWeek: string,
    scheduleSlot: string,
    teacherId: number,
    excludeTimeTableId?: number,
  ): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private staff: Map<number, Staff>;
  private classMappings: Map<number, ClassMapping>;
  private teacherMappings: Map<number, TeacherMapping>;
  private roles: Map<number, Role>;
  private subjects: Map<number, Subject>;
  private students: Map<number, Student>;
  private workingDays: Map<number, WorkingDay>;
  private schoolSchedules: Map<number, SchoolSchedule>;
  private timeTables: Map<number, TimeTable>;
  private timeTableEntries: Map<number, TimeTableEntry>;
  private currentUserId: number;
  private currentStaffId: number;
  private currentClassMappingId: number;
  private currentTeacherMappingId: number;
  private currentRoleId: number;
  private currentSubjectId: number;
  private currentStudentId: number;
  private currentWorkingDayId: number;
  private currentSchoolScheduleId: number;
  private currentTimeTableId: number;
  private currentTimeTableEntryId: number;

  constructor() {
    this.users = new Map();
    this.staff = new Map();
    this.classMappings = new Map();
    this.teacherMappings = new Map();
    this.roles = new Map();
    this.subjects = new Map();
    this.students = new Map();
    this.workingDays = new Map();
    this.schoolSchedules = new Map();
    this.timeTables = new Map();
    this.timeTableEntries = new Map();
    this.currentUserId = 1;
    this.currentStaffId = 1;
    this.currentClassMappingId = 1;
    this.currentTeacherMappingId = 1;
    this.currentRoleId = 1;
    this.currentSubjectId = 1;
    this.currentStudentId = 1;
    this.currentWorkingDayId = 1;
    this.currentSchoolScheduleId = 1;
    this.currentTimeTableId = 1;
    this.currentTimeTableEntryId = 1;

    // Initialize with pre-defined data
    this.initializeRoles();
    this.initializeSubjects();
    this.initializeStaff();
  }

  private initializeRoles() {
    const predefinedRoles = [
      { roleName: "Principal", status: "active" },
      { roleName: "Vice Principal", status: "active" },
      { roleName: "Head of Department", status: "active" },
      { roleName: "Senior Teacher", status: "active" },
      { roleName: "Teacher", status: "active" },
      { roleName: "Assistant Teacher", status: "active" },
      { roleName: "Librarian", status: "active" },
      { roleName: "Lab Assistant", status: "active" },
      { roleName: "Administrative Officer", status: "active" },
      { roleName: "Office Assistant", status: "active" },
      { roleName: "Counselor", status: "active" },
      { roleName: "Sports Coordinator", status: "active" },
    ];

    predefinedRoles.forEach((roleData) => {
      const id = this.currentRoleId++;
      const role: Role = { id, ...roleData };
      this.roles.set(id, role);
    });
  }

  private initializeSubjects() {
    const predefinedSubjects = [
      { subjectName: "Mathematics", status: "active" },
      { subjectName: "English", status: "active" },
      { subjectName: "Science", status: "active" },
      { subjectName: "Social Studies", status: "active" },
      { subjectName: "Hindi", status: "active" },
      { subjectName: "Physics", status: "active" },
      { subjectName: "Chemistry", status: "active" },
      { subjectName: "Biology", status: "active" },
      { subjectName: "History", status: "active" },
      { subjectName: "Geography", status: "active" },
      { subjectName: "Economics", status: "active" },
      { subjectName: "Political Science", status: "active" },
      { subjectName: "Computer Science", status: "active" },
      { subjectName: "Physical Education", status: "active" },
      { subjectName: "Art & Craft", status: "active" },
      { subjectName: "Music", status: "active" },
      { subjectName: "Dance", status: "active" },
      { subjectName: "Sanskrit", status: "active" },
      { subjectName: "French", status: "active" },
      { subjectName: "German", status: "active" },
    ];

    predefinedSubjects.forEach((subjectData) => {
      const id = this.currentSubjectId++;
      const subject: Subject = { id, ...subjectData };
      this.subjects.set(id, subject);
    });
  }

  private initializeStaff() {
    const predefinedStaff = [
      {
        name: "Dr. Rajesh Kumar",
        staffId: "ST001",
        role: "Principal",
        mobileNumber: "+91-9876543210",
        email: "rajesh.kumar@school.edu",
        managerName: null,
        status: "Active",
        lastWorkingDay: null
      },
      {
        name: "Mrs. Priya Sharma",
        staffId: "ST002",
        role: "Vice Principal",
        mobileNumber: "+91-9876543211",
        email: "priya.sharma@school.edu",
        managerName: "Dr. Rajesh Kumar",
        status: "Active",
        lastWorkingDay: null
      },
      {
        name: "Mr. Amit Singh",
        staffId: "ST003",
        role: "Head of Department",
        mobileNumber: "+91-9876543212",
        email: "amit.singh@school.edu",
        managerName: "Mrs. Priya Sharma",
        status: "Active",
        lastWorkingDay: null
      },
      {
        name: "Ms. Kavya Patel",
        staffId: "ST004",
        role: "Senior Teacher",
        mobileNumber: "+91-9876543213",
        email: "kavya.patel@school.edu",
        managerName: "Mr. Amit Singh",
        status: "Active",
        lastWorkingDay: null
      },
      {
        name: "Mr. Vikram Gupta",
        staffId: "ST005",
        role: "Teacher",
        mobileNumber: "+91-9876543214",
        email: "vikram.gupta@school.edu",
        managerName: "Ms. Kavya Patel",
        status: "Active",
        lastWorkingDay: null
      },
      {
        name: "Mrs. Meera Joshi",
        staffId: "ST006",
        role: "Teacher",
        mobileNumber: "+91-9876543215",
        email: "meera.joshi@school.edu",
        managerName: "Ms. Kavya Patel",
        status: "Active",
        lastWorkingDay: null
      },
      {
        name: "Mr. Arjun Reddy",
        staffId: "ST007",
        role: "Teacher",
        mobileNumber: "+91-9876543216",
        email: "arjun.reddy@school.edu",
        managerName: "Ms. Kavya Patel",
        status: "Active",
        lastWorkingDay: null
      },
      {
        name: "Ms. Sunita Verma",
        staffId: "ST008",
        role: "Assistant Teacher",
        mobileNumber: "+91-9876543217",
        email: "sunita.verma@school.edu",
        managerName: "Mrs. Meera Joshi",
        status: "Active",
        lastWorkingDay: null
      },
      {
        name: "Mr. Rohit Agarwal",
        staffId: "ST009",
        role: "Librarian",
        mobileNumber: "+91-9876543218",
        email: "rohit.agarwal@school.edu",
        managerName: "Mrs. Priya Sharma",
        status: "Active",
        lastWorkingDay: null
      },
      {
        name: "Ms. Neha Kapoor",
        staffId: "ST010",
        role: "Lab Assistant",
        mobileNumber: "+91-9876543219",
        email: "neha.kapoor@school.edu",
        managerName: "Mr. Arjun Reddy",
        status: "Active",
        lastWorkingDay: null
      },
      {
        name: "Mr. Deepak Malhotra",
        staffId: "ST011",
        role: "Administrative Officer",
        mobileNumber: "+91-9876543220",
        email: "deepak.malhotra@school.edu",
        managerName: "Dr. Rajesh Kumar",
        status: "Active",
        lastWorkingDay: null
      },
      {
        name: "Mrs. Renu Saxena",
        staffId: "ST012",
        role: "Office Assistant",
        mobileNumber: "+91-9876543221",
        email: "renu.saxena@school.edu",
        managerName: "Mr. Deepak Malhotra",
        status: "Active",
        lastWorkingDay: null
      },
      {
        name: "Dr. Anita Rao",
        staffId: "ST013",
        role: "Counselor",
        mobileNumber: "+91-9876543222",
        email: "anita.rao@school.edu",
        managerName: "Mrs. Priya Sharma",
        status: "Active",
        lastWorkingDay: null
      },
      {
        name: "Mr. Sanjay Kumar",
        staffId: "ST014",
        role: "Sports Coordinator",
        mobileNumber: "+91-9876543223",
        email: "sanjay.kumar@school.edu",
        managerName: "Mrs. Priya Sharma",
        status: "Active",
        lastWorkingDay: null
      },
      {
        name: "Ms. Pooja Bansal",
        staffId: "ST015",
        role: "Teacher",
        mobileNumber: "+91-9876543224",
        email: "pooja.bansal@school.edu",
        managerName: "Ms. Kavya Patel",
        status: "On Leave",
        lastWorkingDay: "2025-07-01"
      }
    ];

    predefinedStaff.forEach((staffData) => {
      const id = this.currentStaffId++;
      const staff: Staff = { 
        id, 
        ...staffData,
        newRole: null
      };
      this.staff.set(id, staff);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getStaff(id: number): Promise<Staff | undefined> {
    return this.staff.get(id);
  }

  async getAllStaff(): Promise<Staff[]> {
    return Array.from(this.staff.values());
  }

  async createStaff(insertStaff: InsertStaff): Promise<Staff> {
    const id = this.currentStaffId++;
    const staffMember: Staff = {
      id,
      name: insertStaff.name,
      staffId: insertStaff.staffId,
      role: insertStaff.role,
      newRole: insertStaff.newRole || null,
      mobileNumber: insertStaff.mobileNumber,
      email: insertStaff.email,
      managerName: insertStaff.managerName ?? null,
      status: insertStaff.status,
      lastWorkingDay: insertStaff.lastWorkingDay || null,
    };
    this.staff.set(id, staffMember);
    return staffMember;
  }

  async updateStaff(
    id: number,
    updateData: Partial<InsertStaff>,
  ): Promise<Staff | undefined> {
    const existing = this.staff.get(id);
    if (!existing) return undefined;

    const updated: Staff = { ...existing, ...updateData };
    this.staff.set(id, updated);
    return updated;
  }

  async deleteStaff(id: number): Promise<boolean> {
    return this.staff.delete(id);
  }

  async getClassMapping(id: number): Promise<ClassMapping | undefined> {
    return this.classMappings.get(id);
  }

  async getAllClassMappings(): Promise<ClassMapping[]> {
    return Array.from(this.classMappings.values());
  }

  async createClassMapping(
    insertMapping: InsertClassMapping,
  ): Promise<ClassMapping> {
    const id = this.currentClassMappingId++;
    const mapping: ClassMapping = {
      ...insertMapping,
      id,
      status: insertMapping.status || "Current working",
    };
    this.classMappings.set(id, mapping);
    return mapping;
  }

  async updateClassMapping(
    id: number,
    updateData: Partial<InsertClassMapping>,
  ): Promise<ClassMapping | undefined> {
    const existing = this.classMappings.get(id);
    if (!existing) return undefined;

    const updated: ClassMapping = { ...existing, ...updateData };
    this.classMappings.set(id, updated);
    return updated;
  }

  async deleteClassMapping(id: number): Promise<boolean> {
    return this.classMappings.delete(id);
  }

  async getTeacherMapping(id: number): Promise<TeacherMapping | undefined> {
    return this.teacherMappings.get(id);
  }

  async getAllTeacherMappings(): Promise<TeacherMapping[]> {
    return Array.from(this.teacherMappings.values());
  }

  async createTeacherMapping(
    insertMapping: InsertTeacherMapping,
  ): Promise<TeacherMapping> {
    const id = this.currentTeacherMappingId++;
    const mapping: TeacherMapping = {
      ...insertMapping,
      id,
      status: insertMapping.status || "Current working",
    };
    this.teacherMappings.set(id, mapping);
    return mapping;
  }

  async updateTeacherMapping(
    id: number,
    updateData: Partial<InsertTeacherMapping>,
  ): Promise<TeacherMapping | undefined> {
    const existing = this.teacherMappings.get(id);
    if (!existing) return undefined;

    const updated: TeacherMapping = { ...existing, ...updateData };
    this.teacherMappings.set(id, updated);
    return updated;
  }

  async deleteTeacherMapping(id: number): Promise<boolean> {
    return this.teacherMappings.delete(id);
  }

  async getRole(id: number): Promise<Role | undefined> {
    return this.roles.get(id);
  }

  async getAllRoles(): Promise<Role[]> {
    return Array.from(this.roles.values());
  }

  async createRole(insertRole: InsertRole): Promise<Role> {
    const id = this.currentRoleId++;
    const role: Role = {
      id,
      roleName: insertRole.roleName,
      status: insertRole.status || "active",
    };
    this.roles.set(id, role);
    return role;
  }

  async updateRole(
    id: number,
    updateData: Partial<InsertRole>,
  ): Promise<Role | undefined> {
    const existing = this.roles.get(id);
    if (!existing) return undefined;

    const updated: Role = { ...existing, ...updateData };
    this.roles.set(id, updated);
    return updated;
  }

  async deleteRole(id: number): Promise<boolean> {
    return this.roles.delete(id);
  }

  // Subject methods
  async getSubject(id: number): Promise<Subject | undefined> {
    return this.subjects.get(id);
  }

  async getAllSubjects(): Promise<Subject[]> {
    return Array.from(this.subjects.values());
  }

  async createSubject(insertSubject: InsertSubject): Promise<Subject> {
    const id = this.currentSubjectId++;
    const subject: Subject = {
      id,
      subjectName: insertSubject.subjectName,
      status: insertSubject.status || "active",
    };
    this.subjects.set(id, subject);
    return subject;
  }

  async updateSubject(
    id: number,
    updateData: Partial<InsertSubject>,
  ): Promise<Subject | undefined> {
    const existing = this.subjects.get(id);
    if (!existing) return undefined;

    const updated: Subject = { ...existing, ...updateData };
    this.subjects.set(id, updated);
    return updated;
  }

  async deleteSubject(id: number): Promise<boolean> {
    return this.subjects.delete(id);
  }

  // Student methods
  async getStudent(id: number): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async getAllStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
  }

  async getStudentsByClassDivision(
    classname: string,
    division: string,
  ): Promise<Student[]> {
    return Array.from(this.students.values()).filter(
      (student) => student.class === classname && student.division === division,
    );
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = this.currentStudentId++;

    // Get existing students in the same class-division to determine roll number
    const existingStudents = await this.getStudentsByClassDivision(
      insertStudent.class,
      insertStudent.division,
    );

    // Sort by first name alphabetically and assign roll number
    const sortedStudents = existingStudents.sort((a, b) =>
      a.firstName.localeCompare(b.firstName),
    );

    // Find the appropriate roll number based on alphabetical order
    let rollNumber = 1;
    for (const existingStudent of sortedStudents) {
      if (
        insertStudent.firstName.localeCompare(existingStudent.firstName) > 0
      ) {
        rollNumber = existingStudent.rollNumber + 1;
      } else {
        break;
      }
    }

    // Adjust roll numbers of students that come after the new student
    for (const existingStudent of sortedStudents) {
      if (existingStudent.rollNumber >= rollNumber) {
        existingStudent.rollNumber++;
        this.students.set(existingStudent.id, existingStudent);
      }
    }

    const student: Student = {
      id,
      firstName: insertStudent.firstName,
      middleName: insertStudent.middleName || null,
      lastName: insertStudent.lastName || null,
      sex: insertStudent.sex,
      dateOfBirth: insertStudent.dateOfBirth,
      // Address fields
      flatBuildingNo: insertStudent.flatBuildingNo,
      areaLocality: insertStudent.areaLocality,
      city: insertStudent.city,
      state: insertStudent.state,
      pincode: insertStudent.pincode,
      landmark: insertStudent.landmark || null,
      // Optional contact details
      contactNumber: insertStudent.contactNumber || null,
      emailId: insertStudent.emailId || null,
      class: insertStudent.class,
      division: insertStudent.division,
      rollNumber,
      // Father information (optional)
      fatherName: insertStudent.fatherName || null,
      fatherMobileNumber: insertStudent.fatherMobileNumber || null,
      fatherEmailId: insertStudent.fatherEmailId || null,
      // Mother information (optional)
      motherName: insertStudent.motherName || null,
      motherMobileNumber: insertStudent.motherMobileNumber || null,
      motherEmailId: insertStudent.motherEmailId || null,
      // Guardian information (optional)
      guardianName: insertStudent.guardianName || null,
      guardianMobileNumber: insertStudent.guardianMobileNumber || null,
      guardianEmailId: insertStudent.guardianEmailId || null,
      guardianRelation: insertStudent.guardianRelation || null,
      apaarId: insertStudent.apaarId,
      aadharNumber: insertStudent.aadharNumber,
    };
    this.students.set(id, student);
    return student;
  }

  async updateStudent(
    id: number,
    updateData: Partial<InsertStudent>,
  ): Promise<Student | undefined> {
    const existing = this.students.get(id);
    if (!existing) return undefined;

    const updated: Student = { ...existing, ...updateData };
    this.students.set(id, updated);
    return updated;
  }

  async deleteStudent(id: number): Promise<boolean> {
    return this.students.delete(id);
  }

  async getClassDivisionStats(): Promise<
    Array<{ class: string; division: string; studentCount: number }>
  > {
    const stats = new Map<
      string,
      { class: string; division: string; studentCount: number }
    >();

    for (const student of Array.from(this.students.values())) {
      const key = `${student.class}-${student.division}`;
      if (stats.has(key)) {
        stats.get(key)!.studentCount++;
      } else {
        stats.set(key, {
          class: student.class,
          division: student.division,
          studentCount: 1,
        });
      }
    }

    return Array.from(stats.values());
  }

  async getWorkingDay(id: number): Promise<WorkingDay | undefined> {
    return this.workingDays.get(id);
  }

  async getAllWorkingDays(): Promise<WorkingDay[]> {
    return Array.from(this.workingDays.values());
  }

  async createWorkingDay(
    insertWorkingDay: InsertWorkingDay,
  ): Promise<WorkingDay> {
    const id = this.currentWorkingDayId++;
    const workingDay: WorkingDay = {
      id,
      dayOfWeek: insertWorkingDay.dayOfWeek,
      dayType: insertWorkingDay.dayType,
      alternateWeeks: insertWorkingDay.alternateWeeks || null,
      timingFrom: insertWorkingDay.timingFrom || null,
      timingTo: insertWorkingDay.timingTo || null,
    };
    this.workingDays.set(id, workingDay);
    return workingDay;
  }

  async updateWorkingDay(
    id: number,
    updateData: Partial<InsertWorkingDay>,
  ): Promise<WorkingDay | undefined> {
    const existing = this.workingDays.get(id);
    if (!existing) return undefined;

    const updated: WorkingDay = { ...existing, ...updateData };
    this.workingDays.set(id, updated);
    return updated;
  }

  async deleteWorkingDay(id: number): Promise<boolean> {
    return this.workingDays.delete(id);
  }

  async getWorkingDayByDay(dayOfWeek: string): Promise<WorkingDay | undefined> {
    const workingDaysArray = Array.from(this.workingDays.values());
    for (const workingDay of workingDaysArray) {
      if (workingDay.dayOfWeek === dayOfWeek) {
        return workingDay;
      }
    }
    return undefined;
  }

  async upsertWorkingDay(
    insertWorkingDay: InsertWorkingDay,
  ): Promise<WorkingDay> {
    const existing = await this.getWorkingDayByDay(insertWorkingDay.dayOfWeek);
    if (existing) {
      return (await this.updateWorkingDay(
        existing.id,
        insertWorkingDay,
      )) as WorkingDay;
    } else {
      return await this.createWorkingDay(insertWorkingDay);
    }
  }

  async getSchoolSchedule(id: number): Promise<SchoolSchedule | undefined> {
    return this.schoolSchedules.get(id);
  }

  async getAllSchoolSchedules(): Promise<SchoolSchedule[]> {
    return Array.from(this.schoolSchedules.values());
  }

  async getSchoolSchedulesByDay(dayOfWeek: string): Promise<SchoolSchedule[]> {
    const allSchedules = Array.from(this.schoolSchedules.values());
    return allSchedules.filter((schedule) => schedule.dayOfWeek === dayOfWeek);
  }

  async createSchoolSchedule(
    insertSchedule: InsertSchoolSchedule,
  ): Promise<SchoolSchedule> {
    const id = this.currentSchoolScheduleId++;
    const schedule: SchoolSchedule = {
      id,
      dayOfWeek: insertSchedule.dayOfWeek,
      type: insertSchedule.type,
      name: insertSchedule.name,
      timingFrom: insertSchedule.timingFrom,
      timingTo: insertSchedule.timingTo,
    };
    this.schoolSchedules.set(id, schedule);
    return schedule;
  }

  async updateSchoolSchedule(
    id: number,
    updateData: Partial<InsertSchoolSchedule>,
  ): Promise<SchoolSchedule | undefined> {
    const existing = this.schoolSchedules.get(id);
    if (!existing) return undefined;

    const updated: SchoolSchedule = { ...existing, ...updateData };
    this.schoolSchedules.set(id, updated);
    return updated;
  }

  async deleteSchoolSchedule(id: number): Promise<boolean> {
    return this.schoolSchedules.delete(id);
  }

  // Time Table methods
  async getTimeTable(id: number): Promise<TimeTable | undefined> {
    return this.timeTables.get(id);
  }

  async getAllTimeTables(): Promise<TimeTable[]> {
    return Array.from(this.timeTables.values());
  }

  async getTimeTableByClassDivision(
    className: string,
    division: string,
  ): Promise<TimeTable | undefined> {
    for (const timeTable of this.timeTables.values()) {
      if (
        timeTable.className === className &&
        timeTable.division === division
      ) {
        return timeTable;
      }
    }
    return undefined;
  }

  async createTimeTable(insertTimeTable: InsertTimeTable): Promise<TimeTable> {
    const id = this.currentTimeTableId++;
    const timeTable: TimeTable = {
      ...insertTimeTable,
      id,
      createdAt: new Date().toISOString(),
    };
    this.timeTables.set(id, timeTable);
    return timeTable;
  }

  async updateTimeTable(
    id: number,
    updateData: Partial<InsertTimeTable>,
  ): Promise<TimeTable | undefined> {
    const existing = this.timeTables.get(id);
    if (!existing) return undefined;

    const updated: TimeTable = { ...existing, ...updateData };
    this.timeTables.set(id, updated);
    return updated;
  }

  async deleteTimeTable(id: number): Promise<boolean> {
    // Delete associated entries first
    const entries = Array.from(this.timeTableEntries.values());
    for (const entry of entries) {
      if (entry.timeTableId === id) {
        this.timeTableEntries.delete(entry.id);
      }
    }

    const result = this.timeTables.delete(id);
    return result;
  }

  async getTimeTableEntries(timeTableId: number): Promise<TimeTableEntry[]> {
    const entries = Array.from(this.timeTableEntries.values());
    return entries.filter((entry) => entry.timeTableId === timeTableId);
  }

  async createTimeTableEntry(
    insertEntry: InsertTimeTableEntry,
  ): Promise<TimeTableEntry> {
    const id = this.currentTimeTableEntryId++;
    const entry: TimeTableEntry = { ...insertEntry, id };
    this.timeTableEntries.set(id, entry);
    return entry;
  }

  async updateTimeTableEntry(
    id: number,
    updateData: Partial<InsertTimeTableEntry>,
  ): Promise<TimeTableEntry | undefined> {
    const existing = this.timeTableEntries.get(id);
    if (!existing) return undefined;

    const updated: TimeTableEntry = { ...existing, ...updateData };
    this.timeTableEntries.set(id, updated);
    return updated;
  }

  async deleteTimeTableEntry(id: number): Promise<boolean> {
    const result = this.timeTableEntries.delete(id);
    return result;
  }

  async getTimeTableEntriesByTimeTable(
    timeTableId: number,
  ): Promise<TimeTableEntry[]> {
    const entries = Array.from(this.timeTableEntries.values());
    return entries.filter((entry) => entry.timeTableId === timeTableId);
  }

  async checkTeacherConflict(
    dayOfWeek: string,
    scheduleSlot: string,
    teacherId: number,
    excludeTimeTableId?: number,
  ): Promise<boolean> {
    const allEntries = Array.from(this.timeTableEntries.values());

    for (const entry of allEntries) {
      // Skip entries from excluded time table (for updates)
      if (excludeTimeTableId && entry.timeTableId === excludeTimeTableId) {
        continue;
      }

      // Check if same teacher is assigned to same day and schedule slot
      if (
        entry.dayOfWeek === dayOfWeek &&
        entry.scheduleSlot === scheduleSlot &&
        entry.teacherId === teacherId
      ) {
        return true; // Conflict found
      }
    }

    return false; // No conflict
  }
}

export const storage = new MemStorage();
