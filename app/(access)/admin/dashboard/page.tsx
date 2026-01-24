
'use client'

import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner, StatCard, EmptyState } from '@/components/shared';
import { useDashboardStats, useOrders, useRecentActivities } from '@/lib/hooks';


import {
  Users,
  Car,
  ShoppingCart,
  DollarSign,
  Clock,
  Activity
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@nextui-org/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useRouter } from 'next/navigation';


export default function DashboardPage() {
  const router = useRouter();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: activities, isLoading: activitiesLoading } = useRecentActivities();
  const { data: orders, isLoading: ordersLoading } = useOrders();

  // Get pending orders
  const pendingOrders = orders?.filter(order => order.status === 'pending').slice(0, 5) || [];


  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="h-4 w-4" />;
      case 'payment':
        return <DollarSign className="h-4 w-4" />;
      case 'user':
        return <Users className="h-4 w-4" />;
      case 'car':
        return <Car className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-purple-100 text-purple-600';
      case 'payment':
        return 'bg-emerald-100 text-emerald-600';
      case 'user':
        return 'bg-blue-100 text-blue-600';
      case 'car':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div>
      <Header
        title="Dashboard"
      // description="Overview of your platform metrics and activities"
      />

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon={Users}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
            isLoading={statsLoading}
          />

          <StatCard
            title="Total Cars"
            value={stats?.totalCars || 0}
            icon={Car}
            description={`${stats?.apiCars || 0} API • ${stats?.manualCars || 0} Manual`}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
            isLoading={statsLoading}
          />

          <StatCard
            title="Total Orders"
            value={stats?.totalOrders || 0}
            icon={ShoppingCart}
            badge={stats?.pendingOrders ? `${stats.pendingOrders} Pending` : undefined}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
            isLoading={statsLoading}
          />

          <StatCard
            title="Total Revenue"
            value={`$${((stats?.totalRevenue || 0) / 1000).toFixed(1)}k`}
            icon={DollarSign}
            trend={{
              value: '12.5%',
              isPositive: true,
            }}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-100"
            isLoading={statsLoading}
          />
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
          {/* Pending Orders - Takes 2 columns */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <ShoppingCart className="h-5 w-5" />
                Pending Orders
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onPress={() => router.push('/admin/orders/pending')}
                className="cursor-pointer hover:text-emerald-600 hover:font-semibold"
              >
                View All
              </Button>
            </CardHeader>


            <CardContent>
              {ordersLoading ? (
                <LoadingSpinner text="Loading orders..." />
              ) : pendingOrders.length > 0 ? (
                <div className="overflow-x-auto -mx-6 sm:mx-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-30">Order ID</TableHead>
                        <TableHead className="min-w-30">Customer</TableHead>
                        <TableHead className="hidden md:table-cell">Car</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="hidden sm:table-cell">Date</TableHead>
                        <TableHead className="w-20"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingOrders.map((order) => (
                        <TableRow
                          key={order.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => router.push(`/admin/orders/pending/${order.id}`)}
                        >
                          <TableCell className="font-mono text-xs sm:text-sm">
                            {order.id}
                          </TableCell>
                          <TableCell>
                            <div className="min-w-0">
                              <div className="font-medium truncate text-sm">
                                {order.userName}
                              </div>
                              <div className="text-xs text-muted-foreground truncate hidden sm:block">
                                {order.userEmail}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm">
                            {order.carDetails.make} {order.carDetails.model}
                          </TableCell>
                          <TableCell className="text-right font-medium text-sm">
                            ${order.amount.toLocaleString()}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                            {format(new Date(order.createdAt), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onPress={() => router.push(`/admin/orders/pending/${order.id}`)}
                              className="h-8 w-8 p-0 cursor-pointer"
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <EmptyState
                  icon={ShoppingCart}
                  title="No pending orders"
                  description="All orders have been processed"
                />
              )}
            </CardContent>
          </Card>

          {/* Recent Activity - Takes 1 column */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activitiesLoading ? (
                <LoadingSpinner text="Loading..." />
              ) : activities && activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className={cn(
                        'h-8 w-8 rounded-lg flex items-center justify-center shrink-0',
                        getActivityColor(activity.type)
                      )}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <p className="text-sm font-medium wrap-break-words">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                          {activity.userName && (
                            <>
                              <span className="truncate">{activity.userName}</span>
                              <span>•</span>
                            </>
                          )}
                          <span>
                            {formatDistanceToNow(new Date(activity.timestamp), {
                              addSuffix: true
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Activity}
                  title="No activities"
                  description="Activities will appear here"
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}