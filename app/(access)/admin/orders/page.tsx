'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { useOrders } from '@/lib/hooks/useOrders';
import { ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@nextui-org/react';


export default function AllOrdersPage() {
  const router = useRouter();
  const { data: orders, isLoading } = useOrders();


  return (
    <div>
      <Header
        title="All Orders"
      //description="All orders awaiting payment or processing"
      />

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <Button
          variant="ghost"
          onPress={() => router.push('/admin/dashboard')}
        >
          Back to Dashboard
        </Button>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <LoadingSpinner text="Loading pending orders..." />
            ) : orders && orders?.length > 0 ? (
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
                title="No pending orders"
                description="All orders have been processed"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}