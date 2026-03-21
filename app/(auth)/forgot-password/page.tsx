'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { CustomBtn, Logo } from '@/components/shared';
import { FormField } from '@/components/Form';
import { EmailSchema, useField } from '@/lib';
import { useForgotPassword } from '@/lib/hooks';

export default function ForgotPasswordPage() {
  const { value: email, error: emailError, handleChange: handleEmailChange } =
    useField('', EmailSchema);
  const forgotPassword = useForgotPassword();
  const [error, setError] = useState('');
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    setIsDisabled(!email || !!emailError);
  }, [email, emailError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    forgotPassword.mutate(
      { email },
      {
        onError: (mutationError: unknown) => {
          setError(
            mutationError instanceof Error
              ? mutationError.message
              : 'Unable to send reset link',
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

            <CustomBtn
              type="submit"
              isLoading={forgotPassword.isPending}
              isDisabled={isDisabled}
              className="w-full bg-emerald-600 text-white rounded-lg"
            >
              Send Reset Link
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
