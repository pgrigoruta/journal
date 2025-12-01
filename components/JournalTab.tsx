'use client';

import { useState } from 'react';
import { normalizeToDateOnly } from '@/lib/utils/date';
import JournalCalendar from './JournalCalendar';
import JournalForm from './JournalForm';

export default function JournalTab() {
  const [selectedDate, setSelectedDate] = useState<Date>(normalizeToDateOnly(new Date()));

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-semibold text-text-primary mb-6">Journal</h2>
        
        <div className="flex gap-6 items-start">
          <div className="flex-shrink-0">
            <JournalCalendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <JournalForm selectedDate={selectedDate} />
          </div>
        </div>
      </div>
    </div>
  );
}

