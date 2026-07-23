export interface QuickFilterDefinition {
  /** attribute name on the content-type, e.g. "site" */
  field: string;
  /** UID of the relation target, e.g. "api::site.site" */
  targetUid: string;
  /** attribute on the target entry used as the pill label, e.g. "name" */
  labelField: string;
  /** 'single' renders a dropdown, 'multi' renders toggleable pills */
  mode: 'single' | 'multi';
}

export interface QuickFiltersConfig {
  filters: QuickFilterDefinition[];
}

export default {
  default: {
    filters: [],
  } satisfies QuickFiltersConfig,
  validator(config: QuickFiltersConfig) {
    if (!Array.isArray(config.filters)) {
      throw new Error('quick-filters: `filters` must be an array');
    }
    for (const filter of config.filters) {
      if (!filter.field || !filter.targetUid || !filter.labelField) {
        throw new Error(
          'quick-filters: each filter definition needs `field`, `targetUid`, and `labelField`'
        );
      }
      if (filter.mode !== 'single' && filter.mode !== 'multi') {
        throw new Error('quick-filters: `mode` must be "single" or "multi"');
      }
    }
  },
};
