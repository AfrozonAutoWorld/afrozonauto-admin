'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomBtn } from '@/components/shared/CustomBtn';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { useAddOrderNote, useCancelOrder, useOrder } from '@/lib/hooks/useOrders';
import { ArrowLeft, Ban, FileText, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';
import { use } from 'react';
import { TextAreaField } from '@/components/Form';


export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);

  const { data: order } = useOrder(resolvedParams.id);
  const addOrderNote = useAddOrderNote();
  const cancelOrder = useCancelOrder();
  const [note, setNote] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

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


  //  const order = orders?.find((o) => o.id === orderId);


  // if (isLoading) {
  //   return (
  //     <div>
  //       <Header title="Order Details" />
  //       <div className="p-6">
  //         <LoadingSpinner text="Loading order..." />
  //       </div>
  //     </div>
  //   );
  // }

  if (!order) {
    return (
      <div>
        <Header title="Order Not Found" />
        <div className="p-6">
          <EmptyState
            icon={ShoppingCart}
            title="Order not found"
            description="The order you are looking for does not exist"
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title={`Order ${order.id}`}
        description="Order details and summary"
      />

      <div className="p-4 sm:p-6 space-y-6">
        {/* Back Button */}
        <CustomBtn
          variant="ghost"
          icon={ArrowLeft}
          onClick={() => router.back()}
          className='cursor-pointer'
        >
          Back to Orders
        </CustomBtn>

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Order ID</p>
                <p className="font-mono">{order.id}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Status</p>
                <StatusBadge status={order.status} />
              </div>

              <div>
                <p className="text-muted-foreground">Customer</p>
                <p className="font-medium">{order.userName}</p>
                <p className="text-xs text-muted-foreground">
                  {order.userEmail}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground">Date</p>
                <p>{format(new Date(order.createdAt), 'MMM d, yyyy')}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Car</p>
                <p>
                  {order.carDetails.make} {order.carDetails.model} (
                  {order.carDetails.year})
                </p>
              </div>

              <div>
                <p className="text-muted-foreground">Amount</p>
                <p className="font-semibold">
                  ${order.amount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
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
                isDisabled={order.status === 'cancelled'}
              >
                {order.status === 'cancelled' ? 'Order Cancelled' : 'Cancel Order'}
              </CustomBtn>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmModal
        open={showCancelConfirm}
        onOpenChange={setShowCancelConfirm}
        title="Cancel Order"
        description="This will cancel the order and prevent further processing"
        message={`Are you sure you want to cancel order ${order.id}?`}
        onConfirm={handleCancelOrder}
        isLoading={cancelOrder.isPending}
        confirmText="Cancel Order"
        variant="warning"
      />
    </div>
  );
}
