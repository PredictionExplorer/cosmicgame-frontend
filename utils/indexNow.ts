const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

export interface IndexNowConfig {
  host: string;
  key: string;
  keyLocation?: string;
}

export interface IndexNowPayload {
  host: string;
  key: string;
  keyLocation?: string;
  urlList: string[];
}

export function createIndexNowPayload(
  config: IndexNowConfig,
  urls: readonly string[],
): IndexNowPayload {
  const uniqueUrls = [...new Set(urls.map((url) => url.trim()).filter(Boolean))];
  return {
    host: config.host,
    key: config.key,
    ...(config.keyLocation ? { keyLocation: config.keyLocation } : {}),
    urlList: uniqueUrls,
  };
}

export function getIndexNowConfigFromEnv(
  env: Record<string, string | undefined> = process.env,
): IndexNowConfig | null {
  const key = env.INDEXNOW_KEY?.trim();
  const host = env.INDEXNOW_HOST?.trim();

  if (!key || !host) return null;

  return {
    host,
    key,
    ...(env.INDEXNOW_KEY_LOCATION?.trim() ? { keyLocation: env.INDEXNOW_KEY_LOCATION.trim() } : {}),
  };
}

export async function submitIndexNowUrls(
  config: IndexNowConfig,
  urls: readonly string[],
): Promise<Response> {
  const payload = createIndexNowPayload(config, urls);
  return fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
