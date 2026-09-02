import userEvent from '@testing-library/user-event';

import enErrors from '@/messages/en/errors.json';
import ukErrors from '@/messages/uk/errors.json';
import zhErrors from '@/messages/zh/errors.json';

import { reportError } from '@/utils/errors';

import { render, screen } from '@/test-utils';

import GlobalError from '../global-error';

jest.mock('../../utils/errors', () => ({ reportError: jest.fn() }));

function setPathname(pathname: string) {
  window.history.replaceState({}, '', pathname);
}

beforeEach(() => {
  jest.clearAllMocks();
  setPathname('/');
});

/**
 * `global-error` owns `<html>`/`<body>`, which React refuses to mount inside a
 * jsdom `<div>` container, so every case renders into a detached document.
 */
function renderGlobalError(reset: () => void = () => {}) {
  const container = document.createElement('div');
  return render(<GlobalError error={new Error('root layout blew up')} reset={reset} />, {
    container: document.body.appendChild(container),
    baseElement: document.body,
  });
}

describe('global error boundary', () => {
  it('renders the English fallback with a reload action', () => {
    renderGlobalError();

    expect(screen.getByText(enErrors.global.title)).toBeInTheDocument();
    expect(screen.getByText(enErrors.global.message)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: enErrors.global.retry })).toBeInTheDocument();
  });

  it('reports the error to Sentry with a global context', () => {
    renderGlobalError();
    expect(reportError).toHaveBeenCalledTimes(1);
    expect(reportError).toHaveBeenCalledWith(expect.any(Error), 'global-error');
  });

  it('retries via reset', async () => {
    const user = userEvent.setup();
    const reset = jest.fn();
    renderGlobalError(reset);

    await user.click(screen.getByRole('button', { name: enErrors.global.retry }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('renders Chinese copy under the /zh prefix, where next-intl is unavailable', () => {
    setPathname('/zh/gallery');
    renderGlobalError();

    expect(screen.getByText(zhErrors.global.title)).toBeInTheDocument();
    expect(screen.getByText(zhErrors.global.message)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: zhErrors.global.retry })).toBeInTheDocument();
  });

  it('renders Ukrainian copy under the /uk prefix with the locale on <html>', () => {
    setPathname('/uk/gallery');
    renderGlobalError();

    expect(screen.getByText(ukErrors.global.title)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: ukErrors.global.retry })).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('lang', 'uk');
    expect(document.documentElement).toHaveAttribute('dir', 'ltr');
  });

  it('falls back to English for any other locale-less path', () => {
    setPathname('/statistics/anchoring');
    renderGlobalError();

    expect(screen.getByText(enErrors.global.title)).toBeInTheDocument();
  });

  it('keeps every locale catalog in step with English', () => {
    for (const catalog of [zhErrors, ukErrors]) {
      expect(Object.keys(catalog.global).sort()).toEqual(Object.keys(enErrors.global).sort());
    }
  });
});
