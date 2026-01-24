'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomBtn } from '@/components/shared/CustomBtn';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { useUser } from '@/lib/hooks/useUsers';
import { useOrders } from '@/lib/hooks/useOrders';
import {
  ArrowLeft,
  ShoppingCart,
  Eye
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

export default function UserOrdersPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useUser(resolvedParams.id);
  const { data: allOrders, isLoading: ordersLoading } = useOrders();

  // Filter orders for this user
  const userOrders = allOrders?.filter(order => order.userId === resolvedParams.id) || [];

  if (userLoading || ordersLoading) {
    return (
      <div>
        <Header title="User Orders" />
        <div className="p-6">
          <LoadingSpinner text="Loading orders..." />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <Header title="User Not Found" />
        <div className="p-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">User not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title={`${user.name}'s Orders`}
      //description="Complete order history for this user"
      />

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Back Button */}
        <CustomBtn
          variant="ghost"
          icon={ArrowLeft}
          onClick={() => router.push(`/admin/users/${user.id}`)}
        >
          Back to Profile
        </CustomBtn>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Order History ({userOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {userOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Car</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">
                          {order.id}
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
                          <CustomBtn
                            variant="ghost"
                            size="sm"
                            icon={Eye}
                            onClick={() => router.push(`/admin/orders/${order.id}`)}
                            className="h-8 w-8 p-0 cursor-pointer"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <EmptyState
                icon={ShoppingCart}
                title="No orders yet"
                description="This user hasn't placed any orders"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}