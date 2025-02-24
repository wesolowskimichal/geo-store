import { detailQueryOptions } from '@/api/queries';
import { GeoData as IGeoData } from '@/api/schema';
import { useQuery } from '@tanstack/react-query';
import { LeftPanel, Page, RightPanel, TopPanel } from '../page';
import { Separator } from '../separator';
import { ReactNode } from 'react';
import { Flag } from '../flag';
import { CornerStatus } from '../corner-status';
import JsonView from '@uiw/react-json-view';
import { Minus } from 'lucide-react';
import { ScrollArea } from './scroll-area';
import { Skeleton } from './skeleton';
import { withBool } from '@/hocs/with-bool';
import { useError } from '@/hooks/use-error';

type Props = {
  geoDataID: IGeoData['id'] | null;
};

const Field = ({ label, value }: { label: string; value: ReactNode }) => {
  return (
    <div className="flex w-full gap-1 rounded border-b border-solid">
      <span className="text-sm font-medium">{label}</span>
      <span className="text-sm">
        {!value || value.toString().length === 0 ? (
          <Minus className="size-4" />
        ) : (
          value
        )}
      </span>
    </div>
  );
};

export const GeoData = ({ geoDataID }: Props) => {
  const { isLoading, data, error } = useQuery({
    ...detailQueryOptions(geoDataID!),
    enabled: geoDataID !== null,
  });

  useError(error);

  if (!geoDataID) {
    return (
      <div className="flex size-full flex-col items-center justify-center">
        <span className="text-xl font-medium uppercase">Nothing to show</span>
        <span className="text-center font-semibold">
          Fetch or select data to show information
        </span>
      </div>
    );
  }

  if (isLoading) {
    return <Skeleton className="w-full" />;
  }

  if (!data && !isLoading) {
    return (
      <div className="flex size-full flex-col items-center justify-center">
        <span className="text-xl font-medium uppercase">
          UNEXPECTED ERROR OCCURED
        </span>
        <span className="font-semibold">
          Try again or contact support if the problem persists
        </span>
      </div>
    );
  }

  return (
    <Page
      className="size-full flex-col overflow-hidden"
      overflowWrapper={false}
    >
      <TopPanel>
        {withBool({
          component: (
            <div className="flex w-full items-center justify-center">
              <CornerStatus status={data!.status}>
                <h1 className="w-full text-center font-medium">
                  {data!.ip_or_url}
                </h1>
              </CornerStatus>
            </div>
          ),
          condition: isLoading,
          fallback: <Skeleton className="size-full h-10" />,
        })}
      </TopPanel>

      <Separator />

      <LeftPanel>
        {withBool({
          component: (
            <div className="flex w-full flex-col gap-2">
              <Field label="Type" value={data!.type} />
              <Field
                label="Country"
                value={
                  <div className="flex items-center gap-1">
                    {data!.country_name}{' '}
                    <Flag
                      flagUnicode={data!.country_flag_emoji_unicode}
                      fallback={<Minus className="size-4" />}
                    />
                  </div>
                }
              />
              <Field label="Latitude" value={data!.latitude} />
              <Field label="Longitude" value={data!.longitude} />
              <Field
                label="Last fetch"
                value={data!.updated_at.toLocaleString()}
              />
            </div>
          ),
          condition: isLoading,
          fallback: <Skeleton className="size-full" />,
        })}
      </LeftPanel>

      <RightPanel>
        {withBool({
          component: (
            <div className="relative overflow-hidden">
              <h3 className="text-xs font-medium">RAW</h3>
              <ScrollArea className="h-full max-h-64 p-2">
                <JsonView value={data!.raw_response as object} />
              </ScrollArea>
            </div>
          ),
          condition: isLoading,
          fallback: <Skeleton className="size-full" />,
        })}
      </RightPanel>
    </Page>
  );
};
