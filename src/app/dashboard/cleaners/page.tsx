import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { CleanersTable } from "@/components/dashboard/cleaners/cleaners-table";
import { cleanerStore } from "@/lib/services/db-service";

export const dynamic = "force-dynamic";

export default async function CleanersPage() {
  const { data: cleaners } = await cleanerStore.getAll([], undefined, 1, 100);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cleaners"
        description="Manage your cleaning team. View availability, performance, and assignments."
      >
        <Link href="/dashboard/cleaners/new">
          <Button className="bg-teal-600 hover:bg-teal-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add Cleaner
          </Button>
        </Link>
      </PageHeader>
      <CleanersTable cleaners={cleaners} />
    </div>
  );
}
