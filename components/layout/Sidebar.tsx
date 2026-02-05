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
} from 'lucide-react';
import { useUIStore } from '@/lib/store/useUIStore';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Logo } from '../shared';
import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';

const menuItems = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Cars',
    href: '/admin/cars',
    icon: Car,
  },
  {
    title: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
    children: [
      {
        title: 'Pending Orders',
        href: '/admin/orders/pending',
      },
      {
        title: 'Completed Orders',
        href: '/admin/orders/completed',
      },
    ],
  },
  {
    title: 'Payments',
    href: '/admin/payments',
    icon: CreditCard,
  },
];

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

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
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');
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
                    const isChildActive = pathname === child.href;

                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onLinkClick}
                        className={cn(
                          'block rounded-md px-3 py-1.5 text-sm transition-colors cursor-pointer',
                          isChildActive
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
  const { status } = useSession();
  const { isMobileSidebarOpen, closeMobileSidebar } = useUIStore();

  // Check if user is authenticated using NextAuth session
  const isAuthenticated = status === 'authenticated';
  const isAuthRoute = pathname === '/login' || pathname === '/';

  // Don't show sidebar on auth routes or when not authenticated
  if (!isAuthenticated || isAuthRoute) {
    return null;
  }

  return (
    <>
      {/* Desktop Sidebar - Always visible on large screens */}
      <aside className="hidden lg:flex h-full w-64 flex-col border-r">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar - Slide-in sheet on small screens */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={closeMobileSidebar}>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent onLinkClick={closeMobileSidebar} />
        </SheetContent>
      </Sheet>
    </>
  );
}