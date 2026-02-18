import { prisma } from "@/lib/db";
import { calculateDistance } from "@/lib/utils";
import type { Cleaner, CleaningSpecialization } from "@/types/cleaner";
import type { AssignmentCandidate } from "@/types/assignment";

interface OrderInput {
  id?: string;
  type: CleaningSpecialization;
  latitude: number;
  longitude: number;
  scheduledDate: Date;
  scheduledStartTime: string;
  scheduledEndTime: string;
  estimatedDuration: number;
  clientId: string;
}

interface RuleRow {
  type: string;
  weight: number;
  enabled: boolean;
}

// ---------------------------------------------------------------------------
// Individual rule scorers (each returns 0–100)
// ---------------------------------------------------------------------------

function scoreProximity(
  cleaner: Cleaner,
  orderLat: number,
  orderLng: number
): { score: number; distance: number } {
  const homeLat = cleaner.homeLocation.latitude;
  const homeLng = cleaner.homeLocation.longitude;

  if (!homeLat && !homeLng) return { score: 50, distance: 0 };
  if (!orderLat && !orderLng) return { score: 50, distance: 0 };

  const distance = calculateDistance(homeLat, homeLng, orderLat, orderLng);
  const radius = cleaner.serviceRadius || 10;

  if (distance <= 2) return { score: 100, distance };
  if (distance >= radius) return { score: 0, distance };

  const score = Math.round(100 * (1 - (distance - 2) / (radius - 2)));
  return { score, distance };
}

function scoreAvailability(
  cleaner: Cleaner,
  scheduledDate: Date,
  startTime: string,
  endTime: string
): number {
  if (cleaner.status !== "active") return 0;
  if (cleaner.availability !== "available") return 0;

  const dayOfWeek = new Date(scheduledDate).getDay();
  const pref = cleaner.schedulePreference;

  const dayMatch = pref.preferredDays.includes(dayOfWeek);
  if (!dayMatch) return 0;

  const prefStart = pref.preferredStartTime || "08:00";
  const prefEnd = pref.preferredEndTime || "18:00";

  if (startTime >= prefStart && endTime <= prefEnd) return 100;
  if (startTime >= prefEnd || endTime <= prefStart) return 10;
  return 50;
}

function scoreSpecialization(
  cleaner: Cleaner,
  orderType: CleaningSpecialization
): boolean {
  return cleaner.specializations.includes(orderType);
}

function scoreRating(cleaner: Cleaner): number {
  const rating = cleaner.rating || 0;
  return Math.min(100, Math.round(((rating - 3.0) / 2.0) * 100));
}

function scoreOvertimePrevention(
  cleaner: Cleaner,
  orderDurationMinutes: number
): number {
  const maxHours = cleaner.schedulePreference.maxHoursPerWeek || 40;
  const currentHours = cleaner.hoursWorkedThisWeek || 0;
  const orderHours = orderDurationMinutes / 60;

  if (currentHours + orderHours > maxHours) return 0;

  return Math.round(
    ((maxHours - (currentHours + orderHours)) / maxHours) * 100
  );
}

function scoreClientPreference(
  cleaner: Cleaner,
  preferredCleanerId?: string
): boolean {
  if (!preferredCleanerId) return false;
  return cleaner.id === preferredCleanerId;
}

function scoreWorkloadBalance(
  cleaner: Cleaner,
  maxHoursAcrossAll: number
): number {
  if (maxHoursAcrossAll <= 0) return 100;
  const hours = cleaner.hoursWorkedThisWeek || 0;
  return Math.round(100 - (hours / maxHoursAcrossAll) * 100);
}

function scoreCostOptimization(
  cleaner: Cleaner,
  minRate: number,
  maxRate: number
): number {
  if (maxRate <= minRate) return 100;
  const rate = cleaner.hourlyRate || 0;
  return Math.round(100 - ((rate - minRate) / (maxRate - minRate)) * 100);
}

// ---------------------------------------------------------------------------
// Main scoring function
// ---------------------------------------------------------------------------

export async function scoreCleaners(
  order: OrderInput,
  availableCleaners: Cleaner[],
  rules: RuleRow[],
  preferredCleanerId?: string
): Promise<AssignmentCandidate[]> {
  if (availableCleaners.length === 0 || rules.length === 0) return [];

  const enabledRules = rules.filter((r) => r.enabled);
  if (enabledRules.length === 0) return [];

  // Pre-calculate aggregate values for relative scoring
  const allHours = availableCleaners.map((c) => c.hoursWorkedThisWeek || 0);
  const maxHoursAcrossAll = Math.max(...allHours, 1);

  const allRates = availableCleaners.map((c) => c.hourlyRate || 0);
  const minRate = Math.min(...allRates);
  const maxRate = Math.max(...allRates);

  const candidates: AssignmentCandidate[] = [];

  for (const cleaner of availableCleaners) {
    let totalWeightedScore = 0;
    let totalWeight = 0;
    const reasons: string[] = [];
    let distance = 0;
    let specMatch = false;
    let isPreferred = false;

    for (const rule of enabledRules) {
      let ruleScore = 0;

      switch (rule.type) {
        case "proximity": {
          const result = scoreProximity(
            cleaner,
            order.latitude,
            order.longitude
          );
          ruleScore = result.score;
          distance = result.distance;
          if (ruleScore >= 70) reasons.push(`${distance} mi away`);
          break;
        }
        case "availability": {
          ruleScore = scoreAvailability(
            cleaner,
            order.scheduledDate,
            order.scheduledStartTime,
            order.scheduledEndTime
          );
          if (ruleScore === 100) reasons.push("Schedule match");
          break;
        }
        case "specialization": {
          specMatch = scoreSpecialization(cleaner, order.type);
          ruleScore = specMatch ? 100 : 0;
          if (specMatch) reasons.push("Specialization match");
          break;
        }
        case "rating": {
          ruleScore = scoreRating(cleaner);
          if (cleaner.rating >= 4.5) reasons.push(`${cleaner.rating}★`);
          break;
        }
        case "overtime_prevention": {
          ruleScore = scoreOvertimePrevention(
            cleaner,
            order.estimatedDuration
          );
          break;
        }
        case "client_preference": {
          isPreferred = scoreClientPreference(cleaner, preferredCleanerId);
          ruleScore = isPreferred ? 100 : 0;
          if (isPreferred) reasons.push("Preferred cleaner");
          break;
        }
        case "workload_balance": {
          ruleScore = scoreWorkloadBalance(cleaner, maxHoursAcrossAll);
          break;
        }
        case "cost_optimization": {
          ruleScore = scoreCostOptimization(cleaner, minRate, maxRate);
          if (ruleScore >= 80) reasons.push("Cost efficient");
          break;
        }
      }

      totalWeightedScore += ruleScore * rule.weight;
      totalWeight += rule.weight;
    }

    const finalScore =
      totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;

    const addr = cleaner.homeLocation;
    const homeAddr = [addr.address, addr.city, addr.state, addr.zipCode]
      .filter(Boolean)
      .join(", ");

    candidates.push({
      cleanerId: cleaner.id,
      cleanerName: `${cleaner.firstName} ${cleaner.lastName}`,
      phone: cleaner.phone || "",
      email: cleaner.email || "",
      homeAddress: homeAddr,
      availability: (cleaner.availability || "available") as AssignmentCandidate["availability"],
      score: finalScore,
      distance,
      currentHoursThisWeek: cleaner.hoursWorkedThisWeek || 0,
      hourlyRate: cleaner.hourlyRate || 0,
      rating: cleaner.rating || 0,
      specializationMatch: specMatch,
      isPreferred,
      reasons,
    });
  }

  // Sort by score descending
  candidates.sort((a, b) => b.score - a.score);

  return candidates;
}

// ---------------------------------------------------------------------------
// Convenience: get suggestions for an existing order
// ---------------------------------------------------------------------------

export async function getAssignmentSuggestions(
  orderId: string,
  maxCandidates: number = 0
): Promise<AssignmentCandidate[]> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return [];

  // Fetch ALL cleaners (not just available) so the table shows everyone
  const allCleaners = await prisma.cleaner.findMany({
    where: { status: "active" },
  });

  const rules = await prisma.assignmentRule.findMany({
    where: { enabled: true },
  });

  // Get client for preferred cleaner
  const client = await prisma.client.findUnique({
    where: { id: order.clientId },
  });

  // Transform Prisma rows to the Cleaner type the scorer expects
  const { transformCleanerRow } = await import("./assignment-helpers");
  const cleaners = allCleaners.map(transformCleanerRow);

  const candidates = await scoreCleaners(
    {
      id: order.id,
      type: order.type as CleaningSpecialization,
      latitude: order.latitude ?? 0,
      longitude: order.longitude ?? 0,
      scheduledDate: order.scheduledDate,
      scheduledStartTime: order.scheduledStartTime,
      scheduledEndTime: order.scheduledEndTime,
      estimatedDuration: order.estimatedDuration,
      clientId: order.clientId,
    },
    cleaners,
    rules,
    client?.preferredCleanerId ?? undefined
  );

  return maxCandidates > 0 ? candidates.slice(0, maxCandidates) : candidates;
}

// ---------------------------------------------------------------------------
// Convenience: auto-assign the best candidate to an order
// ---------------------------------------------------------------------------

export async function autoAssignOrder(orderId: string) {
  const startTime = Date.now();

  const candidates = await getAssignmentSuggestions(orderId, 10);

  if (candidates.length === 0) {
    await prisma.assignmentLog.create({
      data: {
        orderId,
        orderNumber: "",
        triggerReason: "auto_assignment",
        candidatesContacted: 0,
        candidatesResponded: 0,
        success: false,
        durationSeconds: Math.round((Date.now() - startTime) / 1000),
        candidateScores: [],
      },
    });
    return { success: false, candidate: undefined };
  }

  const best = candidates[0];

  // Update the order
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      assignedCleanerId: best.cleanerId,
      assignedCleanerName: best.cleanerName,
      autoAssigned: true,
      status: "assigned",
    },
  });

  // Create assignment log
  await prisma.assignmentLog.create({
    data: {
      orderId,
      orderNumber: updatedOrder.orderNumber,
      triggerReason: "auto_assignment",
      candidatesContacted: candidates.length,
      candidatesResponded: candidates.length,
      selectedCleanerId: best.cleanerId,
      selectedCleanerName: best.cleanerName,
      success: true,
      durationSeconds: Math.round((Date.now() - startTime) / 1000),
      candidateScores: candidates as unknown as object[],
    },
  });

  return { success: true, candidate: best, order: updatedOrder };
}
