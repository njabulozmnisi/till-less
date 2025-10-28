import { ThemeToggle } from '@tillless/ui/components/theme-toggle';
import { Button } from '@tillless/ui/components/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@tillless/ui/components/card';
import { Badge } from '@tillless/ui/components/badge';
import { Alert, AlertTitle, AlertDescription } from '@tillless/ui/components/alert';

export default function TestComponentsPage(): JSX.Element {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Component Showcase</h1>
        <ThemeToggle />
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button className="bg-primary hover:bg-primary-hover">Primary Color</Button>
          <Button className="bg-secondary hover:bg-secondary-hover">Secondary Color</Button>
          <Button className="bg-accent hover:bg-accent-hover">Accent Color</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card description goes here</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This is the card content area.</p>
            </CardContent>
            <CardFooter>
              <Button>Action</Button>
            </CardFooter>
          </Card>

          <Card className="bg-primary-light">
            <CardHeader>
              <CardTitle>Primary Light</CardTitle>
              <CardDescription>Using custom color</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">Fresh green background.</p>
            </CardContent>
          </Card>

          <Card className="bg-accent/10">
            <CardHeader>
              <CardTitle>Accent Tint</CardTitle>
              <CardDescription>Vibrant orange accent</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Savings highlights and alerts.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Badges</h2>
        <div className="flex flex-wrap gap-4">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge className="bg-primary text-primary-foreground">Primary</Badge>
          <Badge className="bg-secondary text-secondary-foreground">Secondary</Badge>
          <Badge className="bg-accent text-accent-foreground">Accent</Badge>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Alerts</h2>
        <div className="space-y-4">
          <Alert>
            <AlertTitle>Default Alert</AlertTitle>
            <AlertDescription>
              This is a default alert with useful information.
            </AlertDescription>
          </Alert>

          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Something went wrong. Please try again.
            </AlertDescription>
          </Alert>

          <Alert className="border-primary bg-primary-light">
            <AlertTitle className="text-primary">Success</AlertTitle>
            <AlertDescription className="text-foreground">
              Your changes have been saved successfully using custom primary color.
            </AlertDescription>
          </Alert>

          <Alert className="border-accent bg-accent/10">
            <AlertTitle className="text-accent">Attention</AlertTitle>
            <AlertDescription>
              Check out these savings! Using custom accent color.
            </AlertDescription>
          </Alert>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Color Palette Demo</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-lg bg-primary text-primary-foreground">
            <h3 className="font-bold">Primary</h3>
            <p className="text-sm">Fresh Green</p>
          </div>
          <div className="p-6 rounded-lg bg-primary-hover text-primary-foreground">
            <h3 className="font-bold">Primary Hover</h3>
            <p className="text-sm">Darker Green</p>
          </div>
          <div className="p-6 rounded-lg bg-primary-light text-foreground">
            <h3 className="font-bold">Primary Light</h3>
            <p className="text-sm">Light Green</p>
          </div>
          <div className="p-6 rounded-lg bg-secondary text-secondary-foreground">
            <h3 className="font-bold">Secondary</h3>
            <p className="text-sm">Deep Teal</p>
          </div>
          <div className="p-6 rounded-lg bg-accent text-accent-foreground">
            <h3 className="font-bold">Accent</h3>
            <p className="text-sm">Vibrant Orange</p>
          </div>
          <div className="p-6 rounded-lg bg-muted text-foreground">
            <h3 className="font-bold">Muted</h3>
            <p className="text-sm">Neutral Gray</p>
          </div>
        </div>
      </section>
    </div>
  );
}
