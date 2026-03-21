"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CustomBtn } from './CustomBtn';
import { LucideIcon } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showFooter?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  icon?: LucideIcon;
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  showFooter = false,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  size = 'md',
  icon: Icon,
}: ModalProps) {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={sizeClasses[size]}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-primary" />
              </div>
            )}
            <div className="flex-1">
              <DialogTitle>{title}</DialogTitle>
              {description && (
                <DialogDescription className="mt-1">
                  {description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          {children}
        </div>

        {(showFooter || footer) && (
          <DialogFooter>
            {footer || (
              <div className="flex gap-2 w-full sm:w-auto">
                <CustomBtn
                  variant="bordered"
                  onPress={() => {
                    onCancel?.();
                    onOpenChange(false);
                  }}
                  disabled={isLoading}
                  className="flex-1 sm:flex-none bg-white border rounded-lg"
                >
                  {cancelText}
                </CustomBtn>
                <CustomBtn
                  onClick={onConfirm}
                  isLoading={isLoading}
                  loadingText="Processing..."
                  className="flex-1 sm:flex-none   bg-emerald-600 text-white font-semibold rounded-lg px-4 py-2 shadow-sm hover:bg-emerald-700 disabled:bg-emerald-200 disabled:text-emerald-700"
                >
                  {confirmText}
                </CustomBtn>
              </div>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}