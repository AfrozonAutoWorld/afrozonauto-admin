'use client';

import { use, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Ban,
  BellRing,
  FileText,
  MapPin,
  Package,
  ShoppingCart,
  User,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomBtn } from '@/components/shared/CustomBtn';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { TextAreaField } from '@/components/Form';
import {
  useAddOrderNote,
  useCancelOrder,
  useOrder,
} from '@/lib/hooks/useOrders';
import { useNotifySellerPaymentCompleted } from '@/lib/hooks/usePayment';

const formatDateTime = (value?: string | null) => {
  if (!value) return '—';
  return format(new Date(value), 'MMM d, yyyy HH:mm');
};

const formatCurrency = (value?: number | null, currency = 'USD') => {
  if (typeof value !== 'number') return '—';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatLabel = (value: string) =>
  value
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);

  const { data: order, isLoading } = useOrder(resolvedParams.id);
  const addOrderNote = useAddOrderNote();
  const cancelOrder = useCancelOrder();
  const notifySeller = useNotifySellerPaymentCompleted();

  const [note, setNote] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [notifyPaymentId, setNotifyPaymentId] = useState<string | null>(null);

  const selectedPayment = useMemo(
    () => order?.payments.find((payment) => payment.id === notifyPaymentId) ?? null,
    [order?.payments, notifyPaymentId],
  );
  const isCancelled = (order?.status ?? '').toUpperCase() === 'CANCELLED';

  const handleAddNote = () => {
    const trimmedNote = note.trim();
    if (!trimmedNote) return;

    addOrderNote.mutate(
      { id: resolvedParams.id, note: trimmedNote },
      {
        onSuccess: () => setNote(''),
      },
    );
  };

  const handleCancelOrder = () => {
    cancelOrder.mutate(resolvedParams.id, {
      onSuccess: () => setShowCancelConfirm(false),
    });
  };

  const handleConfirmNotifySeller = () => {
    if (!selectedPayment || !order) return;

    notifySeller.mutate(
      {
        paymentId: selectedPayment.id,
        vehicleId: order.vehicleId ?? selectedPayment.order?.vehicleId ?? null,
      },
      {
        onSuccess: () => {
          setNotifyPaymentId(null);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div>
        <Header title="Order Details" />
        <div className="p-6">
          <LoadingSpinner text="Loading order..." />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <Header title="Order Not Found" />
        <div className="p-6">
          <EmptyState
            icon={ShoppingCart}
            title="Order not found"
            description="The order you are looking for does not exist."
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title={order.requestNumber || order.id}
        description="Order details, payment activity, and admin actions."
      />

      <div className="p-4 sm:p-6 space-y-6">
        <CustomBtn
          variant="ghost"
          icon={ArrowLeft}
          onClick={() => router.back()}
          className="cursor-pointer"
        >
          Back to Orders
        </CustomBtn>

        <div className="grid gap-6 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Order Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Request Number</p>
                <p className="font-medium">{order.requestNumber || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-mono text-sm">{order.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order Status</p>
                <StatusBadge status={order.status} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Status</p>
                <StatusBadge status={order.paymentStatus} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="font-semibold">{formatCurrency(order.amount)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Priority</p>
                <p className="font-medium">{order.priority || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p>{formatDateTime(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Updated</p>
                <p>{formatDateTime(order.updatedAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status Changed</p>
                <p>{formatDateTime(order.statusChangedAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quote Expires</p>
                <p>{formatDateTime(order.quoteExpiresAt)}</p>
              </div>

              {order.previousStatus.length > 0 && (
                <div className="sm:col-span-2">
                  <p className="mb-2 text-sm text-muted-foreground">Previous Statuses</p>
                  <div className="flex flex-wrap gap-2">
                    {order.previousStatus.map((status) => (
                      <StatusBadge key={status} status={status} />
                    ))}
                  </div>
                </div>
              )}

              {order.tags.length > 0 && (
                <div className="sm:col-span-2">
                  <p className="mb-2 text-sm text-muted-foreground">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {order.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{order.userName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium break-all">{order.userEmail}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="font-mono text-sm">{order.userId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Destination Country</p>
                <p className="font-medium">{order.country || '—'}</p>
              </div>
              <CustomBtn
                variant="bordered"
                icon={User}
                onClick={() => router.push(`/admin/users/${order.userId}`)}
                className="w-full"
              >
                View Customer Profile
              </CustomBtn>
            </CardContent>
          </Card>

          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Vehicle Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="relative h-56 w-full overflow-hidden rounded-lg bg-muted md:w-72">
                  {order.vehicle?.images?.[0] ? (
                    <Image
                      src={order.vehicle.images[0]}
                      alt={`${order.carDetails.make} ${order.carDetails.model}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="grid flex-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Vehicle</p>
                    <p className="font-medium">
                      {order.carDetails.make} {order.carDetails.model} ({order.carDetails.year})
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">VIN</p>
                    <p className="font-mono text-sm">{order.vehicle?.vin || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium">{order.vehicle?.vehicleType || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mileage</p>
                    <p className="font-medium">
                      {typeof order.vehicle?.mileage === 'number'
                        ? `${order.vehicle.mileage.toLocaleString()} mi`
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Transmission</p>
                    <p className="font-medium">{order.vehicle?.transmission || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fuel Type</p>
                    <p className="font-medium">{order.vehicle?.fuelType || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Drivetrain</p>
                    <p className="font-medium">{order.vehicle?.drivetrain || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vehicle Price</p>
                    <p className="font-medium">{formatCurrency(order.vehicle?.priceUsd)}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-sm text-muted-foreground">Dealer</p>
                    <p className="font-medium">
                      {order.vehicle?.dealerName || '—'}
                      {order.vehicle?.dealerCity || order.vehicle?.dealerState
                        ? ` • ${[order.vehicle?.dealerCity, order.vehicle?.dealerState]
                          .filter(Boolean)
                          .join(', ')}`
                        : ''}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Shipping Method</p>
                <p className="font-medium">{order.shippingMethod || order.paymentBreakdown?.shippingMethod || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Destination</p>
                <p className="font-medium">
                  {[order.destinationCity, order.destinationState, order.destinationCountry]
                    .filter(Boolean)
                    .join(', ') || '—'}
                </p>
                {order.destinationAddress && (
                  <p className="text-sm text-muted-foreground">{order.destinationAddress}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ports</p>
                <p className="font-medium">
                  {[order.originPort, order.destinationPort].filter(Boolean).join(' → ') || '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                <p className="font-medium">{formatDateTime(order.estimatedDeliveryDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Actual Delivery</p>
                <p className="font-medium">{formatDateTime(order.actualDeliveryDate)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="xl:col-span-3">
            <CardHeader>
              <CardTitle>Payment Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Breakdown Total</p>
                <p className="font-medium">{formatCurrency(order.paymentBreakdown?.totalUsd)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Used Deposit</p>
                <p className="font-medium">{formatCurrency(order.paymentBreakdown?.totalUsedDeposit)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quoted Price</p>
                <p className="font-medium">{formatCurrency(order.quotedPriceUsd)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deposit Amount</p>
                <p className="font-medium">{formatCurrency(order.depositAmountUsd)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Landed Cost (USD)</p>
                <p className="font-medium">{formatCurrency(order.totalLandedCostUsd)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Landed Cost (Local)</p>
                <p className="font-medium">
                  {typeof order.totalLandedCostLocal === 'number' && order.localCurrency
                    ? formatCurrency(order.totalLandedCostLocal, order.localCurrency)
                    : '—'}
                </p>
              </div>

              {order.paymentBreakdown?.breakdown && (
                <div className="md:col-span-3">
                  <p className="mb-2 text-sm text-muted-foreground">Cost Items</p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(order.paymentBreakdown.breakdown).map(([key, value]) => (
                      <div key={key} className="rounded-lg border border-slate-200 p-3">
                        <p className="text-sm text-muted-foreground">{formatLabel(key)}</p>
                        <p className="font-medium">
                          {typeof value === 'number' ? formatCurrency(value) : String(value ?? '—')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="xl:col-span-3">
            <CardHeader>
              <CardTitle>Payments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.payments.length > 0 ? (
                order.payments.map((payment) => (
                  <div key={payment.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="grid flex-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Transaction</p>
                          <p className="font-medium">{payment.transactionId}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Payment Status</p>
                          <StatusBadge status={payment.status} />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Amount</p>
                          <p className="font-medium">{formatCurrency(payment.amount)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Method</p>
                          <p className="font-medium">{formatLabel(payment.method)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Type</p>
                          <p className="font-medium">{payment.paymentType || '—'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Escrow</p>
                          <p className="font-medium">{payment.escrowStatus || '—'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Completed At</p>
                          <p className="font-medium">{formatDateTime(payment.completedAt)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Admin Confirmed</p>
                          <p className="font-medium">{formatDateTime(payment.adminConfirmedAt)}</p>
                        </div>
                      </div>

                      {payment.status === 'completed' && (
                        <CustomBtn
                          icon={BellRing}
                          onClick={() => setNotifyPaymentId(payment.id)}
                          isLoading={notifySeller.isPending && notifyPaymentId === payment.id}
                          className="bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          Notify Seller
                        </CustomBtn>
                      )}
                    </div>

                    {payment.adminNote && (
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground">Admin Note</p>
                        <p className="text-sm">{payment.adminNote}</p>
                      </div>
                    )}

                    {payment.evidenceUrls.length > 0 && (
                      <div className="mt-4">
                        <p className="mb-2 text-sm text-muted-foreground">Payment Evidence</p>
                        <div className="flex flex-wrap gap-2">
                          {payment.evidenceUrls.map((url, index) => (
                            <a
                              key={`${payment.id}-${index}`}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-sm text-emerald-700 hover:bg-emerald-50"
                            >
                              <MapPin className="h-3.5 w-3.5" />
                              View Evidence {index + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No payments recorded for this order yet.</p>
              )}
            </CardContent>
          </Card>

          {(order.customerNotes || order.specialRequests || order.deliveryInstructions) && (
            <Card className="xl:col-span-3">
              <CardHeader>
                <CardTitle>Customer Notes & Instructions</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Customer Notes</p>
                  <p className="text-sm">{order.customerNotes || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Special Requests</p>
                  <p className="text-sm">{order.specialRequests || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Delivery Instructions</p>
                  <p className="text-sm">{order.deliveryInstructions || '—'}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="xl:col-span-3">
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <TextAreaField
                label="Internal Note"
                htmlFor="order-note"
                id="order-note"
                placeholder="Add an internal note for this order"
                value={note}
                onChange={setNote}
                isInvalid={false}
                errorMessage=""
                rows={4}
              />
              <div className="flex flex-col gap-3 sm:flex-row">
                <CustomBtn
                  icon={FileText}
                  onClick={handleAddNote}
                  isLoading={addOrderNote.isPending}
                  isDisabled={!note.trim()}
                >
                  Save Note
                </CustomBtn>
                <CustomBtn
                  variant="bordered"
                  icon={Ban}
                  onClick={() => setShowCancelConfirm(true)}
                  isDisabled={isCancelled}
                >
                  {isCancelled ? 'Order Cancelled' : 'Cancel Order'}
                </CustomBtn>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmModal
        open={showCancelConfirm}
        onOpenChange={setShowCancelConfirm}
        title="Cancel Order"
        description="This will cancel the order and prevent further processing."
        message={`Are you sure you want to cancel order ${order.requestNumber || order.id}?`}
        onConfirm={handleCancelOrder}
        isLoading={cancelOrder.isPending}
        confirmText="Cancel Order"
        variant="warning"
      />

      <ConfirmModal
        open={!!notifyPaymentId}
        onOpenChange={(open) => {
          if (!open) {
            setNotifyPaymentId(null);
          }
        }}
        title="Notify Seller"
        description="Send the sold notification from this completed payment."
        message={
          selectedPayment
            ? `Notify the seller using transaction ${selectedPayment.transactionId}?`
            : ''
        }
        onConfirm={handleConfirmNotifySeller}
        isLoading={notifySeller.isPending}
        confirmText="Notify Seller"
      />
    </div>
  );
}
