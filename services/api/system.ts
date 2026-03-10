import { axios, isAxiosError, getAPIUrl, flattenTxArray } from './client';

export async function get_current_time() {
  try {
    const { data } = await axios.get(getAPIUrl('time/current'));
    return data.CurrentTimeStamp;
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return 0;
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_system_modelist() {
  try {
    const { data } = await axios.get(getAPIUrl('system/modelist/-1/1000000'));
    return flattenTxArray(data.SystemModeChanges);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_system_events(start: number, end: number) {
  try {
    const { data } = await axios.get(getAPIUrl(`system/admin_events/${start}/${end}`));
    return flattenTxArray(data.AdminEvents);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}
