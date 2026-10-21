/** Typed access to `config/site.config.ts` (exposed through app.config). */
export function useSite() {
  const site = useAppConfig().site
  return {
    ...site,
    /** Assembled at call time so the address never appears in the page source. */
    contactEmail: () => `${site.contact.emailUser}@${site.contact.emailDomain}`,
  }
}
