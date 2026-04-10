'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { CustomBtn } from '@/components/shared/CustomBtn';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Mail, ShoppingCart, CheckCircle, Clock, Check, CheckCheck, Bell } from 'lucide-react';
import { format } from 'date-fns';
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
  useNotificationStats,
} from '@/lib/hooks';

export default function NotificationsPage() {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [page, setPage] = useState(1);
  const limit = 5;

  const { data, isLoading } = useNotifications({
    page,
    limit,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });


  const { data: stats } = useNotificationStats();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const notifications = data?.items || [];
  const meta = data?.meta;
  const totalPages = meta?.pages ?? 1;
  const hasUnread = (stats?.pending ?? 0) > 0;

  return (
    <div>
      <Header
        title="Notifications"
      //description="Email notifications for orders and payments"
      />

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats?.totalSent ?? 0}</div>
                  <p className="text-sm text-muted-foreground">Total Sent</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats?.delivered ?? 0}</div>
                  <p className="text-sm text-muted-foreground">Delivered</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats?.pending ?? 0}</div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats?.orderAlerts ?? 0}</div>
                  <p className="text-sm text-muted-foreground">Order Alerts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Select
                  value={typeFilter}
                  onValueChange={(value) => {
                    setTypeFilter(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="order_created">Order Created</SelectItem>
                    <SelectItem value="order_status_change">Order Status Changed</SelectItem>
                    <SelectItem value="payment_confirmed">Payment Confirmed</SelectItem>
                    <SelectItem value="payment_received">Payment Received</SelectItem>
                    <SelectItem value="payment_failed">Payment Failed</SelectItem>
                    <SelectItem value="inspection_completed">Inspection Completed</SelectItem>
                    <SelectItem value="shipment_update">Shipment Update</SelectItem>
                    <SelectItem value="delivery_scheduled">Delivery Scheduled</SelectItem>
                    <SelectItem value="order_delivered">Order Delivered</SelectItem>
                    <SelectItem value="refund_processed">Refund Processed</SelectItem>
                    <SelectItem value="quote_expired">Quote Expired</SelectItem>
                    <SelectItem value="system_alert">System Alert</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value as 'all' | 'pending' | 'completed');
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Unread</SelectItem>
                    <SelectItem value="completed">Read</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <CustomBtn
                variant="solid"
                icon={CheckCheck}
                onClick={() => markAllAsRead.mutate()}
                isLoading={markAllAsRead.isPending}
                isDisabled={!hasUnread}
                className="min-w-44 bg-emerald-600 text-white font-semibold rounded-lg px-4 py-2 shadow-sm hover:bg-emerald-700 disabled:bg-emerald-200 disabled:text-emerald-700"
              >
                Mark All as Read
              </CustomBtn>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Table */}
        <Card>
          <CardHeader>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <LoadingSpinner text="Loading notifications..." />
            ) : notifications.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {/* <TableHead>Type</TableHead> */}
                      <TableHead>Title</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notifications.map((notif) => (
                      <TableRow key={notif.id}>
                        {/* <TableCell>
                          <div className="flex items-center gap-2">
                            {getNotificationIcon(notif.type)}
                            <span className="text-sm capitalize">
                              {notif.type.replace('_', ' ')}
                            </span>
                          </div>
                        </TableCell> */}
                        <TableCell className="font-medium">{notif.title}</TableCell>
                        <TableCell className="max-w-md truncate">
                          {notif.message}
                        </TableCell>
                        <TableCell className="text-sm">{notif.recipient}</TableCell>
                        <TableCell>
                          <StatusBadge status={notif.status === 'read' ? 'completed' : 'pending'} />

                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(notif.createdAt), 'MMM d, yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          {notif.status === 'unread' ? (
                            <CustomBtn
                              size="sm"
                              variant="flat"
                              icon={Check}
                              onClick={() => markAsRead.mutate(notif.id)}
                              isLoading={markAsRead.isPending && markAsRead.variables === notif.id}
                              isDisabled={markAsRead.isPending && markAsRead.variables !== notif.id}
                              className="cursor-pointer min-w-32 border border-emerald-200 bg-emerald-50 text-emerald-700 font-medium rounded-md hover:bg-emerald-100"
                            >
                              Mark as Read
                            </CustomBtn>
                          ) : (
                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                              Read
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <EmptyState
                icon={Bell}
                title="No notifications"
                description="No notifications match your filters"
              />
            )}
          </CardContent>
          {totalPages > 1 && (
            <CardFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-2">
              <div className="text-sm text-muted-foreground">
                Page {page} of {totalPages} • Total {meta?.total ?? notifications.length}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 disabled:opacity-50 cursor-pointer hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 disabled:opacity-50 cursor-pointer hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </CardFooter>
          )}

        </Card>

      </div>
    </div>
  );
}
