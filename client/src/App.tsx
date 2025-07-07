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
