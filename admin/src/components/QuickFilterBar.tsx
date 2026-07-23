import * as React from 'react';
import { Flex, SingleSelect, SingleSelectOption, Button } from '@strapi/design-system';
// eslint-disable-next-line camelcase
import { unstable_useContentManagerContext as useContentManagerContext, useFetchClient } from '@strapi/strapi/admin';
import { PLUGIN_ID } from '../pluginId';
import { useRelationFilter } from '../utils/useRelationFilter';

interface FilterOption {
  id: number;
  documentId: string;
  label: string;
}

interface ResolvedFilter {
  field: string;
  mode: 'single' | 'multi';
  options: FilterOption[];
}

const QuickFilterField = ({ filter }: { filter: ResolvedFilter }) => {
  const { current, setValue } = useRelationFilter(filter.field);

  if (filter.mode === 'single') {
    const selectedId = current && 'id' in current && '$eq' in current.id ? current.id.$eq : undefined;

    return (
      <SingleSelect
        placeholder="Tất cả"
        value={selectedId !== undefined ? String(selectedId) : ''}
        onClear={() => setValue(undefined)}
        onChange={(value: string | number) =>
          setValue(value !== '' ? { id: { $eq: Number(value) } } : undefined)
        }
      >
        {filter.options.map((opt) => (
          <SingleSelectOption key={opt.id} value={String(opt.id)}>
            {opt.label}
          </SingleSelectOption>
        ))}
      </SingleSelect>
    );
  }

  const selectedIds =
    current && 'id' in current && '$in' in current.id ? current.id.$in : ([] as number[]);

  const toggle = (id: number) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((existing) => existing !== id)
      : [...selectedIds, id];
    setValue(next.length ? { id: { $in: next } } : undefined);
  };

  return (
    <Flex gap={1} wrap="wrap">
      {filter.options.map((opt) => (
        <Button
          key={opt.id}
          size="S"
          variant={selectedIds.includes(opt.id) ? 'success' : 'tertiary'}
          onClick={() => toggle(opt.id)}
        >
          {opt.label}
        </Button>
      ))}
    </Flex>
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
