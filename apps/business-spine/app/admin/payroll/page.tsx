/**
 * Admin Payroll Management Page
 * 
 * Comprehensive payroll administration interface with:
 * - Payroll run management
 * - Employee payroll oversight
 * - Payroll analytics and reporting
 * - Tax and compliance monitoring
 */

import Link from "next/link";
import { withRBAC } from "@/src/rbac/middleware";

// Mock components for now - would be replaced with actual UI components
const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`border rounded-lg p-6 ${className || ''}`}>{children}</div>
);

const CardContent = ({ children }: { children: React.ReactNode }) => (
  <div className="p-0">{children}</div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="pb-4">{children}</div>
);

const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-semibold">{children}</h3>
);

async function PayrollDashboard() {
  // Mock data for now - would fetch from database
  const recentRuns = [
    {
      id: '1',
      payGroup: { name: 'Biweekly' },
      status: 'COMPLETED',
      exceptions: [],
      createdAt: new Date()
    }
  ];

  const stats = {
    totalRuns: 12,
    activeEmployees: 45,
    pendingRuns: 2,
    reviewRuns: 1
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payroll Management</h1>
          <p className="text-muted-foreground">
            Manage payroll runs, employee compensation, and compliance
          </p>
        </div>
        <Link 
          href="/payroll/runs/new" 
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
        >
          New Payroll Run
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRuns}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeEmployees}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingRuns}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.reviewRuns}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payroll Runs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payroll Runs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentRuns.map((run: any) => (
              <div key={run.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{run.payGroup.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Created: {new Date(run.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    run.status === 'FINALIZED' ? 'bg-green-100 text-green-800' :
                    run.status === 'REVIEW' ? 'bg-blue-100 text-blue-800' :
                    run.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {run.status}
                  </span>
                  {run.exceptions.length > 0 && (
                    <span className="text-sm text-red-600">
                      {run.exceptions.length} exceptions
                    </span>
                  )}
                  <Link 
                    href={`/payroll/runs/${run.id}`}
                    className="text-primary hover:underline"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Employee Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manage employee profiles, compensation, and tax information
            </p>
            <Link 
              href="/admin/employees"
              className="text-primary hover:underline"
            >
              Manage Employees →
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Payroll Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Generate payroll reports and analytics
            </p>
            <Link 
              href="/admin/reports/payroll"
              className="text-primary hover:underline"
            >
              View Reports →
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tax & Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Monitor tax calculations and compliance requirements
            </p>
            <Link 
              href="/admin/compliance/payroll"
              className="text-primary hover:underline"
            >
              Compliance →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Export as default page component, not wrapped with RBAC for now
export default PayrollDashboard;
