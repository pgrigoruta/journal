'use client';

import { useState } from 'react';
import JournalCalendar from './JournalCalendar';
import JournalForm from './JournalForm';

export default function JournalTab() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-100 mb-6">Journal</h2>
        
        <JournalCalendar
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />

        <JournalForm selectedDate={selectedDate} />
      </div>
    </div>
  );
}

