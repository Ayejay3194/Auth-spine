/**
 * Launch Gate Checklist Interface
 * Production readiness validation and tracking
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  FileText,
  Play,
  Rocket,
  Lock,
  DollarSign,
  Database,
  Settings,
  Zap,
  AlertCircle
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  category: string;
  title: string;
  description: string;
  required: boolean;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  evidence?: string;
  assignee?: string;
  notes?: string;
  completedAt?: string;
}

interface ChecklistCategory {
  id: string;
  name: string;
  description: string;
  critical: boolean;
  items: ChecklistItem[];
}

interface ChecklistData {
  checklist: ChecklistCategory[];
  validation: {
    canLaunch: boolean;
    blockedItems: ChecklistItem[];
    summary: {
      total: number;
      completed: number;
      critical: number;
      criticalCompleted: number;
    };
  };
  report: {
    status: 'ready' | 'blocked' | 'warning';
    report: string;
    actionItems: string[];
  };
}

const categoryIcons = {
  auth: Shield,
  money: DollarSign,
  data: Database,
  ops: Settings,
  quality: FileText
};

const statusColors = {
  pending: 'bg-gray-100 text-gray-800 border-gray-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  failed: 'bg-red-100 text-red-800 border-red-200'
};

const statusIcons = {
  pending: Clock,
  in_progress: Play,
  completed: CheckCircle2,
  failed: XCircle
};

export default function LaunchGatePage() {
  const [data, setData] = useState<ChecklistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(null);
  const [runningValidation, setRunningValidation] = useState(false);

  useEffect(() => {
    fetchChecklist();
  }, []);

  const fetchChecklist = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/launch-gate/checklist');
      if (!response.ok) throw new Error('Failed to fetch checklist');

      const result = await response.json();
      setData(result.data);
    } catch (error) {
      console.error('Error fetching checklist:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateItemStatus = async (itemId: string, status: string, evidence?: string, notes?: string) => {
    try {
      const response = await fetch('/api/launch-gate/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, status, evidence, notes })
      });

      if (!response.ok) throw new Error('Failed to update item');
      
      await fetchChecklist(); // Refresh data
      setSelectedItem(null); // Close modal
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const runValidation = async () => {
    try {
      setRunningValidation(true);
      const response = await fetch('/api/launch-gate/checklist', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'validate' })
      });

      if (!response.ok) throw new Error('Failed to run validation');
      
      await fetchChecklist(); // Refresh data
    } catch (error) {
      console.error('Error running validation:', error);
    } finally {
      setRunningValidation(false);
    }
  };

  const getLaunchStatus = () => {
    if (!data) return { color: 'gray', text: 'Loading', icon: Clock };
    
    if (data.validation.canLaunch) {
      return { color: 'green', text: 'Ready to Launch', icon: Rocket };
    }
    
    const blockedCount = data.validation.blockedItems.length;
    return { 
      color: 'red', 
      text: `Blocked (${blockedCount} items)`, 
      icon: Lock 
    };
  };

  const launchStatus = getLaunchStatus();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading launch gate checklist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Shield className="w-8 h-8 text-blue-600" />
                Launch Gate Checklist
              </h1>
              <p className="text-gray-600 mt-2">
                Production readiness validation - all RED items must be completed
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={runValidation}
                disabled={runningValidation}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Zap className={`w-4 h-4 ${runningValidation ? 'animate-pulse' : ''}`} />
                {runningValidation ? 'Running...' : 'Run Validation'}
              </button>
            </div>
          </div>
        </div>

        {/* Status Overview */}
        <div className={`bg-white rounded-lg shadow-sm p-6 mb-6 border-2 ${
          launchStatus.color === 'green' ? 'border-green-200' :
          launchStatus.color === 'red' ? 'border-red-200' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${
                launchStatus.color === 'green' ? 'bg-green-100' :
                launchStatus.color === 'red' ? 'bg-red-100' : 'bg-gray-100'
              }`}>
                <launchStatus.icon className={`w-6 h-6 ${
                  launchStatus.color === 'green' ? 'text-green-600' :
                  launchStatus.color === 'red' ? 'text-red-600' : 'text-gray-600'
                }`} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Launch Status: {launchStatus.text}
                </h2>
                <p className="text-gray-600">{data?.report.report}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {data?.validation.summary.criticalCompleted}/{data?.validation.summary.critical}
              </div>
              <div className="text-sm text-gray-600">Critical Items Complete</div>
            </div>
          </div>
        </div>

        {/* Action Items */}
        {data?.report.actionItems && data.report.actionItems.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-red-900">Required Before Launch</h3>
            </div>
            <ul className="space-y-1">
              {data.report.actionItems.map((item, index) => (
                <li key={index} className="text-red-800 flex items-start gap-2">
                  <span className="text-red-600 mt-1">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Checklist Categories */}
        <div className="space-y-6">
          {data?.checklist.map((category) => {
            const CategoryIcon = categoryIcons[category.id as keyof typeof categoryIcons];
            const completedItems = category.items.filter(item => item.status === 'completed').length;
            const totalItems = category.items.length;
            const progress = (completedItems / totalItems) * 100;

            return (
              <div key={category.id} className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CategoryIcon className="w-6 h-6 text-blue-600" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {completedItems}/{totalItems} Complete
                        </div>
                        <div className="text-xs text-gray-600">
                          {Math.round(progress)}%
                        </div>
                      </div>
                      {category.critical && (
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                          CRITICAL
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {category.items.map((item) => {
                    const StatusIcon = statusIcons[item.status];
                    return (
                      <div
                        key={item.id}
                        className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => setSelectedItem(item)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <StatusIcon className="w-5 h-5 mt-0.5 text-gray-400" />
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">
                                {item.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {item.description}
                              </p>
                              {item.evidence && (
                                <p className="text-sm text-gray-500 mt-2">
                                  <strong>Evidence:</strong> {item.evidence}
                                </p>
                              )}
                              {item.assignee && (
                                <div className="flex items-center gap-1 mt-2">
                                  <User className="w-3 h-3 text-gray-400" />
                                  <span className="text-sm text-gray-600">{item.assignee}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusColors[item.status]}`}>
                              {item.status.replace('_', ' ').toUpperCase()}
                            </span>
                            {item.required && (
                              <AlertCircle className="w-4 h-4 text-red-500" title="Required for launch" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Item Detail Modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedItem.title}
                  </h3>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <p className="text-gray-600 mb-6">{selectedItem.description}</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={selectedItem.status}
                      onChange={(e) => setSelectedItem({
                        ...selectedItem,
                        status: e.target.value as any
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Evidence
                    </label>
                    <textarea
                      value={selectedItem.evidence || ''}
                      onChange={(e) => setSelectedItem({
                        ...selectedItem,
                        evidence: e.target.value
                      })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe how this was verified..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={selectedItem.notes || ''}
                      onChange={(e) => setSelectedItem({
                        ...selectedItem,
                        notes: e.target.value
                      })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Additional notes..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => updateItemStatus(
                      selectedItem.id,
                      selectedItem.status,
                      selectedItem.evidence,
                      selectedItem.notes
                    )}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
