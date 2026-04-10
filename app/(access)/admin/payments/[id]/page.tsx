'use client';

import { use, type ReactNode } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  ArrowLeft,
  CarFront,
  ExternalLink,
  FileImage,
  Receipt,
  ShieldCheck,
  UserRound,
  Wallet,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { CustomBtn } from '@/components/shared/CustomBtn';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePayment } from '@/lib/hooks';

const formatLabel = (value?: string | null) => {
  if (!value) return 'N/A';

  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/,/g, ' / ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatCurrencyValue = (value?: number | null, currency = 'USD') => {
  if (typeof value !== 'number' || Number.isNaN(value)) return 'N/A';

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `$${value.toLocaleString()}`;
  }
};

const formatDateTime = (value?: string | null) => {
  if (!value) return 'N/A';
  return format(new Date(value), 'MMM d, yyyy HH:mm');
};

const getStateTone = (value?: string | null) => {
  const normalized = value?.toLowerCase() ?? '';

  if (
    normalized.includes('fail') ||
    normalized.includes('reject') ||
    normalized.includes('refund') ||
    normalized.includes('cancel')
  ) {
    return 'border-red-200 bg-red-50 text-red-700';
  }

  if (
    normalized.includes('complete') ||
    normalized.includes('approve') ||
    normalized.includes('paid') ||
    normalized.includes('verify') ||
    normalized.includes('available')
  ) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }

  if (
    normalized.includes('pending') ||
    normalized.includes('process') ||
    normalized.includes('held') ||
    normalized.includes('quote')
  ) {
    return 'border-amber-200 bg-amber-50 text-amber-700';
  }

  return 'border-slate-200 bg-slate-50 text-slate-700';
};

function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className={mono ? 'mt-1 break-all font-mono text-sm' : 'mt-1 text-sm font-medium'}>
        {value}
      </div>
    </div>
  );
}

function StatePill({ value }: { value?: string | null }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStateTone(
        value,
      )}`}
    >
      {formatLabel(value)}
    </span>
  );
}

export default function PaymentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: payment, isLoading } = usePayment(resolvedParams.id);

  const buyerId = payment?.user?.id || payment?.userId;
  const orderId = payment?.order?.id || payment?.orderId;
  const vehicle = payment?.order?.vehicle;
  const evidenceUrls = payment?.evidenceUrls ?? [];
  const breakdownEntries = Object.entries(
    payment?.order?.paymentBreakdown?.breakdown ?? {},
  );

  if (isLoading) {
    return (
      <div>
        <Header title="Payment Details" />
        <div className="p-6">
          <LoadingSpinner text="Loading payment details..." />
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div>
        <Header title="Payment Not Found" />
        <div className="p-6">
          <EmptyState
            icon={Receipt}
            title="Payment not found"
            description="The payment you are looking for does not exist"
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Payment Details" description="Payment, buyer, and order summary" />

      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CustomBtn
            variant="ghost"
            icon={ArrowLeft}
            onClick={() => router.back()}
            className="cursor-pointer"
          >
            Back to Payments
          </CustomBtn>

          <div className="flex flex-wrap gap-2">
            {buyerId && (
              <CustomBtn
                variant="bordered"
                onClick={() => router.push(`/admin/users/${buyerId}`)}
              >
                Open Buyer
              </CustomBtn>
            )}
            {orderId && (
              <CustomBtn
                variant="bordered"
                onClick={() => router.push(`/admin/orders/${orderId}`)}
              >
                Open Order
              </CustomBtn>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-xl font-semibold">
                    {formatCurrencyValue(payment.amount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  <StatusBadge status={payment.status} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-amber-100 p-3 text-amber-700">
                  <Receipt className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Escrow Status</p>
                  <StatePill value={payment.escrowStatus} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Buyer</p>
                  <p className="text-sm font-semibold">{payment.user?.name || 'Unknown Buyer'}</p>
                  <p className="text-xs text-muted-foreground">
                    {payment.user?.email || buyerId || 'No buyer reference'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-100">
                  {vehicle?.images?.[0] ? (
                    <Image
                      src={vehicle.images[0]}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <CarFront className="h-14 w-14 text-slate-400" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {vehicle
                        ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
                        : 'Vehicle snapshot unavailable'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {vehicle?.vin || payment.order?.requestNumber || payment.id}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {vehicle?.vehicleType && (
                      <StatusBadge status={vehicle.vehicleType.toLowerCase()} />
                    )}
                    {vehicle?.status && (
                      <StatusBadge status={vehicle.status.toLowerCase()} />
                    )}
                  </div>
                </div>

                {vehicle ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InfoRow label="Vehicle ID" value={vehicle.id || 'N/A'} mono />
                    <InfoRow label="VIN" value={vehicle.vin || 'N/A'} mono />
                    <InfoRow
                      label="Listed Price"
                      value={formatCurrencyValue(vehicle.priceUsd)}
                    />
                    <InfoRow
                      label="Mileage"
                      value={
                        typeof vehicle.mileage === 'number'
                          ? `${vehicle.mileage.toLocaleString()} miles`
                          : 'N/A'
                      }
                    />
                    <InfoRow label="Transmission" value={formatLabel(vehicle.transmission)} />
                    <InfoRow label="Fuel Type" value={formatLabel(vehicle.fuelType)} />
                    <InfoRow label="Engine" value={formatLabel(vehicle.engineSize)} />
                    <InfoRow label="Drivetrain" value={formatLabel(vehicle.drivetrain)} />
                    <InfoRow label="Dealer" value={vehicle.dealerName || 'N/A'} />
                    <InfoRow
                      label="Location"
                      value={
                        [vehicle.dealerCity, vehicle.dealerState, vehicle.dealerZipCode]
                          .filter(Boolean)
                          .join(', ') || 'N/A'
                      }
                    />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No vehicle snapshot was included with this payment.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <InfoRow
                    label="Total"
                    value={formatCurrencyValue(payment.order?.paymentBreakdown?.totalUsd)}
                  />
                  <InfoRow
                    label="Used Deposit"
                    value={formatCurrencyValue(
                      payment.order?.paymentBreakdown?.totalUsedDeposit,
                    )}
                  />
                  <InfoRow
                    label="Shipping Method"
                    value={formatLabel(
                      payment.order?.paymentBreakdown?.shippingMethod ||
                      payment.order?.shippingMethod,
                    )}
                  />
                </div>

                {breakdownEntries.length > 0 ? (
                  <div className="rounded-xl border border-slate-200">
                    {breakdownEntries.map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between border-b border-slate-200 px-4 py-3 last:border-b-0"
                      >
                        <span className="text-sm text-slate-600">{formatLabel(key)}</span>
                        <span className="text-sm font-semibold text-slate-900">
                          {typeof value === 'number'
                            ? formatCurrencyValue(value)
                            : formatLabel(String(value))}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No cost breakdown was provided for this payment.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Receipt & Evidence</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  {payment.receiptUrl && (
                    <a
                      href={payment.receiptUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      <Receipt className="h-4 w-4" />
                      Open Receipt
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}

                  <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600">
                    <FileImage className="h-4 w-4" />
                    Evidence Uploaded: {formatDateTime(payment.evidenceUploadedAt)}
                  </div>
                </div>

                {evidenceUrls.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {evidenceUrls.map((url, index) => (
                      <a
                        key={`${url}-${index}`}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="group block overflow-hidden rounded-xl border border-slate-200"
                      >
                        <div className="relative aspect-[4/3] bg-slate-100">
                          <Image
                            src={url}
                            alt={`Payment evidence ${index + 1}`}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No payment evidence files were uploaded.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoRow label="Payment ID" value={payment.id} mono />
                <InfoRow label="Transaction ID" value={payment.transactionId} mono />
                <InfoRow label="Transaction Ref" value={payment.transactionRef || 'N/A'} mono />
                <InfoRow
                  label="Provider Transaction ID"
                  value={payment.providerTransactionId || 'N/A'}
                  mono
                />
                <InfoRow label="Payment Type" value={formatLabel(payment.paymentType)} />
                <InfoRow label="Method" value={formatLabel(payment.method)} />
                <InfoRow label="Provider" value={formatLabel(payment.paymentProvider)} />
                <InfoRow label="Normalized Status" value={<StatusBadge status={payment.status} />} />
                <InfoRow label="Gateway Status" value={<StatePill value={payment.rawStatus} />} />
                <InfoRow label="Escrow" value={<StatePill value={payment.escrowStatus} />} />
                <InfoRow label="USD Amount" value={formatCurrencyValue(payment.amount)} />
                {(payment.amountLocal !== null || payment.localCurrency) && (
                  <InfoRow
                    label={`Local Amount (${payment.localCurrency || 'Local'})`}
                    value={formatCurrencyValue(payment.amountLocal, payment.localCurrency || 'USD')}
                  />
                )}
                {typeof payment.exchangeRate === 'number' && (
                  <InfoRow
                    label="Exchange Rate"
                    value={payment.exchangeRate.toLocaleString()}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Buyer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoRow label="Name" value={payment.user?.name || 'Unknown'} />
                <InfoRow label="Email" value={payment.user?.email || 'N/A'} />
                <InfoRow label="User ID" value={buyerId || 'N/A'} mono />
                {buyerId && (
                  <CustomBtn
                    variant="bordered"
                    className="w-full"
                    onClick={() => router.push(`/admin/users/${buyerId}`)}
                  >
                    Open Buyer Profile
                  </CustomBtn>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Order</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoRow label="Request Number" value={payment.order?.requestNumber || 'N/A'} />
                <InfoRow label="Order ID" value={orderId || 'N/A'} mono />
                <InfoRow label="Order Status" value={<StatePill value={payment.order?.status} />} />
                <InfoRow
                  label="Destination Country"
                  value={payment.order?.destinationCountry || 'N/A'}
                />
                <InfoRow
                  label="Shipping Method"
                  value={formatLabel(
                    payment.order?.shippingMethod ||
                    payment.order?.paymentBreakdown?.shippingMethod,
                  )}
                />

                {payment.order?.previousStatus?.length ? (
                  <div>
                    <p className="text-sm text-muted-foreground">Previous Statuses</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {payment.order.previousStatus.map((status) => (
                        <StatePill key={status} value={status} />
                      ))}
                    </div>
                  </div>
                ) : null}

                {orderId && (
                  <CustomBtn
                    variant="bordered"
                    className="w-full"
                    onClick={() => router.push(`/admin/orders/${orderId}`)}
                  >
                    Open Order
                  </CustomBtn>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Admin Review & Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoRow label="Created At" value={formatDateTime(payment.createdAt)} />
                <InfoRow label="Updated At" value={formatDateTime(payment.updatedAt)} />
                <InfoRow label="Completed At" value={formatDateTime(payment.completedAt)} />
                <InfoRow
                  label="Admin Confirmed At"
                  value={formatDateTime(payment.adminConfirmedAt)}
                />
                <InfoRow
                  label="Admin Confirmed By"
                  value={payment.adminConfirmedBy || 'N/A'}
                  mono
                />
                <InfoRow label="Refunded At" value={formatDateTime(payment.refundedAt)} />
                <InfoRow label="Refund Amount" value={formatCurrencyValue(payment.refundAmount)} />
                <InfoRow label="Refunded By" value={payment.refundedBy || 'N/A'} mono />
                <InfoRow label="Refund Reason" value={payment.refundReason || 'N/A'} />

                <div>
                  <p className="text-sm text-muted-foreground">Admin Note</p>
                  <p className="mt-1 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    {payment.adminNote || 'No admin note recorded.'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="mt-1 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    {payment.description || 'No description provided.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
