"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Star, ArrowUpDown, Eye } from "lucide-react";
import { cn, getInitials, formatPhone } from "@/lib/utils";
import {
  AVAILABILITY_LABELS,
  AVAILABILITY_COLORS,
  SPECIALIZATION_LABELS,
  SPECIALIZATION_COLORS,
  ZONES,
} from "@/lib/constants";
import type { Cleaner, CleanerAvailability } from "@/types/cleaner";

interface CleanersTableProps {
  cleaners: Cleaner[];
}

type SortKey = "name" | "rating" | "hoursWorkedThisWeek" | "hourlyRate" | "completedOrders";

export function CleanersTable({ cleaners }: CleanersTableProps) {
  const [search, setSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState<string>("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    let result = cleaners;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.firstName.toLowerCase().includes(q) ||
          c.lastName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q)
      );
    }

    if (zoneFilter !== "all") {
      result = result.filter((c) => c.zone === zoneFilter);
    }

    if (availabilityFilter !== "all") {
      result = result.filter((c) => c.availability === availabilityFilter);
    }

    result = [...result].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sortKey) {
        case "name":
          return (`${a.firstName} ${a.lastName}`).localeCompare(`${b.firstName} ${b.lastName}`) * dir;
        case "rating":
          return (a.rating - b.rating) * dir;
        case "hoursWorkedThisWeek":
          return (a.hoursWorkedThisWeek - b.hoursWorkedThisWeek) * dir;
        case "hourlyRate":
          return (a.hourlyRate - b.hourlyRate) * dir;
        case "completedOrders":
          return (a.completedOrders - b.completedOrders) * dir;
        default:
          return 0;
      }
    });

    return result;
  }, [cleaners, search, zoneFilter, availabilityFilter, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cleaners..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={zoneFilter} onValueChange={setZoneFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Zones" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Zones</SelectItem>
            {ZONES.map((zone) => (
              <SelectItem key={zone} value={zone}>
                {zone}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {(Object.entries(AVAILABILITY_LABELS) as [CleanerAvailability, string][]).map(
              ([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {filtered.length} cleaner{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">
                <Button variant="ghost" size="sm" className="-ml-3 font-semibold" onClick={() => handleSort("name")}>
                  Cleaner <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>Specializations</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" className="-ml-3 font-semibold" onClick={() => handleSort("hoursWorkedThisWeek")}>
                  Hours/Week <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" className="-ml-3 font-semibold" onClick={() => handleSort("hourlyRate")}>
                  Rate <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>Availability</TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" className="-ml-3 font-semibold" onClick={() => handleSort("rating")}>
                  Rating <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  No cleaners found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((cleaner) => (
                <TableRow key={cleaner.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={cleaner.avatar} alt={`${cleaner.firstName} ${cleaner.lastName}`} />
                        <AvatarFallback className="bg-teal-100 text-teal-700 text-xs dark:bg-teal-900/50 dark:text-teal-300">
                          {getInitials(cleaner.firstName, cleaner.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {cleaner.firstName} {cleaner.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{cleaner.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {cleaner.specializations.slice(0, 2).map((spec) => (
                        <Badge
                          key={spec}
                          variant="outline"
                          className={cn("text-[10px] px-1.5 py-0", SPECIALIZATION_COLORS[spec])}
                        >
                          {SPECIALIZATION_LABELS[spec]}
                        </Badge>
                      ))}
                      {cleaner.specializations.length > 2 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          +{cleaner.specializations.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{cleaner.zone}</TableCell>
                  <TableCell className="text-sm">{formatPhone(cleaner.phone)}</TableCell>
                  <TableCell>
                    <span className={cn("text-sm font-medium", cleaner.hoursWorkedThisWeek > 40 && "text-red-600 dark:text-red-400")}>
                      {cleaner.hoursWorkedThisWeek}h
                    </span>
                  </TableCell>
                  <TableCell className="text-sm font-medium">${cleaner.hourlyRate}/hr</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("text-[10px]", AVAILABILITY_COLORS[cleaner.availability])}
                    >
                      {AVAILABILITY_LABELS[cleaner.availability]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium">{cleaner.rating}</span>
                      <span className="text-xs text-muted-foreground">({cleaner.totalReviews})</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/cleaners/${cleaner.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
