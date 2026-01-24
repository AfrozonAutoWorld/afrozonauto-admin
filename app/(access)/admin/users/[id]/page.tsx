'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomBtn } from '@/components/shared/CustomBtn';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useUser } from '@/lib/hooks/useUsers';
import { useOrders } from '@/lib/hooks/useOrders';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  ShoppingCart,
  Eye,
  User as UserIcon
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
import { EmptyState } from '@/components/shared';


export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useUser(resolvedParams.id);
  const { data: allOrders } = useOrders();

  // Filter orders for this user
  const userOrders = allOrders?.filter(order => order.userId === resolvedParams.id) || [];

  if (userLoading) {
    return (
      <div>
        <Header title="User Profile" />
        <div className="p-6">
          <LoadingSpinner text="Loading user profile..." />
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
      <Header title="User Profile" />

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Back Button */}
        <CustomBtn
          variant="ghost"
          icon={ArrowLeft}
          onClick={() => router.push('/users')}
        >
          Back to Users
        </CustomBtn>

        {/* User Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Avatar */}
              <div className="flex justify-center sm:justify-start">
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserIcon className="h-12 w-12 text-primary" />
                </div>
              </div>

              {/* User Details */}
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  <p className="text-sm text-muted-foreground">{user.id}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.email}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.phone}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.country}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Joined {format(new Date(user.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {user.role === 'super_admin' ? 'Super Admin' : 'Operations Admin'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <StatusBadge status={user.status} />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Statistics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{userOrders.length}</div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">

                {userOrders.filter(o => o.status === 'paid').length}
              </div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {userOrders.filter(o => o.status === 'pending').length}
              </div>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                ${userOrders
                  .filter(o => o.status === 'paid')
                  .reduce((sum, o) => sum + o.amount, 0)
                  .toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Total Spent</p>
            </CardContent>
          </Card>
        </div>

        {/* Order History Link */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Order History</h3>
                <p className="text-sm text-muted-foreground">
                  View all orders placed by this user
                </p>
              </div>
              <CustomBtn
                icon={ShoppingCart}
                onClick={() => router.push(`/users/${user.id}/orders`)}
              >
                View Orders
              </CustomBtn>
            </div>

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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
