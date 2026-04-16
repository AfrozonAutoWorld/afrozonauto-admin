'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomBtn } from '@/components/shared/CustomBtn';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useAddOrderNote, useDeleteOrder, useOrder } from '@/lib/hooks/useOrders';
import { ArrowLeft, FileText, Trash2, User } from 'lucide-react';
import { format } from 'date-fns';
import { TextAreaField } from '@/components/Form';

export default function PendingOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const { data: order, isLoading } = useOrder(resolvedParams.id);
  const addOrderNote = useAddOrderNote();
  const deleteOrder = useDeleteOrder();
  const [note, setNote] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

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

  const handleDeleteOrder = () => {
    deleteOrder.mutate(resolvedParams.id, {
      onSuccess: () => setDeleteTarget(null),
    });
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
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Order not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Order Details" />

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <CustomBtn
          variant="ghost"
          icon={ArrowLeft}
          onClick={() => router.back()}
          className='cursor-pointer'
        >
          Back to Pending Orders
        </CustomBtn>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-mono font-medium">{order.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <StatusBadge status={order.status} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order Date</p>
                <p className="font-medium">
                  {format(new Date(order.createdAt), 'MMMM d, yyyy HH:mm')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-2xl font-bold">${order.amount.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{order.userName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{order.userEmail}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Country</p>
                <p className="font-medium">{order.country}</p>
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

          <Card>
            <CardHeader>
              <CardTitle>Vehicle Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Make & Model</p>
                <p className="font-medium">
                  {order.carDetails.make} {order.carDetails.model}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Year</p>
                <p className="font-medium">{order.carDetails.year}</p>
              </div>
            </CardContent>
          </Card>

          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{order.notes}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <TextAreaField
                label="Internal Note"
                htmlFor="internal-note"
                id="internal-note"
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
                {session?.user?.role === 'SUPER_ADMIN' && (
                  <CustomBtn
                    variant="ghost"
                    icon={Trash2}
                    onClick={() => setDeleteTarget(resolvedParams.id)}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    Delete Order
                  </CustomBtn>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        title="Delete Order"
        description="This action cannot be undone. The order will be permanently deleted from the system."
        message={`Are you sure you want to delete order ${order?.id}?`}
        onConfirm={handleDeleteOrder}
        isLoading={deleteOrder.isPending}
        confirmText="Delete Order"
        variant="destructive"
      />
    </div>
  );
}
