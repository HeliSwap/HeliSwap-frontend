export const timestampToDate = (UNIX_timestamp: string) => {
  const a = new Date(Number(UNIX_timestamp) * 1000);

  const year = a.getFullYear();
  const month = formatTimeNumber(a.getMonth());
  const date = formatTimeNumber(a.getDate());
  const hour = formatTimeNumber(a.getHours());
  const min = formatTimeNumber(a.getMinutes());
  const sec = formatTimeNumber(a.getSeconds());

  const time = `${hour}:${min}:${sec} on ${year}-${month}-${date}`;

  return time;
};

const formatTimeNumber = (numberToFormat: number) =>
  numberToFormat > 9 ? numberToFormat : `0${numberToFormat}`;
