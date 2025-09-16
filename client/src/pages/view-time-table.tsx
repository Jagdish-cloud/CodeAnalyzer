import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, BookOpen, User } from "lucide-react";
import type { TimeTable, TimeTableEntry, Subject, Staff } from "@shared/schema";

export default function ViewTimeTable() {
  const params = useParams<{ id: string }>();
  const timeTableId = parseInt(params?.id || "0");

  const { data: timeTable, isLoading: timeTableLoading } = useQuery<TimeTable>({
    queryKey: ["/api/time-tables", timeTableId],
    queryFn: async () => {
      const response = await fetch(`/api/time-tables/${timeTableId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch time table");
      }
      return response.json();
    },
    enabled: !!timeTableId,
  });

  const { data: entries = [], isLoading: entriesLoading } = useQuery<TimeTableEntry[]>({
    queryKey: ["/api/time-tables", timeTableId, "entries"],
    queryFn: async () => {
      const response = await fetch(`/api/time-tables/${timeTableId}/entries`);
      if (!response.ok) {
        throw new Error("Failed to fetch time table entries");
      }
      return response.json();
    },
    enabled: !!timeTableId,
  });

  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
    queryFn: async () => {
      const response = await fetch("/api/subjects");
      if (!response.ok) {
        throw new Error("Failed to fetch subjects");
      }
      return response.json();
    },
  });

  const { data: staff = [] } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
    queryFn: async () => {
      const response = await fetch("/api/staff");
      if (!response.ok) {
        throw new Error("Failed to fetch staff");
      }
      return response.json();
    },
  });

  if (timeTableLoading || entriesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <div className="text-lg text-blue-600 dark:text-blue-400">
              Loading time table...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!timeTable) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <div className="text-lg text-red-600 dark:text-red-400">
              Time table not found
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Group entries by day and schedule slot
  const groupedEntries = entries.reduce((acc, entry) => {
    if (!acc[entry.dayOfWeek]) {
      acc[entry.dayOfWeek] = {};
    }
    acc[entry.dayOfWeek][entry.scheduleSlot] = entry;
    return acc;
  }, {} as Record<string, Record<string, TimeTableEntry>>);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const scheduleSlots = Array.from(new Set(entries.map(e => e.scheduleSlot))).sort();

  const getSubjectName = (subjectId: number | null) => {
    if (!subjectId) return null;
    return subjects.find(s => s.id === subjectId)?.subjectName || "Unknown Subject";
  };

  const getTeacherName = (teacherId: number | null) => {
    if (!teacherId) return null;
    return staff.find(s => s.id === teacherId)?.name || "Unknown Teacher";
  };

  const getSubjectNames = (subjectIds: string | null) => {
    if (!subjectIds) return [];
    return subjectIds.split(',').map(id => getSubjectName(parseInt(id))).filter(Boolean);
  };

  const getTeacherNames = (teacherIds: string | null) => {
    if (!teacherIds) return [];
    return teacherIds.split(',').map(id => getTeacherName(parseInt(id))).filter(Boolean);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Time Table View
          </h1>
          <p className="text-blue-700 dark:text-blue-300">
            Class {timeTable.className} - Division {timeTable.division}
          </p>
        </div>

        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-blue-200 dark:border-blue-800 shadow-2xl shadow-blue-200/50 dark:shadow-blue-900/30 mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-700 dark:text-blue-300 flex items-center">
              <Calendar className="mr-2 h-6 w-6" />
              Time Table Details
            </CardTitle>
            <CardDescription className="text-blue-600 dark:text-blue-400">
              Academic Year: {timeTable.academicYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-blue-700 dark:text-blue-300">
                  Class {timeTable.className} - Division {timeTable.division}
                </span>
              </div>
              <Badge
                variant={timeTable.status === "active" ? "default" : "secondary"}
                className={
                  timeTable.status === "active"
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                    : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                }
              >
                {timeTable.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-blue-200 dark:border-blue-800 shadow-2xl shadow-blue-200/50 dark:shadow-blue-900/30">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-700 dark:text-blue-300 flex items-center">
              <BookOpen className="mr-2 h-6 w-6" />
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-blue-200 dark:border-blue-700 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900">
                    <TableHead className="text-blue-700 dark:text-blue-300 font-semibold min-w-[120px]">
                      Day
                    </TableHead>
                    {scheduleSlots.map((slot) => (
                      <TableHead 
                        key={slot}
                        className="text-blue-700 dark:text-blue-300 font-semibold text-center min-w-[200px]"
                      >
                        {slot}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {days.map((day) => (
                    <TableRow key={day} className="hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors">
                      <TableCell className="font-medium text-blue-700 dark:text-blue-300">
                        {day}
                      </TableCell>
                      {scheduleSlots.map((slot) => {
                        const entry = groupedEntries[day]?.[slot];
                        return (
                          <TableCell key={slot} className="text-center">
                            {entry ? (
                              <div className="space-y-1">
                                {entry.electiveGroupName ? (
                                  // Elective group entry
                                  <div className="text-sm">
                                    <div className="font-medium text-purple-700 dark:text-purple-300">
                                      {entry.electiveGroupName}
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                      {getSubjectNames(entry.subjectIds).join(', ')}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-500">
                                      {getTeacherNames(entry.teacherIds).join(', ')}
                                    </div>
                                  </div>
                                ) : (
                                  // Regular subject entry
                                  <div className="text-sm">
                                    <div className="font-medium text-blue-700 dark:text-blue-300 flex items-center justify-center">
                                      <BookOpen className="mr-1 h-3 w-3" />
                                      {getSubjectName(entry.subjectId)}
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center justify-center">
                                      <User className="mr-1 h-3 w-3" />
                                      {getTeacherName(entry.teacherId)}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-600">-</span>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
