'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { CustomBtn } from '@/components/shared/CustomBtn';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
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
  useVehicles,
  useDeleteVehicle,
  useAddVehicleToSection,
  useRemoveVehicleFromSection,
} from '@/lib/hooks/useVehicles';
import {
  Plus,
  MoreVertical,
  Eye,
  Star,
  Car as CarIcon,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import Image from 'next/image';
import cloudinaryLoader from '@/lib/cloudinaryLoader';
import { AddCarModal } from './AddCarModal';
import { Vehicle } from '@/lib/api/queries';


export function CarsListingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [vehicleToDelete, setVehicleToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [selectedVehicleForSection, setSelectedVehicleForSection] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [sectionAction, setSectionAction] = useState<{
    action: 'add' | 'remove';
    section: 'RECOMMENDED' | 'TRENDING' | "SPECIALTY";
  } | null>(null);

  const filters = {
    page: currentPage,
    limit: 10,
  };

  const { data, isLoading } = useVehicles(filters);
  const deleteVehicle = useDeleteVehicle();
  const addVehicleToSection = useAddVehicleToSection();
  const removeVehicleFromSection = useRemoveVehicleFromSection();
  const canManageVehicles =
    session?.user.role === 'SUPER_ADMIN' ||
    session?.user.role === 'OPERATIONS_ADMIN';

  const vehicles = data?.items || [];
  const meta = data?.meta;

  // Calculate stats
  const stats = {
    total: meta?.total || 0,
    available: vehicles.filter(v => v.status === 'AVAILABLE').length,
    active: vehicles.filter(v => v.isActive).length,
    featured: vehicles.filter(v => v.featured).length,
  };

  const handleDelete = (id: string, name: string) => {
    setVehicleToDelete({ id, name });
  };

  const confirmDelete = () => {
    if (!vehicleToDelete) return;
    deleteVehicle.mutate(vehicleToDelete.id, {
      onSuccess: () => setVehicleToDelete(null),
    });
  };

  const handleSectionAction = (
    id: string,
    name: string,
    action: 'add' | 'remove',
    section: 'RECOMMENDED' | 'TRENDING' | 'SPECIALTY'
  ) => {
    setSelectedVehicleForSection({ id, name });
    setSectionAction({ action, section });
    setSectionModalOpen(true);
  };

  const confirmSectionAction = () => {
    if (!selectedVehicleForSection || !sectionAction) return;

    if (sectionAction.action === 'add') {
      addVehicleToSection.mutate(
        {
          id: selectedVehicleForSection.id,
          section: sectionAction.section,
        },
        {
          onSuccess: () => {
            setSectionModalOpen(false);
            setSelectedVehicleForSection(null);
            setSectionAction(null);
          },
        }
      );
    } else {
      removeVehicleFromSection.mutate(
        {
          id: selectedVehicleForSection.id,
          section: sectionAction.section,
        },
        {
          onSuccess: () => {
            setSectionModalOpen(false);
            setSelectedVehicleForSection(null);
            setSectionAction(null);
          },
        }
      );
    }
  };

  function getPrimaryImage(vehicle: Vehicle): string {
    const fallbackImage = 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800';


    const primaryImage = vehicle.apiData?.listing?.retailListing?.primaryImage
      || vehicle.apiData?.listing?.wholesaleListing?.primaryImage;

    if (primaryImage) return primaryImage;

    if (vehicle.images && vehicle.images.length > 0) {
      return vehicle.images[0];
    }

    return fallbackImage;
  }

  return (
    <div>
      <Header title="Vehicle Listings" />

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Summary Stats */}
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-sm text-muted-foreground">Total Vehicles</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.available}</div>
              <p className="text-sm text-muted-foreground">Available</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-sm text-muted-foreground">Active Listings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.featured}</div>
              <p className="text-sm text-muted-foreground">Featured</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <CustomBtn
            icon={Plus}
            onClick={() => setAddModalOpen(true)}
            className="bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Add Vehicle
          </CustomBtn>
        </div>

        {/* Vehicles Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <LoadingSpinner text="Loading vehicles..." />
            ) : vehicles.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-62.5">Vehicle</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="hidden md:table-cell">Mileage</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Sections</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicles.map((vehicle) => {
                      const primaryImage = getPrimaryImage(vehicle);

                      return (
                        <TableRow key={vehicle.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="relative h-12 w-16 rounded overflow-hidden bg-muted shrink-0">
                                {primaryImage ? (
                                  <Image
                                    src={primaryImage}
                                    alt={`${vehicle.make} ${vehicle.model}`}
                                    fill
                                    className="object-cover"
                                    loader={primaryImage.includes('res.cloudinary.com') ? cloudinaryLoader : undefined}
                                    unoptimized={!primaryImage.includes('res.cloudinary.com') && !primaryImage.includes('images.pexels.com') && !primaryImage.includes('images.unsplash.com')}
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800';
                                    }}
                                  />
                                ) : (
                                  <div className="flex items-center justify-center h-full">
                                    <CarIcon className="h-6 w-6 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium flex items-center gap-2">
                                  <span className="truncate">
                                    {vehicle.make} {vehicle.model}
                                  </span>
                                  {vehicle.featured && (
                                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500 shrink-0" />
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {vehicle.year} • {vehicle.vin}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            ${vehicle.priceUsd.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={vehicle.vehicleType} />
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm">
                            {vehicle.mileage ? `${vehicle.mileage.toLocaleString()} mi` : 'N/A'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {vehicle.dealerCity && vehicle.dealerState
                              ? `${vehicle.dealerCity}, ${vehicle.dealerState}`
                              : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={vehicle.source === 'API' ? 'api' : 'manual'} />
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {vehicle.sections && vehicle.sections.length > 0 ? (
                                vehicle.sections.map((section) => (
                                  <span
                                    key={section}
                                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${section === 'RECOMMENDED'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : section === 'TRENDING'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-700'
                                      }`}
                                  >
                                    {section === 'RECOMMENDED' ? (
                                      <Star className="mr-1 h-3 w-3" />
                                    ) : section === 'TRENDING' ? (
                                      <TrendingUp className="mr-1 h-3 w-3" />
                                    ) : null}
                                    {section.charAt(0) + section.slice(1).toLowerCase()}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={vehicle.status} />
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
                                <DropdownMenuItem
                                  onClick={() => router.push(`/admin/seller-vehicles/${vehicle.id}`)}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                {canManageVehicles && (
                                  <>
                                    {vehicle.status !== 'SOLD' && (
                                      <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                                          Sections
                                        </DropdownMenuLabel>
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleSectionAction(
                                              vehicle.id,
                                              `${vehicle.make} ${vehicle.model}`,
                                              vehicle.sections?.includes('RECOMMENDED') ? 'remove' : 'add',
                                              'RECOMMENDED'
                                            )
                                          }
                                          disabled={
                                            addVehicleToSection.isPending ||
                                            removeVehicleFromSection.isPending
                                          }
                                        >
                                          <Star className="mr-2 h-4 w-4" />
                                          {vehicle.sections?.includes('RECOMMENDED')
                                            ? 'Remove from Recommended'
                                            : 'Add to Recommended'}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleSectionAction(
                                              vehicle.id,
                                              `${vehicle.make} ${vehicle.model}`,
                                              vehicle.sections?.includes('TRENDING') ? 'remove' : 'add',
                                              'TRENDING'
                                            )
                                          }
                                          disabled={
                                            addVehicleToSection.isPending ||
                                            removeVehicleFromSection.isPending
                                          }
                                        >
                                          <TrendingUp className="mr-2 h-4 w-4" />
                                          {vehicle.sections?.includes('TRENDING')
                                            ? 'Remove from Trending'
                                            : 'Add to Trending'}
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handleDelete(
                                        vehicle.id,
                                        `${vehicle.make} ${vehicle.model}`
                                      )}
                                      disabled={deleteVehicle.isPending}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {meta && meta.pages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Page {meta.page} of {meta.pages} ({meta.total} total)
                    </div>
                    <div className="flex gap-2">
                      <CustomBtn
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        variant="bordered"
                      >
                        Previous
                      </CustomBtn>
                      <CustomBtn
                        onClick={() => setCurrentPage(p => Math.min(meta.pages, p + 1))}
                        disabled={currentPage === meta.pages}
                        variant="bordered"
                      >
                        Next
                      </CustomBtn>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                icon={CarIcon}
                title="No vehicles found"
                description="Start by adding your first vehicle"
                action={{
                  label: "Add Vehicle",
                  onClick: () => setAddModalOpen(true),
                  icon: Plus,
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Vehicle Modal */}
      <AddCarModal open={addModalOpen} onOpenChange={setAddModalOpen} />

      <ConfirmModal
        open={!!vehicleToDelete}
        onOpenChange={(open) => {
          if (!open) setVehicleToDelete(null);
        }}
        title="Delete Vehicle"
        description="This action removes the vehicle from the seller vehicles list."
        message={
          vehicleToDelete
            ? `Are you sure you want to delete ${vehicleToDelete.name}?`
            : ''
        }
        onConfirm={confirmDelete}
        confirmText="Delete Vehicle"
        isLoading={deleteVehicle.isPending}
        variant="destructive"
      />

      <ConfirmModal
        open={sectionModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSectionModalOpen(false);
            setSelectedVehicleForSection(null);
            setSectionAction(null);
          }
        }}
        title={
          sectionAction?.action === 'add'
            ? `Add to ${sectionAction?.section}`
            : `Remove from ${sectionAction?.section}`
        }
        description={
          sectionAction?.action === 'add'
            ? `Add ${selectedVehicleForSection?.name} to the ${sectionAction?.section} section`
            : `Remove ${selectedVehicleForSection?.name} from the ${sectionAction?.section} section`
        }
        message={
          sectionAction?.action === 'add'
            ? `This vehicle will be featured in the ${sectionAction?.section} section on the platform.`
            : `This vehicle will no longer appear in the ${sectionAction?.section} section.`
        }
        onConfirm={confirmSectionAction}
        confirmText={sectionAction?.action === 'add' ? 'Add to Section' : 'Remove from Section'}
        isLoading={
          addVehicleToSection.isPending || removeVehicleFromSection.isPending
        }
        variant={sectionAction?.action === 'remove' ? 'warning' : 'default'}
      />
    </div>
  );
}
