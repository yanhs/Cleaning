import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function SettingsProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your company profile and preferences."
      />

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Company Profile</CardTitle>
            <CardDescription>Update your company information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input id="company-name" defaultValue="CleanSlate Services" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-email">Email</Label>
                <Input id="company-email" type="email" defaultValue="admin@cleanslate.app" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-phone">Phone</Label>
                <Input id="company-phone" defaultValue="(212) 555-0100" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-city">City</Label>
                <Input id="company-city" defaultValue="New York" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-address">Address</Label>
              <Input id="company-address" defaultValue="350 5th Ave, New York, NY 10118" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-about">About</Label>
              <Textarea
                id="company-about"
                defaultValue="Professional cleaning services for residential and commercial properties in the NYC metro area."
                rows={3}
              />
            </div>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white">
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Business Hours</CardTitle>
            <CardDescription>Set your operating hours.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hours-start">Start Time</Label>
                <Input id="hours-start" type="time" defaultValue="07:00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hours-end">End Time</Label>
                <Input id="hours-end" type="time" defaultValue="19:00" />
              </div>
            </div>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white">
              Save Hours
            </Button>
          </CardContent>
        </Card>

        <Separator />

        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="text-base text-red-600 dark:text-red-400">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive">Delete Account</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
