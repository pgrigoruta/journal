'use client';

import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, isSameMonth } from 'date-fns';
import { normalizeToDateOnly } from '@/lib/utils/date';
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
    
    // Normalize date to midnight in local timezone (date-only, no time component)
    const normalizedDate = normalizeToDateOnly(date);
    
    // If the selected date is from a different month, change the current month
    if (!isSameMonth(normalizedDate, currentMonth)) {
      setCurrentMonth(normalizedDate);
    }
    
    onDateSelect(normalizedDate);
  };

  const currentYear = currentMonth.getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);

  return (
    <div className="bg-surface border border-surface-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-text-primary">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <select
            value={currentYear}
            onChange={(e) => handleYearChange(parseInt(e.target.value))}
            className="px-2 py-1 bg-surface-light border border-surface-border rounded text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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
            className="px-2.5 py-1 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded font-medium transition-colors"
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
        className="text-text-primary"
        classNames={{
          months: 'flex flex-col sm:flex-row space-y-2 sm:space-x-2 sm:space-y-0',
          month: 'space-y-2',
          caption: 'flex justify-center pt-0.5 relative items-center mb-2',
          caption_label: 'text-sm font-medium text-text-primary',
          nav: 'space-x-1 flex items-center',
          nav_button: 'h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100 text-text-secondary hover:text-text-primary',
          nav_button_previous: 'absolute left-1',
          nav_button_next: 'absolute right-1',
          table: 'w-full border-collapse',
          head_row: 'flex',
          head_cell: 'text-text-tertiary rounded w-8 font-normal text-xs py-1',
          row: 'flex w-full',
          cell: 'text-center text-sm p-0 relative [&:has([aria-selected])]:bg-surface-light first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
          day: 'h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-surface-light rounded-md transition-colors',
          day_selected: 'bg-primary-600 text-white hover:bg-primary-700 hover:text-white focus:bg-primary-600 focus:text-white',
          day_today: 'bg-surface-light text-text-primary font-semibold',
          day_outside: 'text-text-muted opacity-40 hover:opacity-60 hover:bg-surface-light/50',
          day_disabled: 'text-text-muted opacity-25',
          day_range_middle: 'aria-selected:bg-surface-light aria-selected:text-text-primary',
          day_hidden: 'invisible',
        }}
        styles={{
          month: { width: '100%' },
          caption: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
        }}
      />

      <div className="mt-3 pt-3 border-t border-surface-border">
        <p className="text-xs text-text-tertiary">Selected date:</p>
        <p className="text-base font-semibold text-text-primary mt-0.5">
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </p>
      </div>
    </div>
  );
}

