import type { Response } from "express";

export function parseParamId<T extends string = "id">(
  // Update this line to allow string[] (Express default)
  params: Record<string, string | string[] | undefined>,
  res: Response,
  key: T = "id" as T
): { [K in T]: number } | null {
  const value = params[key];

  // Logic to handle potential array (though rare for params)
  const stringValue = Array.isArray(value) ? value[0] : value;

  if (!stringValue) {
    res.status(400).json({ error: `Missing parameter: ${key}` });
    return null;
  }

  const num = Number(stringValue);
  if (isNaN(num)) {
    res.status(400).json({ error: `Invalid number format for: ${key}` });
    return null;
  }

  return { [key]: num } as { [K in T]: number };
}
