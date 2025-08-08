import { db } from './database';
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
  timeTables,
  timeTableEntries,
  syllabusMasters,
  periodicTests,
  publicHolidays,
  handBooks,
  newsletters,
  events,
  newsCirculars,
  photoGalleries,
  polls,
  surveys,
  mockTests,
  testResults,
  busRoutes,
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
  type TimeTable,
  type InsertTimeTable,
  type TimeTableEntry,
  type InsertTimeTableEntry,
  type SyllabusMaster,
  type InsertSyllabusMaster,
  type PeriodicTest,
  type InsertPeriodicTest,
  type PublicHoliday,
  type InsertPublicHoliday,
  type HandBook,
  type InsertHandBook,
  type Newsletter,
  type InsertNewsletter,
  type Event,
  type InsertEvent,
  type NewsCircular,
  type InsertNewsCircular,
  type PhotoGallery,
  type InsertPhotoGallery,
  type Poll,
  type InsertPoll,
  type Survey,
  type InsertSurvey,
  type MockTest,
  type InsertMockTest,
  type TestResult,
  type InsertTestResult,
  type BusRoute,
  type InsertBusRoute,
} from '@shared/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';

export class DatabaseStorage {
  constructor() {
    console.log('✅ Database storage initialized with PostgreSQL connection');
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  // Staff methods
  async getStaff(id: number): Promise<Staff | undefined> {
    const result = await db.select().from(staff).where(eq(staff.id, id)).limit(1);
    return result[0];
  }

  async getAllStaff(): Promise<Staff[]> {
    return await db.select().from(staff).orderBy(desc(staff.id));
  }

  async createStaff(staffMember: InsertStaff): Promise<Staff> {
    const result = await db.insert(staff).values(staffMember).returning();
    return result[0];
  }

  async updateStaff(id: number, updateData: Partial<InsertStaff>): Promise<Staff | undefined> {
    const result = await db.update(staff).set(updateData).where(eq(staff.id, id)).returning();
    return result[0];
  }

  async deleteStaff(id: number): Promise<boolean> {
    const result = await db.delete(staff).where(eq(staff.id, id)).returning();
    return result.length > 0;
  }

  // Class Mapping methods - Core functionality
  async getClassMapping(id: number): Promise<ClassMapping | undefined> {
    const result = await db.select().from(classMappings).where(eq(classMappings.id, id)).limit(1);
    return result[0];
  }

  async getAllClassMappings(): Promise<ClassMapping[]> {
    try {
      console.log('Attempting to fetch all class mappings...');
      const result = await db.select().from(classMappings);
      console.log(`✅ Successfully fetched ${result.length} class mappings`);
      return result;
    } catch (error) {
      console.error('❌ Error fetching class mappings:', error);
      throw error;
    }
  }

  async createClassMapping(mapping: InsertClassMapping): Promise<ClassMapping> {
    const result = await db.insert(classMappings).values(mapping as any).returning();
    return result[0];
  }

  async updateClassMapping(id: number, updateData: Partial<InsertClassMapping>): Promise<ClassMapping | undefined> {
    const result = await db.update(classMappings).set(updateData as any).where(eq(classMappings.id, id)).returning();
    return result[0];
  }

  async deleteClassMapping(id: number): Promise<boolean> {
    const result = await db.delete(classMappings).where(eq(classMappings.id, id)).returning();
    return result.length > 0;
  }

  // Teacher Mapping methods
  async getTeacherMapping(id: number): Promise<TeacherMapping | undefined> {
    const result = await db.select().from(teacherMappings).where(eq(teacherMappings.id, id)).limit(1);
    return result[0];
  }

  async getAllTeacherMappings(): Promise<TeacherMapping[]> {
    return await db.select().from(teacherMappings).orderBy(desc(teacherMappings.id));
  }

  async createTeacherMapping(mapping: InsertTeacherMapping): Promise<TeacherMapping> {
    const result = await db.insert(teacherMappings).values(mapping as any).returning();
    return result[0];
  }

  async updateTeacherMapping(id: number, updateData: Partial<InsertTeacherMapping>): Promise<TeacherMapping | undefined> {
    const result = await db.update(teacherMappings).set(updateData as any).where(eq(teacherMappings.id, id)).returning();
    return result[0];
  }

  async deleteTeacherMapping(id: number): Promise<boolean> {
    const result = await db.delete(teacherMappings).where(eq(teacherMappings.id, id)).returning();
    return result.length > 0;
  }

  // Role methods
  async getRole(id: number): Promise<Role | undefined> {
    const result = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
    return result[0];
  }

  async getAllRoles(): Promise<Role[]> {
    return await db.select().from(roles).orderBy(desc(roles.id));
  }

  async createRole(role: InsertRole): Promise<Role> {
    const result = await db.insert(roles).values(role).returning();
    return result[0];
  }

  async updateRole(id: number, updateData: Partial<InsertRole>): Promise<Role | undefined> {
    const result = await db.update(roles).set(updateData).where(eq(roles.id, id)).returning();
    return result[0];
  }

  async deleteRole(id: number): Promise<boolean> {
    const result = await db.delete(roles).where(eq(roles.id, id)).returning();
    return result.length > 0;
  }

  // Subject methods
  async getSubject(id: number): Promise<Subject | undefined> {
    const result = await db.select().from(subjects).where(eq(subjects.id, id)).limit(1);
    return result[0];
  }

  async getAllSubjects(): Promise<Subject[]> {
    return await db.select().from(subjects).orderBy(desc(subjects.id));
  }

  async getSubjectsByType(subjectType: "core" | "elective"): Promise<Subject[]> {
    return await db.select().from(subjects).where(eq(subjects.subjectType, subjectType)).orderBy(desc(subjects.id));
  }

  async createSubject(subject: InsertSubject): Promise<Subject> {
    const result = await db.insert(subjects).values(subject).returning();
    return result[0];
  }

  async updateSubject(id: number, updateData: Partial<InsertSubject>): Promise<Subject | undefined> {
    const result = await db.update(subjects).set(updateData).where(eq(subjects.id, id)).returning();
    return result[0];
  }

  async deleteSubject(id: number): Promise<boolean> {
    const result = await db.delete(subjects).where(eq(subjects.id, id)).returning();
    return result.length > 0;
  }

  // Student methods - Simplified
  async getStudent(id: number): Promise<Student | undefined> {
    const result = await db.select().from(students).where(eq(students.id, id)).limit(1);
    return result[0];
  }

  async getAllStudents(): Promise<Student[]> {
    return await db.select().from(students).orderBy(desc(students.id));
  }

  async getStudentsByClassDivision(classname: string, division: string): Promise<Student[]> {
    return await db.select().from(students)
      .where(and(eq(students.class, classname), eq(students.division, division)))
      .orderBy(students.rollNumber);
  }

  async updateStudentElectiveSubjects(studentId: number, electiveSubjects: string[]): Promise<Student | undefined> {
    const result = await db.update(students)
      .set({ selectedElectiveGroups: electiveSubjects as any })
      .where(eq(students.id, studentId))
      .returning();
    return result[0];
  }

  async getStudentsWithElectiveSubject(subjectName: string): Promise<Student[]> {
    const allStudents = await this.getAllStudents();
    return allStudents.filter(student => {
      const selectedGroups = student.selectedElectiveGroups as any[];
      return selectedGroups?.some(group => group.selectedSubject === subjectName);
    });
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    // Get all students in the same class and division
    const existingStudents = await this.getStudentsByClassDivision(student.class, student.division);
    
    // Sort existing students by first name to determine alphabetical order
    const sortedStudents = existingStudents.sort((a, b) => 
      a.firstName.localeCompare(b.firstName)
    );
    
    // Find the position where the new student should be inserted alphabetically
    let insertPosition = sortedStudents.length;
    for (let i = 0; i < sortedStudents.length; i++) {
      if (student.firstName.localeCompare(sortedStudents[i].firstName) < 0) {
        insertPosition = i;
        break;
      }
    }
    
    // Generate roll number based on alphabetical position (1-based)
    const rollNumber = insertPosition + 1;
    
    // Update roll numbers for students that come after the new student alphabetically
    for (let i = insertPosition; i < sortedStudents.length; i++) {
      await db.update(students)
        .set({ rollNumber: i + 2 }) // +2 because we're shifting everyone by 1 and new student takes position +1
        .where(eq(students.id, sortedStudents[i].id));
    }
    
    // Insert the new student with the calculated roll number
    const result = await db.insert(students).values({
      ...student,
      rollNumber
    } as any).returning();
    
    return result[0];
  }

  async updateStudent(id: number, updateData: Partial<InsertStudent>): Promise<Student | undefined> {
    const result = await db.update(students).set(updateData as any).where(eq(students.id, id)).returning();
    return result[0];
  }

  async deleteStudent(id: number): Promise<boolean> {
    const result = await db.delete(students).where(eq(students.id, id)).returning();
    return result.length > 0;
  }

  // Utility function to reorder roll numbers for a class-division based on alphabetical order
  async reorderRollNumbers(className: string, division: string): Promise<void> {
    const existingStudents = await this.getStudentsByClassDivision(className, division);
    
    // Sort students by first name alphabetically
    const sortedStudents = existingStudents.sort((a, b) => 
      a.firstName.localeCompare(b.firstName)
    );
    
    // Update roll numbers based on alphabetical order
    for (let i = 0; i < sortedStudents.length; i++) {
      await db.update(students)
        .set({ rollNumber: i + 1 })
        .where(eq(students.id, sortedStudents[i].id));
    }
  }

  async getClassDivisionStats(): Promise<Array<{ class: string; division: string; studentCount: number }>> {
    const students = await this.getAllStudents();
    const stats = new Map<string, number>();
    
    students.forEach(student => {
      const key = `${student.class}-${student.division}`;
      stats.set(key, (stats.get(key) || 0) + 1);
    });
    
    return Array.from(stats.entries()).map(([key, count]) => {
      const [class_, division] = key.split('-');
      return { class: class_, division, studentCount: count };
    });
  }

  // Working Day methods
  async getWorkingDay(id: number): Promise<WorkingDay | undefined> {
    const result = await db.select().from(workingDays).where(eq(workingDays.id, id)).limit(1);
    return result[0];
  }

  async getAllWorkingDays(): Promise<WorkingDay[]> {
    return await db.select().from(workingDays).orderBy(workingDays.id);
  }

  async createWorkingDay(workingDay: InsertWorkingDay): Promise<WorkingDay> {
    const result = await db.insert(workingDays).values(workingDay).returning();
    return result[0];
  }

  async updateWorkingDay(id: number, updateData: Partial<InsertWorkingDay>): Promise<WorkingDay | undefined> {
    const result = await db.update(workingDays).set(updateData).where(eq(workingDays.id, id)).returning();
    return result[0];
  }

  async deleteWorkingDay(id: number): Promise<boolean> {
    const result = await db.delete(workingDays).where(eq(workingDays.id, id)).returning();
    return result.length > 0;
  }

  async getWorkingDayByDay(dayOfWeek: string): Promise<WorkingDay | undefined> {
    const result = await db.select().from(workingDays).where(eq(workingDays.dayOfWeek, dayOfWeek)).limit(1);
    return result[0];
  }

  async upsertWorkingDay(workingDay: InsertWorkingDay): Promise<WorkingDay> {
    const existing = await this.getWorkingDayByDay(workingDay.dayOfWeek);
    if (existing) {
      const result = await db.update(workingDays)
        .set(workingDay)
        .where(eq(workingDays.id, existing.id))
        .returning();
      return result[0];
    } else {
      return await this.createWorkingDay(workingDay);
    }
  }

  // School Schedule methods
  async getSchoolSchedule(id: number): Promise<SchoolSchedule | undefined> {
    const result = await db.select().from(schoolSchedule).where(eq(schoolSchedule.id, id)).limit(1);
    return result[0];
  }

  async getAllSchoolSchedules(): Promise<SchoolSchedule[]> {
    return await db.select().from(schoolSchedule).orderBy(desc(schoolSchedule.id));
  }

  async getSchoolSchedulesByDay(dayOfWeek: string): Promise<SchoolSchedule[]> {
    return await db.select().from(schoolSchedule).where(eq(schoolSchedule.dayOfWeek, dayOfWeek));
  }

  async createSchoolSchedule(schedule: InsertSchoolSchedule): Promise<SchoolSchedule> {
    const result = await db.insert(schoolSchedule).values(schedule).returning();
    return result[0];
  }

  async updateSchoolSchedule(id: number, updateData: Partial<InsertSchoolSchedule>): Promise<SchoolSchedule | undefined> {
    const result = await db.update(schoolSchedule).set(updateData).where(eq(schoolSchedule.id, id)).returning();
    return result[0];
  }

  async deleteSchoolSchedule(id: number): Promise<boolean> {
    const result = await db.delete(schoolSchedule).where(eq(schoolSchedule.id, id)).returning();
    return result.length > 0;
  }

  // Time Table methods - Simplified
  async getTimeTable(id: number): Promise<TimeTable | undefined> {
    const result = await db.select().from(timeTables).where(eq(timeTables.id, id)).limit(1);
    return result[0];
  }

  async getAllTimeTables(): Promise<TimeTable[]> {
    return await db.select().from(timeTables).orderBy(desc(timeTables.id));
  }

  async getTimeTableByClassDivision(className: string, division: string): Promise<TimeTable | undefined> {
    const result = await db.select().from(timeTables)
      .where(and(eq(timeTables.className, className), eq(timeTables.division, division)))
      .limit(1);
    return result[0];
  }

  async createTimeTable(timeTable: InsertTimeTable): Promise<TimeTable> {
    const result = await db.insert(timeTables).values(timeTable as any).returning();
    return result[0];
  }

  async updateTimeTable(id: number, updateData: Partial<InsertTimeTable>): Promise<TimeTable | undefined> {
    const result = await db.update(timeTables).set(updateData as any).where(eq(timeTables.id, id)).returning();
    return result[0];
  }

  async deleteTimeTable(id: number): Promise<boolean> {
    const result = await db.delete(timeTables).where(eq(timeTables.id, id)).returning();
    return result.length > 0;
  }

  // Time Table Entry methods
  async getTimeTableEntries(timeTableId: number): Promise<TimeTableEntry[]> {
    return await db.select().from(timeTableEntries).where(eq(timeTableEntries.timeTableId, timeTableId));
  }

  async createTimeTableEntry(entry: InsertTimeTableEntry): Promise<TimeTableEntry> {
    const result = await db.insert(timeTableEntries).values(entry as any).returning();
    return result[0];
  }

  async updateTimeTableEntry(id: number, updateData: Partial<InsertTimeTableEntry>): Promise<TimeTableEntry | undefined> {
    const result = await db.update(timeTableEntries).set(updateData as any).where(eq(timeTableEntries.id, id)).returning();
    return result[0];
  }

  async deleteTimeTableEntry(id: number): Promise<boolean> {
    const result = await db.delete(timeTableEntries).where(eq(timeTableEntries.id, id)).returning();
    return result.length > 0;
  }

  async getTimeTableEntriesByTimeTable(timeTableId: number): Promise<TimeTableEntry[]> {
    return await this.getTimeTableEntries(timeTableId);
  }

  async checkTeacherConflict(dayOfWeek: string, scheduleSlot: string, teacherId: number, excludeTimeTableId?: number): Promise<boolean> {
    return false;
  }

  // Syllabus Master methods - Simplified
  async getSyllabusMaster(id: number): Promise<SyllabusMaster | undefined> {
    const result = await db.select().from(syllabusMasters).where(eq(syllabusMasters.id, id)).limit(1);
    return result[0];
  }

  async getAllSyllabusMasters(): Promise<SyllabusMaster[]> {
    return await db.select().from(syllabusMasters).orderBy(desc(syllabusMasters.id));
  }

  async getSyllabusMastersByClassDivision(className: string, divisions: string[]): Promise<SyllabusMaster[]> {
    return await db.select().from(syllabusMasters)
      .where(eq(syllabusMasters.class, className));
  }

  async createSyllabusMaster(syllabus: InsertSyllabusMaster): Promise<SyllabusMaster> {
    const result = await db.insert(syllabusMasters).values(syllabus as any).returning();
    return result[0];
  }

  async updateSyllabusMaster(id: number, updateData: Partial<InsertSyllabusMaster>): Promise<SyllabusMaster | undefined> {
    const result = await db.update(syllabusMasters).set(updateData as any).where(eq(syllabusMasters.id, id)).returning();
    return result[0];
  }

  async deleteSyllabusMaster(id: number): Promise<boolean> {
    const result = await db.delete(syllabusMasters).where(eq(syllabusMasters.id, id)).returning();
    return result.length > 0;
  }

  // Periodic Test methods
  async getPeriodicTest(id: number): Promise<PeriodicTest | undefined> {
    const result = await db.select().from(periodicTests).where(eq(periodicTests.id, id)).limit(1);
    return result[0];
  }

  async getAllPeriodicTests(): Promise<PeriodicTest[]> {
    return await db.select().from(periodicTests).orderBy(desc(periodicTests.id));
  }

  async createPeriodicTest(test: InsertPeriodicTest): Promise<PeriodicTest> {
    const result = await db.insert(periodicTests).values(test as any).returning();
    return result[0];
  }

  async updatePeriodicTest(id: number, updateData: Partial<InsertPeriodicTest>): Promise<PeriodicTest | undefined> {
    const result = await db.update(periodicTests).set(updateData as any).where(eq(periodicTests.id, id)).returning();
    return result[0];
  }

  async deletePeriodicTest(id: number): Promise<boolean> {
    const result = await db.delete(periodicTests).where(eq(periodicTests.id, id)).returning();
    return result.length > 0;
  }

  // Public Holiday methods
  async getPublicHoliday(id: number): Promise<PublicHoliday | undefined> {
    const result = await db.select().from(publicHolidays).where(eq(publicHolidays.id, id)).limit(1);
    return result[0];
  }

  async getAllPublicHolidays(): Promise<PublicHoliday[]> {
    return await db.select().from(publicHolidays).orderBy(desc(publicHolidays.id));
  }

  async getPublicHolidaysByYear(year: string): Promise<PublicHoliday[]> {
    return await db.select().from(publicHolidays).where(eq(publicHolidays.year, year)).orderBy(desc(publicHolidays.id));
  }

  async createPublicHoliday(holiday: InsertPublicHoliday): Promise<PublicHoliday> {
    const result = await db.insert(publicHolidays).values(holiday).returning();
    return result[0];
  }

  async updatePublicHoliday(id: number, updateData: Partial<InsertPublicHoliday>): Promise<PublicHoliday | undefined> {
    const result = await db.update(publicHolidays).set(updateData).where(eq(publicHolidays.id, id)).returning();
    return result[0];
  }

  async deletePublicHoliday(id: number): Promise<boolean> {
    const result = await db.delete(publicHolidays).where(eq(publicHolidays.id, id)).returning();
    return result.length > 0;
  }

  // Hand Book methods
  async getHandBook(id: number): Promise<HandBook | undefined> {
    const result = await db.select().from(handBooks).where(eq(handBooks.id, id)).limit(1);
    return result[0];
  }

  async getAllHandBooks(): Promise<HandBook[]> {
    return await db.select().from(handBooks).orderBy(desc(handBooks.id));
  }

  async getHandBooksByYear(year: string): Promise<HandBook[]> {
    return await db.select().from(handBooks).where(eq(handBooks.year, year)).orderBy(desc(handBooks.id));
  }

  async createHandBook(handBook: InsertHandBook): Promise<HandBook> {
    const result = await db.insert(handBooks).values(handBook).returning();
    return result[0];
  }

  async updateHandBook(id: number, updateData: Partial<InsertHandBook>): Promise<HandBook | undefined> {
    const result = await db.update(handBooks).set(updateData).where(eq(handBooks.id, id)).returning();
    return result[0];
  }

  async deleteHandBook(id: number): Promise<boolean> {
    const result = await db.delete(handBooks).where(eq(handBooks.id, id)).returning();
    return result.length > 0;
  }

  // Newsletter methods
  async getNewsletter(id: number): Promise<Newsletter | undefined> {
    const result = await db.select().from(newsletters).where(eq(newsletters.id, id)).limit(1);
    return result[0];
  }

  async getAllNewsletters(): Promise<Newsletter[]> {
    return await db.select().from(newsletters).orderBy(desc(newsletters.id));
  }

  async createNewsletter(newsletter: InsertNewsletter): Promise<Newsletter> {
    const result = await db.insert(newsletters).values(newsletter).returning();
    return result[0];
  }

  async updateNewsletter(id: number, updateData: Partial<InsertNewsletter>): Promise<Newsletter | undefined> {
    const result = await db.update(newsletters).set(updateData).where(eq(newsletters.id, id)).returning();
    return result[0];
  }

  async deleteNewsletter(id: number): Promise<boolean> {
    const result = await db.delete(newsletters).where(eq(newsletters.id, id)).returning();
    return result.length > 0;
  }

  // Event methods
  async getEvent(id: number): Promise<Event | undefined> {
    const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
    return result[0];
  }

  async getAllEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(desc(events.id));
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const result = await db.insert(events).values(event).returning();
    return result[0];
  }

  async updateEvent(id: number, updateData: Partial<InsertEvent>): Promise<Event | undefined> {
    const result = await db.update(events).set(updateData).where(eq(events.id, id)).returning();
    return result[0];
  }

  async deleteEvent(id: number): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id)).returning();
    return result.length > 0;
  }

  // Bus Route methods - Simplified
  async getBusRoute(id: number): Promise<BusRoute | undefined> {
    const result = await db.select().from(busRoutes).where(eq(busRoutes.id, id)).limit(1);
    return result[0];
  }

  async getAllBusRoutes(): Promise<BusRoute[]> {
    return await db.select().from(busRoutes).orderBy(desc(busRoutes.id));
  }

  async createBusRoute(busRoute: InsertBusRoute): Promise<BusRoute> {
    const result = await db.insert(busRoutes).values(busRoute as any).returning();
    return result[0];
  }

  async updateBusRoute(id: number, updateData: Partial<InsertBusRoute>): Promise<BusRoute | undefined> {
    const result = await db.update(busRoutes).set(updateData as any).where(eq(busRoutes.id, id)).returning();
    return result[0];
  }

  async deleteBusRoute(id: number): Promise<boolean> {
    const result = await db.delete(busRoutes).where(eq(busRoutes.id, id)).returning();
    return result.length > 0;
  }

  // News Circular methods
  async getNewsCircular(id: number): Promise<NewsCircular | undefined> {
    const result = await db.select().from(newsCirculars).where(eq(newsCirculars.id, id)).limit(1);
    return result[0];
  }

  async getAllNewsCirculars(): Promise<NewsCircular[]> {
    return await db.select().from(newsCirculars).orderBy(desc(newsCirculars.id));
  }

  async createNewsCircular(newsCircular: InsertNewsCircular): Promise<NewsCircular> {
    const result = await db.insert(newsCirculars).values(newsCircular).returning();
    return result[0];
  }

  async updateNewsCircular(id: number, updateData: Partial<InsertNewsCircular>): Promise<NewsCircular | undefined> {
    const result = await db.update(newsCirculars).set(updateData).where(eq(newsCirculars.id, id)).returning();
    return result[0];
  }

  async deleteNewsCircular(id: number): Promise<boolean> {
    const result = await db.delete(newsCirculars).where(eq(newsCirculars.id, id)).returning();
    return result.length > 0;
  }

  // Photo Gallery methods
  async getPhotoGallery(id: number): Promise<PhotoGallery | undefined> {
    const result = await db.select().from(photoGalleries).where(eq(photoGalleries.id, id)).limit(1);
    return result[0];
  }

  async getAllPhotoGalleries(): Promise<PhotoGallery[]> {
    return await db.select().from(photoGalleries).orderBy(desc(photoGalleries.id));
  }

  async createPhotoGallery(photoGallery: InsertPhotoGallery): Promise<PhotoGallery> {
    const result = await db.insert(photoGalleries).values(photoGallery).returning();
    return result[0];
  }

  async updatePhotoGallery(id: number, updateData: Partial<InsertPhotoGallery>): Promise<PhotoGallery | undefined> {
    const result = await db.update(photoGalleries).set(updateData).where(eq(photoGalleries.id, id)).returning();
    return result[0];
  }

  async deletePhotoGallery(id: number): Promise<boolean> {
    const result = await db.delete(photoGalleries).where(eq(photoGalleries.id, id)).returning();
    return result.length > 0;
  }

  // Poll methods - Simplified
  async getAllPolls(): Promise<Poll[]> {
    return await db.select().from(polls).orderBy(desc(polls.id));
  }

  async getPoll(id: number): Promise<Poll | undefined> {
    const result = await db.select().from(polls).where(eq(polls.id, id)).limit(1);
    return result[0];
  }

  async createPoll(poll: InsertPoll): Promise<Poll> {
    const result = await db.insert(polls).values(poll as any).returning();
    return result[0];
  }

  async updatePoll(id: number, updateData: Partial<InsertPoll>): Promise<Poll | undefined> {
    const result = await db.update(polls).set(updateData as any).where(eq(polls.id, id)).returning();
    return result[0];
  }

  async deletePoll(id: number): Promise<boolean> {
    const result = await db.delete(polls).where(eq(polls.id, id)).returning();
    return result.length > 0;
  }

  // Survey methods - Simplified
  async getAllSurveys(): Promise<Survey[]> {
    return await db.select().from(surveys).orderBy(desc(surveys.id));
  }

  async getSurvey(id: number): Promise<Survey | undefined> {
    const result = await db.select().from(surveys).where(eq(surveys.id, id)).limit(1);
    return result[0];
  }

  async createSurvey(survey: InsertSurvey): Promise<Survey> {
    const result = await db.insert(surveys).values(survey as any).returning();
    return result[0];
  }

  async updateSurvey(id: number, updateData: Partial<InsertSurvey>): Promise<Survey | undefined> {
    const result = await db.update(surveys).set(updateData as any).where(eq(surveys.id, id)).returning();
    return result[0];
  }

  async deleteSurvey(id: number): Promise<boolean> {
    const result = await db.delete(surveys).where(eq(surveys.id, id)).returning();
    return result.length > 0;
  }

  // Mock Test methods - Simplified
  async getAllMockTests(): Promise<MockTest[]> {
    return await db.select().from(mockTests).orderBy(desc(mockTests.id));
  }

  async getMockTest(id: number): Promise<MockTest | undefined> {
    const result = await db.select().from(mockTests).where(eq(mockTests.id, id)).limit(1);
    return result[0];
  }

  async createMockTest(mockTest: InsertMockTest): Promise<MockTest> {
    const result = await db.insert(mockTests).values(mockTest as any).returning();
    return result[0];
  }

  async updateMockTest(id: number, updateData: Partial<InsertMockTest>): Promise<MockTest | undefined> {
    const result = await db.update(mockTests).set(updateData as any).where(eq(mockTests.id, id)).returning();
    return result[0];
  }

  async deleteMockTest(id: number): Promise<boolean> {
    const result = await db.delete(mockTests).where(eq(mockTests.id, id)).returning();
    return result.length > 0;
  }

  // Test Result methods
  async getAllTestResults(): Promise<TestResult[]> {
    return await db.select().from(testResults).orderBy(desc(testResults.id));
  }

  async getTestResult(id: number): Promise<TestResult | undefined> {
    const result = await db.select().from(testResults).where(eq(testResults.id, id)).limit(1);
    return result[0];
  }

  async getTestResultsByPeriodicTest(periodicTestId: number): Promise<TestResult[]> {
    return await db.select().from(testResults).where(eq(testResults.periodicTestId, periodicTestId));
  }

  async getTestResultsByClassDivision(className: string, division: string): Promise<TestResult[]> {
    return await db.select().from(testResults)
      .where(and(eq(testResults.class, className), eq(testResults.division, division)));
  }

  async createTestResult(testResult: InsertTestResult): Promise<TestResult> {
    const result = await db.insert(testResults).values(testResult).returning();
    return result[0];
  }

  async updateTestResult(id: number, updateData: Partial<InsertTestResult>): Promise<TestResult | undefined> {
    const result = await db.update(testResults).set(updateData).where(eq(testResults.id, id)).returning();
    return result[0];
  }

  async deleteTestResult(id: number): Promise<boolean> {
    const result = await db.delete(testResults).where(eq(testResults.id, id)).returning();
    return result.length > 0;
  }

  async bulkCreateTestResults(testResults: InsertTestResult[]): Promise<TestResult[]> {
    const result = await db.insert(testResults).values(testResults as any).returning();
    return result as TestResult[];
  }
} 