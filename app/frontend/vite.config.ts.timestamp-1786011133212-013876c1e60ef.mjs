// vite.config.ts
import { defineConfig } from "file:///Users/mac/Downloads/FYP%20Development%20Help%20Request%20(1)/app/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///Users/mac/Downloads/FYP%20Development%20Help%20Request%20(1)/app/frontend/node_modules/@vitejs/plugin-react-swc/index.js";
import fs3 from "node:fs";
import path4 from "path";
import { viteSourceLocator } from "file:///Users/mac/Downloads/FYP%20Development%20Help%20Request%20(1)/app/frontend/node_modules/@metagptx/vite-plugin-source-locator/dist/index.mjs";
import { atoms } from "file:///Users/mac/Downloads/FYP%20Development%20Help%20Request%20(1)/app/frontend/node_modules/@metagptx/web-sdk/dist/plugins.js";
import { vitePrerenderPlugin } from "file:///Users/mac/Downloads/FYP%20Development%20Help%20Request%20(1)/app/frontend/node_modules/vite-prerender-plugin/src/index.js";
import Sitemap from "file:///Users/mac/Downloads/FYP%20Development%20Help%20Request%20(1)/app/frontend/node_modules/vite-plugin-sitemap/dist/index.js";

// prerender/blog-routes.js
import path2 from "node:path";

// prerender/utils.js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
var __vite_injected_original_import_meta_url = "file:///Users/mac/Downloads/FYP%20Development%20Help%20Request%20(1)/app/frontend/prerender/utils.js";
var currentFile = fileURLToPath(__vite_injected_original_import_meta_url);
var __dirname2 = path.dirname(currentFile);
var projectRoot = path.resolve(__dirname2, "..");
var seoContentDir = path.resolve(projectRoot, "seo", "content");
function normalizeRouteFromMarkdown(relativePath) {
  const normalized = relativePath.replace(/\\/g, "/").replace(/\/index\.md$/, "").replace(/\.md$/, "");
  return normalized ? `/blog/${normalized}/` : "/blog/";
}
function collectMarkdownFiles(dir, bucket = []) {
  if (!fs.existsSync(dir)) {
    return bucket;
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectMarkdownFiles(fullPath, bucket);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".md")) {
      bucket.push(fullPath);
    }
  }
  return bucket;
}

// prerender/blog-routes.js
function getBlogRoutes() {
  const routes = /* @__PURE__ */ new Set(["/blog/"]);
  for (const filePath of collectMarkdownFiles(seoContentDir)) {
    const relativePath = path2.relative(seoContentDir, filePath);
    routes.add(normalizeRouteFromMarkdown(relativePath));
  }
  return Array.from(routes).sort();
}

// prerender/blog-sitemap.js
import fs2 from "node:fs";
import path3 from "node:path";
function collectMarkdownLastmod(dir) {
  const bucket = {};
  for (const fullPath of collectMarkdownFiles(dir)) {
    const relativePath = path3.relative(seoContentDir, fullPath);
    const route = normalizeRouteFromMarkdown(relativePath);
    bucket[route] = fs2.statSync(fullPath).mtime;
  }
  return bucket;
}
function getLatestContentMtime(lastmodMap) {
  const dates = Object.values(lastmodMap).filter((value) => value instanceof Date);
  if (dates.length === 0) {
    return void 0;
  }
  return new Date(Math.max(...dates.map((date) => date.getTime())));
}
function getSitemapLastmod() {
  const contentLastmod = collectMarkdownLastmod(seoContentDir);
  const latestContentMtime = getLatestContentMtime(contentLastmod);
  return {
    ...latestContentMtime ? { "/blog/": latestContentMtime } : {},
    ...contentLastmod
  };
}

// vite.config.ts
var __vite_injected_original_dirname = "/Users/mac/Downloads/FYP Development Help Request (1)/app/frontend";
process.env.VITE_APP_TITLE = "CyberShield AI - Cybercrime Guidance";
process.env.VITE_APP_DESCRIPTION = "AI-powered cybercrime guidance for victims in Pakistan. Get instant help, evidence collection tips, and legal guidance under PECA 2016.";
process.env.VITE_APP_LOGO_URL ??= process.env.OVERVIEW_LOGO_URL ?? "https://public-frontend-cos.metadl.com/mgx/img/favicon_atoms.ico";
function ensureBuildOutDir() {
  let outDir = path4.resolve(__vite_injected_original_dirname, "dist");
  return {
    name: "ensure-build-out-dir",
    configResolved(config) {
      outDir = path4.resolve(config.root, config.build.outDir);
    },
    writeBundle() {
      fs3.mkdirSync(outDir, { recursive: true });
    }
  };
}
var vite_config_default = defineConfig(({ command }) => {
  const blogPrerenderRoutes = command === "build" ? getBlogRoutes() : [];
  return {
    plugins: [
      viteSourceLocator({
        prefix: "mgx"
        // Prefix used to identify source locations; do not change.
      }),
      react(),
      atoms(),
      ensureBuildOutDir(),
      Sitemap({
        hostname: "https://atoms.template.com",
        lastmod: getSitemapLastmod(),
        readable: true,
        generateRobotsTxt: true
      }),
      ...blogPrerenderRoutes.length > 0 ? vitePrerenderPlugin({
        renderTarget: "#root",
        prerenderScript: path4.resolve(__vite_injected_original_dirname, "prerender/blog.js"),
        additionalPrerenderRoutes: blogPrerenderRoutes
      }) : []
    ],
    resolve: {
      alias: {
        "@": path4.resolve(__vite_injected_original_dirname, "./src")
      }
    },
    server: {
      host: "0.0.0.0",
      // Listen on all network interfaces.
      port: parseInt(process.env.VITE_PORT || "3000"),
      proxy: {
        "/api": {
          target: `http://localhost:${process.env.BACKEND_PORT || "8000"}`,
          changeOrigin: true
        }
      },
      watch: { usePolling: true, interval: 600 }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks
            "react-vendor": ["react", "react-dom"],
            "router-vendor": ["react-router-dom"],
            "ui-vendor": [
              "@radix-ui/react-accordion",
              "@radix-ui/react-alert-dialog",
              "@radix-ui/react-aspect-ratio",
              "@radix-ui/react-avatar",
              "@radix-ui/react-checkbox",
              "@radix-ui/react-collapsible",
              "@radix-ui/react-context-menu",
              "@radix-ui/react-dialog",
              "@radix-ui/react-dropdown-menu",
              "@radix-ui/react-hover-card",
              "@radix-ui/react-label",
              "@radix-ui/react-menubar",
              "@radix-ui/react-navigation-menu",
              "@radix-ui/react-popover",
              "@radix-ui/react-progress",
              "@radix-ui/react-radio-group",
              "@radix-ui/react-scroll-area",
              "@radix-ui/react-select",
              "@radix-ui/react-separator",
              "@radix-ui/react-slider",
              "@radix-ui/react-slot",
              "@radix-ui/react-switch",
              "@radix-ui/react-tabs",
              "@radix-ui/react-toast",
              "@radix-ui/react-toggle",
              "@radix-ui/react-toggle-group",
              "@radix-ui/react-tooltip"
            ],
            "form-vendor": ["react-hook-form", "@hookform/resolvers", "zod"],
            "utils-vendor": [
              "axios",
              "clsx",
              "tailwind-merge",
              "class-variance-authority",
              "date-fns",
              "lucide-react"
            ],
            "query-vendor": ["@tanstack/react-query"]
          }
        }
      },
      chunkSizeWarningLimit: 1e3
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAicHJlcmVuZGVyL2Jsb2ctcm91dGVzLmpzIiwgInByZXJlbmRlci91dGlscy5qcyIsICJwcmVyZW5kZXIvYmxvZy1zaXRlbWFwLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL21hYy9Eb3dubG9hZHMvRllQIERldmVsb3BtZW50IEhlbHAgUmVxdWVzdCAoMSkvYXBwL2Zyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvbWFjL0Rvd25sb2Fkcy9GWVAgRGV2ZWxvcG1lbnQgSGVscCBSZXF1ZXN0ICgxKS9hcHAvZnJvbnRlbmQvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL21hYy9Eb3dubG9hZHMvRllQJTIwRGV2ZWxvcG1lbnQlMjBIZWxwJTIwUmVxdWVzdCUyMCgxKS9hcHAvZnJvbnRlbmQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2MnO1xuaW1wb3J0IGZzIGZyb20gJ25vZGU6ZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyB2aXRlU291cmNlTG9jYXRvciB9IGZyb20gJ0BtZXRhZ3B0eC92aXRlLXBsdWdpbi1zb3VyY2UtbG9jYXRvcic7XG5pbXBvcnQgeyBhdG9tcyB9IGZyb20gJ0BtZXRhZ3B0eC93ZWItc2RrL3BsdWdpbnMnO1xuaW1wb3J0IHsgdml0ZVByZXJlbmRlclBsdWdpbiB9IGZyb20gJ3ZpdGUtcHJlcmVuZGVyLXBsdWdpbic7XG5pbXBvcnQgU2l0ZW1hcCBmcm9tICd2aXRlLXBsdWdpbi1zaXRlbWFwJztcbmltcG9ydCB7IGdldEJsb2dSb3V0ZXMgfSBmcm9tICcuL3ByZXJlbmRlci9ibG9nLXJvdXRlcy5qcyc7XG5pbXBvcnQgeyBnZXRTaXRlbWFwTGFzdG1vZCB9IGZyb20gJy4vcHJlcmVuZGVyL2Jsb2ctc2l0ZW1hcC5qcyc7XG5cbmZ1bmN0aW9uIGVzY2FwZUh0bWxBdHRyKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHN0clxuICAgIC5yZXBsYWNlKC8mL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpXG4gICAgLnJlcGxhY2UoLycvZywgJyYjMzk7Jyk7XG59XG5cbnByb2Nlc3MuZW52LlZJVEVfQVBQX1RJVExFID0gJ0N5YmVyU2hpZWxkIEFJIC0gQ3liZXJjcmltZSBHdWlkYW5jZSc7XG5wcm9jZXNzLmVudi5WSVRFX0FQUF9ERVNDUklQVElPTiA9ICdBSS1wb3dlcmVkIGN5YmVyY3JpbWUgZ3VpZGFuY2UgZm9yIHZpY3RpbXMgaW4gUGFraXN0YW4uIEdldCBpbnN0YW50IGhlbHAsIGV2aWRlbmNlIGNvbGxlY3Rpb24gdGlwcywgYW5kIGxlZ2FsIGd1aWRhbmNlIHVuZGVyIFBFQ0EgMjAxNi4nO1xucHJvY2Vzcy5lbnYuVklURV9BUFBfTE9HT19VUkwgPz89IHByb2Nlc3MuZW52Lk9WRVJWSUVXX0xPR09fVVJMID8/ICdodHRwczovL3B1YmxpYy1mcm9udGVuZC1jb3MubWV0YWRsLmNvbS9tZ3gvaW1nL2Zhdmljb25fYXRvbXMuaWNvJztcblxuZnVuY3Rpb24gZW5zdXJlQnVpbGRPdXREaXIoKSB7XG4gIGxldCBvdXREaXIgPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnZGlzdCcpO1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2Vuc3VyZS1idWlsZC1vdXQtZGlyJyxcbiAgICBjb25maWdSZXNvbHZlZChjb25maWcpIHtcbiAgICAgIG91dERpciA9IHBhdGgucmVzb2x2ZShjb25maWcucm9vdCwgY29uZmlnLmJ1aWxkLm91dERpcik7XG4gICAgfSxcbiAgICB3cml0ZUJ1bmRsZSgpIHtcbiAgICAgIGZzLm1rZGlyU3luYyhvdXREaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgIH0sXG4gIH07XG59XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgY29tbWFuZCB9KSA9PiB7XG4gIGNvbnN0IGJsb2dQcmVyZW5kZXJSb3V0ZXMgPSBjb21tYW5kID09PSAnYnVpbGQnID8gZ2V0QmxvZ1JvdXRlcygpIDogW107XG5cbiAgcmV0dXJuIHtcbiAgICBwbHVnaW5zOiBbXG4gICAgICB2aXRlU291cmNlTG9jYXRvcih7XG4gICAgICAgIHByZWZpeDogJ21neCcsIC8vIFByZWZpeCB1c2VkIHRvIGlkZW50aWZ5IHNvdXJjZSBsb2NhdGlvbnM7IGRvIG5vdCBjaGFuZ2UuXG4gICAgICB9KSxcbiAgICAgIHJlYWN0KCksXG4gICAgICBhdG9tcygpLFxuICAgICAgZW5zdXJlQnVpbGRPdXREaXIoKSxcbiAgICAgIFNpdGVtYXAoe1xuICAgICAgICBob3N0bmFtZTogJ2h0dHBzOi8vYXRvbXMudGVtcGxhdGUuY29tJyxcbiAgICAgICAgbGFzdG1vZDogZ2V0U2l0ZW1hcExhc3Rtb2QoKSxcbiAgICAgICAgcmVhZGFibGU6IHRydWUsXG4gICAgICAgIGdlbmVyYXRlUm9ib3RzVHh0OiB0cnVlLFxuICAgICAgfSksXG4gICAgICAuLi4oYmxvZ1ByZXJlbmRlclJvdXRlcy5sZW5ndGggPiAwXG4gICAgICAgID8gdml0ZVByZXJlbmRlclBsdWdpbih7XG4gICAgICAgICAgICByZW5kZXJUYXJnZXQ6ICcjcm9vdCcsXG4gICAgICAgICAgICBwcmVyZW5kZXJTY3JpcHQ6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdwcmVyZW5kZXIvYmxvZy5qcycpLFxuICAgICAgICAgICAgYWRkaXRpb25hbFByZXJlbmRlclJvdXRlczogYmxvZ1ByZXJlbmRlclJvdXRlcyxcbiAgICAgICAgICB9KVxuICAgICAgICA6IFtdKSxcbiAgICBdLFxuICAgIHJlc29sdmU6IHtcbiAgICAgIGFsaWFzOiB7XG4gICAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJyksXG4gICAgICB9LFxuICAgIH0sXG4gICAgc2VydmVyOiB7XG4gICAgICBob3N0OiAnMC4wLjAuMCcsIC8vIExpc3RlbiBvbiBhbGwgbmV0d29yayBpbnRlcmZhY2VzLlxuICAgICAgcG9ydDogcGFyc2VJbnQocHJvY2Vzcy5lbnYuVklURV9QT1JUIHx8ICczMDAwJyksXG4gICAgICBwcm94eToge1xuICAgICAgICAnL2FwaSc6IHtcbiAgICAgICAgICB0YXJnZXQ6IGBodHRwOi8vbG9jYWxob3N0OiR7cHJvY2Vzcy5lbnYuQkFDS0VORF9QT1JUIHx8ICc4MDAwJ31gLFxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICB3YXRjaDogeyB1c2VQb2xsaW5nOiB0cnVlLCBpbnRlcnZhbDogNjAwIH0sXG4gICAgfSxcbiAgICBidWlsZDoge1xuICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICBvdXRwdXQ6IHtcbiAgICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICAgIC8vIFZlbmRvciBjaHVua3NcbiAgICAgICAgICAgICdyZWFjdC12ZW5kb3InOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbSddLFxuICAgICAgICAgICAgJ3JvdXRlci12ZW5kb3InOiBbJ3JlYWN0LXJvdXRlci1kb20nXSxcbiAgICAgICAgICAgICd1aS12ZW5kb3InOiBbXG4gICAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3QtYWNjb3JkaW9uJyxcbiAgICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC1hbGVydC1kaWFsb2cnLFxuICAgICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LWFzcGVjdC1yYXRpbycsXG4gICAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3QtYXZhdGFyJyxcbiAgICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC1jaGVja2JveCcsXG4gICAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3QtY29sbGFwc2libGUnLFxuICAgICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LWNvbnRleHQtbWVudScsXG4gICAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3QtZGlhbG9nJyxcbiAgICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC1kcm9wZG93bi1tZW51JyxcbiAgICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC1ob3Zlci1jYXJkJyxcbiAgICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC1sYWJlbCcsXG4gICAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3QtbWVudWJhcicsXG4gICAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3QtbmF2aWdhdGlvbi1tZW51JyxcbiAgICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC1wb3BvdmVyJyxcbiAgICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC1wcm9ncmVzcycsXG4gICAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3QtcmFkaW8tZ3JvdXAnLFxuICAgICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LXNjcm9sbC1hcmVhJyxcbiAgICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC1zZWxlY3QnLFxuICAgICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LXNlcGFyYXRvcicsXG4gICAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3Qtc2xpZGVyJyxcbiAgICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC1zbG90JyxcbiAgICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC1zd2l0Y2gnLFxuICAgICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LXRhYnMnLFxuICAgICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LXRvYXN0JyxcbiAgICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC10b2dnbGUnLFxuICAgICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LXRvZ2dsZS1ncm91cCcsXG4gICAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3QtdG9vbHRpcCcsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ2Zvcm0tdmVuZG9yJzogWydyZWFjdC1ob29rLWZvcm0nLCAnQGhvb2tmb3JtL3Jlc29sdmVycycsICd6b2QnXSxcbiAgICAgICAgICAgICd1dGlscy12ZW5kb3InOiBbXG4gICAgICAgICAgICAgICdheGlvcycsXG4gICAgICAgICAgICAgICdjbHN4JyxcbiAgICAgICAgICAgICAgJ3RhaWx3aW5kLW1lcmdlJyxcbiAgICAgICAgICAgICAgJ2NsYXNzLXZhcmlhbmNlLWF1dGhvcml0eScsXG4gICAgICAgICAgICAgICdkYXRlLWZucycsXG4gICAgICAgICAgICAgICdsdWNpZGUtcmVhY3QnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdxdWVyeS12ZW5kb3InOiBbJ0B0YW5zdGFjay9yZWFjdC1xdWVyeSddLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAxMDAwLFxuICAgIH0sXG4gIH07XG59KTtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL21hYy9Eb3dubG9hZHMvRllQIERldmVsb3BtZW50IEhlbHAgUmVxdWVzdCAoMSkvYXBwL2Zyb250ZW5kL3ByZXJlbmRlclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL21hYy9Eb3dubG9hZHMvRllQIERldmVsb3BtZW50IEhlbHAgUmVxdWVzdCAoMSkvYXBwL2Zyb250ZW5kL3ByZXJlbmRlci9ibG9nLXJvdXRlcy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvbWFjL0Rvd25sb2Fkcy9GWVAlMjBEZXZlbG9wbWVudCUyMEhlbHAlMjBSZXF1ZXN0JTIwKDEpL2FwcC9mcm9udGVuZC9wcmVyZW5kZXIvYmxvZy1yb3V0ZXMuanNcIjtpbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IHsgc2VvQ29udGVudERpciwgbm9ybWFsaXplUm91dGVGcm9tTWFya2Rvd24sIGNvbGxlY3RNYXJrZG93bkZpbGVzIH0gZnJvbSAnLi91dGlscy5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRCbG9nUm91dGVzKCkge1xuICBjb25zdCByb3V0ZXMgPSBuZXcgU2V0KFsnL2Jsb2cvJ10pO1xuXG4gIGZvciAoY29uc3QgZmlsZVBhdGggb2YgY29sbGVjdE1hcmtkb3duRmlsZXMoc2VvQ29udGVudERpcikpIHtcbiAgICBjb25zdCByZWxhdGl2ZVBhdGggPSBwYXRoLnJlbGF0aXZlKHNlb0NvbnRlbnREaXIsIGZpbGVQYXRoKTtcbiAgICByb3V0ZXMuYWRkKG5vcm1hbGl6ZVJvdXRlRnJvbU1hcmtkb3duKHJlbGF0aXZlUGF0aCkpO1xuICB9XG5cbiAgcmV0dXJuIEFycmF5LmZyb20ocm91dGVzKS5zb3J0KCk7XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9tYWMvRG93bmxvYWRzL0ZZUCBEZXZlbG9wbWVudCBIZWxwIFJlcXVlc3QgKDEpL2FwcC9mcm9udGVuZC9wcmVyZW5kZXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9tYWMvRG93bmxvYWRzL0ZZUCBEZXZlbG9wbWVudCBIZWxwIFJlcXVlc3QgKDEpL2FwcC9mcm9udGVuZC9wcmVyZW5kZXIvdXRpbHMuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL21hYy9Eb3dubG9hZHMvRllQJTIwRGV2ZWxvcG1lbnQlMjBIZWxwJTIwUmVxdWVzdCUyMCgxKS9hcHAvZnJvbnRlbmQvcHJlcmVuZGVyL3V0aWxzLmpzXCI7aW1wb3J0IGZzIGZyb20gJ25vZGU6ZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJztcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tICdub2RlOnVybCc7XG5cbmNvbnN0IGN1cnJlbnRGaWxlID0gZmlsZVVSTFRvUGF0aChpbXBvcnQubWV0YS51cmwpO1xuY29uc3QgX19kaXJuYW1lID0gcGF0aC5kaXJuYW1lKGN1cnJlbnRGaWxlKTtcbmNvbnN0IHByb2plY3RSb290ID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uJyk7XG5cbmV4cG9ydCBjb25zdCBzZW9Db250ZW50RGlyID0gcGF0aC5yZXNvbHZlKHByb2plY3RSb290LCAnc2VvJywgJ2NvbnRlbnQnKTtcblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZVJvdXRlRnJvbU1hcmtkb3duKHJlbGF0aXZlUGF0aCkge1xuICBjb25zdCBub3JtYWxpemVkID0gcmVsYXRpdmVQYXRoXG4gICAgLnJlcGxhY2UoL1xcXFwvZywgJy8nKVxuICAgIC5yZXBsYWNlKC9cXC9pbmRleFxcLm1kJC8sICcnKVxuICAgIC5yZXBsYWNlKC9cXC5tZCQvLCAnJyk7XG5cbiAgcmV0dXJuIG5vcm1hbGl6ZWQgPyBgL2Jsb2cvJHtub3JtYWxpemVkfS9gIDogJy9ibG9nLyc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb2xsZWN0TWFya2Rvd25GaWxlcyhkaXIsIGJ1Y2tldCA9IFtdKSB7XG4gIGlmICghZnMuZXhpc3RzU3luYyhkaXIpKSB7XG4gICAgcmV0dXJuIGJ1Y2tldDtcbiAgfVxuXG4gIGZvciAoY29uc3QgZW50cnkgb2YgZnMucmVhZGRpclN5bmMoZGlyLCB7IHdpdGhGaWxlVHlwZXM6IHRydWUgfSkpIHtcbiAgICBpZiAoZW50cnkubmFtZS5zdGFydHNXaXRoKCcuJykpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGNvbnN0IGZ1bGxQYXRoID0gcGF0aC5qb2luKGRpciwgZW50cnkubmFtZSk7XG4gICAgaWYgKGVudHJ5LmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgIGNvbGxlY3RNYXJrZG93bkZpbGVzKGZ1bGxQYXRoLCBidWNrZXQpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKGVudHJ5LmlzRmlsZSgpICYmIGVudHJ5Lm5hbWUuZW5kc1dpdGgoJy5tZCcpKSB7XG4gICAgICBidWNrZXQucHVzaChmdWxsUGF0aCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ1Y2tldDtcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL21hYy9Eb3dubG9hZHMvRllQIERldmVsb3BtZW50IEhlbHAgUmVxdWVzdCAoMSkvYXBwL2Zyb250ZW5kL3ByZXJlbmRlclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL21hYy9Eb3dubG9hZHMvRllQIERldmVsb3BtZW50IEhlbHAgUmVxdWVzdCAoMSkvYXBwL2Zyb250ZW5kL3ByZXJlbmRlci9ibG9nLXNpdGVtYXAuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL21hYy9Eb3dubG9hZHMvRllQJTIwRGV2ZWxvcG1lbnQlMjBIZWxwJTIwUmVxdWVzdCUyMCgxKS9hcHAvZnJvbnRlbmQvcHJlcmVuZGVyL2Jsb2ctc2l0ZW1hcC5qc1wiO2ltcG9ydCBmcyBmcm9tICdub2RlOmZzJztcbmltcG9ydCBwYXRoIGZyb20gJ25vZGU6cGF0aCc7XG5pbXBvcnQgeyBzZW9Db250ZW50RGlyLCBub3JtYWxpemVSb3V0ZUZyb21NYXJrZG93biwgY29sbGVjdE1hcmtkb3duRmlsZXMgfSBmcm9tICcuL3V0aWxzLmpzJztcblxuZnVuY3Rpb24gY29sbGVjdE1hcmtkb3duTGFzdG1vZChkaXIpIHtcbiAgY29uc3QgYnVja2V0ID0ge307XG5cbiAgZm9yIChjb25zdCBmdWxsUGF0aCBvZiBjb2xsZWN0TWFya2Rvd25GaWxlcyhkaXIpKSB7XG4gICAgY29uc3QgcmVsYXRpdmVQYXRoID0gcGF0aC5yZWxhdGl2ZShzZW9Db250ZW50RGlyLCBmdWxsUGF0aCk7XG4gICAgY29uc3Qgcm91dGUgPSBub3JtYWxpemVSb3V0ZUZyb21NYXJrZG93bihyZWxhdGl2ZVBhdGgpO1xuICAgIGJ1Y2tldFtyb3V0ZV0gPSBmcy5zdGF0U3luYyhmdWxsUGF0aCkubXRpbWU7XG4gIH1cblxuICByZXR1cm4gYnVja2V0O1xufVxuXG5mdW5jdGlvbiBnZXRMYXRlc3RDb250ZW50TXRpbWUobGFzdG1vZE1hcCkge1xuICBjb25zdCBkYXRlcyA9IE9iamVjdC52YWx1ZXMobGFzdG1vZE1hcCkuZmlsdGVyKCh2YWx1ZSkgPT4gdmFsdWUgaW5zdGFuY2VvZiBEYXRlKTtcblxuICBpZiAoZGF0ZXMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIHJldHVybiBuZXcgRGF0ZShNYXRoLm1heCguLi5kYXRlcy5tYXAoKGRhdGUpID0+IGRhdGUuZ2V0VGltZSgpKSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2l0ZW1hcExhc3Rtb2QoKSB7XG4gIGNvbnN0IGNvbnRlbnRMYXN0bW9kID0gY29sbGVjdE1hcmtkb3duTGFzdG1vZChzZW9Db250ZW50RGlyKTtcbiAgY29uc3QgbGF0ZXN0Q29udGVudE10aW1lID0gZ2V0TGF0ZXN0Q29udGVudE10aW1lKGNvbnRlbnRMYXN0bW9kKTtcblxuICByZXR1cm4ge1xuICAgIC4uLihsYXRlc3RDb250ZW50TXRpbWUgPyB7ICcvYmxvZy8nOiBsYXRlc3RDb250ZW50TXRpbWUgfSA6IHt9KSxcbiAgICAuLi5jb250ZW50TGFzdG1vZCxcbiAgfTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBZ1ksU0FBUyxvQkFBb0I7QUFDN1osT0FBTyxXQUFXO0FBQ2xCLE9BQU9BLFNBQVE7QUFDZixPQUFPQyxXQUFVO0FBQ2pCLFNBQVMseUJBQXlCO0FBQ2xDLFNBQVMsYUFBYTtBQUN0QixTQUFTLDJCQUEyQjtBQUNwQyxPQUFPLGFBQWE7OztBQ1AwWSxPQUFPQyxXQUFVOzs7QUNBN0IsT0FBTyxRQUFRO0FBQ2phLE9BQU8sVUFBVTtBQUNqQixTQUFTLHFCQUFxQjtBQUY0TixJQUFNLDJDQUEyQztBQUkzUyxJQUFNLGNBQWMsY0FBYyx3Q0FBZTtBQUNqRCxJQUFNQyxhQUFZLEtBQUssUUFBUSxXQUFXO0FBQzFDLElBQU0sY0FBYyxLQUFLLFFBQVFBLFlBQVcsSUFBSTtBQUV6QyxJQUFNLGdCQUFnQixLQUFLLFFBQVEsYUFBYSxPQUFPLFNBQVM7QUFFaEUsU0FBUywyQkFBMkIsY0FBYztBQUN2RCxRQUFNLGFBQWEsYUFDaEIsUUFBUSxPQUFPLEdBQUcsRUFDbEIsUUFBUSxnQkFBZ0IsRUFBRSxFQUMxQixRQUFRLFNBQVMsRUFBRTtBQUV0QixTQUFPLGFBQWEsU0FBUyxVQUFVLE1BQU07QUFDL0M7QUFFTyxTQUFTLHFCQUFxQixLQUFLLFNBQVMsQ0FBQyxHQUFHO0FBQ3JELE1BQUksQ0FBQyxHQUFHLFdBQVcsR0FBRyxHQUFHO0FBQ3ZCLFdBQU87QUFBQSxFQUNUO0FBRUEsYUFBVyxTQUFTLEdBQUcsWUFBWSxLQUFLLEVBQUUsZUFBZSxLQUFLLENBQUMsR0FBRztBQUNoRSxRQUFJLE1BQU0sS0FBSyxXQUFXLEdBQUcsR0FBRztBQUM5QjtBQUFBLElBQ0Y7QUFFQSxVQUFNLFdBQVcsS0FBSyxLQUFLLEtBQUssTUFBTSxJQUFJO0FBQzFDLFFBQUksTUFBTSxZQUFZLEdBQUc7QUFDdkIsMkJBQXFCLFVBQVUsTUFBTTtBQUNyQztBQUFBLElBQ0Y7QUFFQSxRQUFJLE1BQU0sT0FBTyxLQUFLLE1BQU0sS0FBSyxTQUFTLEtBQUssR0FBRztBQUNoRCxhQUFPLEtBQUssUUFBUTtBQUFBLElBQ3RCO0FBQUEsRUFDRjtBQUVBLFNBQU87QUFDVDs7O0FEdENPLFNBQVMsZ0JBQWdCO0FBQzlCLFFBQU0sU0FBUyxvQkFBSSxJQUFJLENBQUMsUUFBUSxDQUFDO0FBRWpDLGFBQVcsWUFBWSxxQkFBcUIsYUFBYSxHQUFHO0FBQzFELFVBQU0sZUFBZUMsTUFBSyxTQUFTLGVBQWUsUUFBUTtBQUMxRCxXQUFPLElBQUksMkJBQTJCLFlBQVksQ0FBQztBQUFBLEVBQ3JEO0FBRUEsU0FBTyxNQUFNLEtBQUssTUFBTSxFQUFFLEtBQUs7QUFDakM7OztBRVpnYSxPQUFPQyxTQUFRO0FBQy9hLE9BQU9DLFdBQVU7QUFHakIsU0FBUyx1QkFBdUIsS0FBSztBQUNuQyxRQUFNLFNBQVMsQ0FBQztBQUVoQixhQUFXLFlBQVkscUJBQXFCLEdBQUcsR0FBRztBQUNoRCxVQUFNLGVBQWVDLE1BQUssU0FBUyxlQUFlLFFBQVE7QUFDMUQsVUFBTSxRQUFRLDJCQUEyQixZQUFZO0FBQ3JELFdBQU8sS0FBSyxJQUFJQyxJQUFHLFNBQVMsUUFBUSxFQUFFO0FBQUEsRUFDeEM7QUFFQSxTQUFPO0FBQ1Q7QUFFQSxTQUFTLHNCQUFzQixZQUFZO0FBQ3pDLFFBQU0sUUFBUSxPQUFPLE9BQU8sVUFBVSxFQUFFLE9BQU8sQ0FBQyxVQUFVLGlCQUFpQixJQUFJO0FBRS9FLE1BQUksTUFBTSxXQUFXLEdBQUc7QUFDdEIsV0FBTztBQUFBLEVBQ1Q7QUFFQSxTQUFPLElBQUksS0FBSyxLQUFLLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxTQUFTLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQztBQUNsRTtBQUVPLFNBQVMsb0JBQW9CO0FBQ2xDLFFBQU0saUJBQWlCLHVCQUF1QixhQUFhO0FBQzNELFFBQU0scUJBQXFCLHNCQUFzQixjQUFjO0FBRS9ELFNBQU87QUFBQSxJQUNMLEdBQUkscUJBQXFCLEVBQUUsVUFBVSxtQkFBbUIsSUFBSSxDQUFDO0FBQUEsSUFDN0QsR0FBRztBQUFBLEVBQ0w7QUFDRjs7O0FIbENBLElBQU0sbUNBQW1DO0FBb0J6QyxRQUFRLElBQUksaUJBQWlCO0FBQzdCLFFBQVEsSUFBSSx1QkFBdUI7QUFDbkMsUUFBUSxJQUFJLHNCQUFzQixRQUFRLElBQUkscUJBQXFCO0FBRW5FLFNBQVMsb0JBQW9CO0FBQzNCLE1BQUksU0FBU0MsTUFBSyxRQUFRLGtDQUFXLE1BQU07QUFFM0MsU0FBTztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sZUFBZSxRQUFRO0FBQ3JCLGVBQVNBLE1BQUssUUFBUSxPQUFPLE1BQU0sT0FBTyxNQUFNLE1BQU07QUFBQSxJQUN4RDtBQUFBLElBQ0EsY0FBYztBQUNaLE1BQUFDLElBQUcsVUFBVSxRQUFRLEVBQUUsV0FBVyxLQUFLLENBQUM7QUFBQSxJQUMxQztBQUFBLEVBQ0Y7QUFDRjtBQUdBLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsUUFBUSxNQUFNO0FBQzNDLFFBQU0sc0JBQXNCLFlBQVksVUFBVSxjQUFjLElBQUksQ0FBQztBQUVyRSxTQUFPO0FBQUEsSUFDTCxTQUFTO0FBQUEsTUFDUCxrQkFBa0I7QUFBQSxRQUNoQixRQUFRO0FBQUE7QUFBQSxNQUNWLENBQUM7QUFBQSxNQUNELE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLGtCQUFrQjtBQUFBLE1BQ2xCLFFBQVE7QUFBQSxRQUNOLFVBQVU7QUFBQSxRQUNWLFNBQVMsa0JBQWtCO0FBQUEsUUFDM0IsVUFBVTtBQUFBLFFBQ1YsbUJBQW1CO0FBQUEsTUFDckIsQ0FBQztBQUFBLE1BQ0QsR0FBSSxvQkFBb0IsU0FBUyxJQUM3QixvQkFBb0I7QUFBQSxRQUNsQixjQUFjO0FBQUEsUUFDZCxpQkFBaUJELE1BQUssUUFBUSxrQ0FBVyxtQkFBbUI7QUFBQSxRQUM1RCwyQkFBMkI7QUFBQSxNQUM3QixDQUFDLElBQ0QsQ0FBQztBQUFBLElBQ1A7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLEtBQUtBLE1BQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsTUFDdEM7QUFBQSxJQUNGO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUE7QUFBQSxNQUNOLE1BQU0sU0FBUyxRQUFRLElBQUksYUFBYSxNQUFNO0FBQUEsTUFDOUMsT0FBTztBQUFBLFFBQ0wsUUFBUTtBQUFBLFVBQ04sUUFBUSxvQkFBb0IsUUFBUSxJQUFJLGdCQUFnQixNQUFNO0FBQUEsVUFDOUQsY0FBYztBQUFBLFFBQ2hCO0FBQUEsTUFDRjtBQUFBLE1BQ0EsT0FBTyxFQUFFLFlBQVksTUFBTSxVQUFVLElBQUk7QUFBQSxJQUMzQztBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0wsZUFBZTtBQUFBLFFBQ2IsUUFBUTtBQUFBLFVBQ04sY0FBYztBQUFBO0FBQUEsWUFFWixnQkFBZ0IsQ0FBQyxTQUFTLFdBQVc7QUFBQSxZQUNyQyxpQkFBaUIsQ0FBQyxrQkFBa0I7QUFBQSxZQUNwQyxhQUFhO0FBQUEsY0FDWDtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsWUFDRjtBQUFBLFlBQ0EsZUFBZSxDQUFDLG1CQUFtQix1QkFBdUIsS0FBSztBQUFBLFlBQy9ELGdCQUFnQjtBQUFBLGNBQ2Q7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLFlBQ0Y7QUFBQSxZQUNBLGdCQUFnQixDQUFDLHVCQUF1QjtBQUFBLFVBQzFDO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxNQUNBLHVCQUF1QjtBQUFBLElBQ3pCO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbImZzIiwgInBhdGgiLCAicGF0aCIsICJfX2Rpcm5hbWUiLCAicGF0aCIsICJmcyIsICJwYXRoIiwgInBhdGgiLCAiZnMiLCAicGF0aCIsICJmcyJdCn0K
