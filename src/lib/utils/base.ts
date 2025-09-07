import { ReadonlyURLSearchParams } from "next/navigation";

export function ensureStartWith(stringToCheck: string, startsWith: string) {
  return stringToCheck.startsWith(startsWith)
    ? stringToCheck
    : `${startsWith}${stringToCheck}`;
}

export function createUrl(
  pathname: string,
  params: URLSearchParams | ReadonlyURLSearchParams
) {
  const paramsString = params.toString();
  const queryString = `${paramsString.length ? "?" : ""}${paramsString}`;

  return `${pathname}${queryString}`;
}

export const addBusinessDays = (date: Date, days: number) => {
  const result = new Date(date);
  let addedDays = 0;

  while (addedDays < days) {
    result.setDate(result.getDate() + 1);
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      addedDays++;
    }
  }
  return result;
};
