import { useSearchParams } from 'react-router-dom';
import qs from 'qs';

type RelationFilterValue = { id: { $eq: number } } | { id: { $in: number[] } } | undefined;

/**
 * Reads/writes `filters[<field>]` directly on the URL, the same query param
 * the Content Manager list view itself reads to fetch data — so setting it
 * here triggers the same refetch as using the built-in Filters popover.
 */
export function useRelationFilter(field: string) {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = qs.parse(searchParams.toString());
  const filters = ((query.filters as Record<string, unknown>) ?? {}) as Record<string, unknown>;
  const current = filters[field] as RelationFilterValue;

  const setValue = (next: RelationFilterValue) => {
    const nextFilters = { ...filters };

    if (next) {
      nextFilters[field] = next;
    } else {
      delete nextFilters[field];
    }

    const nextQuery: Record<string, unknown> = { ...query, filters: nextFilters };
    if (Object.keys(nextFilters).length === 0) {
      delete nextQuery.filters;
    }

    setSearchParams(qs.stringify(nextQuery, { encode: false }));
  };

  return { current, setValue };
}
