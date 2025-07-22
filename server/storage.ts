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
  private syllabusMasters: Map<number, SyllabusMaster>;
  private periodicTests: Map<number, PeriodicTest>;
  private publicHolidays: Map<number, PublicHoliday>;
  private handBooks: Map<number, HandBook>;
  private newsletters: Map<number, Newsletter>;
  private events: Map<number, Event>;
  private busRoutes: Map<number, BusRoute>;
  private newsCirculars: Map<number, NewsCircular>;
  private photoGalleries: Map<number, PhotoGallery>;
  private polls: Map<number, Poll>;
  private surveys: Map<number, Survey>;
  private mockTests: Map<number, MockTest>;
  private testResults: Map<number, TestResult>;
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
  private currentSyllabusMasterId: number;
  private currentPeriodicTestId: number;
  private currentPublicHolidayId: number;
  private currentHandBookId: number;
  private currentNewsletterId: number;
  private currentEventId: number;
  private currentBusRouteId: number;
  private currentNewsCircularId: number;
  private currentPhotoGalleryId: number;
  private currentPollId: number;
  private currentSurveyId: number;
  private currentMockTestId: number;
  private currentTestResultId: number;

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
    this.syllabusMasters = new Map();
    this.periodicTests = new Map();
    this.publicHolidays = new Map();
    this.handBooks = new Map();
    this.newsletters = new Map();
    this.events = new Map();
    this.busRoutes = new Map();
    this.newsCirculars = new Map();
    this.photoGalleries = new Map();
    this.polls = new Map();
    this.surveys = new Map();
    this.mockTests = new Map();
    this.testResults = new Map();
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
    this.currentSyllabusMasterId = 1;
    this.currentPeriodicTestId = 1;
    this.currentPublicHolidayId = 1;
    this.currentHandBookId = 1;
    this.currentNewsletterId = 1;
    this.currentEventId = 1;
    this.currentBusRouteId = 1;
    this.currentNewsCircularId = 1;
    this.currentPhotoGalleryId = 1;
    this.currentPollId = 1;
    this.currentSurveyId = 1;
    this.currentMockTestId = 1;
    this.currentTestResultId = 1;

    // Initialize with pre-defined data
    this.initializeRoles();
    this.initializeSubjects();
    this.initializeStaff();
    this.initializeWorkingDays();
    this.initializeSchoolSchedules();
    this.initializeClassMappings();
    this.initializeSyllabusMasters();
    this.initializeStudents();
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

  private initializeWorkingDays() {
    const predefinedWorkingDays = [
      { dayOfWeek: "Monday", dayType: "FullDay", timingFrom: "08:00", timingTo: "15:30", alternateWeeks: [] },
      { dayOfWeek: "Tuesday", dayType: "FullDay", timingFrom: "08:00", timingTo: "15:30", alternateWeeks: [] },
      { dayOfWeek: "Wednesday", dayType: "FullDay", timingFrom: "08:00", timingTo: "15:30", alternateWeeks: [] },
      { dayOfWeek: "Thursday", dayType: "FullDay", timingFrom: "08:00", timingTo: "15:30", alternateWeeks: [] },
      { dayOfWeek: "Friday", dayType: "FullDay", timingFrom: "08:00", timingTo: "15:30", alternateWeeks: [] },
      { dayOfWeek: "Saturday", dayType: "HalfDay", timingFrom: "08:00", timingTo: "12:00", alternateWeeks: [] },
      { dayOfWeek: "Sunday", dayType: "Holiday", timingFrom: "", timingTo: "", alternateWeeks: [] }
    ];

    predefinedWorkingDays.forEach((workingDayData) => {
      const id = this.currentWorkingDayId++;
      const workingDay: WorkingDay = { id, ...workingDayData };
      this.workingDays.set(id, workingDay);
    });
  }

  private initializeSchoolSchedules() {
    const predefinedSchedules = [
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

      // Thursday
      { dayOfWeek: "Thursday", type: "Period", name: "Period-1", timingFrom: "08:00", timingTo: "08:45" },
      { dayOfWeek: "Thursday", type: "Period", name: "Period-2", timingFrom: "08:45", timingTo: "09:30" },
      { dayOfWeek: "Thursday", type: "Break", name: "Break-1", timingFrom: "09:30", timingTo: "09:45" },
      { dayOfWeek: "Thursday", type: "Period", name: "Period-3", timingFrom: "09:45", timingTo: "10:30" },
      { dayOfWeek: "Thursday", type: "Period", name: "Period-4", timingFrom: "10:30", timingTo: "11:15" },
      { dayOfWeek: "Thursday", type: "Break", name: "Lunch Break", timingFrom: "11:15", timingTo: "12:00" },
      { dayOfWeek: "Thursday", type: "Period", name: "Period-5", timingFrom: "12:00", timingTo: "12:45" },
      { dayOfWeek: "Thursday", type: "Period", name: "Period-6", timingFrom: "12:45", timingTo: "13:30" },
      { dayOfWeek: "Thursday", type: "Period", name: "Period-7", timingFrom: "13:30", timingTo: "14:15" },
      { dayOfWeek: "Thursday", type: "Period", name: "Period-8", timingFrom: "14:15", timingTo: "15:00" },

      // Friday
      { dayOfWeek: "Friday", type: "Period", name: "Period-1", timingFrom: "08:00", timingTo: "08:45" },
      { dayOfWeek: "Friday", type: "Period", name: "Period-2", timingFrom: "08:45", timingTo: "09:30" },
      { dayOfWeek: "Friday", type: "Break", name: "Break-1", timingFrom: "09:30", timingTo: "09:45" },
      { dayOfWeek: "Friday", type: "Period", name: "Period-3", timingFrom: "09:45", timingTo: "10:30" },
      { dayOfWeek: "Friday", type: "Period", name: "Period-4", timingFrom: "10:30", timingTo: "11:15" },
      { dayOfWeek: "Friday", type: "Break", name: "Lunch Break", timingFrom: "11:15", timingTo: "12:00" },
      { dayOfWeek: "Friday", type: "Period", name: "Period-5", timingFrom: "12:00", timingTo: "12:45" },
      { dayOfWeek: "Friday", type: "Period", name: "Period-6", timingFrom: "12:45", timingTo: "13:30" },
      { dayOfWeek: "Friday", type: "Period", name: "Period-7", timingFrom: "13:30", timingTo: "14:15" },
      { dayOfWeek: "Friday", type: "Period", name: "Period-8", timingFrom: "14:15", timingTo: "15:00" },

      // Saturday
      { dayOfWeek: "Saturday", type: "Period", name: "Period-1", timingFrom: "08:00", timingTo: "08:45" },
      { dayOfWeek: "Saturday", type: "Period", name: "Period-2", timingFrom: "08:45", timingTo: "09:30" },
      { dayOfWeek: "Saturday", type: "Break", name: "Break-1", timingFrom: "09:30", timingTo: "09:45" },
      { dayOfWeek: "Saturday", type: "Period", name: "Period-3", timingFrom: "09:45", timingTo: "10:30" },
      { dayOfWeek: "Saturday", type: "Period", name: "Period-4", timingFrom: "10:30", timingTo: "11:15" },
      { dayOfWeek: "Saturday", type: "Period", name: "Period-5", timingFrom: "11:15", timingTo: "12:00" }
    ];

    predefinedSchedules.forEach((scheduleData) => {
      const id = this.currentSchoolScheduleId++;
      const schedule: SchoolSchedule = { id, ...scheduleData };
      this.schoolSchedules.set(id, schedule);
    });
  }

  private initializeClassMappings() {
    const predefinedClassMappings = [
      // Current Academic Year - Complete class structure
      {
        year: "2024-25",
        class: "I",
        division: "A",
        subjects: ["Mathematics", "English", "Science", "Social Studies", "Hindi", "Art & Craft", "Physical Education"],
        status: "Current working"
      },
      {
        year: "2024-25",
        class: "I",
        division: "B",
        subjects: ["Mathematics", "English", "Science", "Social Studies", "Hindi", "Art & Craft", "Physical Education"],
        status: "Current working"
      },
      {
        year: "2024-25",
        class: "II",
        division: "A",
        subjects: ["Mathematics", "English", "Science", "Social Studies", "Hindi", "Art & Craft", "Physical Education"],
        status: "Current working"
      },
      {
        year: "2024-25",
        class: "II",
        division: "B",
        subjects: ["Mathematics", "English", "Science", "Social Studies", "Hindi", "Art & Craft", "Physical Education"],
        status: "Current working"
      },
      {
        year: "2024-25",
        class: "III",
        division: "A",
        subjects: ["Mathematics", "English", "Science", "Social Studies", "Hindi", "Computer Science", "Physical Education"],
        status: "Current working"
      },
      {
        year: "2024-25",
        class: "III",
        division: "B",
        subjects: ["Mathematics", "English", "Science", "Social Studies", "Hindi", "Computer Science", "Physical Education"],
        status: "Current working"
      },
      {
        year: "2024-25",
        class: "IV",
        division: "A",
        subjects: ["Mathematics", "English", "Science", "Social Studies", "Hindi", "Computer Science", "Physical Education"],
        status: "Current working"
      },
      {
        year: "2024-25",
        class: "IV",
        division: "B",
        subjects: ["Mathematics", "English", "Science", "Social Studies", "Hindi", "Computer Science", "Physical Education"],
        status: "Current working"
      },
      {
        year: "2024-25",
        class: "V",
        division: "A",
        subjects: ["Mathematics", "English", "Science", "Social Studies", "Hindi", "Computer Science", "Physical Education"],
        status: "Current working"
      },
      {
        year: "2024-25",
        class: "V",
        division: "B",
        subjects: ["Mathematics", "English", "Science", "Social Studies", "Hindi", "Computer Science", "Physical Education"],
        status: "Current working"
      },
      {
        year: "2024-25",
        class: "VI",
        division: "A",
        subjects: ["Mathematics", "English", "Science", "Social Studies", "Hindi", "Sanskrit", "Computer Science", "Physical Education"],
        status: "Current working"
      },
      {
        year: "2024-25",
        class: "VI",
        division: "B",
        subjects: ["Mathematics", "English", "Science", "Social Studies", "Hindi", "Sanskrit", "Computer Science", "Physical Education"],
        status: "Current working"
      },
      {
        year: "2024-25",
        class: "VII",
        division: "A",
        subjects: ["Mathematics", "English", "Science", "Social Studies", "Hindi", "Sanskrit", "Computer Science", "Physical Education"],
        status: "Current working"
      },
      {
        year: "2024-25",
        class: "VII",
        division: "B",
        subjects: ["Mathematics", "English", "Science", "Social Studies", "Hindi", "Sanskrit", "Computer Science", "Physical Education"],
        status: "Current working"
      },
      {
        year: "2024-25",
        class: "VIII",
        division: "A",
        subjects: ["Mathematics", "English", "Science", "Social Studies", "Hindi", "Sanskrit", "Computer Science", "Physical Education"],
        status: "Current working"
      },
      {
        year: "2024-25",
        class: "VIII",
        division: "B",
        subjects: ["Mathematics", "English", "Science", "Social Studies", "Hindi", "Sanskrit", "Computer Science", "Physical Education"],
        status: "Current working"
      },
      {
        year: "2024-25",
        class: "IX",
        division: "A",
        subjects: ["Mathematics", "English", "Physics", "Chemistry", "Biology", "History", "Geography", "Hindi", "Computer Science", "Physical Education"],
        status: "Current working"
      },
      {
        year: "2024-25",
        class: "IX",
        division: "B",
        subjects: ["Mathematics", "English", "Physics", "Chemistry", "Biology", "History", "Geography", "Hindi", "Computer Science", "Physical Education"],
        status: "Current working"
      },
      {
        year: "2024-25",
        class: "X",
        division: "A",
        subjects: ["Mathematics", "English", "Physics", "Chemistry", "Biology", "History", "Geography", "Hindi", "Computer Science", "Physical Education"],
        status: "Current working"
      },
      {
        year: "2024-25",
        class: "X",
        division: "B",
        subjects: ["Mathematics", "English", "Physics", "Chemistry", "Biology", "History", "Geography", "Hindi", "Computer Science", "Physical Education"],
        status: "Current working"
      },
      {
        year: "2024-25",
        class: "XI",
        division: "A",
        subjects: ["Mathematics", "English", "Physics", "Chemistry", "Biology", "Computer Science"],
        status: "Current working"
      },
      {
        year: "2024-25",
        class: "XI",
        division: "B",
        subjects: ["Mathematics", "English", "Physics", "Chemistry", "Economics", "Political Science"],
        status: "Current working"
      },
      {
        year: "2024-25",
        class: "XII",
        division: "A",
        subjects: ["Mathematics", "English", "Physics", "Chemistry", "Biology", "Computer Science"],
        status: "Current working"
      },
      {
        year: "2024-25",
        class: "XII",
        division: "B",
        subjects: ["Mathematics", "English", "Physics", "Chemistry", "Economics", "Political Science"],
        status: "Current working"
      },
      // Previous Academic Year - Some archived data
      {
        year: "2023-24",
        class: "X",
        division: "A",
        subjects: ["Mathematics", "English", "Physics", "Chemistry", "Biology", "History", "Geography", "Hindi"],
        status: "Completed"
      },
      {
        year: "2023-24",
        class: "XII",
        division: "A",
        subjects: ["Mathematics", "English", "Physics", "Chemistry", "Biology", "Computer Science"],
        status: "Completed"
      }
    ];

    predefinedClassMappings.forEach((mappingData) => {
      const id = this.currentClassMappingId++;
      const mapping: ClassMapping = { id, ...mappingData };
      this.classMappings.set(id, mapping);
    });
  }

  private initializeSyllabusMasters() {
    const predefinedSyllabusMasters = [
      // Mathematics Syllabus
      {
        year: "2024-25",
        class: "I",
        subject: "Mathematics",
        divisions: ["A", "B"],
        chapterLessonNo: "Chapter 1",
        topic: "Numbers 1 to 20",
        description: "Introduction to counting, number recognition, and basic addition/subtraction within 20",
        status: "active"
      },
      {
        year: "2024-25",
        class: "I",
        subject: "Mathematics",
        divisions: ["A", "B"],
        chapterLessonNo: "Chapter 2",
        topic: "Shapes and Patterns",
        description: "Basic geometric shapes, pattern recognition, and simple classification activities",
        status: "active"
      },
      {
        year: "2024-25",
        class: "V",
        subject: "Mathematics",
        divisions: ["A", "B"],
        chapterLessonNo: "Chapter 1",
        topic: "Large Numbers",
        description: "Reading and writing numbers up to 5 digits, place value, and comparison",
        status: "active"
      },
      {
        year: "2024-25",
        class: "V",
        subject: "Mathematics",
        divisions: ["A", "B"],
        chapterLessonNo: "Chapter 2",
        topic: "Operations on Large Numbers",
        description: "Addition, subtraction, multiplication, and division of large numbers",
        status: "active"
      },
      {
        year: "2024-25",
        class: "X",
        subject: "Mathematics",
        divisions: ["A", "B"],
        chapterLessonNo: "Chapter 1",
        topic: "Real Numbers",
        description: "Rational and irrational numbers, decimal representation, and operations",
        status: "active"
      },
      {
        year: "2024-25",
        class: "X",
        subject: "Mathematics",
        divisions: ["A", "B"],
        chapterLessonNo: "Chapter 2",
        topic: "Polynomials",
        description: "Introduction to polynomials, factorization, and algebraic identities",
        status: "active"
      },

      // English Syllabus
      {
        year: "2024-25",
        class: "III",
        subject: "English",
        divisions: ["A", "B"],
        chapterLessonNo: "Lesson 1",
        topic: "The Magic Garden",
        description: "Reading comprehension, vocabulary building, and creative writing based on nature themes",
        status: "active"
      },
      {
        year: "2024-25",
        class: "III",
        subject: "English",
        divisions: ["A", "B"],
        chapterLessonNo: "Lesson 2",
        topic: "Grammar: Nouns and Pronouns",
        description: "Understanding different types of nouns and pronouns with practical examples",
        status: "active"
      },
      {
        year: "2024-25",
        class: "VIII",
        subject: "English",
        divisions: ["A", "B"],
        chapterLessonNo: "Chapter 1",
        topic: "How the Camel Got His Hump",
        description: "Reading Kipling's story, analyzing character traits, and understanding moral lessons",
        status: "active"
      },
      {
        year: "2024-25",
        class: "VIII",
        subject: "English",
        divisions: ["A", "B"],
        chapterLessonNo: "Chapter 2",
        topic: "The Tsunami",
        description: "Comprehension of factual accounts, disaster management awareness, and essay writing",
        status: "active"
      },

      // Science Syllabus
      {
        year: "2024-25",
        class: "VI",
        subject: "Science",
        divisions: ["A", "B"],
        chapterLessonNo: "Chapter 1",
        topic: "Food: Where Does It Come From?",
        description: "Sources of food, plant and animal products, and food habits of different animals",
        status: "active"
      },
      {
        year: "2024-25",
        class: "VI",
        subject: "Science",
        divisions: ["A", "B"],
        chapterLessonNo: "Chapter 2",
        topic: "Components of Food",
        description: "Nutrients in food, balanced diet, and deficiency diseases",
        status: "active"
      },
      {
        year: "2024-25",
        class: "IX",
        subject: "Physics",
        divisions: ["A", "B"],
        chapterLessonNo: "Chapter 1",
        topic: "Motion",
        description: "Types of motion, speed, velocity, acceleration, and equations of motion",
        status: "active"
      },
      {
        year: "2024-25",
        class: "IX",
        subject: "Chemistry",
        divisions: ["A", "B"],
        chapterLessonNo: "Chapter 1",
        topic: "Matter in Our Surroundings",
        description: "States of matter, properties of solids, liquids, and gases",
        status: "active"
      },
      {
        year: "2024-25",
        class: "IX",
        subject: "Biology",
        divisions: ["A", "B"],
        chapterLessonNo: "Chapter 1",
        topic: "The Fundamental Unit of Life",
        description: "Cell structure, cell organelles, and basic functions of cells",
        status: "active"
      },

      // Social Studies Syllabus
      {
        year: "2024-25",
        class: "VII",
        subject: "History",
        divisions: ["A", "B"],
        chapterLessonNo: "Chapter 1",
        topic: "Tracing Changes Through a Thousand Years",
        description: "Medieval period in India, sources of historical information, and chronology",
        status: "active"
      },
      {
        year: "2024-25",
        class: "VII",
        subject: "Geography",
        divisions: ["A", "B"],
        chapterLessonNo: "Chapter 1",
        topic: "Environment",
        description: "Natural and human environment, environmental degradation, and conservation",
        status: "active"
      },
      {
        year: "2024-25",
        class: "X",
        subject: "History",
        divisions: ["A", "B"],
        chapterLessonNo: "Chapter 1",
        topic: "The Rise of Nationalism in Europe",
        description: "French Revolution, growth of nationalism, and unification of Germany and Italy",
        status: "active"
      },
      {
        year: "2024-25",
        class: "X",
        subject: "Political Science",
        divisions: ["A", "B"],
        chapterLessonNo: "Chapter 1",
        topic: "Power Sharing",
        description: "Democracy, federal government, and power sharing mechanisms",
        status: "active"
      },

      // Computer Science Syllabus
      {
        year: "2024-25",
        class: "VI",
        subject: "Computer Science",
        divisions: ["A", "B"],
        chapterLessonNo: "Unit 1",
        topic: "Introduction to Computers",
        description: "Basic components of computer, input/output devices, and computer applications",
        status: "active"
      },
      {
        year: "2024-25",
        class: "XI",
        subject: "Computer Science",
        divisions: ["A"],
        chapterLessonNo: "Unit 1",
        topic: "Introduction to Programming",
        description: "Programming fundamentals, Python basics, and problem-solving techniques",
        status: "active"
      },
      {
        year: "2024-25",
        class: "XI",
        subject: "Computer Science",
        divisions: ["A"],
        chapterLessonNo: "Unit 2",
        topic: "Data Types and Operators",
        description: "Python data types, variables, operators, and expressions",
        status: "active"
      },

      // Hindi Syllabus
      {
        year: "2024-25",
        class: "IV",
        subject: "Hindi",
        divisions: ["A", "B"],
        chapterLessonNo: "पाठ 1",
        topic: "मन के भोले-भाले बादल",
        description: "कविता की समझ, भावना की अभिव्यक्ति, और शब्द भंडार का विकास",
        status: "active"
      },
      {
        year: "2024-25",
        class: "IX",
        subject: "Hindi",
        divisions: ["A", "B"],
        chapterLessonNo: "गद्य खंड - पाठ 1",
        topic: "दो बैलों की कथा",
        description: "प्रेमचंद की कहानी, पात्र चरित्र विश्लेषण, और नैतिक मूल्यों की शिक्षा",
        status: "active"
      },

      // Economics Syllabus
      {
        year: "2024-25",
        class: "XI",
        subject: "Economics",
        divisions: ["B"],
        chapterLessonNo: "Chapter 1",
        topic: "Introduction to Economics",
        description: "Basic concepts of microeconomics, scarcity, choice, and opportunity cost",
        status: "active"
      },
      {
        year: "2024-25",
        class: "XII",
        subject: "Economics",
        divisions: ["B"],
        chapterLessonNo: "Chapter 1",
        topic: "National Income and Related Aggregates",
        description: "Macroeconomic concepts, GDP, GNP, and national income accounting",
        status: "active"
      },

      // Physical Education Syllabus
      {
        year: "2024-25",
        class: "VIII",
        subject: "Physical Education",
        divisions: ["A", "B"],
        chapterLessonNo: "Unit 1",
        topic: "Sports and Games",
        description: "Introduction to various sports, rules, equipment, and basic techniques",
        status: "active"
      },
      {
        year: "2024-25",
        class: "XII",
        subject: "Physical Education",
        divisions: ["A", "B"],
        chapterLessonNo: "Chapter 1",
        topic: "Planning in Sports",
        description: "Tournament planning, fixture preparation, and sports management",
        status: "active"
      },

      // Art & Craft Syllabus
      {
        year: "2024-25",
        class: "II",
        subject: "Art & Craft",
        divisions: ["A", "B"],
        chapterLessonNo: "Activity 1",
        topic: "Paper Folding and Cutting",
        description: "Basic origami techniques, paper cutting patterns, and creative expression",
        status: "active"
      },

      // Previous Year Data
      {
        year: "2023-24",
        class: "X",
        subject: "Mathematics",
        divisions: ["A"],
        chapterLessonNo: "Chapter 15",
        topic: "Probability",
        description: "Introduction to probability, experimental and theoretical probability",
        status: "completed"
      },
      {
        year: "2023-24",
        class: "XII",
        subject: "Physics",
        divisions: ["A"],
        chapterLessonNo: "Chapter 12",
        topic: "Atoms",
        description: "Atomic structure, Bohr's model, and energy levels in hydrogen atom",
        status: "completed"
      }
    ];

    predefinedSyllabusMasters.forEach((syllabusData) => {
      const id = this.currentSyllabusMasterId++;
      const syllabus: SyllabusMaster = { id, ...syllabusData };
      this.syllabusMasters.set(id, syllabus);
    });
  }

  private initializeStudents() {
    const predefinedStudents = [
      // Class I - Division A
      {
        firstName: "Aarav",
        middleName: null,
        lastName: "Sharma",
        sex: "Male",
        dateOfBirth: "2018-03-15",
        flatBuildingNo: "123",
        areaLocality: "Green Park",
        city: "Delhi",
        state: "Delhi",
        pincode: "110016",
        landmark: "Near Metro Station",
        contactNumber: "+91-9876543210",
        emailId: null,
        class: "I",
        division: "A",
        rollNumber: 1,
        fatherName: "Rajesh Sharma",
        fatherMobileNumber: "+91-9876543210",
        fatherEmailId: "rajesh.sharma@email.com",
        motherName: "Priya Sharma",
        motherMobileNumber: "+91-9876543211",
        motherEmailId: "priya.sharma@email.com",
        guardianName: "Rajesh Sharma",
        guardianMobileNumber: "+91-9876543210",
        guardianEmailId: "rajesh.sharma@email.com",
        guardianRelation: "Father",
        apaarId: "APAAR001",
        aadharNumber: "123456789012"
      },
      {
        firstName: "Diya",
        middleName: null,
        lastName: "Patel",
        sex: "Female",
        dateOfBirth: "2018-07-22",
        flatBuildingNo: "456",
        areaLocality: "Rose Garden",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
        landmark: "Near Shopping Mall",
        contactNumber: "+91-9876543212",
        emailId: null,
        class: "I",
        division: "A",
        rollNumber: 2,
        fatherName: "Amit Patel",
        fatherMobileNumber: "+91-9876543212",
        fatherEmailId: "amit.patel@email.com",
        motherName: "Kavya Patel",
        motherMobileNumber: "+91-9876543213",
        motherEmailId: "kavya.patel@email.com",
        guardianName: "Amit Patel",
        guardianMobileNumber: "+91-9876543212",
        guardianEmailId: "amit.patel@email.com",
        guardianRelation: "Father",
        apaarId: "APAAR002",
        aadharNumber: "123456789013"
      },
      {
        firstName: "Arjun",
        middleName: null,
        lastName: "Singh",
        sex: "Male",
        dateOfBirth: "2018-01-10",
        flatBuildingNo: "789",
        areaLocality: "Lily Colony",
        city: "Bangalore",
        state: "Karnataka",
        pincode: "560001",
        landmark: "Near Park",
        contactNumber: "+91-9876543214",
        emailId: null,
        class: "I",
        division: "A",
        rollNumber: 3,
        fatherName: "Vikram Singh",
        fatherMobileNumber: "+91-9876543214",
        fatherEmailId: "vikram.singh@email.com",
        motherName: "Meera Singh",
        motherMobileNumber: "+91-9876543215",
        motherEmailId: "meera.singh@email.com",
        guardianName: "Vikram Singh",
        guardianMobileNumber: "+91-9876543214",
        guardianEmailId: "vikram.singh@email.com",
        guardianRelation: "Father",
        apaarId: "APAAR003",
        aadharNumber: "123456789014"
      },

      // Class I - Division B
      {
        firstName: "Ananya",
        middleName: null,
        lastName: "Reddy",
        sex: "Female",
        dateOfBirth: "2018-05-18",
        flatBuildingNo: "321",
        areaLocality: "Lotus Avenue",
        city: "Hyderabad",
        state: "Telangana",
        pincode: "500001",
        landmark: "Near Temple",
        contactNumber: "+91-9876543216",
        emailId: null,
        class: "I",
        division: "B",
        rollNumber: 1,
        fatherName: "Suresh Reddy",
        fatherMobileNumber: "+91-9876543216",
        fatherEmailId: "suresh.reddy@email.com",
        motherName: "Lakshmi Reddy",
        motherMobileNumber: "+91-9876543217",
        motherEmailId: "lakshmi.reddy@email.com",
        guardianName: "Suresh Reddy",
        guardianMobileNumber: "+91-9876543216",
        guardianEmailId: "suresh.reddy@email.com",
        guardianRelation: "Father",
        apaarId: "APAAR004",
        aadharNumber: "123456789015"
      },
      {
        firstName: "Rohan",
        middleName: null,
        lastName: "Kumar",
        sex: "Male",
        dateOfBirth: "2018-09-03",
        flatBuildingNo: "654",
        areaLocality: "Jasmine Street",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600001",
        landmark: "Near School",
        contactNumber: "+91-9876543218",
        emailId: null,
        class: "I",
        division: "B",
        rollNumber: 2,
        fatherName: "Raj Kumar",
        fatherMobileNumber: "+91-9876543218",
        fatherEmailId: "raj.kumar@email.com",
        motherName: "Sunita Kumar",
        motherMobileNumber: "+91-9876543219",
        motherEmailId: "sunita.kumar@email.com",
        guardianName: "Raj Kumar",
        guardianMobileNumber: "+91-9876543218",
        guardianEmailId: "raj.kumar@email.com",
        guardianRelation: "Father",
        apaarId: "APAAR005",
        aadharNumber: "123456789016"
      },

      // Class V - Division A
      {
        firstName: "Ishaan",
        middleName: null,
        lastName: "Gupta",
        sex: "Male",
        dateOfBirth: "2014-11-25",
        flatBuildingNo: "987",
        areaLocality: "Marigold Park",
        city: "Pune",
        state: "Maharashtra",
        pincode: "411001",
        landmark: "Near Library",
        contactNumber: "+91-9876543220",
        emailId: "ishaan.gupta@email.com",
        class: "V",
        division: "A",
        rollNumber: 1,
        fatherName: "Deepak Gupta",
        fatherMobileNumber: "+91-9876543220",
        fatherEmailId: "deepak.gupta@email.com",
        motherName: "Neha Gupta",
        motherMobileNumber: "+91-9876543221",
        motherEmailId: "neha.gupta@email.com",
        guardianName: "Deepak Gupta",
        guardianMobileNumber: "+91-9876543220",
        guardianEmailId: "deepak.gupta@email.com",
        guardianRelation: "Father",
        apaarId: "APAAR006",
        aadharNumber: "123456789017"
      },
      {
        firstName: "Zara",
        middleName: null,
        lastName: "Khan",
        sex: "Female",
        dateOfBirth: "2014-06-14",
        flatBuildingNo: "147",
        areaLocality: "Tulip Gardens",
        city: "Lucknow",
        state: "Uttar Pradesh",
        pincode: "226001",
        landmark: "Near Mosque",
        contactNumber: "+91-9876543222",
        emailId: "zara.khan@email.com",
        class: "V",
        division: "A",
        rollNumber: 2,
        fatherName: "Ahmed Khan",
        fatherMobileNumber: "+91-9876543222",
        fatherEmailId: "ahmed.khan@email.com",
        motherName: "Fatima Khan",
        motherMobileNumber: "+91-9876543223",
        motherEmailId: "fatima.khan@email.com",
        guardianName: "Ahmed Khan",
        guardianMobileNumber: "+91-9876543222",
        guardianEmailId: "ahmed.khan@email.com",
        guardianRelation: "Father",
        apaarId: "APAAR007",
        aadharNumber: "123456789018"
      },

      // Class V - Division B
      {
        firstName: "Sneha",
        middleName: null,
        lastName: "Agarwal",
        sex: "Female",
        dateOfBirth: "2014-08-30",
        flatBuildingNo: "369",
        areaLocality: "Sunflower Road",
        city: "Jaipur",
        state: "Rajasthan",
        pincode: "302001",
        landmark: "Near Fort",
        contactNumber: "+91-9876543226",
        emailId: "sneha.agarwal@email.com",
        class: "V",
        division: "B",
        rollNumber: 1,
        fatherName: "Rohit Agarwal",
        fatherMobileNumber: "+91-9876543226",
        fatherEmailId: "rohit.agarwal@email.com",
        motherName: "Pooja Agarwal",
        motherMobileNumber: "+91-9876543227",
        motherEmailId: "pooja.agarwal@email.com",
        guardianName: "Rohit Agarwal",
        guardianMobileNumber: "+91-9876543226",
        guardianEmailId: "rohit.agarwal@email.com",
        guardianRelation: "Father",
        apaarId: "APAAR008",
        aadharNumber: "123456789019"
      },
      {
        firstName: "Ryan",
        middleName: null,
        lastName: "D'Souza",
        sex: "Male",
        dateOfBirth: "2014-12-12",
        flatBuildingNo: "741",
        areaLocality: "Hibiscus Lane",
        city: "Panaji",
        state: "Goa",
        pincode: "403001",
        landmark: "Near Church",
        contactNumber: "+91-9876543228",
        emailId: "ryan.dsouza@email.com",
        class: "V",
        division: "B",
        rollNumber: 2,
        fatherName: "Joseph D'Souza",
        fatherMobileNumber: "+91-9876543228",
        fatherEmailId: "joseph.dsouza@email.com",
        motherName: "Maria D'Souza",
        motherMobileNumber: "+91-9876543229",
        motherEmailId: "maria.dsouza@email.com",
        guardianName: "Joseph D'Souza",
        guardianMobileNumber: "+91-9876543228",
        guardianEmailId: "joseph.dsouza@email.com",
        guardianRelation: "Father",
        apaarId: "APAAR009",
        aadharNumber: "123456789020"
      },

      // Class X - Division A
      {
        firstName: "Aditya",
        middleName: null,
        lastName: "Mishra",
        sex: "Male",
        dateOfBirth: "2009-04-20",
        flatBuildingNo: "852",
        areaLocality: "Daffodil Heights",
        city: "Kanpur",
        state: "Uttar Pradesh",
        pincode: "208001",
        landmark: "Near Stadium",
        contactNumber: "+91-9876543230",
        emailId: "aditya.mishra@email.com",
        class: "X",
        division: "A",
        rollNumber: 1,
        fatherName: "Sunil Mishra",
        fatherMobileNumber: "+91-9876543230",
        fatherEmailId: "sunil.mishra@email.com",
        motherName: "Ritu Mishra",
        motherMobileNumber: "+91-9876543231",
        motherEmailId: "ritu.mishra@email.com",
        guardianName: "Sunil Mishra",
        guardianMobileNumber: "+91-9876543230",
        guardianEmailId: "sunil.mishra@email.com",
        guardianRelation: "Father",
        apaarId: "APAAR010",
        aadharNumber: "123456789021"
      },
      {
        firstName: "Priya",
        middleName: null,
        lastName: "Joshi",
        sex: "Female",
        dateOfBirth: "2009-01-16",
        flatBuildingNo: "963",
        areaLocality: "Carnation Villa",
        city: "Nashik",
        state: "Maharashtra",
        pincode: "422001",
        landmark: "Near Hospital",
        contactNumber: "+91-9876543232",
        emailId: "priya.joshi@email.com",
        class: "X",
        division: "A",
        rollNumber: 2,
        fatherName: "Manoj Joshi",
        fatherMobileNumber: "+91-9876543232",
        fatherEmailId: "manoj.joshi@email.com",
        motherName: "Kavita Joshi",
        motherMobileNumber: "+91-9876543233",
        motherEmailId: "kavita.joshi@email.com",
        guardianName: "Manoj Joshi",
        guardianMobileNumber: "+91-9876543232",
        guardianEmailId: "manoj.joshi@email.com",
        guardianRelation: "Father",
        apaarId: "APAAR011",
        aadharNumber: "123456789022"
      }
    ];

    predefinedStudents.forEach((studentData) => {
      const id = this.currentStudentId++;
      const student: Student = { id, ...studentData };
      this.students.set(id, student);
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

  // Syllabus Master methods
  async getSyllabusMaster(id: number): Promise<SyllabusMaster | undefined> {
    return this.syllabusMasters.get(id);
  }

  async getAllSyllabusMasters(): Promise<SyllabusMaster[]> {
    return Array.from(this.syllabusMasters.values());
  }

  async getSyllabusMastersByClassDivision(
    className: string,
    divisions: string[],
  ): Promise<SyllabusMaster[]> {
    const allSyllabusMasters = Array.from(this.syllabusMasters.values());
    return allSyllabusMasters.filter((syllabus) => 
      syllabus.class === className && 
      divisions.some(division => syllabus.divisions.includes(division))
    );
  }

  async createSyllabusMaster(insertSyllabus: InsertSyllabusMaster): Promise<SyllabusMaster> {
    const id = this.currentSyllabusMasterId++;
    const syllabus: SyllabusMaster = {
      ...insertSyllabus,
      id,
      status: insertSyllabus.status || "active",
    };
    this.syllabusMasters.set(id, syllabus);
    return syllabus;
  }

  async updateSyllabusMaster(
    id: number,
    updateData: Partial<InsertSyllabusMaster>,
  ): Promise<SyllabusMaster | undefined> {
    const existing = this.syllabusMasters.get(id);
    if (!existing) return undefined;

    const updated: SyllabusMaster = { ...existing, ...updateData };
    this.syllabusMasters.set(id, updated);
    return updated;
  }

  async deleteSyllabusMaster(id: number): Promise<boolean> {
    return this.syllabusMasters.delete(id);
  }

  // Periodic Test methods
  async getPeriodicTest(id: number): Promise<PeriodicTest | undefined> {
    return this.periodicTests.get(id);
  }

  async getAllPeriodicTests(): Promise<PeriodicTest[]> {
    return Array.from(this.periodicTests.values());
  }

  async createPeriodicTest(insertTest: InsertPeriodicTest): Promise<PeriodicTest> {
    const id = this.currentPeriodicTestId++;
    const test: PeriodicTest = {
      ...insertTest,
      id,
      status: insertTest.status || "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.periodicTests.set(id, test);
    return test;
  }

  async updatePeriodicTest(
    id: number,
    updateData: Partial<InsertPeriodicTest>,
  ): Promise<PeriodicTest | undefined> {
    const existing = this.periodicTests.get(id);
    if (!existing) return undefined;

    const updated: PeriodicTest = { 
      ...existing, 
      ...updateData,
      updatedAt: new Date(),
    };
    this.periodicTests.set(id, updated);
    return updated;
  }

  async deletePeriodicTest(id: number): Promise<boolean> {
    return this.periodicTests.delete(id);
  }

  // Public Holiday methods
  async getPublicHoliday(id: number): Promise<PublicHoliday | undefined> {
    return this.publicHolidays.get(id);
  }

  async getAllPublicHolidays(): Promise<PublicHoliday[]> {
    return Array.from(this.publicHolidays.values());
  }

  async getPublicHolidaysByYear(year: string): Promise<PublicHoliday[]> {
    return Array.from(this.publicHolidays.values()).filter(holiday => holiday.year === year);
  }

  async createPublicHoliday(insertHoliday: InsertPublicHoliday): Promise<PublicHoliday> {
    const id = this.currentPublicHolidayId++;
    const holiday: PublicHoliday = {
      ...insertHoliday,
      id,
      createdAt: new Date(),
    };
    this.publicHolidays.set(id, holiday);
    return holiday;
  }

  async updatePublicHoliday(
    id: number,
    updateData: Partial<InsertPublicHoliday>,
  ): Promise<PublicHoliday | undefined> {
    const existing = this.publicHolidays.get(id);
    if (!existing) return undefined;

    const updated: PublicHoliday = { 
      ...existing, 
      ...updateData,
    };
    this.publicHolidays.set(id, updated);
    return updated;
  }

  async deletePublicHoliday(id: number): Promise<boolean> {
    return this.publicHolidays.delete(id);
  }

  // HandBook methods
  async getHandBook(id: number): Promise<HandBook | undefined> {
    return this.handBooks.get(id);
  }

  async getAllHandBooks(): Promise<HandBook[]> {
    return Array.from(this.handBooks.values());
  }

  async getHandBooksByYear(year: string): Promise<HandBook[]> {
    return Array.from(this.handBooks.values()).filter(handBook => handBook.year === year);
  }

  async createHandBook(insertHandBook: InsertHandBook): Promise<HandBook> {
    const id = this.currentHandBookId++;
    const handBook: HandBook = {
      ...insertHandBook,
      id,
      uploadedAt: new Date(),
    };
    this.handBooks.set(id, handBook);
    return handBook;
  }

  async updateHandBook(
    id: number,
    updateData: Partial<InsertHandBook>,
  ): Promise<HandBook | undefined> {
    const existing = this.handBooks.get(id);
    if (!existing) return undefined;

    const updated: HandBook = { 
      ...existing, 
      ...updateData,
    };
    this.handBooks.set(id, updated);
    return updated;
  }

  async deleteHandBook(id: number): Promise<boolean> {
    return this.handBooks.delete(id);
  }

  // Newsletter methods
  async getNewsletter(id: number): Promise<Newsletter | undefined> {
    return this.newsletters.get(id);
  }

  async getAllNewsletters(): Promise<Newsletter[]> {
    return Array.from(this.newsletters.values());
  }

  async createNewsletter(insertNewsletter: InsertNewsletter): Promise<Newsletter> {
    const id = this.currentNewsletterId++;
    const newsletter: Newsletter = {
      ...insertNewsletter,
      id,
      createdAt: new Date(),
    };
    this.newsletters.set(id, newsletter);
    return newsletter;
  }

  async updateNewsletter(
    id: number,
    updateData: Partial<InsertNewsletter>,
  ): Promise<Newsletter | undefined> {
    const existing = this.newsletters.get(id);
    if (!existing) return undefined;

    const updated: Newsletter = { 
      ...existing, 
      ...updateData,
    };
    this.newsletters.set(id, updated);
    return updated;
  }

  async deleteNewsletter(id: number): Promise<boolean> {
    return this.newsletters.delete(id);
  }

  // Event methods
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.currentEventId++;
    const event: Event = {
      ...insertEvent,
      id,
      createdAt: new Date(),
    };
    this.events.set(id, event);
    return event;
  }

  async updateEvent(
    id: number,
    updateData: Partial<InsertEvent>,
  ): Promise<Event | undefined> {
    const existing = this.events.get(id);
    if (!existing) return undefined;

    const updated: Event = { 
      ...existing, 
      ...updateData,
    };
    this.events.set(id, updated);
    return updated;
  }

  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }

  // Bus Route methods
  async getBusRoute(id: number): Promise<BusRoute | undefined> {
    return this.busRoutes.get(id);
  }

  async getAllBusRoutes(): Promise<BusRoute[]> {
    return Array.from(this.busRoutes.values());
  }

  async createBusRoute(insertBusRoute: InsertBusRoute): Promise<BusRoute> {
    const id = this.currentBusRouteId++;
    const busRoute: BusRoute = {
      ...insertBusRoute,
      id,
      createdAt: new Date(),
    };
    this.busRoutes.set(id, busRoute);
    return busRoute;
  }

  async updateBusRoute(
    id: number,
    updateData: Partial<InsertBusRoute>,
  ): Promise<BusRoute | undefined> {
    const existing = this.busRoutes.get(id);
    if (!existing) return undefined;

    const updated: BusRoute = { 
      ...existing, 
      ...updateData,
    };
    this.busRoutes.set(id, updated);
    return updated;
  }

  async deleteBusRoute(id: number): Promise<boolean> {
    return this.busRoutes.delete(id);
  }

  // News/Circular methods
  async getNewsCircular(id: number): Promise<NewsCircular | undefined> {
    return this.newsCirculars.get(id);
  }

  async getAllNewsCirculars(): Promise<NewsCircular[]> {
    return Array.from(this.newsCirculars.values());
  }

  async createNewsCircular(insertNewsCircular: InsertNewsCircular): Promise<NewsCircular> {
    const id = this.currentNewsCircularId++;
    const newsCircular: NewsCircular = {
      ...insertNewsCircular,
      id,
      createdAt: new Date(),
    };
    this.newsCirculars.set(id, newsCircular);
    return newsCircular;
  }

  async updateNewsCircular(
    id: number,
    updateData: Partial<InsertNewsCircular>,
  ): Promise<NewsCircular | undefined> {
    const existing = this.newsCirculars.get(id);
    if (!existing) return undefined;

    const updated: NewsCircular = { 
      ...existing, 
      ...updateData,
    };
    this.newsCirculars.set(id, updated);
    return updated;
  }

  async deleteNewsCircular(id: number): Promise<boolean> {
    return this.newsCirculars.delete(id);
  }

  // Photo Gallery methods
  async getPhotoGallery(id: number): Promise<PhotoGallery | undefined> {
    return this.photoGalleries.get(id);
  }

  async getAllPhotoGalleries(): Promise<PhotoGallery[]> {
    return Array.from(this.photoGalleries.values());
  }

  async createPhotoGallery(insertPhotoGallery: InsertPhotoGallery): Promise<PhotoGallery> {
    const id = this.currentPhotoGalleryId++;
    const photoGallery: PhotoGallery = {
      ...insertPhotoGallery,
      id,
      createdAt: new Date(),
    };
    this.photoGalleries.set(id, photoGallery);
    return photoGallery;
  }

  async updatePhotoGallery(
    id: number,
    updateData: Partial<InsertPhotoGallery>,
  ): Promise<PhotoGallery | undefined> {
    const existing = this.photoGalleries.get(id);
    if (!existing) return undefined;

    const updated: PhotoGallery = { 
      ...existing, 
      ...updateData,
    };
    this.photoGalleries.set(id, updated);
    return updated;
  }

  async deletePhotoGallery(id: number): Promise<boolean> {
    return this.photoGalleries.delete(id);
  }

  // Poll methods
  async getAllPolls(): Promise<Poll[]> {
    return Array.from(this.polls.values());
  }

  async getPoll(id: number): Promise<Poll | undefined> {
    return this.polls.get(id);
  }

  async createPoll(insertPoll: InsertPoll): Promise<Poll> {
    const id = this.currentPollId++;
    const poll: Poll = {
      ...insertPoll,
      id,
    };
    this.polls.set(id, poll);
    return poll;
  }

  async updatePoll(id: number, updateData: Partial<InsertPoll>): Promise<Poll | undefined> {
    const existing = this.polls.get(id);
    if (!existing) return undefined;

    const updated: Poll = { 
      ...existing, 
      ...updateData,
    };
    this.polls.set(id, updated);
    return updated;
  }

  async deletePoll(id: number): Promise<boolean> {
    return this.polls.delete(id);
  }

  // Survey methods
  async getAllSurveys(): Promise<Survey[]> {
    return Array.from(this.surveys.values());
  }

  async getSurvey(id: number): Promise<Survey | undefined> {
    return this.surveys.get(id);
  }

  async createSurvey(insertSurvey: InsertSurvey): Promise<Survey> {
    const id = this.currentSurveyId++;
    const survey: Survey = {
      ...insertSurvey,
      id,
      createdAt: new Date(),
    };
    this.surveys.set(id, survey);
    return survey;
  }

  async updateSurvey(id: number, updateData: Partial<InsertSurvey>): Promise<Survey | undefined> {
    const existing = this.surveys.get(id);
    if (!existing) return undefined;

    const updated: Survey = { 
      ...existing, 
      ...updateData,
    };
    this.surveys.set(id, updated);
    return updated;
  }

  async deleteSurvey(id: number): Promise<boolean> {
    return this.surveys.delete(id);
  }

  // Mock Test methods
  async getAllMockTests(): Promise<MockTest[]> {
    return Array.from(this.mockTests.values());
  }

  async getMockTest(id: number): Promise<MockTest | undefined> {
    return this.mockTests.get(id);
  }

  async createMockTest(insertMockTest: InsertMockTest): Promise<MockTest> {
    const id = this.currentMockTestId++;
    const mockTest: MockTest = {
      ...insertMockTest,
      id,
      createdAt: new Date(),
    };
    this.mockTests.set(id, mockTest);
    return mockTest;
  }

  async updateMockTest(id: number, updateData: Partial<InsertMockTest>): Promise<MockTest | undefined> {
    const existing = this.mockTests.get(id);
    if (!existing) return undefined;

    const updated: MockTest = { 
      ...existing, 
      ...updateData,
    };
    this.mockTests.set(id, updated);
    return updated;
  }

  async deleteMockTest(id: number): Promise<boolean> {
    return this.mockTests.delete(id);
  }

  // Test Result methods
  async getAllTestResults(): Promise<TestResult[]> {
    return Array.from(this.testResults.values());
  }

  async getTestResult(id: number): Promise<TestResult | undefined> {
    return this.testResults.get(id);
  }

  async getTestResultsByPeriodicTest(periodicTestId: number): Promise<TestResult[]> {
    return Array.from(this.testResults.values()).filter(
      result => result.periodicTestId === periodicTestId
    );
  }

  async getTestResultsByClassDivision(className: string, division: string): Promise<TestResult[]> {
    return Array.from(this.testResults.values()).filter(
      result => result.class === className && result.division === division
    );
  }

  async createTestResult(insertTestResult: InsertTestResult): Promise<TestResult> {
    const id = this.currentTestResultId++;
    
    // Auto-calculate grade based on marks percentage
    let grade: string | null = null;
    if (insertTestResult.marks !== null && insertTestResult.marks !== undefined) {
      const percentage = (insertTestResult.marks / insertTestResult.maxMarks) * 100;
      if (percentage >= 90) grade = "A+";
      else if (percentage >= 80) grade = "A";
      else if (percentage >= 70) grade = "B+";
      else if (percentage >= 60) grade = "B";
      else if (percentage >= 50) grade = "C";
      else if (percentage >= 35) grade = "D";
      else grade = "F";
    }

    const testResult: TestResult = {
      ...insertTestResult,
      id,
      grade,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.testResults.set(id, testResult);
    return testResult;
  }

  async updateTestResult(id: number, updateData: Partial<InsertTestResult>): Promise<TestResult | undefined> {
    const existing = this.testResults.get(id);
    if (!existing) return undefined;

    // Auto-calculate grade if marks are updated
    let grade = existing.grade;
    if (updateData.marks !== undefined || updateData.maxMarks !== undefined) {
      const marks = updateData.marks ?? existing.marks;
      const maxMarks = updateData.maxMarks ?? existing.maxMarks;
      
      if (marks !== null && marks !== undefined) {
        const percentage = (marks / maxMarks) * 100;
        if (percentage >= 90) grade = "A+";
        else if (percentage >= 80) grade = "A";
        else if (percentage >= 70) grade = "B+";
        else if (percentage >= 60) grade = "B";
        else if (percentage >= 50) grade = "C";
        else if (percentage >= 35) grade = "D";
        else grade = "F";
      }
    }

    const updated: TestResult = { 
      ...existing, 
      ...updateData,
      grade,
      updatedAt: new Date(),
    };
    this.testResults.set(id, updated);
    return updated;
  }

  async deleteTestResult(id: number): Promise<boolean> {
    return this.testResults.delete(id);
  }

  async bulkCreateTestResults(testResults: InsertTestResult[]): Promise<TestResult[]> {
    const createdResults: TestResult[] = [];
    
    for (const testResult of testResults) {
      const created = await this.createTestResult(testResult);
      createdResults.push(created);
    }
    
    return createdResults;
  }
}

export const storage = new MemStorage();
