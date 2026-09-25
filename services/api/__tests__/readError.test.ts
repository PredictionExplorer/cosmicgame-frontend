import { AxiosError } from 'axios';

import {
  ApiReadError,
  apiErrorStatus,
  isRecordNotFound,
  saysRecordNotFound,
} from '@/services/api/readError';

/** The Cosmic API's answers, as it sends them. */
const NOT_HELD = { error: 'record not found', status: 0 };
const PARSE_ERROR = {
  error: 'Can\'t parse integer parameter: strconv.ParseInt: parsing "abc": invalid syntax',
  status: 0,
};

const axiosError = (status: number, data: unknown): AxiosError =>
  new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    status,
    statusText: '',
    headers: {},
    config: {} as never,
    data,
  });

describe('saysRecordNotFound', () => {
  it('reads the API’s "record not found" answer, in any case', () => {
    expect(saysRecordNotFound(NOT_HELD)).toBe(true);
    expect(saysRecordNotFound({ error: 'Record not found' })).toBe(true);
  });

  it('reads any other body as something else', () => {
    expect(saysRecordNotFound(PARSE_ERROR)).toBe(false);
    expect(saysRecordNotFound({ error: 'record not foundry' })).toBe(false);
    expect(saysRecordNotFound({ error: 404 })).toBe(false);
    expect(saysRecordNotFound('record not found')).toBe(false);
    expect(saysRecordNotFound({})).toBe(false);
    expect(saysRecordNotFound(null)).toBe(false);
    expect(saysRecordNotFound(undefined)).toBe(false);
  });
});

describe('isRecordNotFound', () => {
  it.each([
    ['a 400 "record not found"', 400, NOT_HELD, true],
    ['a 404', 404, undefined, true],
    ['a 404 with any body', 404, '404 page not found', true],
    ['a 400 that could not parse the id', 400, PARSE_ERROR, false],
    ['a 400 with no body', 400, undefined, false],
    ['a 500 that says "record not found"', 500, NOT_HELD, false],
  ])('reads %s from a read policy', (_label, status, body, notFound) => {
    const error = new ApiReadError('Network response was not OK', status, body);
    expect(error.recordNotFound).toBe(notFound);
    expect(isRecordNotFound(error)).toBe(notFound);
    expect(apiErrorStatus(error)).toBe(status);
  });

  it.each([
    ['a 400 "record not found"', 400, NOT_HELD, true],
    ['a 404', 404, '404 page not found', true],
    ['a 400 that could not parse the id', 400, PARSE_ERROR, false],
  ])(
    'reads %s from an axios error that skipped the read policies',
    (_label, status, body, notFound) => {
      expect(isRecordNotFound(axiosError(status, body))).toBe(notFound);
    },
  );

  it('never reads a failure that did not reach the server as a missing record', () => {
    expect(isRecordNotFound(new ApiReadError('Network response was not OK'))).toBe(false);
    expect(isRecordNotFound(new AxiosError('Network Error', 'ERR_NETWORK'))).toBe(false);
    expect(isRecordNotFound(new Error('record not found'))).toBe(false);
    expect(isRecordNotFound(null)).toBe(false);
    expect(isRecordNotFound(undefined)).toBe(false);
  });
});
