import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export default function MapPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Map View"
        description="See your cleaners and jobs on a real-time map."
      />
      <Card>
        <CardContent className="py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-100 dark:bg-teal-900/30 mx-auto mb-4">
            <MapPin className="h-8 w-8 text-teal-600 dark:text-teal-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Interactive Map Coming Soon</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            The map view will show all cleaners and active jobs on a real-time map with
            custom markers, route tracking, and zone visualization. Powered by Leaflet + OpenStreetMap.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
