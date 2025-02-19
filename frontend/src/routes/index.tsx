import { listQueryOptions } from '@/api/queries';
import { Flag } from '@/components/flag';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  const listQuery = useQuery(listQueryOptions);

  return (
    <div className="text-red-400">
      {listQuery.isSuccess && (
        <div>
          {listQuery.data.map((geoData) => (
            <div key={geoData.id}>
              <Flag flagUnicode={geoData.country_flag_emoji_unicode} />
            </div>
          ))}
        </div>
      )}
      <Button>Test Button</Button>
    </div>
  );
}
