import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { OrdersTable } from "@/components/dashboard/orders/orders-table";
import { orderStore } from "@/lib/services/db-service";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const { data: orders } = await orderStore.getAll([], undefined, 1, 200);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Manage cleaning orders, track status, and handle assignments."
      >
        <Link href="/dashboard/orders/new">
          <Button className="bg-teal-600 hover:bg-teal-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Button>
        </Link>
      </PageHeader>
      <OrdersTable orders={orders} />
    </div>
  );
}
