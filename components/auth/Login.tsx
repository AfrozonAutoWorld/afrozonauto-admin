'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { CustomBtn, Logo } from '@/components/shared';
import { FormField, PasswordField } from '@/components/Form';
import { EmailSchema, PasswordSchema, useField } from '@/lib';
import { signIn } from "next-auth/react";
import { showToast } from '@/lib/showNotification';

export function LoginPage() {
  const { value: email, error: emailError, handleChange: handleEmailChange } = useField("", EmailSchema);
  const {
    value: password,
    error: passwordError,
    handleChange: handlePasswordChange,
  } = useField("", PasswordSchema);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    setIsDisabled(!email || !password || !!passwordError || !!emailError);
  }, [email, emailError, password, passwordError]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (!res) {
        throw new Error("No response from server");
      }

      if (res.error === "CredentialsSignin") {
        setError("Invalid email or password");
        showToast({ type: "error", message: "Invalid email or password", duration: 8000 });
      } else if (res.error) {
        setError(res.error);
        showToast({ type: "error", message: res.error || "Unexpected server error", duration: 8000 });
      } else {
        showToast({ type: "success", message: "Login Successful", duration: 3000 });
        // AuthProvider in layout.tsx takes over routing from here
      }
    } catch (error: unknown) {
      console.error("Login failed:", error);
      const message = error instanceof Error ? error.message : "Unexpected error occurred";
      const errorMessage = message.includes("Network")
        ? "Network error. Please check your internet connection."
        : message;

      setError(errorMessage);
      showToast({ type: "error", message: errorMessage, duration: 8000 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
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

          <form onSubmit={onSubmit} className="w-full">
            <div className="grid w-full items-start gap-4 py-4">
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
                className="text-sm"
              />
              <div>
                <PasswordField
                  PasswordText="Password"
                  placeholderText="Enter your password"
                  passwordError={passwordError}
                  handlePasswordChange={handlePasswordChange}
                />
              </div>
            </div>
            <div className="text-center">
              <CustomBtn
                type="submit"
                isLoading={isLoading}
                isDisabled={isDisabled}
                className="bg-emerald-600 text-white rounded-lg cursor-pointer px-4 font-semibold text-lg"
              >
                Login
              </CustomBtn>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Forgot password? Contact system administrator</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}