import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type WorkingDay, type InsertWorkingDay, insertWorkingDaySchema } from "@shared/schema";

const days = [
  "Monday",
  "Tuesday", 
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

const dayTypeOptions = [
  { value: "FullDay", label: "Full Day" },
  { value: "HalfDay", label: "Half Day" },
  { value: "Holiday", label: "Holiday" },
  { value: "AlternateWeek", label: "Alternate Week" }
];

const weekOptions = ["W1", "W2", "W3", "W4", "W5"];

interface WorkingDayFormData {
  dayOfWeek: string;
  dayType: string;
  alternateWeeks?: string[] | null;
  timingFrom?: string | null;
  timingTo?: string | null;
}

const workingDayFormSchema = z.object({
  dayOfWeek: z.string().min(1, "Day of week is required"),
  dayType: z.string().min(1, "Day type is required"),
  alternateWeeks: z.array(z.string()).optional(),
  timingFrom: z.string().optional(),
  timingTo: z.string().optional(),
});

export default function WorkingDays() {
  const [isEditing, setIsEditing] = useState(false);
  const [currentWorkingDays, setCurrentWorkingDays] = useState<WorkingDay[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing working days
  const { data: workingDays = [], isLoading } = useQuery({
    queryKey: ["/api/working-days"],
    queryFn: async () => {
      const response = await fetch("/api/working-days");
      if (!response.ok) {
        throw new Error("Failed to fetch working days");
      }
      return response.json() as Promise<WorkingDay[]>;
    },
  });

  // Initialize working days data
  useEffect(() => {
    if (workingDays.length > 0) {
      setCurrentWorkingDays(workingDays);
    } else {
      // Initialize with default structure for all days
      const defaultDays = days.map((day) => ({
        id: 0,
        dayOfWeek: day,
        dayType: "FullDay",
        alternateWeeks: null,
        timingFrom: "09:00",
        timingTo: "17:00",
      }));
      setCurrentWorkingDays(defaultDays);
    }
  }, [workingDays]);

  // Form setup
  const form = useForm<WorkingDayFormData>({
    resolver: zodResolver(workingDayFormSchema),
  });

  // Save working days mutation
  const saveWorkingDaysMutation = useMutation({
    mutationFn: async (data: WorkingDayFormData[]) => {
      const promises = data.map(async (dayData) => {
        const workingDayData: InsertWorkingDay = {
          dayOfWeek: dayData.dayOfWeek,
          dayType: dayData.dayType,
          alternateWeeks: dayData.alternateWeeks || null,
          timingFrom: dayData.timingFrom || null,
          timingTo: dayData.timingTo || null,
        };
        
        return apiRequest("/api/working-days", "POST", workingDayData);
      });
      
      return await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/working-days"] });
      toast({
        title: "Success",
        description: "Working days saved successfully",
      });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      console.error("Error saving working days:", error);
      toast({
        title: "Error",
        description: "Failed to save working days",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    const formData = currentWorkingDays.map(day => ({
      dayOfWeek: day.dayOfWeek,
      dayType: day.dayType,
      alternateWeeks: day.alternateWeeks,
      timingFrom: day.timingFrom,
      timingTo: day.timingTo,
    }));
    saveWorkingDaysMutation.mutate(formData);
  };

  const handleDayChange = (dayIndex: number, field: string, value: any) => {
    const updatedDays = [...currentWorkingDays];
    updatedDays[dayIndex] = {
      ...updatedDays[dayIndex],
      [field]: value,
    };
    setCurrentWorkingDays(updatedDays);
  };

  const handleAlternateWeeksChange = (dayIndex: number, week: string, checked: boolean) => {
    const updatedDays = [...currentWorkingDays];
    const currentWeeks = updatedDays[dayIndex].alternateWeeks || [];
    
    if (checked) {
      updatedDays[dayIndex].alternateWeeks = [...currentWeeks, week];
    } else {
      updatedDays[dayIndex].alternateWeeks = currentWeeks.filter(w => w !== week);
    }
    
    setCurrentWorkingDays(updatedDays);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-orange-950 dark:via-red-950 dark:to-pink-950 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-8">
            <div className="text-lg text-orange-600 dark:text-orange-400">Loading working days...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-orange-950 dark:via-red-950 dark:to-pink-950 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Working Days Configuration
          </h1>
          <p className="text-orange-700 dark:text-orange-300">
            Configure school working days and timings for each day of the week
          </p>
        </div>

        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-orange-200 dark:border-orange-800 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white rounded-t-lg">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold">Working Days Schedule</CardTitle>
                <CardDescription className="text-orange-100">
                  Set up your school's working days and timings
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {!isEditing ? (
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="bg-white text-orange-600 hover:bg-orange-50 font-medium"
                  >
                    Edit Schedule
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSave}
                      disabled={saveWorkingDaysMutation.isPending}
                      className="bg-white text-orange-600 hover:bg-orange-50 font-medium"
                    >
                      {saveWorkingDaysMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-orange-200 dark:border-orange-700">
                    <th className="text-left p-3 font-semibold text-orange-800 dark:text-orange-200">Day</th>
                    <th className="text-left p-3 font-semibold text-orange-800 dark:text-orange-200">Type</th>
                    <th className="text-left p-3 font-semibold text-orange-800 dark:text-orange-200">Alternate Weeks</th>
                    <th className="text-left p-3 font-semibold text-orange-800 dark:text-orange-200">Timing From</th>
                    <th className="text-left p-3 font-semibold text-orange-800 dark:text-orange-200">Timing To</th>
                  </tr>
                </thead>
                <tbody>
                  {currentWorkingDays.map((day, index) => (
                    <tr key={day.dayOfWeek} className="border-b border-orange-100 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/30">
                      <td className="p-3 font-medium text-orange-900 dark:text-orange-100">
                        {day.dayOfWeek}
                      </td>
                      <td className="p-3">
                        {isEditing ? (
                          <Select
                            value={day.dayType}
                            onValueChange={(value) => handleDayChange(index, "dayType", value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {dayTypeOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-orange-700 dark:text-orange-300">
                            {dayTypeOptions.find(opt => opt.value === day.dayType)?.label}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {day.dayType === "AlternateWeek" ? (
                          isEditing ? (
                            <div className="flex gap-2 flex-wrap">
                              {weekOptions.map((week) => (
                                <div key={week} className="flex items-center space-x-1">
                                  <Checkbox
                                    id={`${day.dayOfWeek}-${week}`}
                                    checked={(day.alternateWeeks || []).includes(week)}
                                    onCheckedChange={(checked) => 
                                      handleAlternateWeeksChange(index, week, checked as boolean)
                                    }
                                  />
                                  <label 
                                    htmlFor={`${day.dayOfWeek}-${week}`}
                                    className="text-sm font-medium text-orange-700 dark:text-orange-300"
                                  >
                                    {week}
                                  </label>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-orange-700 dark:text-orange-300">
                              {(day.alternateWeeks || []).join(", ") || "None"}
                            </span>
                          )
                        ) : (
                          <span className="text-orange-500 dark:text-orange-400">N/A</span>
                        )}
                      </td>
                      <td className="p-3">
                        {day.dayType !== "Holiday" ? (
                          isEditing ? (
                            <Input
                              type="time"
                              value={day.timingFrom || ""}
                              onChange={(e) => handleDayChange(index, "timingFrom", e.target.value)}
                              className="w-full"
                            />
                          ) : (
                            <span className="text-orange-700 dark:text-orange-300">
                              {day.timingFrom || "Not set"}
                            </span>
                          )
                        ) : (
                          <span className="text-orange-500 dark:text-orange-400">N/A</span>
                        )}
                      </td>
                      <td className="p-3">
                        {day.dayType !== "Holiday" ? (
                          isEditing ? (
                            <Input
                              type="time"
                              value={day.timingTo || ""}
                              onChange={(e) => handleDayChange(index, "timingTo", e.target.value)}
                              className="w-full"
                            />
                          ) : (
                            <span className="text-orange-700 dark:text-orange-300">
                              {day.timingTo || "Not set"}
                            </span>
                          )
                        ) : (
                          <span className="text-orange-500 dark:text-orange-400">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}