'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { useOrders, useDeleteOrder } from '@/lib/hooks/useOrders';
import { useNotifySellerPaymentCompleted } from '@/lib/hooks/usePayment';
import {
  ArrowLeft,
  BellRing,
  Eye,
  MoreVertical,
  Search,
  ShoppingCart,
  Trash2,
} from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CustomBtn } from '@/components/shared';
import type { Order } from '@/types';

const orderStatuses = [
  'PENDING_QUOTE',
  'QUOTE_SENT',
  'QUOTE_ACCEPTED',
  'QUOTE_REJECTED',
  'QUOTE_EXPIRED',
  'DEPOSIT_PENDING',
  'DEPOSIT_PAID',
  'HALF_DEPOSIT_PAID',
  'AWAITING_BALANCE',
  'BALANCE_PAID',
  'INSPECTION_PENDING',
  'INSPECTION_COMPLETE',
  'INSPECTION_FAILED',
  'AWAITING_APPROVAL',
  'APPROVED',
  'REJECTED',
  'PURCHASE_IN_PROGRESS',
  'PURCHASED',
  'EXPORT_PENDING',
  'SHIPPED',
  'IN_TRANSIT',
  'ARRIVED_PORT',
  'CUSTOMS_CLEARANCE',
  'CUSTOMS_HOLD',
  'CLEARED',
  'DELIVERY_SCHEDULED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
  'PARTIALLY_REFUNDED',
] as const;

const priorityOptions = ['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const;
const filterFieldClassName =
  'h-11 rounded-lg border-slate-200 bg-white shadow-none transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500/20';
const filterLabelClassName = 'text-sm font-medium text-slate-700';


export default function AllOrdersPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const notifySeller = useNotifySellerPaymentCompleted();
  const deleteOrder = useDeleteOrder();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userId, setUserId] = useState('');
  const [priority, setPriority] = useState('all');
  const [shippingMethod, setShippingMethod] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notifyTarget, setNotifyTarget] = useState<{
    paymentId: string;
    vehicleId?: string | null;
    requestNumber?: string | null;
    transactionId: string;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    requestNumber: string;
  } | null>(null);
  const limit = 10;

  const filters = useMemo(() => ({
    page,
    limit,
    search: search.trim() || undefined,
    status: statusFilter !== 'all' ? [statusFilter] : undefined,
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

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setUserId('');
    setPriority('all');
    setShippingMethod('');
    setDestinationCountry('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const getCompletedPayment = (order: Order) =>
    order.payments.find((payment) => payment.status === 'completed');

  const handleNotifySeller = (order: Order) => {
    const completedPayment = getCompletedPayment(order);
    if (!completedPayment) return;

    setNotifyTarget({
      paymentId: completedPayment.id,
      vehicleId: order.vehicleId ?? completedPayment.order?.vehicleId ?? null,
      requestNumber: order.requestNumber ?? order.id,
      transactionId: completedPayment.transactionId,
    });
  };

  const handleDeleteOrder = (order: Order) => {
    setDeleteTarget({
      id: order.id,
      requestNumber: order.requestNumber || order.id,
    });
  };

  const confirmNotifySeller = () => {
    if (!notifyTarget) return;

    notifySeller.mutate(
      {
        paymentId: notifyTarget.paymentId,
        vehicleId: notifyTarget.vehicleId,
      },
      {
        onSuccess: () => {
          setNotifyTarget(null);
        },
      },
    );
  };

  const confirmDeleteOrder = () => {
    if (!deleteTarget) return;

    deleteOrder.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
      },
    });
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
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className={`${filterFieldClassName} pl-9`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className={filterLabelClassName} htmlFor="order-status">
                  Status
                </label>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger
                    id="order-status"
                    className={`w-full ${filterFieldClassName}`}
                  >
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border-slate-200 shadow-lg max-h-80">
                    <SelectItem value="all">All Statuses</SelectItem>
                    {orderStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className={filterLabelClassName} htmlFor="order-user-id">
                  User ID
                </label>
                <Input
                  id="order-user-id"
                  placeholder="Filter by user ID"
                  value={userId}
                  onChange={(e) => {
                    setUserId(e.target.value);
                    setPage(1);
                  }}
                  className={filterFieldClassName}
                />
              </div>

              <div className="space-y-2">
                <label className={filterLabelClassName} htmlFor="order-priority">
                  Priority
                </label>
                <Select
                  value={priority}
                  onValueChange={(value) => {
                    setPriority(value);
                    setPage(1);
                  }}
                >
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
                  onChange={(e) => {
                    setShippingMethod(e.target.value);
                    setPage(1);
                  }}
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
                  onChange={(e) => {
                    setDestinationCountry(e.target.value);
                    setPage(1);
                  }}
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
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
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
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                  className={filterFieldClassName}
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <CustomBtn variant="bordered" onClick={clearFilters}>
                Clear Filters
              </CustomBtn>
            </div>
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
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Car</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => {
                      const completedPayment = getCompletedPayment(order);

                      return (
                        <TableRow
                          key={order.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => router.push(`/admin/orders/${order.id}`)}
                        >
                          <TableCell className="font-mono text-sm">
                            <div className="space-y-1">
                              <div>{order.requestNumber || order.id}</div>
                              <div className="text-xs text-muted-foreground">{order.id}</div>
                            </div>
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
                          <TableCell>
                            <StatusBadge status={completedPayment ? 'completed' : order.paymentStatus} />
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(order.createdAt), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                  }}
                                  className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 hover:bg-slate-50"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/admin/orders/${order.id}`);
                                  }}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Detail
                                </DropdownMenuItem>
                                {completedPayment && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleNotifySeller(order);
                                      }}
                                    >
                                      <BellRing className="mr-2 h-4 w-4" />
                                      Notify Seller
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {session?.user?.role === 'SUPER_ADMIN' && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteOrder(order);
                                      }}
                                      className="text-red-600 focus:text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete Order
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page <= 1}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page >= totalPages}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </CardFooter>
          )}

        </Card>

      </div>

      <ConfirmModal
        open={!!notifyTarget}
        onOpenChange={(open) => {
          if (!open) {
            setNotifyTarget(null);
          }
        }}
        title="Notify Seller"
        description="Send the sold notification from the completed payment on this order."
        message={
          notifyTarget
            ? `Notify the seller for order ${notifyTarget.requestNumber ?? ''} using transaction ${notifyTarget.transactionId}?`
            : ''
        }
        onConfirm={confirmNotifySeller}
        isLoading={notifySeller.isPending}
        confirmText="Notify Seller"
      />

      <ConfirmModal
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        title="Delete Order"
        description="This action cannot be undone. The order will be permanently deleted from the system."
        message={
          deleteTarget
            ? `Are you sure you want to delete order ${deleteTarget.requestNumber}?`
            : ''
        }
        onConfirm={confirmDeleteOrder}
        isLoading={deleteOrder.isPending}
        confirmText="Delete Order"
        variant="destructive"
      />
    </div>
  );
}
