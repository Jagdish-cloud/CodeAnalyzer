import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/layout";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Staff from "@/pages/staff";
import AddStaff from "@/pages/add-staff";
import ClassMapping from "@/pages/class-mapping";
import AddClassMapping from "@/pages/add-class-mapping";
import TeacherMapping from "@/pages/teacher-mapping";
import AddTeacherMapping from "@/pages/add-teacher-mapping";
import Roles from "@/pages/roles";
import AddRole from "@/pages/add-role";
import Subjects from "@/pages/subjects";
import AddSubject from "@/pages/add-subject";
import WorkingDays from "@/pages/working-days";
import SchoolSchedule from "@/pages/school-schedule";
import TimeTableLanding from "@/pages/time-table";
import AddTimeTable from "@/pages/add-time-table";
import StudentMasters from "@/pages/student-masters";
import StudentsLanding from "@/pages/students-landing";
import AddStudent from "@/pages/add-student";
import SyllabusMaster from "@/pages/syllabus-master";
import SyllabusClass from "@/pages/syllabus-class";
import AddSyllabus from "@/pages/add-syllabus";
import PeriodicTest from "@/pages/periodic-test";
import AddPeriodicTest from "@/pages/add-periodic-test";
import PublicHolidays from "@/pages/public-holidays";
import AddPublicHoliday from "@/pages/add-public-holiday";
import HandBook from "@/pages/hand-book";
import AddHandBook from "@/pages/add-hand-book";
import Newsletter from "@/pages/newsletter";
import AddNewsletter from "@/pages/add-newsletter";
import Events from "@/pages/events";
import AddEvent from "@/pages/add-event";
import BusRoutes from "@/pages/bus-routes";
import AddBusRoute from "@/pages/add-bus-route";
import EditBusRoute from "@/pages/edit-bus-route";
import NewsCirculars from "@/pages/news-circulars";
import AddNewsCircular from "@/pages/add-news-circular";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/staff" component={Staff} />
        <Route path="/staff/add" component={AddStaff} />
        <Route path="/class-mapping" component={ClassMapping} />
        <Route path="/add-class-mapping" component={AddClassMapping} />
        <Route path="/teacher-mapping" component={TeacherMapping} />
        <Route path="/add-teacher-mapping" component={AddTeacherMapping} />
        <Route path="/roles" component={Roles} />
        <Route path="/add-role" component={AddRole} />
        <Route path="/subjects" component={Subjects} />
        <Route path="/add-subject" component={AddSubject} />
        <Route path="/working-days" component={WorkingDays} />
        <Route path="/school-schedule" component={SchoolSchedule} />
        <Route path="/time-table" component={TimeTableLanding} />
        <Route path="/add-time-table" component={AddTimeTable} />
        <Route path="/student-masters" component={StudentMasters} />
        <Route path="/students/:class/:division" component={StudentsLanding} />
        <Route path="/add-student" component={AddStudent} />
        <Route path="/syllabus-master" component={SyllabusMaster} />
        <Route path="/syllabus-master/class/:className" component={SyllabusClass} />
        <Route path="/syllabus-master/add" component={AddSyllabus} />
        <Route path="/periodic-test" component={PeriodicTest} />
        <Route path="/periodic-test/add" component={AddPeriodicTest} />
        <Route path="/public-holidays" component={PublicHolidays} />
        <Route path="/add-public-holiday" component={AddPublicHoliday} />
        <Route path="/hand-book" component={HandBook} />
        <Route path="/add-hand-book" component={AddHandBook} />
        <Route path="/newsletter" component={Newsletter} />
        <Route path="/add-newsletter" component={AddNewsletter} />
        <Route path="/events" component={Events} />
        <Route path="/add-event" component={AddEvent} />
        <Route path="/bus-routes" component={BusRoutes} />
        <Route path="/add-bus-route" component={AddBusRoute} />
        <Route path="/edit-bus-route/:id" component={EditBusRoute} />
        <Route path="/news-circulars" component={NewsCirculars} />
        <Route path="/add-news-circular" component={AddNewsCircular} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
