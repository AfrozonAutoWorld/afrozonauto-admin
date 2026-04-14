'use client';

import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomBtn } from '@/components/shared';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md border-slate-200">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <CardTitle className="mt-4 text-xl">Access Restricted</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Your account does not have access to the admin dashboard.
          </p>
          <Link href="/login" className="block">
            <CustomBtn className="w-full bg-emerald-600 text-white">
              Back to Login
            </CustomBtn>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
