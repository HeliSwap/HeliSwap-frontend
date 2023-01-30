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

export const timestampToDate = (UNIX_timestamp: number) => {
  const a = new Date(Number(UNIX_timestamp));

  const year = a.getFullYear();
  const month = months[a.getMonth()];
  const day = formatTimeNumber(a.getDate());

  const date = `${day} ${month} ${year}`;

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
