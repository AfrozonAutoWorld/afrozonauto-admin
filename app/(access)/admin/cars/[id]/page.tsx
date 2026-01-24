'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomBtn } from '@/components/shared/CustomBtn';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useCar, useToggleFeatured, useToggleAvailability } from '@/lib/hooks/useCars';
import {
  ArrowLeft,
  Edit,
  Star,
  MapPin,
  Gauge,
  DollarSign,
  Package
} from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';

export default function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: car, isLoading } = useCar(resolvedParams.id);
  const toggleFeatured = useToggleFeatured();
  const toggleAvailability = useToggleAvailability();

  if (isLoading) {
    return (
      <div>
        <Header title="Car Details" />
        <div className="p-6">
          <LoadingSpinner text="Loading car details..." />
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div>
        <Header title="Car Not Found" />
        <div className="p-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Car not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Car Details" />

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <CustomBtn
            variant="ghost"
            icon={ArrowLeft}
            onClick={() => router.push('/cars')}
          >
            Back to Cars
          </CustomBtn>

          <div className="flex gap-2">
            <CustomBtn
              variant="bordered"
              onClick={() => toggleFeatured.mutate(car.id)}
              isLoading={toggleFeatured.isPending}
            >
              <Star className={`mr-2 h-4 w-4 ${car.featured ? 'fill-yellow-500 text-yellow-500' : ''}`} />
              {car.featured ? 'Unfeature' : 'Feature'}
            </CustomBtn>

            <CustomBtn
              variant="bordered"
              onClick={() => toggleAvailability.mutate(car.id)}
              isLoading={toggleAvailability.isPending}
            >
              Mark as {car.available ? 'Sold' : 'Available'}
            </CustomBtn>

            <CustomBtn
              icon={Edit}
              onClick={() => router.push(`/cars/${car.id}/edit`)}
            >
              Edit
            </CustomBtn>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Car Image and Basic Info */}
          <Card className="lg:col-span-2">
            <CardContent className="pt-6 space-y-6">
              {/* Image */}
              <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-muted">
                {car.images[0] ? (
                  <Image
                    src={car.images[0]}
                    alt={`${car.make} ${car.model}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Title and Status */}
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h2 className="text-3xl font-bold">
                      {car.make} {car.model}
                    </h2>
                    <p className="text-muted-foreground">{car.year}</p>
                  </div>
                  <div className="flex gap-2">
                    <StatusBadge status={car.condition} />
                    {car.featured && (
                      <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                    )}
                  </div>
                </div>

                <div className="text-3xl font-bold text-primary">
                  ${car.price.toLocaleString()}
                </div>
              </div>

              {/* Description */}
              {car.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{car.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Details Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Car Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Gauge className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mileage</p>
                    <p className="font-medium">
                      {car.mileage ? `${car.mileage.toLocaleString()} miles` : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{car.location}</p>
                    <p className="text-xs text-muted-foreground">{car.country}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Source</p>
                    <p className="font-medium">{car.source === 'api' ? 'API Import' : 'Manual Entry'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>

                    <StatusBadge status={car.source === 'api' ? 'active' : 'inactive'} />

                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Listing Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Added</p>
                  <p className="text-sm font-medium">
                    {format(new Date(car.createdAt), 'MMMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="text-sm font-medium">
                    {format(new Date(car.updatedAt), 'MMMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Listing ID</p>
                  <p className="text-sm font-mono">{car.id}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
