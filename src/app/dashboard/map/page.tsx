import { PageHeader } from "@/components/shared/page-header";
import { MapView } from "@/components/dashboard/map/map-view";

export default function MapPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Map"
        description="Cleaners and active orders on the map."
      />
      <MapView />
    </div>
  );
}
