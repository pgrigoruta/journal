'use client';

import { useState } from 'react';
import JournalTab from './JournalTab';
import StatsTab from './StatsTab';
import ManageTab from './ManageTab';
import TabButton from './ui/TabButton';

type Tab = 'journal' | 'stats' | 'manage';

interface TabsProps {
  defaultTab?: Tab;
}

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'journal', label: 'Journal' },
  { id: 'stats', label: 'Stats' },
  { id: 'manage', label: 'Manage' },
];

export default function Tabs({ defaultTab = 'journal' }: TabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);

  return (
    <div className="flex flex-col h-screen bg-surface-dark text-text-primary">
      {/* Tab Navigation */}
      <div className="border-b border-surface-border">
        <nav className="flex space-x-1 px-4" aria-label="Tabs">
          {TABS.map((tab) => (
            <TabButton key={tab.id} isActive={activeTab === tab.id} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </TabButton>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'journal' && <JournalTab />}
        {activeTab === 'stats' && <StatsTab />}
        {activeTab === 'manage' && <ManageTab />}
      </div>
    </div>
  );
}
