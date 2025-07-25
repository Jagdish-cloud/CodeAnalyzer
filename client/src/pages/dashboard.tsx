import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  Users, 
  BookOpen, 
  TrendingUp,
  Plus,
  Eye,
  BarChart3,
  Calendar,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import { cn } from '@/lib/utils';
import type { PublicHoliday } from '@shared/schema';

export default function Dashboard() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const { data: holidays = [], isLoading: holidaysLoading } = useQuery<PublicHoliday[]>({
    queryKey: ['/api/public-holidays', selectedYear],
    queryFn: async () => {
      const response = await fetch(`/api/public-holidays/year/${selectedYear}`);
      if (!response.ok) throw new Error('Failed to fetch holidays');
      return response.json();
    },
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getHolidaysForDate = (date: Date) => {
    // Format date as YYYY-MM-DD in local timezone to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    return holidays.filter(holiday => {
      return dateString >= holiday.fromDate && dateString <= holiday.toDate;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth === 11) {
        setSelectedMonth(0);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-16 p-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-lg"></div>
      );
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(selectedYear, selectedMonth, day);
      const dayHolidays = getHolidaysForDate(currentDate);
      const isToday = currentDate.toDateString() === new Date().toDateString();

      days.push(
        <div
          key={day}
          className={cn(
            "h-16 p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-800",
            isToday && "ring-2 ring-blue-400/50 bg-blue-50 dark:bg-blue-900/20",
            dayHolidays.length > 0 && "bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-800"
          )}
        >
          <div className="flex justify-between items-start mb-1">
            <span className={cn(
              "text-sm font-medium",
              isToday ? "text-blue-600 dark:text-blue-400" : "text-slate-700 dark:text-slate-300"
            )}>
              {day}
            </span>
            {dayHolidays.length > 0 && (
              <Badge variant="secondary" className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                {dayHolidays.length}
              </Badge>
            )}
          </div>
          <div className="space-y-1">
            {dayHolidays.slice(0, 1).map((holiday, index) => (
              <div
                key={index}
                className="text-xs p-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-700 dark:text-slate-300 truncate"
                title={holiday.holidayDescription}
              >
                {holiday.holidayDescription}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  const stats = [
    {
      title: "Total Institutions",
      value: "12",
      change: "+2 this month",
      icon: Building,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Active Students",
      value: "1,234",
      change: "+5% from last month",
      icon: Users,
      color: "from-emerald-500 to-emerald-600"
    },
    {
      title: "Modules Mapped",
      value: "48",
      change: "+8 new mappings",
      icon: BookOpen,
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "System Usage",
      value: "92%",
      change: "+12% from last week",
      icon: TrendingUp,
      color: "from-orange-500 to-orange-600"
    }
  ];

  const recentInstitutions = [
    { name: "Springfield Elementary", location: "Springfield, IL", status: "Active", students: 245 },
    { name: "Riverside High School", location: "Riverside, CA", status: "Active", students: 890 },
    { name: "Mountain View Academy", location: "Denver, CO", status: "Pending", students: 156 },
    { name: "Coastal Community College", location: "Miami, FL", status: "Active", students: 1240 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-violet-950 dark:via-purple-950 dark:to-pink-950">
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-lg">
                Welcome to your School Management System
              </p>
            </div>
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus className="h-5 w-5 mr-2" />
              Add Institution
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className={`border-0 shadow-lg bg-gradient-to-br ${stat.color} text-white card-hover`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/80 text-sm font-medium">{stat.title}</p>
                        <p className="text-3xl font-bold">{stat.value}</p>
                        <p className="text-xs text-white/70">{stat.change}</p>
                      </div>
                      <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Recent Institutions & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader className="border-b border-slate-200 dark:border-slate-700 pb-6">
                <CardTitle className="flex items-center space-x-3 text-slate-900 dark:text-slate-100">
                  <Building className="h-6 w-6 text-blue-600" />
                  <span className="text-xl font-semibold">Recent Institutions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {recentInstitutions.map((institution, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <div className="space-y-1">
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100">{institution.name}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{institution.location}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">{institution.students} students</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          institution.status === 'Active' 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {institution.status}
                        </span>
                        <Button variant="outline" size="sm" className="border-slate-200 dark:border-slate-700">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader className="border-b border-slate-200 dark:border-slate-700 pb-6">
                <CardTitle className="flex items-center space-x-3 text-slate-900 dark:text-slate-100">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                  <span className="text-xl font-semibold">Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Button className="w-full justify-start bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30" variant="outline">
                    <Building className="h-5 w-5 mr-3" />
                    Create New Institution
                  </Button>
                  <Button className="w-full justify-start bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700 hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-900/30 dark:hover:to-purple-800/30" variant="outline">
                    <BookOpen className="h-5 w-5 mr-3" />
                    Class/Subject Mapping
                  </Button>
                  <Button className="w-full justify-start bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700 hover:from-emerald-100 hover:to-emerald-200 dark:hover:from-emerald-900/30 dark:hover:to-emerald-800/30" variant="outline">
                    <Users className="h-5 w-5 mr-3" />
                    Manage Staff
                  </Button>
                  <Button className="w-full justify-start bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700 hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-900/30 dark:hover:to-orange-800/30" variant="outline">
                    <BarChart3 className="h-5 w-5 mr-3" />
                    View Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Holiday Calendar Section */}
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader className="border-b border-slate-200 dark:border-slate-700 pb-6">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-3 text-slate-900 dark:text-slate-100">
                  <Calendar className="h-6 w-6 text-purple-600" />
                  <span className="text-xl font-semibold">Holiday Calendar - {monthNames[selectedMonth]} {selectedYear}</span>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                    className="border-slate-200 dark:border-slate-700"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('next')}
                    className="border-slate-200 dark:border-slate-700"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {holidaysLoading ? (
                <div className="grid grid-cols-7 gap-4">
                  {Array.from({ length: 35 }, (_, i) => (
                    <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <>
                  {/* Week days header */}
                  <div className="grid grid-cols-7 gap-4 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-sm font-medium text-slate-600 dark:text-slate-400 p-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-4">
                    {renderCalendar()}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}