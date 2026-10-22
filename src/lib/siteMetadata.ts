/**
 * Compatibility shim: the implementation moved to `@/config/site`.
 * Existing importers (robots, sitemap, manifest, opengraph-image) are
 * redirected to the new module in later phases; this shim dies with the
 * legacy wave (new_plan.md §8).
 */

export { getStructuredData, siteName, siteUrlFor } from '@/config/site'
