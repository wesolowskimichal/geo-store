export type listFilters = {
  ip_or_url?: string;
  ip_or_url__icontains?: string;
  type?: string;
  country_name?: string;
  latitude_gte?: number;
  latitude_lte?: number;
  longitude_gte?: number;
  longitude_lte?: number;
  status?: string;
  ordering?: 'updated_at' | '-updated_at';
  page?: number;
  page_size?: number;
};
