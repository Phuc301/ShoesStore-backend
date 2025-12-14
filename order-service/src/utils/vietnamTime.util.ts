import moment from 'moment-timezone';

export const getVietnamTimeString = (): string => {
  return moment().tz('Asia/Ho_Chi_Minh').format('YYYYMMDDHHmmss');
};

export const getVietnamTimePlusMinutes = (minutes: number): string => {
  return moment()
    .tz('Asia/Ho_Chi_Minh')
    .add(minutes, 'minutes')
    .format('YYYYMMDDHHmmss');
};

export const getVietnamISOTime = (): string => {
  return moment.utc().toISOString();
};
