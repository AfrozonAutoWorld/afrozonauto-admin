'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { usePendingOrders } from '@/lib/hooks/useOrders';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
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
import { CustomBtn } from '@/components/shared';


export default function PendingOrdersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 5;
  const { data, isLoading } = usePendingOrders({ page, limit });

  const pendingOrders = data?.items || [];
  const totalPages = data?.meta.pages ?? 1;

  return (
    <div>
      <Header
        title="Pending Orders"
      //description="All orders awaiting payment or processing"
      />

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <CustomBtn
          variant="ghost"
          icon={ArrowLeft}
          onClick={() => router.back()}
          className='cursor-pointer'
        >
          Back
        </CustomBtn>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <LoadingSpinner text="Loading pending orders..." />
            ) : pendingOrders.length > 0 ? (
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
                    {pendingOrders.map((order) => (
                      <TableRow
                        key={order.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => router.push(`/admin/orders/pending/${order.id}`)}
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
                            onPress={() => router.push(`/admin/orders/pending/${order.id}`)}
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


          {totalPages > 1 && (
            <CardFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                Page {page} of {totalPages} • Total {data?.meta.total ?? pendingOrders.length}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => setPage((prev) => Math.max(1, prev - 1))}
                  isDisabled={page <= 1}
                  className='cursor-pointer'
                >
                  Previous
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  isDisabled={page >= totalPages}
                  className='cursor-pointer'
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
