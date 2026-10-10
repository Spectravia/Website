/** Typed access to `config/site.config.ts` (exposed through app.config). */
export function useSite() {
  return useAppConfig().site
}
