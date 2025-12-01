'use client';

import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, isSameMonth } from 'date-fns';
import 'react-day-picker/dist/style.css';

interface JournalCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export default function JournalCalendar({ selectedDate, onDateSelect }: JournalCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const handleMonthChange = (month: Date) => {
    setCurrentMonth(month);
  };

  const handleYearChange = (year: number) => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(year);
    setCurrentMonth(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    onDateSelect(today);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    // If the selected date is from a different month, change the current month
    if (!isSameMonth(date, currentMonth)) {
      setCurrentMonth(date);
    }
    
    onDateSelect(date);
  };

  const currentYear = currentMonth.getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-100">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <select
            value={currentYear}
            onChange={(e) => handleYearChange(parseInt(e.target.value))}
            className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-medium"
          >
            Today
          </button>
        </div>
      </div>

      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={handleDateSelect}
        month={currentMonth}
        onMonthChange={handleMonthChange}
        showOutsideDays={true}
        fixedWeeks={true}
        className="text-gray-100"
        classNames={{
          months: 'flex flex-col sm:flex-row space-y-2 sm:space-x-2 sm:space-y-0',
          month: 'space-y-2',
          caption: 'flex justify-center pt-0.5 relative items-center mb-2',
          caption_label: 'text-sm font-medium text-gray-100',
          nav: 'space-x-1 flex items-center',
          nav_button: 'h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100 text-gray-300 hover:text-gray-100',
          nav_button_previous: 'absolute left-1',
          nav_button_next: 'absolute right-1',
          table: 'w-full border-collapse',
          head_row: 'flex',
          head_cell: 'text-gray-400 rounded w-8 font-normal text-xs py-1',
          row: 'flex w-full',
          cell: 'text-center text-sm p-0 relative [&:has([aria-selected])]:bg-gray-700 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
          day: 'h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-700 rounded-md transition-colors',
          day_selected: 'bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-600 focus:text-white',
          day_today: 'bg-gray-700 text-gray-100 font-semibold',
          day_outside: 'text-gray-500 opacity-40 hover:opacity-60 hover:bg-gray-700/50',
          day_disabled: 'text-gray-500 opacity-25',
          day_range_middle: 'aria-selected:bg-gray-700 aria-selected:text-gray-100',
          day_hidden: 'invisible',
        }}
        styles={{
          month: { width: '100%' },
          caption: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
        }}
      />

      <div className="mt-3 pt-3 border-t border-gray-700">
        <p className="text-xs text-gray-400">Selected date:</p>
        <p className="text-base font-semibold text-gray-100 mt-0.5">
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </p>
      </div>
    </div>
  );
}

