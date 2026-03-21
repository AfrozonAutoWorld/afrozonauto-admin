'use client';

import { useState } from 'react';
import { Modal } from '@/components/shared/Modal';
import { toast } from 'sonner';
import { EmailSchema, FullNameSchema, PhoneSchema, useField } from '@/lib';
import { FormField, SelectField } from '../Form';
import { useCreateUser } from '@/lib/hooks/useUsers';

const roleOptions = [
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "OPERATIONS_ADMIN", label: "Operations Admin" },
  { value: "BUYER", label: "Buyer" },
  { value: "SELLER", label: "Seller" },
]

interface AddUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddUserModal({ open, onOpenChange }: AddUserModalProps) {
  const {
    value: firstName,
    error: firstNameError,
    handleChange: handleFirstNameChange,
    validate: validateFirstName,
    reset: resetFirstName,
  } = useField("", FullNameSchema);
  const {
    value: lastName,
    error: lastNameError,
    handleChange: handleLastNameChange,
    validate: validateLastName,
    reset: resetLastName,
  } = useField("", FullNameSchema);
  const {
    value: phone,
    error: phoneError,
    handleChange: handleTelePhoneChange,
    validate: validatePhone,
    reset: resetPhone,
  } = useField("", PhoneSchema);
  const {
    value: email,
    error: emailError,
    handleChange: handleEmailChange,
    validate: validateEmail,
    reset: resetEmail,
  } = useField("", EmailSchema);

  const [selectedRole, setSelectedRole] = useState<string>("");
  const [roleError, setRoleError] = useState("");
  const createUser = useCreateUser();

  const resetForm = () => {
    resetFirstName();
    resetLastName();
    resetPhone();
    resetEmail();
    setSelectedRole("");
    setRoleError("");
  };

  const handleSubmit = async () => {
    const isFirstNameValid = validateFirstName();
    const isLastNameValid = validateLastName();
    const isEmailValid = validateEmail();
    const isPhoneValid = validatePhone();

    if (!selectedRole) {
      setRoleError("Role is required");
    }

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !selectedRole ||
      !isFirstNameValid ||
      !isLastNameValid ||
      !isEmailValid ||
      !isPhoneValid
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    createUser.mutate(
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        role: selectedRole,
      },
      {
        onSuccess: () => {
          resetForm();
          onOpenChange(false);
        },
      },
    );
  };


  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Add New User"
      description="Create a new admin user account"
      size="lg"
      showFooter
      onConfirm={handleSubmit}
      confirmText="Add User"
      isLoading={createUser.isPending}
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="First Name"
            id="firstName"
            type="text"
            htmlFor="firstName"
            placeholder="John"
            value={firstName}
            onChange={handleFirstNameChange}
            isInvalid={!!firstNameError}
            errorMessage={firstNameError}
            disabled={createUser.isPending}
            reqValue="*"
            required
          />

          <FormField
            label="Last Name"
            id="lastName"
            type="text"
            htmlFor="lastName"
            placeholder="Doe"
            value={lastName}
            onChange={handleLastNameChange}
            isInvalid={!!lastNameError}
            errorMessage={lastNameError}
            disabled={createUser.isPending}
            reqValue="*"
            required
          />
        </div>

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
          disabled={createUser.isPending}
          required
        />

        <FormField
          label="Phone Number"
          id="phone"
          type="tel"
          htmlFor="phone"
          placeholder="Phone Number"
          value={phone}
          onChange={handleTelePhoneChange}
          isInvalid={!!phoneError}
          errorMessage={phoneError}
          disabled={createUser.isPending}
          reqValue="*"
          required
        />

        <div className='w-full'>
          <SelectField
            label="Role"
            htmlFor="role"
            id="role"
            placeholder="Select Role"
            isInvalid={!!roleError}
            errorMessage={roleError}
            value={selectedRole}
            onChange={(value: string) => {
              setSelectedRole(value);
              setRoleError("");
            }}
            options={roleOptions}
            required
            reqValue="*"
          />
        </div>

      </div>
    </Modal>
  );
}
