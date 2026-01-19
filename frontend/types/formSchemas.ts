import { z } from "zod";

// helpers
const DateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date");
const TimeString = z.string().regex(/^\d{2}:\d{2}$/, "Invalid time");

export const DateRangeSchema = z
  .object({
    fromDate: DateString,
    fromTime: TimeString,
    toDate: DateString,
    toTime: TimeString,
  })
  .refine(
    (data) => {
      const from = new Date(`${data.fromDate}T${data.fromTime}`);
      const to = new Date(`${data.toDate}T${data.toTime}`);
      return from < to;
    },
    {
      message: "`From` must be before `To`",
      path: ["toDate"],
    }
  );
export type DateRangeForm = z.infer<typeof DateRangeSchema>;
export const DateRangeSchemaWithTransform = DateRangeSchema.transform(
  (data) => ({
    from: new Date(`${data.fromDate}T${data.fromTime}`),
    to: new Date(`${data.toDate}T${data.toTime}`),
  })
);
