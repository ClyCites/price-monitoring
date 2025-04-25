"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, Users, ShieldCheck, UserCheck, UserX } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface UserStats {
  totalUsers: number
  byRole: {
    admin: number
    agent: number
    user: number
  }
  activeUsers: number
  inactiveUsers: number
}

interface UserStatsCardsProps {
  stats?: UserStats
  isLoading: boolean
}

export default function UserStatsCards({ stats, isLoading }: UserStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="mt-2 text-sm text-muted-foreground">Loading statistics...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-8 border rounded-md">
        <p className="text-muted-foreground">No statistics available</p>
      </div>
    )
  }

  // Prepare data for charts
  const roleData = [
    { name: "Admin", value: stats.byRole.admin, color: "#ef4444" },
    { name: "Agent", value: stats.byRole.agent, color: "#3b82f6" },
    { name: "User", value: stats.byRole.user, color: "#6b7280" },
  ]

  const statusData = [
    { name: "Active", value: stats.activeUsers, color: "#22c55e" },
    { name: "Inactive", value: stats.inactiveUsers, color: "#9ca3af" },
  ]

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers} active ({Math.round((stats.activeUsers / stats.totalUsers) * 100)}%)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <ShieldCheck className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byRole.admin}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.byRole.admin / stats.totalUsers) * 100)}% of users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Agents</CardTitle>
            <ShieldCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byRole.agent}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.byRole.agent / stats.totalUsers) * 100)}% of users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Rate</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((stats.activeUsers / stats.totalUsers) * 100)}%</div>
            <p className="text-xs text-muted-foreground">{stats.inactiveUsers} inactive users</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="roles">
        <TabsList>
          <TabsTrigger value="roles">User Roles</TabsTrigger>
          <TabsTrigger value="status">User Status</TabsTrigger>
        </TabsList>
        <TabsContent value="roles" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>User Role Distribution</CardTitle>
              <CardDescription>Breakdown of users by assigned role</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roleData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {roleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} users`, "Count"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="status" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>User Status</CardTitle>
              <CardDescription>Active vs. inactive user accounts</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={statusData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} users`, "Count"]} />
                    <Legend />
                    <Bar dataKey="value" name="Users">
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>User Role Summary</CardTitle>
            <CardDescription>Detailed breakdown of user roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Administrators</p>
                  <p className="text-xs text-muted-foreground">Full system access</p>
                </div>
                <div className="text-2xl font-bold text-red-500">{stats.byRole.admin}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Agents</p>
                  <p className="text-xs text-muted-foreground">Limited administrative access</p>
                </div>
                <div className="text-2xl font-bold text-blue-500">{stats.byRole.agent}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Regular Users</p>
                  <p className="text-xs text-muted-foreground">Standard user permissions</p>
                </div>
                <div className="text-2xl font-bold text-gray-500">{stats.byRole.user}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Status Summary</CardTitle>
            <CardDescription>Active and inactive user accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Active Users</p>
                  <p className="text-xs text-muted-foreground">Can access the system</p>
                </div>
                <div className="flex items-center">
                  <UserCheck className="h-4 w-4 mr-2 text-green-500" />
                  <span className="text-2xl font-bold">{stats.activeUsers}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Inactive Users</p>
                  <p className="text-xs text-muted-foreground">Access temporarily disabled</p>
                </div>
                <div className="flex items-center">
                  <UserX className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-2xl font-bold">{stats.inactiveUsers}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Active Rate</p>
                  <p className="text-xs text-muted-foreground">Percentage of active users</p>
                </div>
                <div className="text-2xl font-bold">{Math.round((stats.activeUsers / stats.totalUsers) * 100)}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
