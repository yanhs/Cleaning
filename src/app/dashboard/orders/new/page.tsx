"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/page-header";
import { SPECIALIZATION_LABELS, PRIORITY_LABELS } from "@/lib/constants";
import type { OrderPriority, RecurrencePattern } from "@/types/order";
import type { CleaningSpecialization } from "@/types/cleaner";

const RECURRENCE_LABELS: Record<RecurrencePattern, string> = {
  one_time: "One Time",
  weekly: "Weekly",
  biweekly: "Biweekly",
  monthly: "Monthly",
};

interface FormErrors {
  [key: string]: string;
}

export default function NewOrderPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [clientId, setClientId] = useState("");
  const [type, setType] = useState<CleaningSpecialization | "">("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledStartTime, setScheduledStartTime] = useState("");
  const [scheduledEndTime, setScheduledEndTime] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [squareFootage, setSquareFootage] = useState("");
  const [priority, setPriority] = useState<OrderPriority>("normal");
  const [recurrence, setRecurrence] = useState<RecurrencePattern>("one_time");
  const [specialInstructions, setSpecialInstructions] = useState("");

  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!clientId.trim()) newErrors.clientId = "Client ID is required";
    if (!type) newErrors.type = "Service type is required";
    if (!address.trim()) newErrors.address = "Address is required";
    if (!city.trim()) newErrors.city = "City is required";
    if (!state.trim()) newErrors.state = "State is required";
    if (!zipCode.trim()) newErrors.zipCode = "ZIP code is required";
    if (!scheduledDate) newErrors.scheduledDate = "Scheduled date is required";
    if (!scheduledStartTime)
      newErrors.scheduledStartTime = "Start time is required";
    if (!scheduledEndTime) newErrors.scheduledEndTime = "End time is required";
    if (!estimatedDuration || Number(estimatedDuration) <= 0)
      newErrors.estimatedDuration = "Estimated duration must be greater than 0";
    if (squareFootage && Number(squareFootage) < 0)
      newErrors.squareFootage = "Square footage cannot be negative";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      const body = {
        clientId,
        type,
        address: {
          address,
          city,
          state,
          zipCode,
        },
        scheduledDate: new Date(scheduledDate).toISOString(),
        scheduledStartTime,
        scheduledEndTime,
        estimatedDuration: Number(estimatedDuration),
        squareFootage: squareFootage ? Number(squareFootage) : undefined,
        priority,
        recurrence,
        specialInstructions: specialInstructions || undefined,
        items: [],
      };

      const response = await fetch("/cleaning/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create order");
      }

      toast.success("Order created successfully");
      router.push("/dashboard/orders");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create order"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="New Order">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
      </PageHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Service Details */}
        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="clientId">Client ID</Label>
                <Input
                  id="clientId"
                  placeholder="Enter client ID"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                />
                {errors.clientId && (
                  <p className="text-sm text-destructive">{errors.clientId}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Service Type</Label>
                <Select
                  value={type}
                  onValueChange={(value) =>
                    setType(value as CleaningSpecialization)
                  }
                >
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      Object.entries(SPECIALIZATION_LABELS) as [
                        CleaningSpecialization,
                        string,
                      ][]
                    ).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-destructive">{errors.type}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="Street address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                {errors.city && (
                  <p className="text-sm text-destructive">{errors.city}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
                {errors.state && (
                  <p className="text-sm text-destructive">{errors.state}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  placeholder="ZIP code"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                />
                {errors.zipCode && (
                  <p className="text-sm text-destructive">{errors.zipCode}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Scheduled Date</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
                {errors.scheduledDate && (
                  <p className="text-sm text-destructive">
                    {errors.scheduledDate}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedDuration">
                  Estimated Duration (minutes)
                </Label>
                <Input
                  id="estimatedDuration"
                  type="number"
                  min={1}
                  placeholder="e.g. 120"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                />
                {errors.estimatedDuration && (
                  <p className="text-sm text-destructive">
                    {errors.estimatedDuration}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="scheduledStartTime">Start Time</Label>
                <Input
                  id="scheduledStartTime"
                  type="time"
                  value={scheduledStartTime}
                  onChange={(e) => setScheduledStartTime(e.target.value)}
                />
                {errors.scheduledStartTime && (
                  <p className="text-sm text-destructive">
                    {errors.scheduledStartTime}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduledEndTime">End Time</Label>
                <Input
                  id="scheduledEndTime"
                  type="time"
                  value={scheduledEndTime}
                  onChange={(e) => setScheduledEndTime(e.target.value)}
                />
                {errors.scheduledEndTime && (
                  <p className="text-sm text-destructive">
                    {errors.scheduledEndTime}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={priority}
                  onValueChange={(value) =>
                    setPriority(value as OrderPriority)
                  }
                >
                  <SelectTrigger id="priority" className="w-full">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      Object.entries(PRIORITY_LABELS) as [
                        OrderPriority,
                        string,
                      ][]
                    ).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recurrence">Recurrence</Label>
                <Select
                  value={recurrence}
                  onValueChange={(value) =>
                    setRecurrence(value as RecurrencePattern)
                  }
                >
                  <SelectTrigger id="recurrence" className="w-full">
                    <SelectValue placeholder="Select recurrence" />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      Object.entries(RECURRENCE_LABELS) as [
                        RecurrencePattern,
                        string,
                      ][]
                    ).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="squareFootage">Square Footage (optional)</Label>
                <Input
                  id="squareFootage"
                  type="number"
                  min={0}
                  placeholder="e.g. 2000"
                  value={squareFootage}
                  onChange={(e) => setSquareFootage(e.target.value)}
                />
                {errors.squareFootage && (
                  <p className="text-sm text-destructive">
                    {errors.squareFootage}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialInstructions">Special Instructions</Label>
              <Textarea
                id="specialInstructions"
                placeholder="Any special instructions or notes for this order..."
                rows={4}
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" asChild>
            <Link href="/dashboard/orders">Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Order
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
