import { db } from '../server/database';
import { workingDays, schoolSchedule } from '../shared/schema';

const workingDaysData = [
  {
    dayOfWeek: 'Monday',
    dayType: 'FullDay',
    timingFrom: '08:00',
    timingTo: '15:30'
  },
  {
    dayOfWeek: 'Tuesday',
    dayType: 'FullDay',
    timingFrom: '08:00',
    timingTo: '15:30'
  },
  {
    dayOfWeek: 'Wednesday',
    dayType: 'FullDay',
    timingFrom: '08:00',
    timingTo: '15:30'
  },
  {
    dayOfWeek: 'Thursday',
    dayType: 'FullDay',
    timingFrom: '08:00',
    timingTo: '15:30'
  },
  {
    dayOfWeek: 'Friday',
    dayType: 'FullDay',
    timingFrom: '08:00',
    timingTo: '15:30'
  },
  {
    dayOfWeek: 'Saturday',
    dayType: 'HalfDay',
    timingFrom: '08:00',
    timingTo: '12:30'
  },
  {
    dayOfWeek: 'Sunday',
    dayType: 'Holiday',
    timingFrom: null,
    timingTo: null
  }
];

// Define a typical school day schedule
const generateDaySchedule = (dayOfWeek: string, isHalfDay: boolean = false) => {
  const schedule = [
    {
      dayOfWeek,
      type: 'Others',
      name: 'Assembly',
      timingFrom: '08:00',
      timingTo: '08:30'
    },
    {
      dayOfWeek,
      type: 'Period',
      name: 'Period-1',
      timingFrom: '08:30',
      timingTo: '09:20'
    },
    {
      dayOfWeek,
      type: 'Period',
      name: 'Period-2',
      timingFrom: '09:20',
      timingTo: '10:10'
    },
    {
      dayOfWeek,
      type: 'Break',
      name: 'Short Break',
      timingFrom: '10:10',
      timingTo: '10:25'
    },
    {
      dayOfWeek,
      type: 'Period',
      name: 'Period-3',
      timingFrom: '10:25',
      timingTo: '11:15'
    },
    {
      dayOfWeek,
      type: 'Period',
      name: 'Period-4',
      timingFrom: '11:15',
      timingTo: '12:05'
    },
    {
      dayOfWeek,
      type: 'Break',
      name: 'Lunch Break',
      timingFrom: '12:05',
      timingTo: '12:45'
    }
  ];

  if (!isHalfDay) {
    schedule.push(
      {
        dayOfWeek,
        type: 'Period',
        name: 'Period-5',
        timingFrom: '12:45',
        timingTo: '13:35'
      },
      {
        dayOfWeek,
        type: 'Period',
        name: 'Period-6',
        timingFrom: '13:35',
        timingTo: '14:25'
      },
      {
        dayOfWeek,
        type: 'Break',
        name: 'Short Break',
        timingFrom: '14:25',
        timingTo: '14:40'
      },
      {
        dayOfWeek,
        type: 'Period',
        name: 'Period-7',
        timingFrom: '14:40',
        timingTo: '15:30'
      }
    );
  }

  return schedule;
};

async function seedSchedule() {
  try {
    // Insert working days
    for (const day of workingDaysData) {
      try {
        await db.insert(workingDays).values(day);
        console.log(`Added working day: ${day.dayOfWeek}`);
      } catch (err: any) {
        if (err.code === '23505') { // Unique violation error code
          console.log(`Working day ${day.dayOfWeek} already exists, skipping...`);
        } else {
          console.error(`Error adding ${day.dayOfWeek}:`, err);
        }
      }
    }

    // Insert school schedules for each working day
    for (const day of workingDaysData) {
      if (day.dayType !== 'Holiday') {
        const daySchedule = generateDaySchedule(day.dayOfWeek, day.dayType === 'HalfDay');
        
        for (const schedule of daySchedule) {
          try {
            await db.insert(schoolSchedule).values(schedule);
            console.log(`Added schedule for ${day.dayOfWeek}: ${schedule.name}`);
          } catch (err: any) {
            if (err.code === '23505') {
              console.log(`Schedule ${schedule.name} for ${day.dayOfWeek} already exists, skipping...`);
            } else {
              console.error(`Error adding schedule for ${day.dayOfWeek}:`, err);
            }
          }
        }
      }
    }

    console.log('All schedules have been processed');
  } catch (err) {
    console.error('Error:', err);
    throw err;
  }
}

seedSchedule();
