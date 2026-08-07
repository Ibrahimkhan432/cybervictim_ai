import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { loadRuntimeConfig } from './lib/config.ts';

// Force correct browser tab title — overrides any platform-injected title
document.title = 'CyberShield AI - Cybercrime Guidance';

// Observe and revert any external title changes (e.g., platform scripts)
const titleObserver = new MutationObserver(() => {
  if (document.title !== 'CyberShield AI - Cybercrime Guidance') {
    document.title = 'CyberShield AI - Cybercrime Guidance';
  }
});
const titleEl = document.querySelector('title');
if (titleEl) {
  titleObserver.observe(titleEl, { childList: true, characterData: true, subtree: true });
}

// Load runtime configuration before rendering the app
async function initializeApp() {
  // Prerendered blog pages are served as pure static HTML for SEO.
  // Intentionally skip React mounting so the crawler-facing markup stays
  // lightweight and self-contained — no client-side hydration needed.
  if (
    document
      .querySelector('meta[name="prerender-static-page"]')
      ?.getAttribute('content') === 'blog'
  ) {
    return;
  }

  try {
    await loadRuntimeConfig();
    console.log('Runtime configuration loaded successfully');
  } catch (error) {
    console.warn(
      'Failed to load runtime configuration, using defaults:',
      error
    );
  }

  // Render the app
  createRoot(document.getElementById('root')!).render(<App />);
}

// Initialize the app
initializeApp();
