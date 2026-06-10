import { fromZonedTime } from "date-fns-tz";

export const localToUtc = (date: Date): Date => {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const utcDate = fromZonedTime(date as Date, userTimeZone);
    return utcDate.toISOString() as unknown as Date;
} 
