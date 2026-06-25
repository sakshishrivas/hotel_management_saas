'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { customerSchema, CustomerFormValues } from '../schema';
import { useCreateCustomer, useUpdateCustomer } from '../hooks/use-customers';
import { Customer } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CustomerFormProps {
  initialData?: Customer;
}

export function CustomerForm({ initialData }: CustomerFormProps) {
  const router = useRouter();
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();

  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      nationality: '',
      documentType: '',
      documentNo: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      countryCode: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        email: (initialData as any).email || '', // assuming email comes from somewhere or we just pass it if backend adds it
        phone: (initialData as any).phone || '',
        dateOfBirth: initialData.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split('T')[0] : '',
        gender: initialData.gender || '',
        nationality: initialData.nationality || '',
        documentType: initialData.documentType || '',
        documentNo: initialData.documentNo || '',
        addressLine1: initialData.addressLine1 || '',
        addressLine2: initialData.addressLine2 || '',
        city: initialData.city || '',
        state: initialData.state || '',
        postalCode: initialData.postalCode || '',
        countryCode: initialData.countryCode || '',
        notes: initialData.notes || '',
      });
    }
  }, [initialData, reset]);

  const onSubmit = async (data: CustomerFormValues) => {
    // Only pass non-empty fields to backend
    const payload = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
    ) as CustomerFormValues;

    if (isEditing) {
      await updateMutation.mutateAsync({ id: initialData.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    router.push('/customers');
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
          <Input id="firstName" {...register('firstName')} className={errors.firstName ? 'border-red-500' : ''} />
          {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
          <Input id="lastName" {...register('lastName')} className={errors.lastName ? 'border-red-500' : ''} />
          {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
          <Input id="email" type="email" {...register('email')} className={errors.email ? 'border-red-500' : ''} />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" type="tel" {...register('phone')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input id="dateOfBirth" type="date" {...register('dateOfBirth')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Input id="gender" {...register('gender')} placeholder="e.g., Male, Female, Other" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nationality">Nationality</Label>
          <Input id="nationality" {...register('nationality')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="documentType">Document Type</Label>
          <Input id="documentType" {...register('documentType')} placeholder="e.g., Passport, ID Card" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="documentNo">Document Number</Label>
          <Input id="documentNo" {...register('documentNo')} />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="addressLine1">Address Line 1</Label>
            <Input id="addressLine1" {...register('addressLine1')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="addressLine2">Address Line 2</Label>
            <Input id="addressLine2" {...register('addressLine2')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" {...register('city')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State/Province</Label>
            <Input id="state" {...register('state')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input id="postalCode" {...register('postalCode')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="countryCode">Country Code (2 letters)</Label>
            <Input id="countryCode" {...register('countryCode')} placeholder="e.g., US, UK" />
            {errors.countryCode && <p className="text-sm text-red-500">{errors.countryCode.message}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" {...register('notes')} rows={4} />
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/customers')}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Customer' : 'Create Customer')}
        </Button>
      </div>
    </form>
  );
}
