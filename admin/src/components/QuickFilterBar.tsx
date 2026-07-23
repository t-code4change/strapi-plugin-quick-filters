import * as React from 'react';
import { Flex } from '@strapi/design-system';
// eslint-disable-next-line camelcase
import { unstable_useContentManagerContext as useContentManagerContext, useFetchClient } from '@strapi/strapi/admin';
import { PLUGIN_ID } from '../pluginId';
import { useRelationFilter } from '../utils/useRelationFilter';
import { QuickSelectDropdown } from './QuickSelectDropdown';

interface FilterOption {
  id: number;
  documentId: string;
  label: string;
}

interface ResolvedFilter {
  field: string;
  label: string;
  mode: 'single' | 'multi';
  options: FilterOption[];
}

const QuickFilterField = ({ filter }: { filter: ResolvedFilter }) => {
  const { current, setValue } = useRelationFilter(filter.field);

  const selectedIds = !current
    ? []
    : '$eq' in current.id
      ? [current.id.$eq]
      : current.id.$in;

  const handleChange = (ids: number[]) => {
    if (ids.length === 0) {
      setValue(undefined);
    } else if (filter.mode === 'single') {
      setValue({ id: { $eq: ids[0] } });
    } else {
      setValue({ id: { $in: ids } });
    }
  };

  return (
    <QuickSelectDropdown
      label={filter.label}
      options={filter.options}
      selectedIds={selectedIds}
      multi={filter.mode === 'multi'}
      onChange={handleChange}
    />
  );
};

const QuickFilterBar = () => {
  const { model } = useContentManagerContext();
  const { get } = useFetchClient();
  const [resolvedFilters, setResolvedFilters] = React.useState<ResolvedFilter[]>([]);

  React.useEffect(() => {
    if (!model) {
      return;
    }

    get(`/${PLUGIN_ID}/resolve`, { params: { model } })
      .then(({ data }) => setResolvedFilters((data as { filters?: ResolvedFilter[] }).filters ?? []))
      .catch(() => setResolvedFilters([]));
  }, [model, get]);

  if (resolvedFilters.length === 0) {
    return null;
  }

  return (
    <Flex gap={2}>
      {resolvedFilters.map((filter) => (
        <QuickFilterField key={filter.field} filter={filter} />
      ))}
    </Flex>
  );
};

export default QuickFilterBar;
