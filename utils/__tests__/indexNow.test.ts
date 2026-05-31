import { createIndexNowPayload, getIndexNowConfigFromEnv } from '@/utils/indexNow';

describe('IndexNow helpers', () => {
  it('builds a deduplicated payload without submitting anything', () => {
    expect(
      createIndexNowPayload(
        {
          host: 'cosmicsignature.com',
          key: 'test-key',
          keyLocation: 'https://cosmicsignature.com/test-key.txt',
        },
        [
          'https://cosmicsignature.com/',
          'https://cosmicsignature.com/',
          'https://app.cosmicsignature.com/statistics',
          '',
        ],
      ),
    ).toEqual({
      host: 'cosmicsignature.com',
      key: 'test-key',
      keyLocation: 'https://cosmicsignature.com/test-key.txt',
      urlList: ['https://cosmicsignature.com/', 'https://app.cosmicsignature.com/statistics'],
    });
  });

  it('requires a real env key and host before IndexNow can be enabled', () => {
    expect(getIndexNowConfigFromEnv({})).toBeNull();
    expect(getIndexNowConfigFromEnv({ INDEXNOW_KEY: 'key' })).toBeNull();
    expect(getIndexNowConfigFromEnv({ INDEXNOW_HOST: 'cosmicsignature.com' })).toBeNull();
    expect(
      getIndexNowConfigFromEnv({
        INDEXNOW_KEY: 'key',
        INDEXNOW_HOST: 'cosmicsignature.com',
      }),
    ).toEqual({ key: 'key', host: 'cosmicsignature.com' });
  });
});
