'use client';

import { use, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  Eye,
  Mail,
  MapPin,
  Phone,
  Shield,
  ShoppingCart,
  User as UserIcon,
  UserX,
  Wallet,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { TextAreaField } from '@/components/Form';
import { EmptyState } from '@/components/shared';
import { ConfirmModal } from '@/components/shared';
import { CustomBtn } from '@/components/shared/CustomBtn';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Modal } from '@/components/shared/Modal';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useOrders } from '@/lib/hooks/useOrders';
import {
  useApproveSellerAccount,
  useRejectSellerAccount,
  useToggleUserStatus,
  useUser,
} from '@/lib/hooks/useUsers';

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sellerReviewModalOpen, setSellerReviewModalOpen] = useState(false);
  const [sellerReviewAction, setSellerReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [sellerReviewNote, setSellerReviewNote] = useState('');

  const { data: user, isLoading: userLoading } = useUser(resolvedParams.id);
  const { data: allOrdersData } = useOrders({
    userId: resolvedParams.id,
    page: 1,
    limit: 50,
  });
  const toggleStatus = useToggleUserStatus();
  const approveSellerAccount = useApproveSellerAccount();
  const rejectSellerAccount = useRejectSellerAccount();

  const allOrders = allOrdersData?.items || [];
  const canManageUserStatus = session?.user.role === 'SUPER_ADMIN';
  const canManageSellerReview =
    session?.user.role === 'SUPER_ADMIN' ||
    session?.user.role === 'OPERATIONS_ADMIN';

  const userOrders = allOrders.filter((order) => order.userId === resolvedParams.id);

  const formatRole = (role: string) =>
    role
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const confirmToggleStatus = () => {
    const userId = user?.id;
    if (!userId) return;

    toggleStatus.mutate(userId, {
      onSuccess: () => setConfirmOpen(false),
    });
  };

  const sellerStatus = (
    user?.sellerStatus ??
    (user?.role === 'SELLER' ? 'pending' : 'not_applied')
  ).toLowerCase();
  const sellerBadgeStatus = `seller_${sellerStatus}`;
  const isSellerAccount = user?.role === 'SELLER' || sellerStatus !== 'not_applied';
  const isSellerReviewSubmitting =
    approveSellerAccount.isPending || rejectSellerAccount.isPending;

  const openSellerReviewModal = (action: 'approve' | 'reject') => {
    setSellerReviewAction(action);
    setSellerReviewNote('');
    setSellerReviewModalOpen(true);
  };

  const closeSellerReviewModal = () => {
    setSellerReviewModalOpen(false);
    setSellerReviewAction(null);
    setSellerReviewNote('');
  };

  const submitSellerReview = () => {
    if (!user || !sellerReviewAction) {
      return;
    }

    if (sellerReviewAction === 'reject' && !sellerReviewNote.trim()) {
      return;
    }

    const payload = {
      userId: user.id,
      profileId: user.profileId,
      note: sellerReviewAction === 'reject' ? sellerReviewNote.trim() : undefined,
    };
    const mutation =
      sellerReviewAction === 'approve'
        ? approveSellerAccount
        : rejectSellerAccount;

    mutation.mutate(payload, {
      onSuccess: () => closeSellerReviewModal(),
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
              className={
                user.status === 'active'
                  ? 'border-red-200 text-red-700 hover:bg-red-50'
                  : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
              }
            >
              {user.status === 'active' ? 'Deactivate User' : 'Activate User'}
            </CustomBtn>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex justify-center sm:justify-start">
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserIcon className="h-12 w-12 text-primary" />
                </div>
              </div>

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
                    <span className="text-sm">{formatRole(user.role)}</span>
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
                    <StatusBadge status={sellerBadgeStatus} />
                  </div>

                  {user.lastLoginAt && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Last Login:</span>
                      <span className="text-sm">
                        {format(new Date(user.lastLoginAt), 'MMM d, yyyy HH:mm')}
                      </span>
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

        {isSellerAccount && (
          <Card>
            <CardHeader>
              <CardTitle>Seller Account Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Current Seller Status</p>
                  <div className="mt-2">
                    <StatusBadge status={sellerBadgeStatus} />
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Seller Verified At</p>
                  <p className="mt-2 text-sm font-medium">
                    {user.sellerVerifiedAt
                      ? format(new Date(user.sellerVerifiedAt), 'MMM d, yyyy HH:mm')
                      : 'Not approved yet'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Profile ID</p>
                  <p className="mt-2 text-sm font-mono">
                    {user.profileId || 'No nested profile'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Identification Type</p>
                  <p className="mt-2 text-sm font-medium">
                    {user.identificationType
                      ? formatRole(user.identificationType)
                      : 'Not provided'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Business Name</p>
                  <p className="mt-2 text-sm font-medium">
                    {user.businessName || 'Not provided'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Tax ID</p>
                  <p className="mt-2 text-sm font-medium">
                    {user.taxId || 'Not provided'}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground">Latest Review Note</p>
                  <p className="mt-2 text-sm">
                    {user.sellerRejectedReason ||
                      (user.sellerVerifiedAt
                        ? 'Seller account is approved.'
                        : 'No seller review note recorded yet.')}
                  </p>
                </div>
              </div>

              {canManageSellerReview && (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <CustomBtn
                    onClick={() => openSellerReviewModal('approve')}
                    isDisabled={sellerStatus === 'approved'}
                    icon={BadgeCheck}
                  >
                    {sellerStatus === 'approved' ? 'Seller Approved' : 'Approve Seller'}
                  </CustomBtn>
                  <CustomBtn
                    variant="bordered"
                    onClick={() => openSellerReviewModal('reject')}
                    icon={UserX}
                    className="border-red-200 text-red-700 hover:bg-red-50"
                  >
                    Reject Seller
                  </CustomBtn>
                </div>
              )}
            </CardContent>
          </Card>
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
                {user.firstName || user.lastName
                  ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
                  : '—'}
              </div>
              <p className="text-sm text-muted-foreground">Profile Name</p>
            </CardContent>
          </Card>
        </div>

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
                {userOrders.filter((order) => order.status === 'paid').length}
              </div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {userOrders.filter((order) => order.status === 'pending').length}
              </div>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                ${userOrders
                  .filter((order) => order.status === 'paid')
                  .reduce((sum, order) => sum + order.amount, 0)
                  .toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Total Spent</p>
            </CardContent>
          </Card>
        </div>

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

      <Modal
        open={sellerReviewModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeSellerReviewModal();
            return;
          }
          setSellerReviewModalOpen(open);
        }}
        title={
          sellerReviewAction === 'approve'
            ? 'Approve Seller Account'
            : 'Reject Seller Account'
        }
        description={
          sellerReviewAction === 'approve'
            ? 'Confirm this seller account.'
            : 'Add the reason for rejecting this seller account.'
        }
        showFooter
        onConfirm={submitSellerReview}
        confirmText={
          sellerReviewAction === 'approve' ? 'Approve Seller' : 'Reject Seller'
        }
        isLoading={isSellerReviewSubmitting}
      >
        {sellerReviewAction === 'reject' ? (
          <TextAreaField
            label="Rejection Reason"
            htmlFor="seller-review-note"
            id="seller-review-note"
            placeholder="Explain why this seller account is being rejected"
            value={sellerReviewNote}
            onChange={setSellerReviewNote}
            isInvalid={!sellerReviewNote.trim() && isSellerReviewSubmitting}
            errorMessage="A review note is required"
            required
            disableAutosize
            fixedHeightClassName="h-32"
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            This action will verify the seller using the profile/application ID only.
          </p>
        )}
      </Modal>
    </div>
  );
}
