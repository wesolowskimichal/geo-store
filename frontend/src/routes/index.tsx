import { Button } from '@/components/ui/button';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="text-red-400">
      Hello World!
      <Button>Test Button</Button>
    </div>
  );
}
