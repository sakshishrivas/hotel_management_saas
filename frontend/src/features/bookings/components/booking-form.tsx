'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { bookingSchema, BookingFormValues } from '../schema';
import { useCreateBooking, useUpdateBooking } from '../hooks/use-bookings';
import { Booking } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { customersApi } from '@/features/customers/api/customers.api';
import { hotelsApi } from '@/features/hotels/api/hotels.api';

// Normally we would have an API for Room Types, but for this demo we assume we have a way to fetch room types
// We will mock fetching room types or rely on another API. Actually the user prompt says "use existing backend APIs only".
// Let's create a small hook for RoomTypes since they exist on backend.

interface BookingFormProps {
  initialData?: Booking;
}

export function BookingForm({ initialData }: BookingFormProps) {
  const router = useRouter();
  const createMutation = useCreateBooking();
  const updateMutation = useUpdateBooking();

  const isEditing = !!initialData;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerProfileId: '',
      checkInDate: '',
      checkOutDate: '',
      adults: 1,
      children: 0,
      sourceChannel: 'front_desk',
      currencyCode: 'USD',
      specialRequests: '',
      notes: '',
      rooms: [{ roomTypeId: '', adults: 1, children: 0, nightlyRate: 0, notes: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'rooms',
  });

  useEffect(() => {
    if (initialData) {
      reset({
        checkInDate: initialData.checkInDate ? new Date(initialData.checkInDate).toISOString().split('T')[0] : '',
        checkOutDate: initialData.checkOutDate ? new Date(initialData.checkOutDate).toISOString().split('T')[0] : '',
        adults: initialData.adults || 1,
        children: initialData.children || 0,
        sourceChannel: initialData.sourceChannel || 'front_desk',
        currencyCode: initialData.currencyCode || 'USD',
        specialRequests: initialData.specialRequests || '',
        notes: initialData.notes || '',
        // If editing, usually rooms are managed separately or we map them:
        // rooms: initialData.bookingRooms?.map(...)
      });
    }
  }, [initialData, reset]);

  const onSubmit = async (data: BookingFormValues) => {
    // Basic filter
    const payload = {
      ...data,
      customerProfileId: data.customerProfileId || undefined,
    };

    if (isEditing) {
      await updateMutation.mutateAsync({ id: initialData.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    router.push('/bookings');
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {!isEditing && (
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="customerProfileId">Customer Profile ID</Label>
            <Input id="customerProfileId" {...register('customerProfileId')} placeholder="Enter Customer UUID (Optional)" />
            <p className="text-sm text-muted-foreground">In a real app, this would be a searchable dropdown.</p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="checkInDate">Check-In Date <span className="text-red-500">*</span></Label>
          <Input id="checkInDate" type="date" {...register('checkInDate')} className={errors.checkInDate ? 'border-red-500' : ''} />
          {errors.checkInDate && <p className="text-sm text-red-500">{errors.checkInDate.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="checkOutDate">Check-Out Date <span className="text-red-500">*</span></Label>
          <Input id="checkOutDate" type="date" {...register('checkOutDate')} className={errors.checkOutDate ? 'border-red-500' : ''} />
          {errors.checkOutDate && <p className="text-sm text-red-500">{errors.checkOutDate.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="adults">Total Adults</Label>
          <Input id="adults" type="number" min="1" {...register('adults')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="children">Total Children</Label>
          <Input id="children" type="number" min="0" {...register('children')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sourceChannel">Source Channel</Label>
          <Input id="sourceChannel" {...register('sourceChannel')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currencyCode">Currency Code</Label>
          <Input id="currencyCode" {...register('currencyCode')} />
        </div>
      </div>

      {!isEditing && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Rooms</h3>
            <Button type="button" variant="outline" size="sm" onClick={() => append({ roomTypeId: '', adults: 1, children: 0, nightlyRate: 0, notes: '' })}>
              <Plus className="mr-2 h-4 w-4" /> Add Room
            </Button>
          </div>
          
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end border p-4 rounded-lg bg-muted/10 relative">
              <div className="space-y-2 md:col-span-2">
                <Label>Room Type ID</Label>
                <Input {...register(`rooms.${index}.roomTypeId`)} placeholder="Enter Room Type UUID" />
                {errors.rooms?.[index]?.roomTypeId && <p className="text-xs text-red-500">{errors.rooms[index]?.roomTypeId?.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Adults</Label>
                <Input type="number" {...register(`rooms.${index}.adults`)} />
              </div>
              <div className="space-y-2">
                <Label>Children</Label>
                <Input type="number" {...register(`rooms.${index}.children`)} />
              </div>
              <div className="space-y-2">
                <Label>Nightly Rate</Label>
                <Input type="number" step="0.01" {...register(`rooms.${index}.nightlyRate`)} />
              </div>
              <div className="pb-1 text-right">
                {fields.length > 1 && (
                  <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="specialRequests">Special Requests</Label>
        <Textarea id="specialRequests" {...register('specialRequests')} rows={3} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Internal Notes</Label>
        <Textarea id="notes" {...register('notes')} rows={3} />
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/bookings')}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Booking' : 'Create Booking')}
        </Button>
      </div>
    </form>
  );
}
