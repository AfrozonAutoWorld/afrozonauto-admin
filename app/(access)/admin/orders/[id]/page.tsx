'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomBtn } from '@/components/shared/CustomBtn';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { useOrder } from '@/lib/hooks/useOrders';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';
import { use } from 'react';


export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);

  const { data: order } = useOrder(resolvedParams.id);


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
          onClick={() => router.push('/admin/orders')}
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
      </div>
    </div>
  );
}
