
export const fetchWithTenant = async (input: RequestInfo | URL, init?: RequestInit) => {
  let tenantSlug = '';
  try {
    const reqHeaders = await headers();
    const host = reqHeaders.get('host') || '';
    const hostname = host.split(':')[0];
    
    // Check if it's a tenant subdomain
    if (hostname.endsWith('.kalvixnexus.com')) {
      tenantSlug = hostname.replace('.kalvixnexus.com', '');
    } else if (hostname !== 'localhost' && hostname !== 'kalvixnexus.com' && hostname !== 'www.kalvixnexus.com') {
      // It might be a custom domain, but for now we just pass the hostname itself, or the backend resolves it
      // Actually backend resolves by custom domain if slug is empty, so we just pass host
      tenantSlug = hostname;
    }
  } catch (e) {
    // headers() throws if used outside a request context (like in generateStaticParams)
  }

  const newInit: RequestInit = { ...init };
  newInit.headers = {
    ...newInit.headers,
  };
  
  if (tenantSlug) {
    (newInit.headers as any)['x-tenant-slug'] = tenantSlug;
  }
  
  // Also pass original host just in case backend needs it for custom domain lookup
  try {
    const reqHeaders = await headers();
    const host = reqHeaders.get('host') || '';
    if (host) {
      (newInit.headers as any)['x-forwarded-host'] = host;
    }
  } catch(e) {}

  return fetch(input, newInit);
};
