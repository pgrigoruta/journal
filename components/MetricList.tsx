'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Metric } from '@/lib/types/metric';

interface MetricListProps {
  metrics: Metric[];
  onEdit: (metric: Metric) => void;
  onDelete: (id: string) => Promise<void>;
  onReorder: (metricIds: string[]) => Promise<void>;
}

function SortableMetricItem({ metric, onEdit, onDelete }: { metric: Metric; onEdit: (metric: Metric) => void; onDelete: (id: string) => Promise<void> }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: metric.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      text: 'Text',
      number: 'Number',
      yesno: 'Yes/No',
      grade: 'Grade (1-5)',
      dropdown: 'Dropdown',
    };
    return labels[type] || type;
  };

  const getRecurrenceLabel = (recurrence: any) => {
    if (recurrence.type === 'daily') return 'Daily';
    if (recurrence.type === 'weekly') {
      const days = recurrence.days || [];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return `Weekly: ${days.map((d: number) => dayNames[d]).join(', ') || 'None'}`;
    }
    if (recurrence.type === 'monthly') return `Monthly: Day ${recurrence.day}`;
    if (recurrence.type === 'yearly') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `Yearly: ${months[recurrence.month - 1]} ${recurrence.day}`;
    }
    if (recurrence.type === 'specific') return `Specific: ${recurrence.dates?.length || 0} dates`;
    if (recurrence.type === 'custom') return `Every ${recurrence.interval} ${recurrence.unit}`;
    return 'Unknown';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-gray-800 border border-gray-700 rounded-lg p-4 mb-3 ${
        !metric.active ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-100">{metric.label}</h3>
            {!metric.active && (
              <span className="px-2 py-1 text-xs bg-gray-700 text-gray-400 rounded">Inactive</span>
            )}
          </div>
          <div className="ml-8 space-y-1 text-sm text-gray-400">
            <div>
              <span className="font-medium">Key:</span> <code className="text-blue-400">{metric.key}</code>
            </div>
            <div>
              <span className="font-medium">Type:</span> {getTypeLabel(metric.type)}
            </div>
            <div>
              <span className="font-medium">Recurrence:</span> {getRecurrenceLabel(metric.recurrence)}
            </div>
            {metric.type === 'dropdown' && metric.options && (
              <div>
                <span className="font-medium">Options:</span>{' '}
                {metric.options.length} option{metric.options.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onEdit(metric)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(metric.id)}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MetricList({ metrics, onEdit, onDelete, onReorder }: MetricListProps) {
  const [items, setItems] = useState(metrics);

  useEffect(() => {
    setItems(metrics);
  }, [metrics]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      // Update sort order in database
      const metricIds = newItems.map((item) => item.id);
      await onReorder(metricIds);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No metrics found. Click "Add New Metric" to create your first metric.</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((m) => m.id)} strategy={verticalListSortingStrategy}>
        <div>
          {items.map((metric) => (
            <SortableMetricItem
              key={metric.id}
              metric={metric}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

