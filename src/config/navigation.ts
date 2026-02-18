import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Map,
  BarChart3,
  Bell,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const sidebarNavigation: NavSection[] = [
  {
    label: "Main",
    items: [
      { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { title: "Orders", href: "/dashboard/orders", icon: ClipboardList },
      { title: "Cleaners", href: "/dashboard/cleaners", icon: Users },
      { title: "Map", href: "/dashboard/map", icon: Map },
    ],
  },
  {
    label: "Insights",
    items: [
      { title: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
      { title: "Notifications", href: "/dashboard/notifications", icon: Bell },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Settings", href: "/dashboard/settings/profile", icon: Settings },
    ],
  },
];
