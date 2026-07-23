# strapi-plugin-quick-filters

**One-click filter pills for the Strapi Content Manager — no more Filters popover
gymnastics.**

![Quick Filters in action — filtering Articles by site with a single click](docs/screenshot.png)

## The problem

Strapi's built-in filter is powerful but slow for the most common case: *"show me
only the rows where this relation/enum is X."* Every time, it's the same dance:

1. Click **Filters**
2. Pick the field from a dropdown
3. Pick an operator (`is`, `is not`, `contains`, ...)
4. Type or pick the value
5. Click **Apply**

Four clicks and a dropdown hunt, for something that should be one click.

## The fix

**Quick Filters** renders a row of clickable pills — one per possible value — right
next to the **Filters** button. Click a pill, the list re-filters instantly. Click it
again to clear. Select several pills at once for an OR filter. No popover, no
dropdown, no typing.

- 🎯 **Single or multi-select** per field — a dropdown for "pick one," toggle pills
  for "pick several"
- ✅ **Visual selected state** — active pills turn green with a checkmark, so you
  always see the current filter at a glance
- 🧠 **Zero per-content-type wiring** — configure the relation field *once*, and every
  content-type that has it gets the pill bar automatically. Add a 10th content-type
  with the same relation tomorrow and it just works, no code change.
- ⚡ **Native Content Manager filtering under the hood** — pills just set the same
  `filters` query param the built-in Filters UI uses, so pagination, sorting, and
  every other list-view feature keep working normally.

Built for and battle-tested in production on a real multi-site Strapi CMS (filtering
articles/products/services/... by which client site they belong to, across 8+
content-types).

## Installation

### Option A — local monorepo dependency

If the plugin lives as a sibling folder to your Strapi app:

```json
// package.json
"dependencies": {
  "strapi-plugin-quick-filters": "file:../strapi-plugin-quick-filters"
}
```

```bash
npm install
```

### Option B — vendored tarball (recommended for Docker/production builds)

`file:../sibling-folder` dependencies break in a Docker build, because the build
context usually only includes your app's own folder — the sibling plugin folder
simply isn't there to resolve. Vendor a tarball inside your app instead:

```bash
# inside this plugin's folder
npm run build
npm pack

# copy the resulting .tgz into your Strapi app
mkdir -p /path/to/your-app/vendor
cp strapi-plugin-quick-filters-*.tgz /path/to/your-app/vendor/
```

```json
// your-app/package.json
"dependencies": {
  "strapi-plugin-quick-filters": "file:./vendor/strapi-plugin-quick-filters-0.1.0.tgz"
}
```

```bash
npm install
```

If your `Dockerfile` runs `npm ci` before copying the full source tree (a common
pattern for Docker layer caching), make sure `vendor/` is copied in **before** that
`npm ci` step:

```dockerfile
COPY package*.json ./
COPY vendor ./vendor   # <-- must exist before npm ci resolves the tarball path
RUN npm ci
```

## Configuration

In your Strapi app's `config/plugins.ts` (or `.js`):

```ts
export default () => ({
  'quick-filters': {
    enabled: true,
    config: {
      filters: [
        {
          field: 'site',              // the relation attribute name on your content-types
          targetUid: 'api::site.site', // the content-type it relates to
          labelField: 'name',         // which field of the target to show as the pill label
          mode: 'multi',              // 'multi' = toggle pills, 'single' = dropdown
        },
        // add as many filter definitions as you need — each applies to every
        // content-type whose schema has a matching relation attribute
      ],
    },
  },
});
```

That's it. No further per-content-type setup — every content-type with a `site`
relation targeting `api::site.site` gets the pill bar automatically, on both
existing and future content-types.

## How it works

- Registers into the Content Manager's `listView.actions` injection zone (the space
  between the **Filters** button and the view-configuration gear icon).
- A small admin-only server route (`GET /quick-filters/resolve?model=...`) checks the
  requested content-type's schema against your config and returns the matching
  filter definitions plus the live list of options (id + label) from the target
  content-type.
- Clicking a pill writes straight to the URL's `filters` query param — the exact
  mechanism the Content Manager's own list view already uses — so the list refetches
  through the normal, native filtering path.

## Requirements

- Strapi `^5.0.0`
- React 18, React Router 6, styled-components 6 (all already provided by the Strapi
  admin panel — just make sure they're listed as `peerDependencies` if you fork this,
  not bundled, or you'll end up with a duplicate React context tree and broken click
  handlers)

## License

MIT
