import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { createGeoData } from '@/api/geodata';
import { Page, LeftPanel, RightPanel, BottomPanel } from '@/components/page';
import { Header } from '@/components/header';
import { Separator } from '@/components/separator';
import { RecentFetches } from '@/components/recent-fetches';
import type { GeoData as IGeoData } from '@/api/schema';
import { GeoData } from '@/components/ui/geo-data';
import { toast } from 'sonner';
import { isApiDetailedError } from '@/api/api';
import { History } from '@/components/history';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: (ip_or_url: string) => createGeoData(ip_or_url),
    onSuccess: ({ id }) => {
      queryClient.invalidateQueries({ queryKey: ['list'] });
      toast.success('Data fetched successfully');
      setDataID(id);
    },
    onError: (error: unknown) => {
      if (isApiDetailedError(error)) {
        toast.error(
          error.response?.data.detail ?? 'An unexpected error occurred'
        );
      } else {
        toast.error('An unexpected error occurred');
      }
    },
  });

  const [address, setAddress] = useState('');
  const [dataID, setDataID] = useState<IGeoData['id'] | null>(null);

  return (
    <Page mClassName="h-[50vh] overflow-hidden">
      <LeftPanel className="flex-col gap-4">
        <Header
          value={address}
          setValue={setAddress}
          isDisabled={createMutation.isPending || address.trim().length === 0}
          isLoading={createMutation.isPending}
          onFindClick={() => createMutation.mutate(address)}
        />
        <Separator />
        <RecentFetches onRowSelected={setDataID} />
      </LeftPanel>

      <RightPanel>
        <GeoData geoDataID={dataID} />
      </RightPanel>

      <BottomPanel className="h-screen">
        <History />
      </BottomPanel>
    </Page>
  );
}
