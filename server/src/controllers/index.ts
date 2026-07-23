import type { Core } from '@strapi/strapi';
import type { QuickFilterDefinition } from '../config';

interface ResolvedFilter extends QuickFilterDefinition {
  options: Array<{ id: number; documentId: string; label: string }>;
}

const controller = ({ strapi }: { strapi: Core.Strapi }) => ({
  async resolve(ctx: any) {
    const model = ctx.query.model as string | undefined;

    if (!model) {
      ctx.body = { filters: [] };
      return;
    }

    const contentType = (strapi.contentTypes as Record<string, any>)[model];
    if (!contentType) {
      ctx.body = { filters: [] };
      return;
    }

    const { filters = [] } = strapi.config.get<{ filters: QuickFilterDefinition[] }>(
      'plugin::quick-filters',
      { filters: [] }
    );

    const applicable = filters.filter((def) => {
      const attribute = contentType.attributes?.[def.field];
      return (
        attribute &&
        attribute.type === 'relation' &&
        'target' in attribute &&
        attribute.target === def.targetUid
      );
    });

    const resolved: ResolvedFilter[] = [];

    for (const def of applicable) {
      try {
        const entries = await strapi.documents(def.targetUid as any).findMany({
          fields: ['id', 'documentId', def.labelField] as any,
          limit: 200,
        });

        resolved.push({
          ...def,
          options: entries.map((entry: any) => ({
            id: entry.id,
            documentId: entry.documentId,
            label: entry[def.labelField] ?? entry.documentId,
          })),
        });
      } catch (err) {
        strapi.log.warn(
          `quick-filters: could not resolve options for "${def.field}" (${def.targetUid}): ${
            (err as Error).message
          }`
        );
      }
    }

    ctx.body = { filters: resolved };
  },
});

export default {
  controller,
};
