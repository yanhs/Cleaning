import type { Cleaner } from "@/types/cleaner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformCleanerRow(row: any): Cleaner {
  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    phone: row.phone,
    avatar: row.avatar ?? undefined,
    status: row.status,
    availability: row.availability,
    specializations: row.specializations,
    rating: row.rating,
    totalReviews: row.totalReviews,
    yearsExperience: row.yearsExperience,
    certifications: row.certifications,
    backgroundCheckDate: row.backgroundCheckDate ?? undefined,
    backgroundCheckStatus: row.backgroundCheckStatus,
    homeLocation: {
      latitude: row.homeLatitude ?? 0,
      longitude: row.homeLongitude ?? 0,
      address: row.homeAddress ?? "",
      city: row.homeCity ?? "",
      state: row.homeState ?? "",
      zipCode: row.homeZipCode ?? "",
    },
    serviceRadius: row.serviceRadius,
    currentLocation:
      row.currentLatitude != null
        ? {
            latitude: row.currentLatitude,
            longitude: row.currentLongitude ?? 0,
            address: "",
            city: "",
            state: "",
            zipCode: "",
          }
        : undefined,
    zone: row.zone,
    hoursWorkedThisWeek: row.hoursWorkedThisWeek,
    hoursWorkedThisMonth: row.hoursWorkedThisMonth,
    hourlyRate: row.hourlyRate,
    overtimeRate: row.overtimeRate,
    completedOrders: row.completedOrders,
    cancellationRate: row.cancellationRate,
    schedulePreference: {
      preferredDays: row.preferredDays,
      preferredStartTime: row.preferredStartTime,
      preferredEndTime: row.preferredEndTime,
      maxHoursPerWeek: row.maxHoursPerWeek,
      noGoZones: row.noGoZones,
    },
    notes: row.notes,
    lastOrderDate: row.lastOrderDate ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
