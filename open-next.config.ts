import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Phase 1 (no R2/D1/Durable Object bindings available on this token yet):
// serve the prerendered routes from Workers Static Assets (read-only
// incremental cache) with cache interception enabled. On-demand routes
// render in the worker. ISR revalidation of build-time content happens on
// every deploy instead (acceptable: content changes ship with deploys).
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
