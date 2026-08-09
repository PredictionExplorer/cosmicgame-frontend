import { getClientBuildInfo, isVercelProductionDeploy } from '../buildInfo';

const FULL_SHA = 'deadbeef1234567890abcdef1234567890abcdef';

describe('getClientBuildInfo', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('returns null when no commit was baked into the bundle', () => {
    delete process.env.NEXT_PUBLIC_BUILD_COMMIT;

    expect(getClientBuildInfo()).toBeNull();
  });

  it('returns null for a blank commit rather than an empty build stamp', () => {
    // An unset Vercel variable often arrives as an empty string, and a
    // whitespace-only value would otherwise render as a blank footer line.
    process.env.NEXT_PUBLIC_BUILD_COMMIT = '   ';

    expect(getClientBuildInfo()).toBeNull();
  });

  it('shortens a full sha to seven characters and keeps the original', () => {
    process.env.NEXT_PUBLIC_BUILD_COMMIT = FULL_SHA;
    process.env.NEXT_PUBLIC_BUILD_REF = 'main';

    expect(getClientBuildInfo()).toEqual({
      shortSha: 'deadbee',
      fullSha: FULL_SHA,
      ref: 'main',
    });
  });

  it('leaves a sha shorter than seven characters intact', () => {
    process.env.NEXT_PUBLIC_BUILD_COMMIT = 'abc12';

    expect(getClientBuildInfo()).toMatchObject({ shortSha: 'abc12', fullSha: 'abc12' });
  });

  it('keeps a sha of exactly seven characters unchanged', () => {
    process.env.NEXT_PUBLIC_BUILD_COMMIT = 'abc1234';

    expect(getClientBuildInfo()!.shortSha).toBe('abc1234');
  });

  it('trims surrounding whitespace from both the sha and the ref', () => {
    process.env.NEXT_PUBLIC_BUILD_COMMIT = `  ${FULL_SHA}\n`;
    process.env.NEXT_PUBLIC_BUILD_REF = '  release/1.2  ';

    expect(getClientBuildInfo()).toEqual({
      shortSha: 'deadbee',
      fullSha: FULL_SHA,
      ref: 'release/1.2',
    });
  });

  it('reports an empty ref when only the commit is available', () => {
    process.env.NEXT_PUBLIC_BUILD_COMMIT = FULL_SHA;
    delete process.env.NEXT_PUBLIC_BUILD_REF;

    expect(getClientBuildInfo()!.ref).toBe('');
  });

  it('reads the environment on every call so a re-render sees a new build', () => {
    process.env.NEXT_PUBLIC_BUILD_COMMIT = FULL_SHA;
    const first = getClientBuildInfo();

    process.env.NEXT_PUBLIC_BUILD_COMMIT = '0000000aaaa';
    const second = getClientBuildInfo();

    expect(first!.shortSha).toBe('deadbee');
    expect(second!.shortSha).toBe('0000000');
  });
});

describe('isVercelProductionDeploy', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('is true only for the production environment', () => {
    process.env.NEXT_PUBLIC_VERCEL_ENV = 'production';

    expect(isVercelProductionDeploy()).toBe(true);
  });

  it('is false on preview deployments, where dev-only UI stays visible', () => {
    process.env.NEXT_PUBLIC_VERCEL_ENV = 'preview';

    expect(isVercelProductionDeploy()).toBe(false);
  });

  it('is false for local development and for an unset environment', () => {
    process.env.NEXT_PUBLIC_VERCEL_ENV = 'development';
    expect(isVercelProductionDeploy()).toBe(false);

    delete process.env.NEXT_PUBLIC_VERCEL_ENV;
    expect(isVercelProductionDeploy()).toBe(false);
  });

  it('does not accept a differently cased value as production', () => {
    process.env.NEXT_PUBLIC_VERCEL_ENV = 'Production';

    expect(isVercelProductionDeploy()).toBe(false);
  });
});
