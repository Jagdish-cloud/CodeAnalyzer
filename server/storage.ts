import { DatabaseStorage } from './databaseStorage';

// Storage interface for type safety
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
  getSubjectsByType(subjectType: "core" | "elective"): Promise<Subject[]>;
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
  updateStudentElectiveSubjects(
    studentId: number,
    electiveSubjects: string[]
  ): Promise<Student | undefined>;
  getStudentsWithElectiveSubject(
    subjectName: string
  ): Promise<Student[]>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(
    id: number,
    student: Partial<InsertStudent>,
  ): Promise<Student | undefined>;
  deleteStudent(id: number): Promise<boolean>;
  reorderRollNumbers(className: string, division: string): Promise<void>;
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
  getSyllabusMaster(id: number): Promise<SyllabusMaster | undefined>;
  getAllSyllabusMasters(): Promise<SyllabusMaster[]>;
  getSyllabusMastersByClassDivision(
    className: string,
    divisions: string[],
  ): Promise<SyllabusMaster[]>;
  createSyllabusMaster(syllabus: InsertSyllabusMaster): Promise<SyllabusMaster>;
  updateSyllabusMaster(
    id: number,
    syllabus: Partial<InsertSyllabusMaster>,
  ): Promise<SyllabusMaster | undefined>;
  deleteSyllabusMaster(id: number): Promise<boolean>;
  getPeriodicTest(id: number): Promise<PeriodicTest | undefined>;
  getAllPeriodicTests(): Promise<PeriodicTest[]>;
  createPeriodicTest(test: InsertPeriodicTest): Promise<PeriodicTest>;
  updatePeriodicTest(
    id: number,
    test: Partial<InsertPeriodicTest>,
  ): Promise<PeriodicTest | undefined>;
  deletePeriodicTest(id: number): Promise<boolean>;
  getPublicHoliday(id: number): Promise<PublicHoliday | undefined>;
  getAllPublicHolidays(): Promise<PublicHoliday[]>;
  getPublicHolidaysByYear(year: string): Promise<PublicHoliday[]>;
  createPublicHoliday(holiday: InsertPublicHoliday): Promise<PublicHoliday>;
  updatePublicHoliday(
    id: number,
    holiday: Partial<InsertPublicHoliday>,
  ): Promise<PublicHoliday | undefined>;
  deletePublicHoliday(id: number): Promise<boolean>;
  getHandBook(id: number): Promise<HandBook | undefined>;
  getAllHandBooks(): Promise<HandBook[]>;
  getHandBooksByYear(year: string): Promise<HandBook[]>;
  createHandBook(handBook: InsertHandBook): Promise<HandBook>;
  updateHandBook(
    id: number,
    handBook: Partial<InsertHandBook>,
  ): Promise<HandBook | undefined>;
  deleteHandBook(id: number): Promise<boolean>;
  getNewsletter(id: number): Promise<Newsletter | undefined>;
  getAllNewsletters(): Promise<Newsletter[]>;
  createNewsletter(newsletter: InsertNewsletter): Promise<Newsletter>;
  updateNewsletter(
    id: number,
    newsletter: Partial<InsertNewsletter>,
  ): Promise<Newsletter | undefined>;
  deleteNewsletter(id: number): Promise<boolean>;
  getEvent(id: number): Promise<Event | undefined>;
  getAllEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(
    id: number,
    event: Partial<InsertEvent>,
  ): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  getBusRoute(id: number): Promise<BusRoute | undefined>;
  getAllBusRoutes(): Promise<BusRoute[]>;
  createBusRoute(busRoute: InsertBusRoute): Promise<BusRoute>;
  updateBusRoute(
    id: number,
    busRoute: Partial<InsertBusRoute>,
  ): Promise<BusRoute | undefined>;
  deleteBusRoute(id: number): Promise<boolean>;
  getNewsCircular(id: number): Promise<NewsCircular | undefined>;
  getAllNewsCirculars(): Promise<NewsCircular[]>;
  createNewsCircular(newsCircular: InsertNewsCircular): Promise<NewsCircular>;
  updateNewsCircular(
    id: number,
    newsCircular: Partial<InsertNewsCircular>,
  ): Promise<NewsCircular | undefined>;
  deleteNewsCircular(id: number): Promise<boolean>;
  getPhotoGallery(id: number): Promise<PhotoGallery | undefined>;
  getAllPhotoGalleries(): Promise<PhotoGallery[]>;
  createPhotoGallery(photoGallery: InsertPhotoGallery): Promise<PhotoGallery>;
  updatePhotoGallery(
    id: number,
    photoGallery: Partial<InsertPhotoGallery>,
  ): Promise<PhotoGallery | undefined>;
  deletePhotoGallery(id: number): Promise<boolean>;

  // Poll methods
  getAllPolls(): Promise<Poll[]>;
  getPoll(id: number): Promise<Poll | undefined>;
  createPoll(poll: InsertPoll): Promise<Poll>;
  updatePoll(id: number, poll: Partial<InsertPoll>): Promise<Poll | undefined>;
  deletePoll(id: number): Promise<boolean>;

  // Survey methods
  getAllSurveys(): Promise<Survey[]>;
  getSurvey(id: number): Promise<Survey | undefined>;
  createSurvey(survey: InsertSurvey): Promise<Survey>;
  updateSurvey(id: number, survey: Partial<InsertSurvey>): Promise<Survey | undefined>;
  deleteSurvey(id: number): Promise<boolean>;

  // Mock Test methods
  getAllMockTests(): Promise<MockTest[]>;
  getMockTest(id: number): Promise<MockTest | undefined>;
  createMockTest(mockTest: InsertMockTest): Promise<MockTest>;
  updateMockTest(id: number, mockTest: Partial<InsertMockTest>): Promise<MockTest | undefined>;
  deleteMockTest(id: number): Promise<boolean>;
  
  // Test Result methods
  getAllTestResults(): Promise<TestResult[]>;
  getTestResult(id: number): Promise<TestResult | undefined>;
  getTestResultsByPeriodicTest(periodicTestId: number): Promise<TestResult[]>;
  getTestResultsByClassDivision(className: string, division: string): Promise<TestResult[]>;
  createTestResult(testResult: InsertTestResult): Promise<TestResult>;
  updateTestResult(id: number, testResult: Partial<InsertTestResult>): Promise<TestResult | undefined>;
  deleteTestResult(id: number): Promise<boolean>;
  bulkCreateTestResults(testResults: InsertTestResult[]): Promise<TestResult[]>;
}

// Import types from schema
import type {
  User,
  InsertUser,
  Staff,
  InsertStaff,
  ClassMapping,
  InsertClassMapping,
  TeacherMapping,
  InsertTeacherMapping,
  Role,
  InsertRole,
  Subject,
  InsertSubject,
  Student,
  InsertStudent,
  WorkingDay,
  InsertWorkingDay,
  SchoolSchedule,
  InsertSchoolSchedule,
  TimeTable,
  InsertTimeTable,
  TimeTableEntry,
  InsertTimeTableEntry,
  SyllabusMaster,
  InsertSyllabusMaster,
  PeriodicTest,
  InsertPeriodicTest,
  PublicHoliday,
  InsertPublicHoliday,
  HandBook,
  InsertHandBook,
  Newsletter,
  InsertNewsletter,
  Event,
  InsertEvent,
  NewsCircular,
  InsertNewsCircular,
  PhotoGallery,
  InsertPhotoGallery,
  Poll,
  InsertPoll,
  Survey,
  InsertSurvey,
  MockTest,
  InsertMockTest,
  TestResult,
  InsertTestResult,
  BusRoute,
  InsertBusRoute,
} from '@shared/schema';

// Using the actual PostgreSQL database
export const storage = new DatabaseStorage();
