'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CustomBtn } from '@/components/shared/CustomBtn';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  useDeleteVehicle
} from '@/lib/hooks/useVehicles';
import {
  Search,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Star,
  Car as CarIcon,
  Trash2
} from 'lucide-react';
import Image from 'next/image';
import { AddCarModal } from './AddCarModal';
import { Vehicle } from '@/lib/api/queries';


export function CarsListingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>('all');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Build filters object
  const filters = {
    search: searchQuery || undefined,
    source: sourceFilter !== 'all' ? sourceFilter.toUpperCase() : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    vehicleType: vehicleTypeFilter !== 'all' ? vehicleTypeFilter : undefined,
    page: currentPage,
    limit: 10,
    includeApi: true,
  };

  const { data, isLoading } = useVehicles(filters);
  const deleteVehicle = useDeleteVehicle();

  const vehicles = data?.data || [];
  const meta = data?.meta;

  // Calculate stats
  const stats = {
    total: meta?.total || 0,
    available: vehicles.filter(v => v.status === 'AVAILABLE').length,
    fromApi: meta?.fromApi || 0,
    featured: vehicles.filter(v => v.features).length,
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      deleteVehicle.mutate(id);
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
              <div className="text-2xl font-bold">{stats.fromApi}</div>
              <p className="text-sm text-muted-foreground">From API</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.featured}</div>
              <p className="text-sm text-muted-foreground">Featured</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by make, model, VIN..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                  <Select value={sourceFilter} onValueChange={setSourceFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      <SelectItem value="api">API Only</SelectItem>
                      <SelectItem value="manual">Manual Only</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="AVAILABLE">Available</SelectItem>
                      <SelectItem value="SOLD">Sold</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={vehicleTypeFilter} onValueChange={setVehicleTypeFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="CAR">Car</SelectItem>
                      <SelectItem value="SEDAN">Sedan</SelectItem>
                      <SelectItem value="SUV">SUV</SelectItem>
                      <SelectItem value="TRUCK">Truck</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
            </div>
          </CardContent>
        </Card>

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
                                  {vehicle.features && (
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
                            <StatusBadge status={vehicle.source} />
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
                                  onClick={() => router.push(`/admin/vehicles/${vehicle.id}`)}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => router.push(`/admin/vehicles/${vehicle.id}/edit`)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Vehicle
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
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
                description={
                  searchQuery
                    ? "Try adjusting your search or filters"
                    : "Start by adding your first vehicle"
                }
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
    </div>
  );
}