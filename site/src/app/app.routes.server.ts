import { RenderMode, ServerRoute } from '@angular/ssr';

// One page, prerendered to static HTML for GitHub Pages.
export const serverRoutes: ServerRoute[] = [{ path: '**', renderMode: RenderMode.Prerender }];
