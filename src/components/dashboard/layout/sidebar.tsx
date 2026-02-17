"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, PanelLeftClose, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { sidebarNavigation } from "@/config/navigation";
import { useSidebarStore } from "@/lib/stores/use-sidebar-store";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggle } = useSidebarStore();

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r bg-card h-screen sticky top-0 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center h-16 px-4 border-b shrink-0",
          isCollapsed && "justify-center px-2"
        )}
      >
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold tracking-tight">CleanSlate</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-6 px-2">
          {sidebarNavigation.map((section) => (
            <div key={section.label}>
              {!isCollapsed && (
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.label}
                </p>
              )}
              {isCollapsed && <Separator className="mb-2" />}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" &&
                      pathname.startsWith(item.href));

                  const linkContent = (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        isCollapsed && "justify-center px-2"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isActive && "text-teal-600 dark:text-teal-400"
                        )}
                      />
                      {!isCollapsed && <span>{item.title}</span>}
                      {!isCollapsed && item.badge && (
                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-600 px-1.5 text-[10px] font-semibold text-white">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );

                  if (isCollapsed) {
                    return (
                      <Tooltip key={item.href} delayDuration={0}>
                        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                        <TooltipContent side="right" className="font-medium">
                          {item.title}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return <div key={item.href}>{linkContent}</div>;
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Collapse toggle */}
      <div className="border-t p-2 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggle}
          className={cn(
            "w-full",
            isCollapsed ? "justify-center px-2" : "justify-start"
          )}
        >
          {isCollapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4 mr-2" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
