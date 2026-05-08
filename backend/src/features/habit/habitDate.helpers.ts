const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const getUtcDate = (dateKey: string): Date => {
  if (!DATE_KEY_PATTERN.test(dateKey)) {
    throw new Error("Date key must use YYYY-MM-DD");
  }

  const date = new Date(`${dateKey}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date key");
  }

  if (toDateKey(date) !== dateKey) {
    throw new Error("Invalid date key");
  }

  return date;
};

const addDays = (date: Date, days: number): Date => {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);

  return nextDate;
};

export const toDateKey = (date: Date): string => {
  return date.toISOString().slice(0, 10);
};

export const formatDateDisplay = (dateKey: string): string => {
  getUtcDate(dateKey);

  const [year, month, day] = dateKey.split("-");

  return `${day}.${month}.${year}`;
};

export const getCalendarWeekRange = (
  dateKey: string,
): { startDate: string; endDate: string } => {
  const date = getUtcDate(dateKey);
  const day = date.getUTCDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = addDays(date, mondayOffset);
  const sunday = addDays(monday, 6);

  return {
    startDate: toDateKey(monday),
    endDate: toDateKey(sunday),
  };
};

export const isAllowedCheckinDate = (
  dateKey: string,
  today: Date = new Date(),
): boolean => {
  const normalizedToday = toDateKey(today);
  const yesterday = toDateKey(addDays(getUtcDate(normalizedToday), -1));

  return dateKey === normalizedToday || dateKey === yesterday;
};
