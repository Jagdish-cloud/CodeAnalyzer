import { useState, useEffect, useRef, useCallback } from "react";
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
  minTime?: string;
  maxTime?: string;
}

export function TimePicker({ 
  value = "", 
  onChange, 
  placeholder = "Select time",
  className,
  disabled = false,
  minTime = "06:00",
  maxTime = "23:59"
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState(9);
  const [minutes, setMinutes] = useState(0);
  const hourScrollRef = useRef<HTMLDivElement>(null);
  const minuteScrollRef = useRef<HTMLDivElement>(null);

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

  // Generate available hours and minutes based on constraints
  const [minHour, minMinute] = minTime.split(':').map(Number);
  const [maxHour, maxMinute] = maxTime.split(':').map(Number);

  const getAvailableHours = () => {
    const availableHours = [];
    for (let h = minHour; h <= maxHour; h++) {
      availableHours.push(h);
    }
    return availableHours;
  };

  const getAvailableMinutes = (selectedHour: number) => {
    const availableMinutes = [];
    let startMinute = 0;
    let endMinute = 59;

    if (selectedHour === minHour) {
      startMinute = minMinute;
    }
    if (selectedHour === maxHour) {
      endMinute = maxMinute;
    }

    for (let m = startMinute; m <= endMinute; m++) {
      availableMinutes.push(m);
    }
    return availableMinutes;
  };

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

  const handleHourSelect = (hour: number) => {
    const availableMinutes = getAvailableMinutes(hour);
    let newMinutes = minutes;
    
    // Adjust minutes if current minute is not available for the new hour
    if (!availableMinutes.includes(minutes)) {
      newMinutes = availableMinutes[0] || 0;
    }
    
    handleTimeChange(hour, newMinutes);
  };

  // Handle mouse wheel scrolling
  const handleWheelScroll = useCallback((e: WheelEvent, type: 'hour' | 'minute') => {
    e.preventDefault();
    e.stopPropagation();
    
    if (type === 'hour') {
      const availableHours = getAvailableHours();
      const currentIndex = availableHours.indexOf(hours);
      const direction = e.deltaY > 0 ? 1 : -1;
      const newIndex = Math.max(0, Math.min(availableHours.length - 1, currentIndex + direction));
      handleHourSelect(availableHours[newIndex]);
    } else {
      const availableMinutes = getAvailableMinutes(hours);
      const currentIndex = availableMinutes.indexOf(minutes);
      const direction = e.deltaY > 0 ? 1 : -1;
      const newIndex = Math.max(0, Math.min(availableMinutes.length - 1, currentIndex + direction));
      handleTimeChange(hours, availableMinutes[newIndex]);
    }
  }, [hours, minutes, handleTimeChange, getAvailableHours, getAvailableMinutes]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent, type: 'hour' | 'minute') => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      
      if (type === 'hour') {
        const availableHours = getAvailableHours();
        const currentIndex = availableHours.indexOf(hours);
        const direction = e.key === 'ArrowUp' ? -1 : 1;
        const newIndex = Math.max(0, Math.min(availableHours.length - 1, currentIndex + direction));
        handleHourSelect(availableHours[newIndex]);
      } else {
        const availableMinutes = getAvailableMinutes(hours);
        const currentIndex = availableMinutes.indexOf(minutes);
        const direction = e.key === 'ArrowUp' ? -1 : 1;
        const newIndex = Math.max(0, Math.min(availableMinutes.length - 1, currentIndex + direction));
        handleTimeChange(hours, availableMinutes[newIndex]);
      }
    }
  }, [hours, minutes, handleTimeChange, getAvailableHours, getAvailableMinutes]);

  // Attach wheel and keyboard event listeners
  useEffect(() => {
    const hourElement = hourScrollRef.current;
    const minuteElement = minuteScrollRef.current;

    if (hourElement) {
      const hourWheelHandler = (e: WheelEvent) => handleWheelScroll(e, 'hour');
      const hourKeyHandler = (e: KeyboardEvent) => handleKeyDown(e, 'hour');
      
      hourElement.addEventListener('wheel', hourWheelHandler, { passive: false });
      hourElement.addEventListener('keydown', hourKeyHandler);
      hourElement.setAttribute('tabindex', '0');
      
      return () => {
        hourElement.removeEventListener('wheel', hourWheelHandler);
        hourElement.removeEventListener('keydown', hourKeyHandler);
      };
    }
  }, [handleWheelScroll, handleKeyDown]);

  useEffect(() => {
    const minuteElement = minuteScrollRef.current;

    if (minuteElement) {
      const minuteWheelHandler = (e: WheelEvent) => handleWheelScroll(e, 'minute');
      const minuteKeyHandler = (e: KeyboardEvent) => handleKeyDown(e, 'minute');
      
      minuteElement.addEventListener('wheel', minuteWheelHandler, { passive: false });
      minuteElement.addEventListener('keydown', minuteKeyHandler);
      minuteElement.setAttribute('tabindex', '0');
      
      return () => {
        minuteElement.removeEventListener('wheel', minuteWheelHandler);
        minuteElement.removeEventListener('keydown', minuteKeyHandler);
      };
    }
  }, [handleWheelScroll, handleKeyDown]);

  // Scroll to selected item when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (hourScrollRef.current) {
          const hourElement = hourScrollRef.current.querySelector(`[data-hour="${hours}"]`);
          if (hourElement) {
            hourElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
        if (minuteScrollRef.current) {
          const minuteElement = minuteScrollRef.current.querySelector(`[data-minute="${minutes}"]`);
          if (minuteElement) {
            minuteElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 100);
    }
  }, [isOpen, hours, minutes]);

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
          <Clock className="mr-2 h-4 w-4 text-orange-500" />
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
        
        {/* Scrollable Time Picker */}
        <div className="p-4">
          <div className="flex items-center justify-center space-x-6">
            {/* Hours Column */}
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-xs font-medium text-orange-600 dark:text-orange-400">Hours</span>
                <div className="flex flex-col space-y-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const availableHours = getAvailableHours();
                      const currentIndex = availableHours.indexOf(hours);
                      if (currentIndex > 0) {
                        handleHourSelect(availableHours[currentIndex - 1]);
                      }
                    }}
                    disabled={getAvailableHours().indexOf(hours) === 0}
                    className="h-6 w-6 p-0 hover:bg-orange-100 dark:hover:bg-orange-900"
                  >
                    <ChevronUp className="h-3 w-3 text-orange-600" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const availableHours = getAvailableHours();
                      const currentIndex = availableHours.indexOf(hours);
                      if (currentIndex < availableHours.length - 1) {
                        handleHourSelect(availableHours[currentIndex + 1]);
                      }
                    }}
                    disabled={getAvailableHours().indexOf(hours) === getAvailableHours().length - 1}
                    className="h-6 w-6 p-0 hover:bg-orange-100 dark:hover:bg-orange-900"
                  >
                    <ChevronDown className="h-3 w-3 text-orange-600" />
                  </Button>
                </div>
              </div>
              <div 
                ref={hourScrollRef}
                tabIndex={0}
                className="h-32 w-16 overflow-y-auto scrollbar-thin scrollbar-track-orange-100 scrollbar-thumb-orange-300 dark:scrollbar-track-orange-900 dark:scrollbar-thumb-orange-700 bg-gradient-to-b from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 rounded-lg border border-orange-200 dark:border-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-600"
              >
                <div className="py-2">
                  {getAvailableHours().map((hour) => (
                    <div
                      key={hour}
                      data-hour={hour}
                      onClick={() => handleHourSelect(hour)}
                      className={cn(
                        "text-center py-2 mx-1 rounded-lg cursor-pointer transition-all duration-200 font-mono text-sm font-bold",
                        hour === hours
                          ? "bg-gradient-to-r from-orange-200 to-red-200 dark:from-orange-800 dark:to-red-800 text-orange-700 dark:text-orange-300 shadow-md scale-105"
                          : "hover:bg-orange-100 dark:hover:bg-orange-900 hover:scale-105 text-gray-600 dark:text-gray-400"
                      )}
                    >
                      {hour.toString().padStart(2, '0')}
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-xs text-orange-500 dark:text-orange-400 mt-1 text-center">
                Scroll or use ↑↓
              </div>
            </div>

            <div className="text-2xl font-bold text-transparent bg-gradient-to-b from-orange-500 to-red-500 bg-clip-text">:</div>

            {/* Minutes Column */}
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-xs font-medium text-orange-600 dark:text-orange-400">Minutes</span>
                <div className="flex flex-col space-y-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const availableMinutes = getAvailableMinutes(hours);
                      const currentIndex = availableMinutes.indexOf(minutes);
                      if (currentIndex > 0) {
                        handleTimeChange(hours, availableMinutes[currentIndex - 1]);
                      }
                    }}
                    disabled={getAvailableMinutes(hours).indexOf(minutes) === 0}
                    className="h-6 w-6 p-0 hover:bg-orange-100 dark:hover:bg-orange-900"
                  >
                    <ChevronUp className="h-3 w-3 text-orange-600" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const availableMinutes = getAvailableMinutes(hours);
                      const currentIndex = availableMinutes.indexOf(minutes);
                      if (currentIndex < availableMinutes.length - 1) {
                        handleTimeChange(hours, availableMinutes[currentIndex + 1]);
                      }
                    }}
                    disabled={getAvailableMinutes(hours).indexOf(minutes) === getAvailableMinutes(hours).length - 1}
                    className="h-6 w-6 p-0 hover:bg-orange-100 dark:hover:bg-orange-900"
                  >
                    <ChevronDown className="h-3 w-3 text-orange-600" />
                  </Button>
                </div>
              </div>
              <div 
                ref={minuteScrollRef}
                tabIndex={0}
                className="h-32 w-16 overflow-y-auto scrollbar-thin scrollbar-track-orange-100 scrollbar-thumb-orange-300 dark:scrollbar-track-orange-900 dark:scrollbar-thumb-orange-700 bg-gradient-to-b from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 rounded-lg border border-orange-200 dark:border-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-600"
              >
                <div className="py-2">
                  {getAvailableMinutes(hours).map((minute) => (
                    <div
                      key={minute}
                      data-minute={minute}
                      onClick={() => handleTimeChange(hours, minute)}
                      className={cn(
                        "text-center py-2 mx-1 rounded-lg cursor-pointer transition-all duration-200 font-mono text-sm font-bold",
                        minute === minutes
                          ? "bg-gradient-to-r from-orange-200 to-red-200 dark:from-orange-800 dark:to-red-800 text-orange-700 dark:text-orange-300 shadow-md scale-105"
                          : "hover:bg-orange-100 dark:hover:bg-orange-900 hover:scale-105 text-gray-600 dark:text-gray-400"
                      )}
                    >
                      {minute.toString().padStart(2, '0')}
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-xs text-orange-500 dark:text-orange-400 mt-1 text-center">
                Scroll or use ↑↓
              </div>
            </div>
          </div>

          {/* Selected Time Display */}
          <div className="mt-4 text-center p-3 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 rounded-xl border border-orange-200 dark:border-orange-800">
            <div className="text-xl font-bold text-transparent bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text">
              {formatDisplayTime(hours, minutes)}
            </div>
            <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">Selected Time</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-orange-100 dark:border-orange-900 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 flex justify-end space-x-2">
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