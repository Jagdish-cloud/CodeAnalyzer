import { users, staff, classMappings, teacherMappings, roles, subjects, students, type User, type InsertUser, type Staff, type InsertStaff, type ClassMapping, type InsertClassMapping, type TeacherMapping, type InsertTeacherMapping, type Role, type InsertRole, type Subject, type InsertSubject, type Student, type InsertStudent } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getStaff(id: number): Promise<Staff | undefined>;
  getAllStaff(): Promise<Staff[]>;
  createStaff(staff: InsertStaff): Promise<Staff>;
  updateStaff(id: number, staff: Partial<InsertStaff>): Promise<Staff | undefined>;
  deleteStaff(id: number): Promise<boolean>;
  getClassMapping(id: number): Promise<ClassMapping | undefined>;
  getAllClassMappings(): Promise<ClassMapping[]>;
  createClassMapping(mapping: InsertClassMapping): Promise<ClassMapping>;
  updateClassMapping(id: number, mapping: Partial<InsertClassMapping>): Promise<ClassMapping | undefined>;
  deleteClassMapping(id: number): Promise<boolean>;
  getTeacherMapping(id: number): Promise<TeacherMapping | undefined>;
  getAllTeacherMappings(): Promise<TeacherMapping[]>;
  createTeacherMapping(mapping: InsertTeacherMapping): Promise<TeacherMapping>;
  updateTeacherMapping(id: number, mapping: Partial<InsertTeacherMapping>): Promise<TeacherMapping | undefined>;
  deleteTeacherMapping(id: number): Promise<boolean>;
  getRole(id: number): Promise<Role | undefined>;
  getAllRoles(): Promise<Role[]>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: number, role: Partial<InsertRole>): Promise<Role | undefined>;
  deleteRole(id: number): Promise<boolean>;
  getSubject(id: number): Promise<Subject | undefined>;
  getAllSubjects(): Promise<Subject[]>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  updateSubject(id: number, subject: Partial<InsertSubject>): Promise<Subject | undefined>;
  deleteSubject(id: number): Promise<boolean>;
  getStudent(id: number): Promise<Student | undefined>;
  getAllStudents(): Promise<Student[]>;
  getStudentsByClassDivision(classname: string, division: string): Promise<Student[]>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, student: Partial<InsertStudent>): Promise<Student | undefined>;
  deleteStudent(id: number): Promise<boolean>;
  getClassDivisionStats(): Promise<Array<{class: string; division: string; studentCount: number}>>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private staff: Map<number, Staff>;
  private classMappings: Map<number, ClassMapping>;
  private teacherMappings: Map<number, TeacherMapping>;
  private roles: Map<number, Role>;
  private subjects: Map<number, Subject>;
  private students: Map<number, Student>;
  private currentUserId: number;
  private currentStaffId: number;
  private currentClassMappingId: number;
  private currentTeacherMappingId: number;
  private currentRoleId: number;
  private currentSubjectId: number;
  private currentStudentId: number;

  constructor() {
    this.users = new Map();
    this.staff = new Map();
    this.classMappings = new Map();
    this.teacherMappings = new Map();
    this.roles = new Map();
    this.subjects = new Map();
    this.students = new Map();
    this.currentUserId = 1;
    this.currentStaffId = 1;
    this.currentClassMappingId = 1;
    this.currentTeacherMappingId = 1;
    this.currentRoleId = 1;
    this.currentSubjectId = 1;
    this.currentStudentId = 1;
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

  async updateStaff(id: number, updateData: Partial<InsertStaff>): Promise<Staff | undefined> {
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

  async createClassMapping(insertMapping: InsertClassMapping): Promise<ClassMapping> {
    const id = this.currentClassMappingId++;
    const mapping: ClassMapping = { 
      ...insertMapping, 
      id,
      status: insertMapping.status || "Current working"
    };
    this.classMappings.set(id, mapping);
    return mapping;
  }

  async updateClassMapping(id: number, updateData: Partial<InsertClassMapping>): Promise<ClassMapping | undefined> {
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

  async createTeacherMapping(insertMapping: InsertTeacherMapping): Promise<TeacherMapping> {
    const id = this.currentTeacherMappingId++;
    const mapping: TeacherMapping = { 
      ...insertMapping, 
      id,
      status: insertMapping.status || "Current working"
    };
    this.teacherMappings.set(id, mapping);
    return mapping;
  }

  async updateTeacherMapping(id: number, updateData: Partial<InsertTeacherMapping>): Promise<TeacherMapping | undefined> {
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
      status: insertRole.status || "active"
    };
    this.roles.set(id, role);
    return role;
  }

  async updateRole(id: number, updateData: Partial<InsertRole>): Promise<Role | undefined> {
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
      status: insertSubject.status || "active"
    };
    this.subjects.set(id, subject);
    return subject;
  }

  async updateSubject(id: number, updateData: Partial<InsertSubject>): Promise<Subject | undefined> {
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

  async getStudentsByClassDivision(classname: string, division: string): Promise<Student[]> {
    return Array.from(this.students.values()).filter(
      student => student.class === classname && student.division === division
    );
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = this.currentStudentId++;
    
    // Get existing students in the same class-division to determine roll number
    const existingStudents = await this.getStudentsByClassDivision(insertStudent.class, insertStudent.division);
    
    // Sort by first name alphabetically and assign roll number
    const sortedStudents = existingStudents.sort((a, b) => a.firstName.localeCompare(b.firstName));
    
    // Find the appropriate roll number based on alphabetical order
    let rollNumber = 1;
    for (const existingStudent of sortedStudents) {
      if (insertStudent.firstName.localeCompare(existingStudent.firstName) > 0) {
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
      aadharNumber: insertStudent.aadharNumber
    };
    this.students.set(id, student);
    return student;
  }

  async updateStudent(id: number, updateData: Partial<InsertStudent>): Promise<Student | undefined> {
    const existing = this.students.get(id);
    if (!existing) return undefined;
    
    const updated: Student = { ...existing, ...updateData };
    this.students.set(id, updated);
    return updated;
  }

  async deleteStudent(id: number): Promise<boolean> {
    return this.students.delete(id);
  }

  async getClassDivisionStats(): Promise<Array<{class: string; division: string; studentCount: number}>> {
    const stats = new Map<string, {class: string; division: string; studentCount: number}>();
    
    for (const student of Array.from(this.students.values())) {
      const key = `${student.class}-${student.division}`;
      if (stats.has(key)) {
        stats.get(key)!.studentCount++;
      } else {
        stats.set(key, {
          class: student.class,
          division: student.division,
          studentCount: 1
        });
      }
    }
    
    return Array.from(stats.values());
  }
}

export const storage = new MemStorage();
