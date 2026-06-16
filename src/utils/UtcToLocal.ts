import { toZonedTime } from "date-fns-tz";

export const utcToLocal = (date: Date): Date => {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return toZonedTime(date, userTimeZone);
}