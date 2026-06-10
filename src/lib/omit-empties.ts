function isPlainObject(value: any): value is object {
  return Object.prototype.toString.call(value) === "[object Object]";
}

export function omitEmpty<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: Partial<T> = {};

  for (const key in obj) {
    const value = obj[key];

    const isEmpty =
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "") ||
      (Array.isArray(value) && value.length === 0) ||
      (isPlainObject(value) && Object.keys(value).length === 0);

    if (!isEmpty) {
      result[key] = value;
    }
  }

  return result;
}
