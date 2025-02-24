import { GeoData } from '@/components/ui/geo-data';
import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/$id')({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return (
    <div className="flex flex-col gap-4 p-2">
      <Link to="/" className="size-fit cursor-pointer text-lg">
        Go back
      </Link>
      {isNaN(parseInt(id)) ? (
        <span className="text-xl text-destructive">Invalid ID</span>
      ) : (
        <GeoData geoDataID={parseInt(id)} />
      )}
    </div>
  );
}
