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
  'Novermber',
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

const formatTimeNumber = (numberToFormat: number) =>
  numberToFormat > 9 ? numberToFormat : `0${numberToFormat}`;
