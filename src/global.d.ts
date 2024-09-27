import type { ClientApi } from '../server/preload';

declare global {
  interface Window {
    api: ClientApi;
  }
}
