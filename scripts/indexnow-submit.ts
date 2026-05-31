import { getIndexNowConfigFromEnv, submitIndexNowUrls } from '@/utils/indexNow';

async function main() {
  const config = getIndexNowConfigFromEnv();
  const urls = process.argv.slice(2);

  if (!config) {
    throw new Error('Set INDEXNOW_KEY and INDEXNOW_HOST before submitting IndexNow URLs.');
  }

  if (urls.length === 0) {
    throw new Error('Pass at least one absolute URL to submit.');
  }

  const response = await submitIndexNowUrls(config, urls);
  if (!response.ok) {
    throw new Error(`IndexNow submission failed with HTTP ${response.status}.`);
  }

  console.warn(`Submitted ${urls.length} URL(s) to IndexNow for ${config.host}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
