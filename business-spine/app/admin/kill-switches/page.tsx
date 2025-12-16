/**
 * Kill Switches Control Panel
 * Emergency system controls for critical functions
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Power,
  AlertTriangle,
  Shield,
  Lock,
  Unlock,
  Clock,
  User,
  Activity,
  Zap,
  Pause,
  Play,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface KillSwitch {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  activatedAt?: string;
  activatedBy?: string;
  reason?: string;
  autoDisableAt?: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
}

interface SystemStatus {
  overall: 'operational' | 'degraded' | 'critical';
  activeSwitches: KillSwitch[];
  impactedFeatures: string[];
}

const impactColors = {
  low: 'bg-blue-100 text-blue-800 border-blue-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200'
};

const statusIcons = {
  operational: CheckCircle2,
  degraded: AlertTriangle,
  critical: XCircle
};

const statusColors = {
  operational: 'text-green-600 bg-green-50 border-green-200',
  degraded: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  critical: 'text-red-600 bg-red-50 border-red-200'
};

export default function KillSwitchesPage() {
  const [switches, setSwitches] = useState<KillSwitch[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSwitch, setSelectedSwitch] = useState<KillSwitch | null>(null);
  const [actionModal, setActionModal] = useState<{
    switch: KillSwitch;
    action: 'activate' | 'deactivate';
  } | null>(null);

  useEffect(() => {
    fetchKillSwitches();
  }, []);

  const fetchKillSwitches = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/kill-switches');
      if (!response.ok) throw new Error('Failed to fetch kill switches');

      const result = await response.json();
      setSwitches(result.data.switches);
      setSystemStatus(result.data.systemStatus);
    } catch (error) {
      console.error('Error fetching kill switches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchAction = async (switchItem: KillSwitch, action: 'activate' | 'deactivate') => {
    setActionModal({ switch: switchItem, action });
  };

  const executeSwitchAction = async (reason: string, autoDisableHours?: number) => {
    if (!actionModal) return;

    try {
      const response = await fetch('/api/admin/kill-switches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          switchId: actionModal.switch.id,
          action: actionModal.action,
          reason,
          autoDisableHours
        })
      });

      if (!response.ok) throw new Error('Failed to update kill switch');

      const result = await response.json();
      setSwitches(result.data.switches);
      setSystemStatus(result.data.systemStatus);
      setActionModal(null);
    } catch (error) {
      console.error('Error updating kill switch:', error);
    }
  };

  const getOverallStatusIcon = () => {
    if (!systemStatus) return Activity;
    return statusIcons[systemStatus.overall];
  };

  const groupSwitchesByCategory = () => {
    const groups: Record<string, KillSwitch[]> = {};
    switches.forEach(sw => {
      if (!groups[sw.category]) {
        groups[sw.category] = [];
      }
      groups[sw.category].push(sw);
    });
    return groups;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading kill switches...</p>
        </div>
      </div>
    );
  }

  const StatusIcon = getOverallStatusIcon();
  const groupedSwitches = groupSwitchesByCategory();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Power className="w-8 h-8 text-red-600" />
                Kill Switches Control Panel
              </h1>
              <p className="text-gray-600 mt-2">
                Emergency controls to pause critical system functions
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchKillSwitches}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Activity className="w-4 h-4" />
                Refresh Status
              </button>
            </div>
          </div>
        </div>

        {/* System Status Overview */}
        {systemStatus && (
          <div className={`bg-white rounded-lg shadow-sm p-6 mb-6 border-2 ${statusColors[systemStatus.overall].split(' ')[2]}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <StatusIcon className={`w-8 h-8 ${statusColors[systemStatus.overall].split(' ')[0]}`} />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    System Status: {systemStatus.overall.charAt(0).toUpperCase() + systemStatus.overall.slice(1)}
                  </h2>
                  <p className="text-gray-600">
                    {systemStatus.overall === 'operational' && 'All systems operating normally'}
                    {systemStatus.overall === 'degraded' && 'Some functions temporarily disabled'}
                    {systemStatus.overall === 'critical' && 'Critical systems impacted'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {systemStatus.activeSwitches.length}
                </div>
                <div className="text-sm text-gray-600">Active Switches</div>
              </div>
            </div>
          </div>
        )}

        {/* Active Switches Alert */}
        {systemStatus?.activeSwitches && systemStatus.activeSwitches.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-red-900">Active Kill Switches</h3>
            </div>
            <div className="space-y-2">
              {systemStatus.activeSwitches.map((sw) => (
                <div key={sw.id} className="flex items-center justify-between text-red-800">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    <span className="font-medium">{sw.name}</span>
                    <span className="text-red-600">({sw.impact})</span>
                  </div>
                  <div className="text-sm text-red-600">
                    {sw.activatedAt && `Activated ${new Date(sw.activatedAt).toLocaleString()}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Kill Switches by Category */}
        <div className="space-y-6">
          {Object.entries(groupedSwitches).map(([category, categorySwitches]) => (
            <div key={category} className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 capitalize">
                  {category} Controls
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {categorySwitches.filter(sw => sw.enabled).length} of {categorySwitches.length} active
                </p>
              </div>

              <div className="divide-y divide-gray-200">
                {categorySwitches.map((killSwitch) => (
                  <div key={killSwitch.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-3 rounded-lg ${
                          killSwitch.enabled 
                            ? 'bg-red-100' 
                            : 'bg-gray-100'
                        }`}>
                          {killSwitch.enabled ? (
                            <Lock className="w-6 h-6 text-red-600" />
                          ) : (
                            <Unlock className="w-6 h-6 text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {killSwitch.name}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {killSwitch.description}
                          </p>
                          
                          {killSwitch.enabled && killSwitch.reason && (
                            <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-800">
                              <strong>Reason:</strong> {killSwitch.reason}
                            </div>
                          )}

                          {killSwitch.enabled && (
                            <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                              {killSwitch.activatedAt && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Activated {new Date(killSwitch.activatedAt).toLocaleString()}
                                </div>
                              )}
                              {killSwitch.activatedBy && (
                                <div className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {killSwitch.activatedBy}
                                </div>
                              )}
                              {killSwitch.autoDisableAt && (
                                <div className="flex items-center gap-1">
                                  <Zap className="w-3 h-3" />
                                  Auto-disable {new Date(killSwitch.autoDisableAt).toLocaleString()}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${impactColors[killSwitch.impact]}`}>
                          {killSwitch.impact.toUpperCase()}
                        </span>
                        
                        <button
                          onClick={() => handleSwitchAction(killSwitch, killSwitch.enabled ? 'deactivate' : 'activate')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                            killSwitch.enabled
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-red-600 text-white hover:bg-red-700'
                          }`}
                        >
                          {killSwitch.enabled ? (
                            <>
                              <Play className="w-4 h-4" />
                              Enable
                            </>
                          ) : (
                            <>
                              <Pause className="w-4 h-4" />
                              Disable
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Action Confirmation Modal */}
        {actionModal && (
          <ActionModal
            killSwitch={actionModal.switch}
            action={actionModal.action}
            onConfirm={executeSwitchAction}
            onCancel={() => setActionModal(null)}
          />
        )}
      </div>
    </div>
  );
}

function ActionModal({
  killSwitch,
  action,
  onConfirm,
  onCancel
}: {
  killSwitch: KillSwitch;
  action: 'activate' | 'deactivate';
  onConfirm: (reason: string, autoDisableHours?: number) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState('');
  const [autoDisableHours, setAutoDisableHours] = useState<number | undefined>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onConfirm(reason.trim(), autoDisableHours);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {action === 'activate' ? (
              <Lock className="w-6 h-6 text-red-600" />
            ) : (
              <Unlock className="w-6 h-6 text-green-600" />
            )}
            <h3 className="text-lg font-semibold text-gray-900">
              {action === 'activate' ? 'Activate' : 'Deactivate'} Kill Switch
            </h3>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <p className="font-medium text-gray-900">{killSwitch.name}</p>
            <p className="text-sm text-gray-600 mt-1">{killSwitch.description}</p>
            <p className="text-sm text-gray-500 mt-2">
              Impact: <span className="font-medium">{killSwitch.impact.toUpperCase()}</span>
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Please provide a reason for this action..."
              required
            />
          </div>

          {action === 'activate' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto-disable (optional)
              </label>
              <select
                value={autoDisableHours || ''}
                onChange={(e) => setAutoDisableHours(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">No auto-disable</option>
                <option value="1">1 hour</option>
                <option value="4">4 hours</option>
                <option value="12">12 hours</option>
                <option value="24">24 hours</option>
                <option value="72">72 hours</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-white rounded-lg transition-colors ${
                action === 'activate'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {action === 'activate' ? 'Activate' : 'Deactivate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
