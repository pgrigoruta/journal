'use client';

import { useState } from 'react';
import JournalTab from './JournalTab';
import ManageTab from './ManageTab';

type Tab = 'journal' | 'manage';

interface TabsProps {
  defaultTab?: Tab;
}

export default function Tabs({ defaultTab = 'journal' }: TabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      {/* Tab Navigation */}
      <div className="border-b border-gray-800">
        <nav className="flex space-x-1 px-4" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('journal')}
            className={`
              px-6 py-4 text-sm font-medium transition-colors duration-200
              border-b-2 ${
                activeTab === 'journal'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
              }
            `}
          >
            Journal
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`
              px-6 py-4 text-sm font-medium transition-colors duration-200
              border-b-2 ${
                activeTab === 'manage'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
              }
            `}
          >
            Manage
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'journal' ? <JournalTab /> : <ManageTab />}
      </div>
    </div>
  );
}

