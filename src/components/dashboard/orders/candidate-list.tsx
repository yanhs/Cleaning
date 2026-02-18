"use client";

import { Star, MapPin, Clock, DollarSign, Heart, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Candidate {
  cleanerId: string;
  cleanerName: string;
  score: number;
  distance: number;
  currentHoursThisWeek: number;
  hourlyRate: number;
  rating: number;
  specializationMatch: boolean;
  isPreferred: boolean;
  reasons: string[];
}

interface CandidateListProps {
  candidates: Candidate[];
  onSelect: (cleanerId: string) => void;
  selectedCleanerId?: string;
}

export function CandidateList({
  candidates,
  onSelect,
  selectedCleanerId,
}: CandidateListProps) {
  if (candidates.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        No suitable cleaners found
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {candidates.map((candidate, index) => (
        <button
          key={candidate.cleanerId}
          onClick={() => onSelect(candidate.cleanerId)}
          className={cn(
            "w-full text-left rounded-lg border p-3 transition-colors hover:bg-accent/50",
            selectedCleanerId === candidate.cleanerId
              ? "border-teal-600 bg-teal-50/50 dark:bg-teal-950/20"
              : "border-border"
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs font-medium shrink-0">
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-sm truncate">
                      {candidate.cleanerName}
                    </span>
                    {candidate.isPreferred && (
                      <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500 shrink-0" />
                    )}
                    {selectedCleanerId === candidate.cleanerId && (
                      <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                      {candidate.rating.toFixed(1)}
                    </span>
                    {candidate.distance > 0 && (
                      <span className="flex items-center gap-0.5">
                        <MapPin className="h-3 w-3" />
                        {candidate.distance} mi
                      </span>
                    )}
                    <span className="flex items-center gap-0.5">
                      <DollarSign className="h-3 w-3" />
                      ${candidate.hourlyRate}/hr
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-3 w-3" />
                      {candidate.currentHoursThisWeek}h/wk
                    </span>
                  </div>
                </div>
              </div>
              {candidate.reasons.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2 ml-10">
                  {candidate.reasons.map((reason, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0"
                    >
                      {reason}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span
                className={cn(
                  "text-sm font-semibold",
                  candidate.score >= 70
                    ? "text-teal-600"
                    : candidate.score >= 40
                      ? "text-amber-600"
                      : "text-red-500"
                )}
              >
                {candidate.score}%
              </span>
              <Progress
                value={candidate.score}
                className="w-16 h-1.5"
              />
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
