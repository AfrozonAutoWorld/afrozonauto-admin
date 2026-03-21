'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { useUsers, useToggleUserStatus } from '@/lib/hooks/useUsers';
import { Search, MoreVertical, User, Eye, Users, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { AddUserModal } from '@/components/users/AddUserModal';
import { useRouter } from 'next/navigation';


export function UsersPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const canManageUserStatus = session?.user.role === 'SUPER_ADMIN';

  const [searchQuery, setSearchQuery] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, isLoading } = useUsers({
    page,
    limit,
    //search: searchQuery.trim() || undefined,
  });
  const [addUserModal, setAddUserModal] = useState(false);

  const toggleStatus = useToggleUserStatus();

  const users = data?.items || [];
  const meta = data?.meta;
  const totalPages = meta?.pages ?? 1;



  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const handleToggleStatus = (userId: string) => {
    setSelectedUserId(userId);
    setConfirmOpen(true);
  };

  const confirmToggleStatus = () => {
    if (selectedUserId) {
      toggleStatus.mutate(selectedUserId);
      setConfirmOpen(false);
      setSelectedUserId(null);
    }
  };

  const selectedUser = users?.find(u => u.id === selectedUserId);

  return (
    <>
      <div>
        <Header
          title="Users"

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
                              <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id}/orders`)}>
                                <User className="mr-2 h-4 w-4" />
                                View Orders
                              </DropdownMenuItem>
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
                  description={searchQuery ? "Try adjusting your search" : "Start by adding your first user"}
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

    </>
  );
}
