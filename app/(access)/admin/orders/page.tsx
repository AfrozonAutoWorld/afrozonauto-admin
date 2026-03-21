'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { useOrders } from '@/lib/hooks/useOrders';
import { ArrowLeft, Search, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@nextui-org/react';
import { CustomBtn } from '@/components/shared';

const orderStatuses = [
  'PENDING',
  'CONFIRMED',
  'INSPECTION',
  'IN_TRANSIT',
  'CUSTOMS',
  'ARRIVED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
] as const;

const priorityOptions = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
const filterFieldClassName =
  'h-11 rounded-lg border-slate-200 bg-white shadow-none transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500/20';
const filterLabelClassName = 'text-sm font-medium text-slate-700';


export default function AllOrdersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [userId, setUserId] = useState('');
  const [priority, setPriority] = useState('all');
  const [shippingMethod, setShippingMethod] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const limit = 10;

  const filters = useMemo(() => ({
    page,
    limit,
    search: search.trim() || undefined,
    status: statusFilter
      ? statusFilter
        .split(',')
        .map((status) => status.trim().toUpperCase())
        .filter(Boolean)
      : undefined,
    userId: userId.trim() || undefined,
    priority: priority !== 'all' ? priority : undefined,
    shippingMethod: shippingMethod.trim() || undefined,
    destinationCountry: destinationCountry.trim() || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  }), [
    page,
    limit,
    search,
    statusFilter,
    userId,
    priority,
    shippingMethod,
    destinationCountry,
    startDate,
    endDate,
  ]);

  const { data, isLoading } = useOrders(filters);
  const orders = data?.items || [];
  const totalPages = data?.meta.pages ?? 1;

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, userId, priority, shippingMethod, destinationCountry, startDate, endDate]);

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setUserId('');
    setPriority('all');
    setShippingMethod('');
    setDestinationCountry('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };


  return (
    <div>
      <Header
        title="All Orders"
      //description="All orders awaiting payment or processing"
      />

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <CustomBtn
          variant="ghost"
          icon={ArrowLeft}
          onClick={() => router.back()}
          className='cursor-pointer'
        >
          Back to Dashboard
        </CustomBtn>

        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-2 xl:col-span-2">
                <label className={filterLabelClassName} htmlFor="order-search">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="order-search"
                    placeholder="Request number, customer name, or email"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`${filterFieldClassName} pl-9`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className={filterLabelClassName} htmlFor="order-status">
                  Statuses
                </label>
                <Input
                  id="order-status"
                  placeholder="PENDING,CONFIRMED"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  list="order-status-options"
                  className={filterFieldClassName}
                />
              </div>

              <div className="space-y-2">
                <label className={filterLabelClassName} htmlFor="order-user-id">
                  User ID
                </label>
                <Input
                  id="order-user-id"
                  placeholder="Filter by user ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className={filterFieldClassName}
                />
              </div>

              <div className="space-y-2">
                <label className={filterLabelClassName} htmlFor="order-priority">
                  Priority
                </label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger
                    id="order-priority"
                    className={`w-full ${filterFieldClassName}`}
                  >
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border-slate-200 shadow-lg">
                    <SelectItem value="all">All Priorities</SelectItem>
                    {priorityOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className={filterLabelClassName} htmlFor="order-shipping-method">
                  Shipping Method
                </label>
                <Input
                  id="order-shipping-method"
                  placeholder="RORO, AIR_FREIGHT, etc."
                  value={shippingMethod}
                  onChange={(e) => setShippingMethod(e.target.value)}
                  className={filterFieldClassName}
                />
              </div>

              <div className="space-y-2">
                <label className={filterLabelClassName} htmlFor="order-destination-country">
                  Destination Country
                </label>
                <Input
                  id="order-destination-country"
                  placeholder="Nigeria"
                  value={destinationCountry}
                  onChange={(e) => setDestinationCountry(e.target.value)}
                  className={filterFieldClassName}
                />
              </div>

              <div className="space-y-2">
                <label className={filterLabelClassName} htmlFor="order-start-date">
                  Start Date
                </label>
                <Input
                  id="order-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={filterFieldClassName}
                />
              </div>

              <div className="space-y-2">
                <label className={filterLabelClassName} htmlFor="order-end-date">
                  End Date
                </label>
                <Input
                  id="order-end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={filterFieldClassName}
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <CustomBtn variant="bordered" onClick={clearFilters}>
                Clear Filters
              </CustomBtn>
            </div>

            <datalist id="order-status-options">
              {orderStatuses.map((status) => (
                <option key={status} value={status} />
              ))}
            </datalist>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <LoadingSpinner text="Loading orders..." />
            ) : orders.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Car</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow
                        key={order.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                      >
                        <TableCell className="font-mono text-sm">
                          {order.id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.userName}</div>
                            <div className="text-xs text-muted-foreground">
                              {order.userEmail}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {order.carDetails.make} {order.carDetails.model} ({order.carDetails.year})
                        </TableCell>
                        <TableCell className="font-medium">
                          ${order.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={order.status} />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(order.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onPress={() => router.push(`/admin/orders/${order.id}`)}
                            className="h-8 w-8 p-0"
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
                title="No orders found"
                description="Try adjusting your filters"
              />
            )}
          </CardContent>

          {totalPages > 1 && (
            <CardFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                Page {page} of {totalPages} • Total {data?.meta.total ?? orders.length}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => setPage((prev) => Math.max(1, prev - 1))}
                  isDisabled={page <= 1}
                  className="cursor-pointer"
                >
                  Previous
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  isDisabled={page >= totalPages}
                  className='"cursor-pointer'
                >
                  Next
                </Button>
              </div>
            </CardFooter>
          )}

        </Card>

      </div>
    </div>
  );
}
