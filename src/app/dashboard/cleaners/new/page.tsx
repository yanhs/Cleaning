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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/page-header";
import { SPECIALIZATION_LABELS, ZONES } from "@/lib/constants";
import type {
  CleanerFormData,
  CleaningSpecialization,
} from "@/types/cleaner";

const SPECIALIZATION_OPTIONS = Object.entries(SPECIALIZATION_LABELS) as [
  CleaningSpecialization,
  string,
][];

interface FormErrors {
  [key: string]: string;
}

export default function AddCleanerPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<CleanerFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specializations: [],
    hourlyRate: 0,
    zone: "",
    homeLocation: {
      address: "",
      city: "",
      state: "",
      zipCode: "",
    },
    serviceRadius: 10,
    schedulePreference: {
      preferredStartTime: "08:00",
      preferredEndTime: "17:00",
      maxHoursPerWeek: 40,
    },
    notes: "",
  });

  function updateField<K extends keyof CleanerFormData>(
    field: K,
    value: CleanerFormData[K]
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function updateHomeLocation(field: string, value: string) {
    setFormData((prev) => ({
      ...prev,
      homeLocation: { ...prev.homeLocation, [field]: value },
    }));
    const errorKey = `homeLocation.${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
    }
  }

  function updateSchedulePreference(field: string, value: string | number) {
    setFormData((prev) => ({
      ...prev,
      schedulePreference: { ...prev.schedulePreference, [field]: value },
    }));
  }

  function toggleSpecialization(spec: CleaningSpecialization) {
    setFormData((prev) => {
      const current = prev.specializations;
      const updated = current.includes(spec)
        ? current.filter((s) => s !== spec)
        : [...current, spec];
      return { ...prev, specializations: updated };
    });
    if (errors.specializations) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.specializations;
        return next;
      });
    }
  }

  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    if (formData.specializations.length === 0) {
      newErrors.specializations = "Select at least one specialization";
    }
    if (!formData.hourlyRate || formData.hourlyRate <= 0) {
      newErrors.hourlyRate = "Hourly rate must be greater than 0";
    }
    if (!formData.zone) {
      newErrors.zone = "Zone is required";
    }
    if (!formData.homeLocation?.address?.trim()) {
      newErrors["homeLocation.address"] = "Address is required";
    }
    if (!formData.homeLocation?.city?.trim()) {
      newErrors["homeLocation.city"] = "City is required";
    }
    if (!formData.homeLocation?.state?.trim()) {
      newErrors["homeLocation.state"] = "State is required";
    }
    if (!formData.homeLocation?.zipCode?.trim()) {
      newErrors["homeLocation.zipCode"] = "Zip code is required";
    }
    if (!formData.serviceRadius || formData.serviceRadius <= 0) {
      newErrors.serviceRadius = "Service radius must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/cleaning/api/cleaners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Failed to add cleaner");
      }

      toast.success("Cleaner added successfully");
      router.push("/dashboard/cleaners");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add cleaner"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Add Cleaner">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/cleaners">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </PageHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500">{errors.firstName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="john.doe@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="(555) 123-4567"
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Details */}
        <Card>
          <CardHeader>
            <CardTitle>Work Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Specializations</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                {SPECIALIZATION_OPTIONS.map(([value, label]) => (
                  <label
                    key={value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={formData.specializations.includes(value)}
                      onCheckedChange={() => toggleSpecialization(value)}
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
              {errors.specializations && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.specializations}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.hourlyRate || ""}
                  onChange={(e) =>
                    updateField("hourlyRate", parseFloat(e.target.value) || 0)
                  }
                  placeholder="25.00"
                />
                {errors.hourlyRate && (
                  <p className="text-sm text-red-500">{errors.hourlyRate}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="zone">Zone</Label>
                <Select
                  value={formData.zone}
                  onValueChange={(value) => updateField("zone", value)}
                >
                  <SelectTrigger id="zone">
                    <SelectValue placeholder="Select a zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {ZONES.map((zone) => (
                      <SelectItem key={zone} value={zone}>
                        {zone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.zone && (
                  <p className="text-sm text-red-500">{errors.zone}</p>
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
                value={formData.homeLocation?.address || ""}
                onChange={(e) => updateHomeLocation("address", e.target.value)}
                placeholder="123 Main St"
              />
              {errors["homeLocation.address"] && (
                <p className="text-sm text-red-500">
                  {errors["homeLocation.address"]}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.homeLocation?.city || ""}
                  onChange={(e) => updateHomeLocation("city", e.target.value)}
                  placeholder="Springfield"
                />
                {errors["homeLocation.city"] && (
                  <p className="text-sm text-red-500">
                    {errors["homeLocation.city"]}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.homeLocation?.state || ""}
                  onChange={(e) => updateHomeLocation("state", e.target.value)}
                  placeholder="IL"
                />
                {errors["homeLocation.state"] && (
                  <p className="text-sm text-red-500">
                    {errors["homeLocation.state"]}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input
                  id="zipCode"
                  value={formData.homeLocation?.zipCode || ""}
                  onChange={(e) => updateHomeLocation("zipCode", e.target.value)}
                  placeholder="62701"
                />
                {errors["homeLocation.zipCode"] && (
                  <p className="text-sm text-red-500">
                    {errors["homeLocation.zipCode"]}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serviceRadius">Service Radius (miles)</Label>
                <Input
                  id="serviceRadius"
                  type="number"
                  min="1"
                  value={formData.serviceRadius}
                  onChange={(e) =>
                    updateField(
                      "serviceRadius",
                      parseInt(e.target.value) || 10
                    )
                  }
                  placeholder="10"
                />
                {errors.serviceRadius && (
                  <p className="text-sm text-red-500">
                    {errors.serviceRadius}
                  </p>
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preferredStartTime">
                  Preferred Start Time
                </Label>
                <Input
                  id="preferredStartTime"
                  type="time"
                  value={formData.schedulePreference?.preferredStartTime || "08:00"}
                  onChange={(e) =>
                    updateSchedulePreference(
                      "preferredStartTime",
                      e.target.value
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredEndTime">Preferred End Time</Label>
                <Input
                  id="preferredEndTime"
                  type="time"
                  value={formData.schedulePreference?.preferredEndTime || "17:00"}
                  onChange={(e) =>
                    updateSchedulePreference(
                      "preferredEndTime",
                      e.target.value
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxHoursPerWeek">Max Hours Per Week</Label>
                <Input
                  id="maxHoursPerWeek"
                  type="number"
                  min="1"
                  max="168"
                  value={formData.schedulePreference?.maxHoursPerWeek || 40}
                  onChange={(e) =>
                    updateSchedulePreference(
                      "maxHoursPerWeek",
                      parseInt(e.target.value) || 40
                    )
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ""}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder="Any additional notes about this cleaner..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/cleaners">Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Add Cleaner
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
