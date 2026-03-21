'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { CustomBtn } from '@/components/shared/CustomBtn';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { Modal } from '@/components/shared/Modal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { TextAreaField } from '@/components/Form';
import { usePayments, useInitiateRefund, useConfirmPayment, useRejectPayment } from '@/lib/hooks';
import { CreditCard, DollarSign, MoreVertical, Search } from 'lucide-react';
import { format } from 'date-fns';

export default function PaymentsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'confirm' | 'reject' | null>(null);
  const [reviewPaymentId, setReviewPaymentId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, refetch } = usePayments({
    page,
    limit,
    search: searchQuery.trim() || undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
  });
  const initiateRefund = useInitiateRefund();
  const confirmPayment = useConfirmPayment();
  const rejectPayment = useRejectPayment();

  const payments = data?.items || [];
  const totalPages = data?.meta.pages ?? 1;

  useEffect(() => {
    setPage(1);
  }, [statusFilter, searchQuery]);

  const handleRefundClick = (paymentId: string) => {
    setSelectedPayment(paymentId);
    setRefundModalOpen(true);
  };

  const handleReviewAction = (paymentId: string, action: 'confirm' | 'reject') => {
    setReviewPaymentId(paymentId);
    setReviewAction(action);
    setReviewNote('');
    setReviewModalOpen(true);
  };

  const confirmRefund = () => {
    if (selectedPayment) {
      const payment = payments?.find(p => p.id === selectedPayment);
      if (payment) {
        initiateRefund.mutate(
          { paymentId: payment.id, amount: payment.amount },
          {
            onSuccess: async () => {
              await refetch();
              setRefundModalOpen(false);
              setSelectedPayment(null);
            },
          }
        );
      }
    }
  };

  const submitReviewAction = () => {
    if (!reviewPaymentId || !reviewAction || !reviewNote.trim()) return;

    const payload = { paymentId: reviewPaymentId, note: reviewNote.trim() };
    const mutation = reviewAction === 'confirm' ? confirmPayment : rejectPayment;

    mutation.mutate(payload, {
      onSuccess: async () => {
        await refetch();
        setReviewModalOpen(false);
        setReviewPaymentId(null);
        setReviewAction(null);
        setReviewNote('');
      },
    });
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      case 'bank_transfer':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const payment = payments.find(p => p.id === selectedPayment);
  const reviewPayment = payments.find(p => p.id === reviewPaymentId);
  const refundMessage = payment
    ? `Are you sure you want to refund $${payment.amount.toLocaleString()} for transaction ${payment.transactionId}? This action cannot be undone.`
    : 'Select a payment to refund.';
  const isReviewSubmitting = confirmPayment.isPending || rejectPayment.isPending;

  return (
    <div>
      <Header
        title="Payments"
      // description="Track payment transactions and process refunds"
      />

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Filters */}
        {/* Summary Stats */}
        {payments.length > 0 && (
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{data?.meta.total ?? payments.length}</div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  ${payments
                    .filter(p => p.status === 'completed')
                    .reduce((sum, p) => sum + p.amount, 0)
                    .toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {payments.filter(p => p.status === 'pending').length}
                </div>
                <p className="text-sm text-muted-foreground">Pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  ${payments
                    .filter(p => p.status === 'refunded')
                    .reduce((sum, p) => sum + (p.refundAmount || 0), 0)
                    .toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Refunded</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="payment-search" className="text-sm font-medium text-slate-700">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="payment-search"
                    placeholder="Search by transaction, order, or reference"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-11 rounded-lg border-slate-200 bg-white pl-9 shadow-none focus-visible:ring-2 focus-visible:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="payment-status" className="text-sm font-medium text-slate-700">
                  Status
                </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger
                    id="payment-status"
                    className="h-11 w-full rounded-lg border-slate-200 bg-white shadow-none focus-visible:ring-2 focus-visible:ring-emerald-500/20"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border-slate-200 shadow-lg">
                    <SelectItem value="ALL">All Payments</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <LoadingSpinner text="Loading payments..." />
            ) : payments.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-sm">
                          {payment.transactionId}
                        </TableCell>
                        <TableCell
                          className="font-mono text-sm text-blue-600 cursor-pointer hover:underline"
                          onClick={() => router.push(`/admin/orders/${payment.orderId}`)}
                        >
                          {payment.orderId}
                        </TableCell>
                        <TableCell className="font-medium">
                          {typeof payment.amount === 'number'
                            ? `$${payment.amount.toLocaleString()}`
                            : '—'}
                          {typeof payment.refundAmount === 'number' && (
                            <div className="text-xs text-red-600">
                              Refunded: ${payment.refundAmount.toLocaleString()}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPaymentMethodIcon(payment.method)}
                            <span className="capitalize">
                              {typeof payment.method === 'string'
                                ? payment.method.replace('_', ' ')
                                : '—'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={payment.status} />
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(payment.createdAt), 'MMM d, yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          {(payment.status === 'pending' || payment.status === 'completed') && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  type="button"
                                  className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 hover:bg-slate-50"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {payment.status === 'pending' && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => handleReviewAction(payment.id, 'confirm')}
                                    >
                                      Confirm
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleReviewAction(payment.id, 'reject')}
                                      className="text-red-700"
                                    >
                                      Reject
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {payment.status === 'completed' && (
                                  <DropdownMenuItem onClick={() => handleRefundClick(payment.id)}>
                                    Refund
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                          {payment.status === 'refunded' && payment.refundedAt && (
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(payment.refundedAt), 'MMM d, yyyy')}
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
                icon={CreditCard}
                title="No payments found"
                description="Payment transactions will appear here"
              />
            )}
          </CardContent>

          {totalPages > 1 && (
            <CardFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                Page {page} of {totalPages} • Total {data?.meta.total ?? payments.length}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </CardFooter>
          )}


        </Card>

      </div>

      {/* Refund Confirmation Modal */}
      <ConfirmModal
        open={refundModalOpen}
        onOpenChange={setRefundModalOpen}
        title="Initiate Refund"
        description="Process a refund for this transaction"
        message={refundMessage}
        onConfirm={confirmRefund}
        isLoading={initiateRefund.isPending}
        variant="warning"
        confirmText="Process Refund"
      />

      <Modal
        open={reviewModalOpen}
        onOpenChange={(open) => {
          setReviewModalOpen(open);
          if (!open) {
            setReviewPaymentId(null);
            setReviewAction(null);
            setReviewNote('');
          }
        }}
        title={reviewAction === 'confirm' ? 'Confirm Payment' : 'Reject Payment'}
        description={
          reviewPayment
            ? `Add an internal note for transaction ${reviewPayment.transactionId}.`
            : 'Add an internal note for this payment action.'
        }
        showFooter
        onConfirm={submitReviewAction}
        confirmText={reviewAction === 'confirm' ? 'Confirm Payment' : 'Reject Payment'}
        isLoading={isReviewSubmitting}
      >
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            A note is required before this payment can be {reviewAction === 'confirm' ? 'confirmed' : 'rejected'}.
          </p>
          <TextAreaField
            label="Note"
            htmlFor="payment-review-note"
            id="payment-review-note"
            placeholder={
              reviewAction === 'confirm'
                ? 'Explain why this payment is being confirmed'
                : 'Explain why this payment is being rejected'
            }
            value={reviewNote}
            onChange={setReviewNote}
            isInvalid={!reviewNote.trim() && isReviewSubmitting}
            errorMessage="Note is required"
            required
            disableAutosize
            fixedHeightClassName="h-36"
          />
        </div>
      </Modal>
    </div>
  );
}
