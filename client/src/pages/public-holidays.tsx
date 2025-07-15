import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Clock, MapPin, Edit, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PublicHoliday } from '@shared/schema';

export default function PublicHolidays() {
  const [, navigate] = useLocation();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const { data: holidays = [], isLoading } = useQuery<PublicHoliday[]>({
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
    const dateString = date.toISOString().split('T')[0];
    return holidays.filter(holiday => {
      // Compare date strings directly to avoid timezone issues
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
        <div key={`empty-${i}`} className="h-24 p-2 border border-white/10 bg-white/5 rounded-lg"></div>
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
            "h-24 p-2 border border-white/10 bg-white/5 rounded-lg transition-all duration-300 hover:bg-white/10",
            isToday && "ring-2 ring-yellow-400/50 bg-yellow-400/10",
            dayHolidays.length > 0 && "bg-gradient-to-br from-red-500/20 to-pink-500/20 border-red-400/30"
          )}
        >
          <div className="flex justify-between items-start mb-1">
            <span className={cn(
              "text-sm font-medium",
              isToday ? "text-yellow-400" : "text-white/80"
            )}>
              {day}
            </span>
            {dayHolidays.length > 0 && (
              <Badge variant="secondary" className="text-xs bg-red-500/20 text-red-200 border-red-400/30">
                {dayHolidays.length}
              </Badge>
            )}
          </div>
          <div className="space-y-1">
            {dayHolidays.slice(0, 2).map((holiday, index) => (
              <div
                key={index}
                className="text-xs p-1 bg-white/10 rounded text-white/90 truncate"
                title={holiday.holidayDescription}
              >
                {holiday.holidayDescription}
              </div>
            ))}
            {dayHolidays.length > 2 && (
              <div className="text-xs text-white/60">
                +{dayHolidays.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const getUpcomingHolidays = () => {
    const today = new Date();
    return holidays
      .filter(holiday => new Date(holiday.fromDate) >= today)
      .sort((a, b) => new Date(a.fromDate).getTime() - new Date(b.fromDate).getTime())
      .slice(0, 5);
  };

  if (isLoading) {
    return (
      <div className="p-8 min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-7 gap-4">
            {Array.from({ length: 35 }, (_, i) => (
              <div key={i} className="h-24 bg-white/5 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Public Holiday & Vacation Master
              </h1>
              <p className="text-white/70">
                Manage school holidays and vacation periods
              </p>
            </div>
            <Button
              onClick={() => navigate('/add-public-holiday')}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Holiday
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl text-white">
                    {monthNames[selectedMonth]} {selectedYear}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth('prev')}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth('next')}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Week days header */}
                <div className="grid grid-cols-7 gap-4 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-white/80 p-2">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-4">
                  {renderCalendar()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Year Selector */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">Select Year</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {[selectedYear - 1, selectedYear, selectedYear + 1].map(year => (
                    <Button
                      key={year}
                      variant={year === selectedYear ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedYear(year)}
                      className={cn(
                        "w-full",
                        year === selectedYear
                          ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                          : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                      )}
                    >
                      {year}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Holidays */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Upcoming Holidays
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getUpcomingHolidays().length > 0 ? (
                    getUpcomingHolidays().map((holiday, index) => (
                      <div
                        key={index}
                        className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">
                            {holiday.holidayDescription}
                          </span>
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "text-xs",
                              holiday.holidayType === 'full_day' 
                                ? "bg-red-500/20 text-red-200 border-red-400/30" 
                                : "bg-yellow-500/20 text-yellow-200 border-yellow-400/30"
                            )}
                          >
                            {holiday.holidayType === 'full_day' ? 'Full Day' : 'Half Day'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/60">
                          <Calendar className="w-3 h-3" />
                          {new Date(holiday.fromDate).toLocaleDateString()}
                          {holiday.fromDate !== holiday.toDate && (
                            <span> - {new Date(holiday.toDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-white/60">
                      No upcoming holidays
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">Holiday Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Total Holidays</span>
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-200 border-blue-400/30">
                      {holidays.length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Full Day</span>
                    <Badge variant="secondary" className="bg-red-500/20 text-red-200 border-red-400/30">
                      {holidays.filter(h => h.holidayType === 'full_day').length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Half Day</span>
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-200 border-yellow-400/30">
                      {holidays.filter(h => h.holidayType === 'half_day').length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}