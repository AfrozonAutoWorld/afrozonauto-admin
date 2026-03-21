'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CustomBtn } from '@/components/shared';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { FormField, PasswordField } from '@/components/Form';
import { useForgotPassword, useResetPassword, useUser } from '@/lib/hooks';

const profileFields = [
  { label: 'Email', key: 'email' },
  { label: 'Phone', key: 'phone' },
  { label: 'Role', key: 'role' },
  { label: 'Timezone', key: 'timezone' },
  { label: 'Language', key: 'language' },
  { label: 'Currency', key: 'currency' },
] as const;

export default function AdminProfilePage() {
  const { data: session } = useSession();
  const { data: user, isLoading } = useUser(session?.user.id ?? '');
  const forgotPassword = useForgotPassword();
  const resetPassword = useResetPassword();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [resetError, setResetError] = useState('');

  if (isLoading) {
    return <LoadingSpinner text="Loading profile..." />;
  }

  if (!user) {
    return <LoadingSpinner text="Unable to load profile" />;
  }

  const handleSendResetCode = () => {
    setResetError('');
    forgotPassword.mutate(
      { email: user.email },
      {
        onError: (error: unknown) => {
          setResetError(
            error instanceof Error ? error.message : 'Unable to send reset code',
          );
        },
      },
    );
  };

  const handleResetPassword = () => {
    setResetError('');

    if (!token.trim()) {
      setResetError('Reset code is required');
      return;
    }

    if (password.length < 4) {
      setPasswordError('Password must be at least 4 characters');
      return;
    }

    if (password !== confirmPassword) {
      setConfirmError('Passwords do not match');
      return;
    }

    resetPassword.mutate(
      {
        email: user.email,
        token: token.trim(),
        password,
      },
      {
        onSuccess: () => {
          setToken('');
          setPassword('');
          setConfirmPassword('');
          setConfirmError('');
          setPasswordError('');
          setResetError('');
        },
        onError: (error: unknown) => {
          setResetError(
            error instanceof Error ? error.message : 'Unable to reset password',
          );
        },
      },
    );
  };

  return (
    <div>
      <Header title="My Profile" description="Current account details" />

      <div className="p-4 sm:p-6 space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">{user.name}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusBadge status={user.role} />
                <StatusBadge status={user.status} />
                {user.isVerified && <StatusBadge status="verified" />}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {profileFields.map((field) => (
                <div
                  key={field.key}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {field.label}
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {String(user[field.key] ?? '—')}
                  </p>
                </div>
              ))}
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Wallet Balance
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {typeof user.walletBalance === 'number'
                    ? `${user.currency ?? 'USD'} ${user.walletBalance.toLocaleString()}`
                    : '—'}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Last Login
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {user.lastLoginAt ?? '—'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">Password Reset</h3>
              <p className="text-sm text-muted-foreground">
                Send a reset code to your email, then use the code below to set a new password.
              </p>
            </div>

            {resetError && (
              <Alert variant="destructive">
                <AlertDescription>{resetError}</AlertDescription>
              </Alert>
            )}

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Reset Email
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">{user.email}</p>
            </div>

            <div className="flex justify-start">
              <CustomBtn
                onClick={handleSendResetCode}
                isLoading={forgotPassword.isPending}
                className="bg-emerald-600 text-white rounded-lg"
              >
                Send Reset Code
              </CustomBtn>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Reset Code"
                id="reset-code"
                type="text"
                htmlFor="reset-code"
                placeholder="Enter the code from your email"
                value={token}
                onChange={setToken}
                isInvalid={false}
                errorMessage=""
                reqValue="*"
              />

              <div />

              <PasswordField
                PasswordText="New Password"
                placeholderText="Enter your new password"
                passwordError={passwordError}
                handlePasswordChange={(value) => {
                  setPassword(value);
                  setPasswordError('');
                }}
              />

              <PasswordField
                PasswordText="Confirm Password"
                placeholderText="Confirm your new password"
                passwordError={confirmError}
                handlePasswordChange={(value) => {
                  setConfirmPassword(value);
                  setConfirmError('');
                }}
              />
            </div>

            <div className="flex justify-end">
              <CustomBtn
                onClick={handleResetPassword}
                isLoading={resetPassword.isPending}
                isDisabled={!token || !password || !confirmPassword}
                className="bg-emerald-600 text-white rounded-lg"
              >
                Reset Password
              </CustomBtn>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
