# strapi-plugin-quick-filters

Adds a quick pill/dropdown filter bar to the Content Manager list view for
relation fields, instead of the default Filters popover flow (click Filters →
pick field → pick operator → type value).

Works generically: for every content-type whose schema has a relation
attribute matching one of the configured filter definitions, the plugin
automatically renders a filter control between the "Filters" button and the
view-configuration icon. No per-content-type wiring needed — add a new
content-type with a matching relation field and it picks it up automatically.

## Install (local, via `file:` dependency)

In the host Strapi app's `package.json`:

```json
"dependencies": {
  "strapi-plugin-quick-filters": "file:../strapi-plugin-quick-filters"
}
```

Then `npm install`.

## Configure

In the host app's `config/plugins.ts`:

```ts
export default () => ({
  'quick-filters': {
    enabled: true,
    config: {
      filters: [
        {
          field: 'site',
          targetUid: 'api::site.site',
          labelField: 'name',
          mode: 'multi', // or 'single'
        },
      ],
    },
  },
});
```

## Build

```bash
npm install
npm run build
```

Rebuild after every change (`npm run build`), then restart the host app's dev
server to pick up the new `dist/` output.
