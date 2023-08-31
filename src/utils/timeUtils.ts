const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const DAY_IN_SECONDS = 86400;

export const timestampToDate = (UNIX_timestamp: number) => {
  const a = new Date(Number(UNIX_timestamp));

  const year = a.getFullYear();
  const month = months[a.getMonth()];
  const day = formatTimeNumber(a.getDate());

  const date = `${day} ${month} ${year}`;

  return date;
};

export const timestampToDateTime = (UNIX_timestamp: number) => {
  const a = new Date(Number(UNIX_timestamp));

  const year = a.getFullYear();
  const month = months[a.getMonth()];
  const day = formatTimeNumber(a.getDate());
  const hour = formatTimeNumber(a.getHours());
  const minutes = formatTimeNumber(a.getMinutes());

  const date = `${day} ${month} ${year} - ${hour}:${minutes}`;

  return date;
};

export const formatTimeNumber = (numberToFormat: number) =>
  numberToFormat > 9 ? numberToFormat : `0${numberToFormat}`;

export const getCountdownReturnValues = (countDown: number) => {
  const days = Math.floor(countDown / (1000 * 60 * 60 * 24));
  const hours = Math.floor((countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((countDown % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
};

export const getMonthsFromDurationMilliseconds = (duration: number) => {
  const returnObject = {
    valueNumeric: 0,
    valueString: '0 Months',
  };

  if (duration > 0) {
    const months = Math.floor(duration / 30 / 24 / 3600000);

    returnObject.valueNumeric = months;
    returnObject.valueString = `${months === 1 ? `${months} Month` : `${months} Months`}`;
  }

  return returnObject;
};

export const getDaysFromDurationMilliseconds = (duration: number) => {
  const returnObject = {
    valueNumeric: 0,
    valueString: '0 Months',
  };

  if (duration > 0) {
    const days = Math.floor(duration / 24 / 3600000);

    returnObject.valueNumeric = days;
    returnObject.valueString = `${days === 1 ? `${days} Day` : `${days} Days`}`;
  }

  return returnObject;
};

export const nowTimestampInSeconds = () => Math.floor(Date.now() / 1000);

export const getDaysFromTimestampInSeconds = (
  timestampInSeconds: number,
  from = nowTimestampInSeconds(),
) => {
  if (timestampInSeconds < nowTimestampInSeconds()) return 0;

  return Math.floor((timestampInSeconds - from) / DAY_IN_SECONDS);
};
