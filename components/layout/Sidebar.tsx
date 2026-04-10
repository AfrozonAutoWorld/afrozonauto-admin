'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Car,
  ShoppingCart,
  CreditCard,
  LogOut,
  ChevronUp,
  ChevronDown,
  UserCircle2,
} from 'lucide-react';
import { useUIStore } from '@/lib/store/useUIStore';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Logo } from '../shared';
import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';

type AppRole = 'SUPER_ADMIN' | 'OPERATIONS_ADMIN' | 'SELLER' | 'BUYER';

type MenuItem = {
  title: string;
  href: string;
  icon: typeof LayoutDashboard;
  roles: AppRole[];
  children?: Array<{
    title: string;
    href: string;
  }>;
};

const getRoleBasePath = (role?: string) => {
  if (role === 'SUPER_ADMIN' || role === 'OPERATIONS_ADMIN') {
    return '/admin';
  }
  return '/unauthorized';
};

const buildMenuItems = (role?: string): MenuItem[] => {
  const basePath = getRoleBasePath(role);
  const adminRoles: AppRole[] = ['SUPER_ADMIN', 'OPERATIONS_ADMIN'];

  return [
    {
      title: 'Dashboard',
      href: `${basePath}/dashboard`,
      icon: LayoutDashboard,
      roles: adminRoles,
    },
    {
      title: 'Users',
      href: `${basePath}/users`,
      icon: Users,
      roles: adminRoles,
    },
    {
      title: 'Vehicles',
      href: `${basePath}/vehicles`,
      icon: Car,
      roles: adminRoles,
      children: [
        {
          title: 'Seller Vehicles',
          href: `${basePath}/seller-vehicles`,
        },
        {
          title: 'Trending Vehicles',
          href: `${basePath}/vehicles/trending`,
        },
        {
          title: 'Recommended Vehicles',
          href: `${basePath}/vehicles/recommended`,
        },
      ],
    },
    {
      title: 'Orders',
      href: `${basePath}/orders`,
      icon: ShoppingCart,
      roles: adminRoles,
      children: [
        {
          title: 'All Orders',
          href: `${basePath}/orders`,
        },
        {
          title: 'Pending Orders',
          href: `${basePath}/orders/pending`,
        },
      ],
    },
    {
      title: 'Payments',
      href: `${basePath}/payments`,
      icon: CreditCard,
      roles: adminRoles,
    },
    {
      title: 'Profile',
      href: `${basePath}/profile`,
      icon: UserCircle2,
      roles: adminRoles,
    },
  ].filter((item) => role && item.roles.includes(role as AppRole));
};

function SidebarContent({
  session,
  onLinkClick,
}: {
  session?: ReturnType<typeof useSession>['data'];
  onLinkClick?: () => void;
}) {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const menuItems = buildMenuItems(session?.user.role);

  const toggleMenu = (href: string) => {
    setExpandedMenus(prev => ({ ...prev, [href]: !prev[href] }));
  };

  const handleLogout = async () => {
    await signOut({
      callbackUrl: "/login",
    });
  };

  return (
    <div className="flex h-full flex-col bg-card">
      <div className='p-6'>
        <Logo />
      </div>

      <Separator />

      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const hasChildren = !!item.children?.length;
          const isChildRouteActive =
            item.children?.some(
              (child) =>
                pathname === child.href ||
                pathname.startsWith(child.href + '/'),
            ) ?? false;
          const isActive =
            pathname === item.href ||
            pathname.startsWith(item.href + '/') ||
            isChildRouteActive;
          const isExpanded = expandedMenus[item.href] || isActive;

          return (
            <div key={item.href}>
              {/* Parent menu */}
              {hasChildren ? (
                <div
                  className={cn(
                    'flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer',
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                  onClick={() => toggleMenu(item.href)}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </div>

                  <span className="text-muted-foreground">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </span>
                </div>
              ) : (
                <Link
                  href={item.href}
                  onClick={onLinkClick}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer',
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              )}

              {/* Sub-menu */}
              {hasChildren && isExpanded && (
                <div className="ml-7 mt-1 space-y-1">
                  {item.children!.map((child) => {
                    const childActive =
                      pathname === child.href ||
                      pathname.startsWith(child.href + '/');

                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onLinkClick}
                        className={cn(
                          'block rounded-md px-3 py-1.5 text-sm transition-colors cursor-pointer',
                          childActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
                      >
                        {child.title}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <Separator />

      <div className="p-4 space-y-4">
        <div className="rounded-lg bg-muted p-3">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Signed in as
          </p>
          <p className="text-sm font-medium truncate">{session?.user.fullName ?? ""}</p>
          <p className="text-xs text-muted-foreground truncate">{session?.user.email ?? ""}</p>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { isMobileSidebarOpen, closeMobileSidebar } = useUIStore();

  // Check if user is authenticated using NextAuth session
  const isAuthenticated = status === 'authenticated';
  const isAuthRoute =
    pathname === '/login' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname === '/';
  const canRenderSidebar =
    session?.user.role === 'SUPER_ADMIN' ||
    session?.user.role === 'OPERATIONS_ADMIN';

  // Don't show sidebar on auth routes or when not authenticated
  if (!isAuthenticated || isAuthRoute || !canRenderSidebar) {
    return null;
  }

  return (
    <>
      {/* Desktop Sidebar - Always visible on large screens */}
      <aside className="hidden lg:flex h-full w-64 flex-col border-r">
        <SidebarContent session={session} />
      </aside>

      {/* Mobile Sidebar - Slide-in sheet on small screens */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={closeMobileSidebar}>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent session={session} onLinkClick={closeMobileSidebar} />
        </SheetContent>
      </Sheet>
    </>
  );
}
