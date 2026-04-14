'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { CustomBtn, Logo } from '@/components/shared';
import { FormField, PasswordField } from '@/components/Form';
import { PasswordSchema, RequiredSchema, useField } from '@/lib';
import { useResetPassword } from '@/lib/hooks';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailSchema = useMemo(() => RequiredSchema('Email'), []);
  const tokenSchema = useMemo(() => RequiredSchema('Token'), []);
  const {
    value: email,
    error: emailError,
    handleChange: handleEmailChange,
    setValue: setEmailValue,
  } = useField('', emailSchema);
  const {
    value: token,
    error: tokenError,
    handleChange: handleTokenChange,
    setValue: setTokenValue,
  } = useField('', tokenSchema);
  const {
    value: password,
    error: passwordError,
    handleChange: handlePasswordChange,
  } = useField('', PasswordSchema);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [error, setError] = useState('');
  const resetPassword = useResetPassword();

  useEffect(() => {
    const emailFromQuery = searchParams.get('email');
    const tokenFromQuery = searchParams.get('token');
    if (emailFromQuery) {
      setEmailValue(emailFromQuery);
    }
    if (tokenFromQuery) {
      setTokenValue(tokenFromQuery);
    }
  }, [searchParams, setEmailValue, setTokenValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!token.trim()) {
      setError('Reset token is required');
      return;
    }

    if (password !== confirmPassword) {
      setConfirmError('Passwords do not match');
      return;
    }

    resetPassword.mutate(
      {
        email: email.trim(),
        token: token.trim(),
        password,
      },
      {
        onSuccess: () => {
          router.replace('/login');
        },
        onError: (mutationError: unknown) => {
          setError(
            mutationError instanceof Error
              ? mutationError.message
              : 'Unable to reset password',
          );
        },
      },
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <Logo />
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              label="Email address"
              id="email"
              type="email"
              htmlFor="email"
              placeholder="Enter your email address"
              value={email}
              onChange={handleEmailChange}
              isInvalid={!!emailError}
              errorMessage={emailError}
              reqValue="*"
            />

            <FormField
              label="Reset Token"
              id="token"
              type="text"
              htmlFor="token"
              placeholder="Paste your reset token"
              value={token}
              onChange={handleTokenChange}
              isInvalid={!!tokenError}
              errorMessage={tokenError}
              reqValue="*"
            />

            <PasswordField
              PasswordText="New Password"
              placeholderText="Enter your new password"
              passwordError={passwordError}
              handlePasswordChange={handlePasswordChange}
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

            <CustomBtn
              type="submit"
              isLoading={resetPassword.isPending}
              isDisabled={!email || !token || !password || !confirmPassword || !!passwordError || !!emailError}
              className="w-full bg-emerald-600 text-white rounded-lg"
            >
              Reset Password
            </CustomBtn>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <Link href="/login" className="underline">
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
