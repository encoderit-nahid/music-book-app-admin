import { fromZonedTime } from "date-fns-tz";

export const localToUtc = (date: Date): Date => {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return fromZonedTime(date, userTimeZone);
}
