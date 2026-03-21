'use client';

import { use, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomBtn } from '@/components/shared/CustomBtn';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ConfirmModal } from '@/components/shared';
import { useToggleUserStatus, useUser } from '@/lib/hooks/useUsers';
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
  User as UserIcon,
  Wallet
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
  const { data: session } = useSession();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { data: user, isLoading: userLoading } = useUser(resolvedParams.id);
  const { data: allOrdersData } = useOrders({ userId: resolvedParams.id, page: 1, limit: 50 });
  const toggleStatus = useToggleUserStatus();
  const allOrders = allOrdersData?.items || [];
  const canManageUserStatus = session?.user.role === 'SUPER_ADMIN';

  // Filter orders for this user
  const userOrders = allOrders.filter(order => order.userId === resolvedParams.id);

  const formatRole = (role: string) =>
    role
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const confirmToggleStatus = () => {
    toggleStatus.mutate(user.id, {
      onSuccess: () => setConfirmOpen(false),
    });
  };

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
          onClick={() => router.back()}
        >
          Back to Users
        </CustomBtn>

        {canManageUserStatus && (
          <div className="flex justify-end">
            <CustomBtn
              variant="bordered"
              onClick={() => setConfirmOpen(true)}
              className={user.status === 'active' ? 'border-red-200 text-red-700 hover:bg-red-50' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}
            >
              {user.status === 'active' ? 'Deactivate User' : 'Activate User'}
            </CustomBtn>
          </div>
        )}

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
                    <span className="text-sm">{user.timezone || user.country || 'N/A'}</span>
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
                    {formatRole(user.role)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <StatusBadge status={user.status} />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Email Verified:</span>
                    <StatusBadge status={user.emailVerified ? 'completed' : 'pending'} />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Profile Verified:</span>
                    <StatusBadge status={user.isVerified ? 'completed' : 'pending'} />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Seller Status:</span>
                    <span className="text-sm">{formatRole(user.sellerStatus ?? 'not_applied')}</span>
                  </div>

                  {user.lastLoginAt && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Last Login:</span>
                      <span className="text-sm">{format(new Date(user.lastLoginAt), 'MMM d, yyyy HH:mm')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {canManageUserStatus && (
          <ConfirmModal
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            title={`${user.status === 'active' ? 'Deactivate' : 'Activate'} User`}
            description="This action changes the user's access level on the platform."
            message={`Are you sure you want to ${user.status === 'active' ? 'deactivate' : 'activate'} ${user.name}?`}
            onConfirm={confirmToggleStatus}
            isLoading={toggleStatus.isPending}
            variant={user.status === 'active' ? 'warning' : 'default'}
            confirmText={user.status === 'active' ? 'Deactivate' : 'Activate'}
          />
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 text-emerald-600" />
                <div>
                  <div className="text-2xl font-bold">
                    {user.currency} {(user.walletBalance ?? 0).toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">Wallet Balance</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{user.language?.toUpperCase() || 'EN'}</div>
              <p className="text-sm text-muted-foreground">Language</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{user.isSuspended ? 'Yes' : 'No'}</div>
              <p className="text-sm text-muted-foreground">Suspended</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {user.firstName || user.lastName ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : '—'}
              </div>
              <p className="text-sm text-muted-foreground">Profile Name</p>
            </CardContent>
          </Card>
        </div>

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
                onClick={() => router.push(`/admin/users/${user.id}/orders`)}
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
