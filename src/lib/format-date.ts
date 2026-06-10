export function formatDate(date: string) {
  return `${date.split(" ").join("T")}Z`;
}
