import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration, withEventReplay, withIncrementalHydration } from '@angular/platform-browser';
import { UrlSerializer, provideRouter } from '@angular/router';
import { TrailingSlashSerializer } from './shared/trailing-slash';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter([]),
    // The page body is `@defer (hydrate never)`: prerendered HTML, its code chunk is never downloaded.
    provideClientHydration(withEventReplay(), withIncrementalHydration()),
    { provide: UrlSerializer, useClass: TrailingSlashSerializer },
  ],
};
