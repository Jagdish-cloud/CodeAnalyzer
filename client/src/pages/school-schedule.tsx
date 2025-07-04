import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Clock } from "lucide-react";
import {
  type WorkingDay,
  type SchoolSchedule,
  type InsertSchoolSchedule,
} from "@shared/schema";

const days = [
  "Monday",
  "Tuesday", 
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const scheduleFormSchema = z.object({
  dayOfWeek: z.string().min(1, "Day of week is required"),
  type: z.enum(["Period", "Break"], {
    required_error: "Type is required",
  }),
  name: z.string().min(1, "Name is required"),
  timingFrom: z.string().min(1, "Start time is required"),
  timingTo: z.string().min(1, "End time is required"),
});

type ScheduleFormData = z.infer<typeof scheduleFormSchema>;

export default function SchoolSchedule() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState("");
  const [modalType, setModalType] = useState<"Period" | "Break">("Period");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch working days to show timings
  const { data: workingDays = [], isLoading: isLoadingWorkingDays } = useQuery({
    queryKey: ["/api/working-days"],
    queryFn: async () => {
      const response = await fetch("/api/working-days");
      if (!response.ok) {
        throw new Error("Failed to fetch working days");
      }
      return response.json() as Promise<WorkingDay[]>;
    },
  });

  // Fetch school schedules
  const { data: schedules = [], isLoading: isLoadingSchedules } = useQuery({
    queryKey: ["/api/school-schedules"],
    queryFn: async () => {
      const response = await fetch("/api/school-schedules");
      if (!response.ok) {
        throw new Error("Failed to fetch school schedules");
      }
      return response.json() as Promise<SchoolSchedule[]>;
    },
  });

  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      dayOfWeek: "",
      type: "Period",
      name: "",
      timingFrom: "",
      timingTo: "",
    },
  });

  // Create schedule mutation
  const createScheduleMutation = useMutation({
    mutationFn: async (data: ScheduleFormData) => {
      const scheduleData: InsertSchoolSchedule = {
        dayOfWeek: data.dayOfWeek,
        type: data.type,
        name: data.name,
        timingFrom: data.timingFrom,
        timingTo: data.timingTo,
      };
      const response = await apiRequest("POST", "/api/school-schedules", scheduleData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/school-schedules"] });
      toast({
        title: "Success",
        description: `${modalType} added successfully`,
      });
      setIsModalOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || `Failed to add ${modalType.toLowerCase()}`,
        variant: "destructive",
      });
    },
  });

  // Delete schedule mutation
  const deleteScheduleMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/school-schedules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/school-schedules"] });
      toast({
        title: "Success",
        description: "Schedule item deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete schedule item",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ScheduleFormData) => {
    createScheduleMutation.mutate(data);
  };

  const openModal = (day: string, type: "Period" | "Break") => {
    setSelectedDay(day);
    setModalType(type);
    form.setValue("dayOfWeek", day);
    form.setValue("type", type);
    
    // Auto-generate name based on existing count
    const daySchedules = schedules.filter(s => s.dayOfWeek === day && s.type === type);
    const nextNumber = daySchedules.length + 1;
    const defaultName = type === "Period" ? `Period-${nextNumber}` : `Break-${nextNumber}`;
    form.setValue("name", defaultName);
    
    setIsModalOpen(true);
  };

  const getWorkingDayInfo = (dayOfWeek: string) => {
    return workingDays.find(day => day.dayOfWeek === dayOfWeek);
  };

  const getSchedulesForDay = (dayOfWeek: string) => {
    return schedules
      .filter(s => s.dayOfWeek === dayOfWeek)
      .sort((a, b) => a.timingFrom.localeCompare(b.timingFrom));
  };

  const getBlockedTimes = (dayOfWeek: string) => {
    const daySchedules = schedules.filter(s => s.dayOfWeek === dayOfWeek);
    return daySchedules.map(s => ({ from: s.timingFrom, to: s.timingTo }));
  };

  if (isLoadingWorkingDays || isLoadingSchedules) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-orange-950 dark:via-red-950 dark:to-pink-950 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <div className="text-lg text-orange-600 dark:text-orange-400">
              Loading school schedule...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-orange-950 dark:via-red-950 dark:to-pink-950 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent mb-2">
            School Schedule
          </h1>
          <p className="text-orange-700 dark:text-orange-300">
            Manage periods and breaks for each day based on working day timings
          </p>
        </div>

        <div className="space-y-6">
          {days.map((day) => {
            const workingDayInfo = getWorkingDayInfo(day);
            const daySchedules = getSchedulesForDay(day);
            
            if (!workingDayInfo || workingDayInfo.dayType === "Holiday") {
              return (
                <Card key={day} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-orange-200 dark:border-orange-800">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-xl text-orange-700 dark:text-orange-300">
                          {day}
                        </CardTitle>
                        <CardDescription className="text-orange-600 dark:text-orange-400">
                          Holiday - No schedule available
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            }

            return (
              <Card key={day} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-orange-200 dark:border-orange-800">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-xl text-orange-700 dark:text-orange-300">
                        {day}
                      </CardTitle>
                      <CardDescription className="text-orange-600 dark:text-orange-400">
                        {workingDayInfo.timingFrom && workingDayInfo.timingTo ? 
                          `Timing: ${workingDayInfo.timingFrom} - ${workingDayInfo.timingTo}` :
                          "No timing set"
                        }
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => openModal(day, "Period")}
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                        disabled={!workingDayInfo.timingFrom || !workingDayInfo.timingTo}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Period
                      </Button>
                      <Button
                        onClick={() => openModal(day, "Break")}
                        size="sm"
                        variant="outline"
                        className="border-orange-300 hover:bg-orange-50 dark:border-orange-700 dark:hover:bg-orange-950"
                        disabled={!workingDayInfo.timingFrom || !workingDayInfo.timingTo}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Break
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {daySchedules.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {daySchedules.map((schedule) => (
                        <div
                          key={schedule.id}
                          className={`p-3 rounded-lg border flex justify-between items-center ${
                            schedule.type === "Period"
                              ? "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800"
                              : "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                          }`}
                        >
                          <div>
                            <div className="font-medium text-sm">
                              {schedule.name}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {schedule.timingFrom} - {schedule.timingTo}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={schedule.type === "Period" ? "default" : "secondary"}
                              className={
                                schedule.type === "Period"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                  : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              }
                            >
                              {schedule.type}
                            </Badge>
                            <Button
                              onClick={() => deleteScheduleMutation.mutate(schedule.id)}
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No periods or breaks added yet</p>
                      <p className="text-sm">Click "Add Period" or "Add Break" to get started</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Add Period/Break Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-800">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Add {modalType}
              </DialogTitle>
              <DialogDescription className="text-orange-600 dark:text-orange-400">
                Add a new {modalType.toLowerCase()} for {selectedDay}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-orange-700 dark:text-orange-300">
                        {modalType} Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={`Enter ${modalType.toLowerCase()} name`}
                          className="border-orange-200 focus:border-orange-400 dark:border-orange-700"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="timingFrom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-orange-700 dark:text-orange-300">
                          Start Time
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="time"
                            className="border-orange-200 focus:border-orange-400 dark:border-orange-700"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timingTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-orange-700 dark:text-orange-300">
                          End Time
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="time"
                            className="border-orange-200 focus:border-orange-400 dark:border-orange-700"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="border-orange-300 hover:bg-orange-50 dark:border-orange-700 dark:hover:bg-orange-950"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createScheduleMutation.isPending}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                  >
                    {createScheduleMutation.isPending ? "Adding..." : `Add ${modalType}`}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}