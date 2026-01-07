/**
 * Admin Users Management Page
 * Complete RBAC user management interface
 */

'use client';

import { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  MoreHorizontal, 
  Shield, 
  Calendar,
  Activity,
  Mail,
  UserCheck,
  UserX
} from 'lucide-react';
import { useAppContext, usePageState, ROUTES } from '@/suites/core';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'manager' | 'staff' | 'readonly';
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
  _count: {
    bookings: number;
    payments: number;
  };
}

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const roleColors = {
  owner: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
  admin: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
  manager: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
  staff: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
  readonly: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700'
};

const roleIcons = {
  owner: Shield,
  admin: Shield,
  manager: Users,
  staff: UserCheck,
  readonly: UserX
};

export default function UsersManagementPage() {
  const { ui, setFilter, addNotification } = useAppContext();
  const [localPage, setLocalPage] = useState(1);

  const search = (ui.filters.userSearch as string) || '';
  const roleFilter = (ui.filters.userRole as string) || '';
  const page = localPage;

  const { data: usersData, loading, refetch } = usePageState(
    async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter })
      });

      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json() as Promise<UsersResponse>;
    },
    [search, roleFilter, page]
  );

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) throw new Error('Failed to update role');
      addNotification('User role updated successfully', 'success');
      refetch();
    } catch (error) {
      addNotification(error instanceof Error ? error.message : 'Failed to update role', 'error');
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });

      if (!response.ok) throw new Error('Failed to update status');
      addNotification(`User ${isActive ? 'activated' : 'deactivated'} successfully`, 'success');
      refetch();
    } catch (error) {
      addNotification(error instanceof Error ? error.message : 'Failed to update status', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                Users Management
              </h1>
              <p className="text-gray-600 dark:text-slate-400 mt-2">
                Manage user accounts, roles, and permissions
              </p>
            </div>
            <button
              onClick={() => ui.setActiveModal('createUser')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add User
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={search}
                onChange={(e) => setFilter('userSearch', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setFilter('userRole', e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
            >
              <option value="">All Roles</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="staff">Staff</option>
              <option value="readonly">Read Only</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 dark:text-slate-400 mt-2">Loading users...</p>
            </div>
          ) : usersData?.users.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-slate-400">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700">
                  {usersData?.users.map((user: User) => {
                    const RoleIcon = roleIcons[user.role as keyof typeof roleIcons];
                    return (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600 dark:text-slate-300">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${roleColors[user.role as keyof typeof roleColors]}`}>
                            <RoleIcon className="w-3 h-3" />
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                            user.isActive 
                              ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700' 
                              : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700'
                          }`}>
                            <Activity className="w-3 h-3" />
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                          <div className="space-y-1">
                            <div>Bookings: {user._count.bookings}</div>
                            <div>Payments: {user._count.payments}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => toggleUserStatus(user.id, !user.isActive)}
                              className={`p-1 rounded ${
                                user.isActive 
                                  ? 'text-red-600 hover:text-red-800' 
                                  : 'text-green-600 hover:text-green-800'
                              }`}
                              title={user.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </button>
                            <button className="p-1 text-gray-600 hover:text-gray-800">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {usersData?.pagination && usersData.pagination.pages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((page - 1) * usersData.pagination.limit) + 1} to{' '}
              {Math.min(page * usersData.pagination.limit, usersData.pagination.total)} of{' '}
              {usersData.pagination.total} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setLocalPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm">
                Page {page} of {usersData?.pagination?.pages || 1}
              </span>
              <button
                onClick={() => setLocalPage(page + 1)}
                disabled={page === (usersData?.pagination?.pages || 1)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
