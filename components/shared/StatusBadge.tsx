import { Badge, badgeVariants } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { VariantProps } from 'class-variance-authority';

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

type StatusType =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'not_applied'
  | 'seller_pending'
  | 'seller_approved'
  | 'seller_rejected'
  | 'seller_not_applied'
  | 'completed'
  | 'cancelled'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'verified'
  | 'new'
  | 'used'
  | 'certified'
  | 'available'
  | 'reserved'
  | 'sold'
  | 'car'
  | 'sedan'
  | 'suv'
  | 'truck'
  | 'van'
  | 'coupe'
  | 'api'
  | 'manual';

interface StatusBadgeProps {
  status: StatusType | string; // Allow any string for flexibility
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase() as StatusType;

  const config: Record<string, { variant: BadgeVariant; label: string; className?: string }> = {
    active: {
      variant: 'default',
      label: 'Active',
      className: 'bg-emerald-600 hover:bg-emerald-500'
    },
    inactive: {
      variant: 'secondary',
      label: 'Inactive'
    },
    pending: {
      variant: 'secondary',
      label: 'Pending',
      className: 'bg-yellow-500 hover:bg-yellow-600 text-white'
    },
    approved: {
      variant: 'default',
      label: 'Approved',
      className: 'bg-emerald-600 hover:bg-emerald-500'
    },
    rejected: {
      variant: 'destructive',
      label: 'Rejected'
    },
    not_applied: {
      variant: 'secondary',
      label: 'Not Applied'
    },
    seller_pending: {
      variant: 'secondary',
      label: 'Seller Pending',
      className: 'bg-amber-500 hover:bg-amber-600 text-white'
    },
    seller_approved: {
      variant: 'default',
      label: 'Seller Approved',
      className: 'bg-teal-600 hover:bg-teal-500'
    },
    seller_rejected: {
      variant: 'destructive',
      label: 'Seller Rejected'
    },
    seller_not_applied: {
      variant: 'secondary',
      label: 'Not a Seller',
      className: 'bg-slate-500 hover:bg-slate-600 text-white'
    },
    completed: {
      variant: 'default',
      label: 'Completed',
      className: 'bg-green-500 hover:bg-green-600'
    },
    cancelled: {
      variant: 'destructive',
      label: 'Cancelled'
    },
    paid: {
      variant: 'default',
      label: 'Paid',
      className: 'bg-green-500 hover:bg-green-600'
    },
    failed: {
      variant: 'destructive',
      label: 'Failed'
    },
    refunded: {
      variant: 'destructive',
      label: 'Refunded'
    },
    verified: {
      variant: 'default',
      label: 'Verified',
      className: 'bg-emerald-600 hover:bg-emerald-500'
    },
    new: {
      variant: 'default',
      label: 'New',
      className: 'bg-blue-500 hover:bg-blue-600'
    },
    used: {
      variant: 'secondary',
      label: 'Used'
    },
    certified: {
      variant: 'default',
      label: 'Certified',
      className: 'bg-purple-500 hover:bg-purple-600'
    },
    // Vehicle Status
    available: {
      variant: 'default',
      label: 'Available',
      className: 'bg-emerald-600 hover:bg-emerald-500'
    },
    reserved: {
      variant: 'secondary',
      label: 'Reserved',
      className: 'bg-amber-500 hover:bg-amber-600 text-white'
    },
    sold: {
      variant: 'destructive',
      label: 'Sold'
    },
    // Vehicle Types
    car: {
      variant: 'secondary',
      label: 'Car',
      className: 'bg-slate-500 hover:bg-slate-600 text-white'
    },
    sedan: {
      variant: 'secondary',
      label: 'Sedan',
      className: 'bg-blue-500 hover:bg-blue-600 text-white'
    },
    suv: {
      variant: 'secondary',
      label: 'SUV',
      className: 'bg-orange-500 hover:bg-orange-600 text-white'
    },
    truck: {
      variant: 'secondary',
      label: 'Truck',
      className: 'bg-amber-600 hover:bg-amber-700 text-white'
    },
    van: {
      variant: 'secondary',
      label: 'Van',
      className: 'bg-cyan-500 hover:bg-cyan-600 text-white'
    },
    coupe: {
      variant: 'secondary',
      label: 'Coupe',
      className: 'bg-indigo-500 hover:bg-indigo-600 text-white'
    },
    // Source Types
    api: {
      variant: 'default',
      label: 'API',
      className: 'bg-emerald-600 hover:bg-emerald-500'
    },
    manual: {
      variant: 'secondary',
      label: 'Manual',
      className: 'bg-slate-500 hover:bg-slate-600 text-white'
    },
  };

  const { variant, label, className: statusClass } =
    config[normalizedStatus] || {
      variant: 'secondary' as BadgeVariant,
      label: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
    };

  return (
    <Badge
      variant={variant}
      className={cn(statusClass, className)}
    >
      {label}
    </Badge>
  );
}
