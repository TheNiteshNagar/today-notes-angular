import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent as App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err: unknown) => {
    const msg = err instanceof Error ? err.message.replace(/[\r\n]/g, ' ') : 'Bootstrap failed';
    console.error('[App] Failed to bootstrap:', msg);
  });
