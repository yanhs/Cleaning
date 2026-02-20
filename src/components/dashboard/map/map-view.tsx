"use client";

import "leaflet/dist/leaflet.css";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Users,
  ClipboardList,
  Eye,
  MapPin,
  Phone,
  Star,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  SPECIALIZATION_LABELS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  AVAILABILITY_LABELS,
  AVAILABILITY_COLORS,
} from "@/lib/constants";

// Dynamic import to avoid SSR issues with Leaflet
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

interface MapCleaner {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  availability: string;
  specializations: string[];
  rating: number;
  homeLatitude: number | null;
  homeLongitude: number | null;
  homeAddress: string | null;
  zone: string;
  hoursWorkedThisWeek: number;
}

interface MapOrder {
  id: string;
  orderNumber: string;
  clientName: string;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  type: string;
  status: string;
  priority: string;
  scheduledDate: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  assignedCleanerName: string | null;
  assignedCleanerId: string | null;
}

type LayerFilter = "all" | "cleaners" | "orders";

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function MapView() {
  const [cleaners, setCleaners] = useState<MapCleaner[]>([]);
  const [orders, setOrders] = useState<MapOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [layerFilter, setLayerFilter] = useState<LayerFilter>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [cleanerIcon, setCleanerIcon] = useState<L.Icon | null>(null);
  const [orderIcon, setOrderIcon] = useState<L.Icon | null>(null);
  const [urgentIcon, setUrgentIcon] = useState<L.Icon | null>(null);

  // Load data
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/cleaning/api/map");
        const data = await res.json();
        setCleaners(data.cleaners || []);
        setOrders(data.orders || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Create Leaflet icons after client-side load
  useEffect(() => {
    import("leaflet").then((L) => {
      // Fix default marker icon issue
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      setCleanerIcon(
        new L.Icon({
          iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        })
      );

      setOrderIcon(
        new L.Icon({
          iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        })
      );

      setUrgentIcon(
        new L.Icon({
          iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        })
      );

      setLeafletLoaded(true);
    });
  }, []);

  // Filter logic
  const filteredCleaners = useMemo(() => {
    if (layerFilter === "orders") return [];
    return cleaners.filter(
      (c) => c.homeLatitude != null && c.homeLongitude != null
    );
  }, [cleaners, layerFilter]);

  const filteredOrders = useMemo(() => {
    if (layerFilter === "cleaners") return [];
    let result = orders.filter(
      (o) => o.latitude != null && o.longitude != null
    );
    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter);
    }
    return result;
  }, [orders, layerFilter, statusFilter]);

  // Compute center from all markers
  const center = useMemo<[number, number]>(() => {
    const allLats: number[] = [];
    const allLngs: number[] = [];

    filteredCleaners.forEach((c) => {
      if (c.homeLatitude && c.homeLongitude) {
        allLats.push(c.homeLatitude);
        allLngs.push(c.homeLongitude);
      }
    });
    filteredOrders.forEach((o) => {
      if (o.latitude && o.longitude) {
        allLats.push(o.latitude);
        allLngs.push(o.longitude);
      }
    });

    if (allLats.length === 0) return [40.7128, -74.006]; // NYC default

    const avgLat = allLats.reduce((s, v) => s + v, 0) / allLats.length;
    const avgLng = allLngs.reduce((s, v) => s + v, 0) / allLngs.length;
    return [avgLat, avgLng];
  }, [filteredCleaners, filteredOrders]);

  // Stats
  const availableCount = cleaners.filter((c) => c.availability === "available").length;
  const activeOrderCount = orders.filter((o) =>
    ["assigned", "confirmed", "in_progress"].includes(o.status)
  ).length;
  const pendingCount = orders.filter((o) => o.status === "pending").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="flex items-center gap-2 py-3 px-4">
            <Users className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-xs text-muted-foreground">Available</p>
              <p className="text-lg font-bold">{availableCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-2 py-3 px-4">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Total Cleaners</p>
              <p className="text-lg font-bold">{cleaners.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-2 py-3 px-4">
            <ClipboardList className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-xs text-muted-foreground">Active Orders</p>
              <p className="text-lg font-bold">{activeOrderCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-2 py-3 px-4">
            <ClipboardList className="h-4 w-4 text-amber-600" />
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-lg font-bold">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={layerFilter} onValueChange={(v) => setLayerFilter(v as LayerFilter)}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Show..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Markers</SelectItem>
            <SelectItem value="cleaners">Cleaners Only</SelectItem>
            <SelectItem value="orders">Orders Only</SelectItem>
          </SelectContent>
        </Select>

        {layerFilter !== "cleaners" && (
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
            </SelectContent>
          </Select>
        )}

        <div className="flex items-center gap-4 ml-auto text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-green-500" /> Cleaners
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-blue-500" /> Orders
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500" /> Urgent
          </span>
        </div>
      </div>

      {/* Map */}
      <div className="rounded-lg border overflow-hidden" style={{ height: "calc(100vh - 320px)", minHeight: "400px" }}>
        {leafletLoaded ? (
          <MapContainer
            center={center}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Cleaner markers */}
            {cleanerIcon &&
              filteredCleaners.map((cleaner) => (
                <Marker
                  key={`c-${cleaner.id}`}
                  position={[cleaner.homeLatitude!, cleaner.homeLongitude!]}
                  icon={cleanerIcon}
                >
                  <Popup maxWidth={280}>
                    <div className="space-y-2 min-w-[200px]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm">
                          {cleaner.firstName} {cleaner.lastName}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px]",
                            AVAILABILITY_COLORS[cleaner.availability as keyof typeof AVAILABILITY_COLORS]
                          )}
                        >
                          {AVAILABILITY_LABELS[cleaner.availability as keyof typeof AVAILABILITY_LABELS]}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {cleaner.phone}
                        </p>
                        <p className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {cleaner.zone}
                        </p>
                        <p className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-amber-500" /> {cleaner.rating.toFixed(1)}
                        </p>
                        <p className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {cleaner.hoursWorkedThisWeek}h this week
                        </p>
                      </div>
                      {cleaner.specializations.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {cleaner.specializations.map((s) => (
                            <Badge key={s} variant="secondary" className="text-[9px] px-1 py-0">
                              {SPECIALIZATION_LABELS[s as keyof typeof SPECIALIZATION_LABELS] || s}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <Link href={`/dashboard/cleaners/${cleaner.id}`}>
                        <Button variant="outline" size="sm" className="w-full mt-1 h-7 text-xs">
                          <Eye className="h-3 w-3 mr-1" /> View Profile
                        </Button>
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              ))}

            {/* Order markers */}
            {orderIcon &&
              urgentIcon &&
              filteredOrders.map((order) => (
                <Marker
                  key={`o-${order.id}`}
                  position={[order.latitude!, order.longitude!]}
                  icon={order.priority === "urgent" || order.priority === "high" ? urgentIcon : orderIcon}
                >
                  <Popup maxWidth={280}>
                    <div className="space-y-2 min-w-[200px]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-semibold text-xs">
                          {order.orderNumber}
                        </span>
                        <div className="flex gap-1">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px]",
                              ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS]
                            )}
                          >
                            {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px]",
                              PRIORITY_COLORS[order.priority as keyof typeof PRIORITY_COLORS]
                            )}
                          >
                            {PRIORITY_LABELS[order.priority as keyof typeof PRIORITY_LABELS]}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-1 text-xs">
                        <p className="font-medium">{order.clientName}</p>
                        <p className="text-muted-foreground">{order.address}, {order.city}</p>
                        <p className="text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(order.scheduledDate)}, {formatTime(order.scheduledStartTime)} - {formatTime(order.scheduledEndTime)}
                        </p>
                        <p className="text-muted-foreground">
                          {SPECIALIZATION_LABELS[order.type as keyof typeof SPECIALIZATION_LABELS] || order.type}
                        </p>
                        {order.assignedCleanerName && (
                          <p className="text-muted-foreground">
                            Cleaner: <span className="font-medium text-foreground">{order.assignedCleanerName}</span>
                          </p>
                        )}
                      </div>
                      <Link href={`/dashboard/orders/${order.id}`}>
                        <Button variant="outline" size="sm" className="w-full mt-1 h-7 text-xs">
                          <Eye className="h-3 w-3 mr-1" /> View Order
                        </Button>
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        ) : (
          <div className="flex items-center justify-center h-full bg-muted/30">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}
