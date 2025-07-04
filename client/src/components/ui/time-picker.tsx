import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Clock, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function TimePicker({ 
  value = "", 
  onChange, 
  placeholder = "Select time",
  className,
  disabled = false
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState(9);
  const [minutes, setMinutes] = useState(0);

  // Parse time value when it changes
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':').map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        setHours(h);
        setMinutes(m);
      }
    }
  }, [value]);

  const formatTime = (h: number, m: number) => {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const formatDisplayTime = (h: number, m: number) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const handleTimeChange = (newHours: number, newMinutes: number) => {
    setHours(newHours);
    setMinutes(newMinutes);
    onChange(formatTime(newHours, newMinutes));
  };

  const adjustHours = (increment: boolean) => {
    const newHours = increment 
      ? (hours + 1) % 24 
      : (hours - 1 + 24) % 24;
    handleTimeChange(newHours, minutes);
  };

  const adjustMinutes = (increment: boolean) => {
    const newMinutes = increment 
      ? (minutes + 15) % 60 
      : (minutes - 15 + 60) % 60;
    handleTimeChange(hours, newMinutes);
  };

  const quickTimes = [
    { label: "9:00 AM", value: "09:00" },
    { label: "10:00 AM", value: "10:00" },
    { label: "11:00 AM", value: "11:00" },
    { label: "12:00 PM", value: "12:00" },
    { label: "1:00 PM", value: "13:00" },
    { label: "2:00 PM", value: "14:00" },
    { label: "3:00 PM", value: "15:00" },
    { label: "4:00 PM", value: "16:00" },
    { label: "5:00 PM", value: "17:00" },
  ];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal transition-all duration-200",
            !value && "text-muted-foreground",
            "border-orange-200 hover:border-orange-300 focus:border-orange-400 dark:border-orange-700",
            "hover:shadow-lg hover:shadow-orange-100 dark:hover:shadow-orange-900/20",
            "bg-gradient-to-r from-white to-orange-50 dark:from-gray-800 dark:to-orange-950",
            value && "bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4 text-orange-500 animate-pulse" />
          <span className="font-medium">
            {value ? formatDisplayTime(hours, minutes) : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-gradient-to-br from-white via-orange-50 to-red-50 dark:from-gray-800 dark:via-orange-950 dark:to-red-950 border border-orange-200 dark:border-orange-800 shadow-2xl shadow-orange-200/50 dark:shadow-orange-900/30" align="start">
        <div className="p-4 border-b border-orange-100 dark:border-orange-900 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900">
          <h4 className="font-medium text-orange-700 dark:text-orange-300 flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            Select Time
          </h4>
        </div>
        
        {/* Custom Time Picker */}
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-center space-x-4">
            {/* Hours */}
            <div className="flex flex-col items-center space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => adjustHours(true)}
                className="h-8 w-8 p-0 hover:bg-gradient-to-b hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-900 dark:hover:to-orange-800 transition-all duration-200 hover:scale-110"
              >
                <ChevronUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </Button>
              <div className="text-2xl font-mono font-bold text-center w-14 py-3 bg-gradient-to-br from-orange-100 via-orange-50 to-red-50 dark:from-orange-900 dark:via-orange-950 dark:to-red-950 rounded-xl border-2 border-orange-200 dark:border-orange-800 shadow-lg text-orange-700 dark:text-orange-300 transition-all duration-300 hover:shadow-xl">
                {hours.toString().padStart(2, '0')}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => adjustHours(false)}
                className="h-8 w-8 p-0 hover:bg-gradient-to-b hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-900 dark:hover:to-orange-800 transition-all duration-200 hover:scale-110"
              >
                <ChevronDown className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </Button>
              <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">Hours</span>
            </div>

            <div className="text-3xl font-bold text-transparent bg-gradient-to-b from-orange-500 to-red-500 bg-clip-text animate-pulse">:</div>

            {/* Minutes */}
            <div className="flex flex-col items-center space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => adjustMinutes(true)}
                className="h-8 w-8 p-0 hover:bg-gradient-to-b hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-900 dark:hover:to-orange-800 transition-all duration-200 hover:scale-110"
              >
                <ChevronUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </Button>
              <div className="text-2xl font-mono font-bold text-center w-14 py-3 bg-gradient-to-br from-orange-100 via-orange-50 to-red-50 dark:from-orange-900 dark:via-orange-950 dark:to-red-950 rounded-xl border-2 border-orange-200 dark:border-orange-800 shadow-lg text-orange-700 dark:text-orange-300 transition-all duration-300 hover:shadow-xl">
                {minutes.toString().padStart(2, '0')}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => adjustMinutes(false)}
                className="h-8 w-8 p-0 hover:bg-gradient-to-b hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-900 dark:hover:to-orange-800 transition-all duration-200 hover:scale-110"
              >
                <ChevronDown className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </Button>
              <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">Minutes</span>
            </div>
          </div>

          <div className="text-center p-3 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 rounded-xl border border-orange-200 dark:border-orange-800">
            <div className="text-xl font-bold text-transparent bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text">
              {formatDisplayTime(hours, minutes)}
            </div>
            <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">Selected Time</div>
          </div>
        </div>

        {/* Quick Time Selection */}
        <div className="p-4 border-t border-orange-100 dark:border-orange-900 bg-gradient-to-b from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
          <h5 className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-3 flex items-center">
            <Clock className="mr-1 h-3 w-3" />
            Quick Select
          </h5>
          <div className="grid grid-cols-3 gap-2">
            {quickTimes.map((time) => (
              <Button
                key={time.value}
                variant="ghost"
                size="sm"
                onClick={() => {
                  onChange(time.value);
                  setIsOpen(false);
                }}
                className="text-xs font-medium bg-white dark:bg-gray-800 hover:bg-gradient-to-r hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-900 dark:hover:to-orange-800 hover:text-orange-700 dark:hover:text-orange-300 border border-orange-200 dark:border-orange-700 transition-all duration-200 hover:scale-105 hover:shadow-md"
              >
                {time.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-orange-100 dark:border-orange-900 flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="border-orange-300 hover:bg-orange-50 dark:border-orange-700 dark:hover:bg-orange-950"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => setIsOpen(false)}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
          >
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}