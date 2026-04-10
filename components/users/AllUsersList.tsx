'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { CustomBtn, StatusBadge, LoadingSpinner, EmptyState, ConfirmModal } from '@/components/shared'
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
  useApproveSellerAccount,
  useUsers,
  useToggleUserStatus,
} from '@/lib/hooks/useUsers';
import { MoreVertical, User, Eye, Users, UserPlus, BadgeCheck } from 'lucide-react';
import { format } from 'date-fns';
import { AddUserModal } from '@/components/users/AddUserModal';
import { useRouter } from 'next/navigation';


export function UsersPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const canManageUserStatus = session?.user.role === 'SUPER_ADMIN';
  const canManageSellerReview =
    session?.user.role === 'SUPER_ADMIN' ||
    session?.user.role === 'OPERATIONS_ADMIN';
  const limit = 10;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [sellerConfirmOpen, setSellerConfirmOpen] = useState(false);
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const { data, isLoading } = useUsers({
    page,
    limit,
  });
  const [addUserModal, setAddUserModal] = useState(false);

  const toggleStatus = useToggleUserStatus();
  const approveSellerAccount = useApproveSellerAccount();

  const users = data?.items || [];
  const meta = data?.meta;
  const totalPages = meta?.pages ?? 1;

  const getRawSellerStatusForUser = (user: (typeof users)[number]) =>
    (
      user.sellerStatus ??
      (user.role === 'SELLER' ? 'pending' : 'not_applied')
    ).toLowerCase();

  const getSellerStatusForUser = (user: (typeof users)[number]) =>
    `seller_${getRawSellerStatusForUser(user)}`;

  const handleToggleStatus = (userId: string) => {
    setSelectedUserId(userId);
    setConfirmOpen(true);
  };

  const handleConfirmSeller = (userId: string) => {
    setSelectedSellerId(userId);
    setSellerConfirmOpen(true);
  };

  const confirmToggleStatus = () => {
    if (selectedUserId) {
      toggleStatus.mutate(selectedUserId);
      setConfirmOpen(false);
      setSelectedUserId(null);
    }
  };

  const confirmSellerApproval = () => {
    if (!selectedSellerId) return;

    const selectedSeller = users.find((user) => user.id === selectedSellerId);
    if (!selectedSeller) return;

    approveSellerAccount.mutate(
      {
        userId: selectedSeller.id,
        profileId: selectedSeller.profileId,
      },
      {
        onSuccess: () => {
          setSellerConfirmOpen(false);
          setSelectedSellerId(null);
        },
      },
    );
  };

  const selectedUser = users?.find(u => u.id === selectedUserId);
  const selectedSeller = users?.find((user) => user.id === selectedSellerId);

  return (
    <>
      <div>
        <Header
          title="Users"
          description="Manage all platform users."
        />

        <div className="p-6 space-y-6">

          {/* Summary Stats */}
          {users.length > 0 && (
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{meta?.total ?? users.length}</div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {users.filter(u => u.status === 'active').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {users.filter(u => u.role === 'SUPER_ADMIN').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Super Admins</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Search Bar */}
          <div className="flex items-center justify-end gap-4 pt-6">
            <CustomBtn
              icon={UserPlus}
              onPress={() => setAddUserModal(true)}
              type="submit"
              isLoading={isLoading}
              className="bg-emerald-600 text-white rounded-lg cursor-pointer px-4 font-semibold text-lg"
            >
              Add User
            </CustomBtn>
          </div>

          {/* Users Table */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <LoadingSpinner text="Loading users..." />
              ) : users.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Seller Review</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {user.id}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">{user.email}</div>
                            <div className="text-xs text-muted-foreground">
                              {user.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.country}</TableCell>
                        <TableCell>
                          <StatusBadge status={user.role} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={getSellerStatusForUser(user)} />
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{user.totalOrders}</span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={user.status} />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(user.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className="h-8 w-8 p-0 flex items-center justify-center rounded hover:bg-gray-100 cursor-pointer"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id}`)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Profile
                              </DropdownMenuItem>
                              {user.role === 'BUYER' && (
                                <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id}/orders`)}>
                                  <User className="mr-2 h-4 w-4" />
                                  View Orders
                                </DropdownMenuItem>
                              )}
                              {canManageSellerReview &&
                                user.role === 'SELLER' &&
                                getRawSellerStatusForUser(user) !== 'approved' && (
                                  <DropdownMenuItem onClick={() => handleConfirmSeller(user.id)}>
                                    <BadgeCheck className="mr-2 h-4 w-4" />
                                    Confirm Seller
                                  </DropdownMenuItem>
                                )}
                              {canManageUserStatus && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleToggleStatus(user.id)}
                                  >
                                    {user.status === 'active' ? 'Deactivate' : 'Activate'} User
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState
                  icon={Users}
                  title="No users found"
                  description="Start by adding your first user"
                  action={{
                    label: "Add User",
                    onClick: () => setAddUserModal(true),
                    icon: UserPlus,
                  }}
                />
              )}
            </CardContent>

            {totalPages > 1 && (
              <CardFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-2">
                <div className="text-sm text-muted-foreground">
                  Page {page} of {totalPages} • Total {meta?.total ?? users.length}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1.5 text-sm rounded-md border border-gray-300 disabled:opacity-50 cursor-pointer hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={page >= totalPages}
                    className="px-3 py-1.5 text-sm rounded-md border border-gray-300 disabled:opacity-50 cursor-pointer hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </CardFooter>
            )}

          </Card>



        </div>

        <AddUserModal
          open={addUserModal}
          onOpenChange={setAddUserModal}
        />

      </div>




      {/* Confirm Modal */}
      {canManageUserStatus && (
        <ConfirmModal
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={`${selectedUser?.status === 'active' ? 'Deactivate' : 'Activate'} User`}
          description="This will change the user's access to the platform"
          message={`Are you sure you want to ${selectedUser?.status === 'active' ? 'deactivate' : 'activate'} ${selectedUser?.name}?`}
          onConfirm={confirmToggleStatus}
          isLoading={toggleStatus.isPending}
          variant={selectedUser?.status === 'active' ? 'warning' : 'default'}
          confirmText={selectedUser?.status === 'active' ? 'Deactivate' : 'Activate'}
        />
      )}

      <ConfirmModal
        open={sellerConfirmOpen}
        onOpenChange={(open) => {
          setSellerConfirmOpen(open);

          if (!open) {
            setSelectedSellerId(null);
          }
        }}
        title="Confirm Seller"
        description="This will verify the seller profile using its ID only."
        message={
          selectedSeller
            ? `Are you sure you want to confirm ${selectedSeller.name} as a seller?`
            : 'Are you sure you want to confirm this seller?'
        }
        onConfirm={confirmSellerApproval}
        isLoading={approveSellerAccount.isPending}
        confirmText="Confirm Seller"
      />

    </>
  );
}
