"use client";

import { useRouter } from "next/navigation";
import { AssignmentPanel } from "@/components/dashboard/orders/assignment-panel";
import type { Order } from "@/types/order";

interface NotificationData {
  id: string;
  type: string;
  title: string;
  message: string;
  channels: string[];
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export function AssignmentPanelWrapper({
  order,
  notifications,
}: {
  order: Order;
  notifications?: NotificationData[];
}) {
  const router = useRouter();

  return (
    <AssignmentPanel
      orderId={order.id}
      orderNumber={order.orderNumber}
      orderAddress={order.address.address}
      orderDate={order.scheduledDate}
      orderStartTime={order.scheduledStartTime}
      assignedCleanerId={order.assignedCleanerId}
      assignedCleanerName={order.assignedCleanerName}
      autoAssigned={order.autoAssigned}
      status={order.status}
      onAssigned={() => router.refresh()}
      notifications={notifications}
    />
  );
}
