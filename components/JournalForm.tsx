'use client';

import { useState, useEffect } from 'react';
import { Metric } from '@/lib/types/metric';
import { matchesRecurrence } from '@/lib/utils/recurrence';
import { toDateOnlyString } from '@/lib/utils/date';
import Toggle from './Toggle';
import Card from './ui/Card';
import Button from './ui/Button';
import IconButton from './ui/IconButton';
import Modal from './ui/Modal';
import TrashIcon from './ui/TrashIcon';
import LoadingSpinner from './ui/LoadingSpinner';
import MetricInput from './MetricInput';

interface JournalFormProps {
  selectedDate: Date;
}

interface FormData {
  [metricId: string]: string | number | boolean;
}

export default function JournalForm({ selectedDate }: JournalFormProps) {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEntry, setLoadingEntry] = useState(false);
  const [formData, setFormData] = useState<FormData>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [hasEntry, setHasEntry] = useState(false);

  useEffect(() => {
    loadMetrics();
  }, []);

  useEffect(() => {
    loadEntryData();
  }, [selectedDate]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/metrics');
      if (!response.ok) throw new Error('Failed to load metrics');
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEntryData = async () => {
    try {
      setLoadingEntry(true);
      const dateStr = toDateOnlyString(selectedDate);
      const response = await fetch(`/api/journal/entries?date=${dateStr}`);
      if (!response.ok) throw new Error('Failed to load entry');
      const data = await response.json();

      const hasData = data.values && Object.keys(data.values).length > 0;
      setHasEntry(hasData);

      if (data.values) {
        setFormData(data.values);
      } else {
        setFormData({});
      }
    } catch (error) {
      console.error('Error loading entry data:', error);
      setFormData({});
      setHasEntry(false);
    } finally {
      setLoadingEntry(false);
    }
  };

  const saveEntry = async () => {
    try {
      setSaving(true);
      const dateStr = toDateOnlyString(selectedDate);
      const response = await fetch('/api/journal/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: dateStr,
          values: formData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save entry');
      }

      setHasEntry(true);
    } catch (error) {
      console.error('Error saving entry:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (metricId: string, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [metricId]: value,
    }));
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const dateStr = toDateOnlyString(selectedDate);
      const response = await fetch(`/api/journal/entries?date=${dateStr}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete entry');
      }

      setFormData({});
      setHasEntry(false);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting entry:', error);
    } finally {
      setDeleting(false);
    }
  };

  // Filter and sort metrics
  const visibleMetrics = metrics
    .filter((metric) => {
      if (!metric.active) return false;
      return matchesRecurrence(selectedDate, metric.recurrence as any);
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (loading || loadingEntry) {
    return (
      <Card className="flex-1">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    );
  }

  if (visibleMetrics.length === 0) {
    return (
      <Card className="flex-1">
        <p className="text-text-tertiary">No metrics scheduled for this date.</p>
      </Card>
    );
  }

  return (
    <>
      <Card className="flex-1 relative" title="Journal Entry" headerActions={
        <>
          {hasEntry && (
            <IconButton
              icon={<TrashIcon />}
              variant="danger"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleting || saving}
              aria-label="Delete entry"
            />
          )}
          <Button onClick={saveEntry} isLoading={saving} disabled={deleting}>
            Save Entry
          </Button>
        </>
      }>
        <div className="space-y-4">
          {visibleMetrics.map((metric) => (
            <div key={metric.id} className="space-y-2">
              <label className="block text-sm font-medium text-text-secondary">{metric.label}</label>
              <MetricInput
                metric={metric}
                value={formData[metric.id]}
                onChange={(value) => handleChange(metric.id, value)}
              />
            </div>
          ))}
        </div>
      </Card>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Entry"
        variant="danger"
        onConfirm={handleDelete}
        confirmLabel="Delete"
        isLoading={deleting}
      >
        Are you sure you want to delete this journal entry? This action cannot be undone.
      </Modal>
    </>
  );
}
