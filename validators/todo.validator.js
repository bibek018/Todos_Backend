import { z } from "zod";
export const validtodoSchema = z
  .object({
    title: z.string().min(8, "Title must be of minium length 8"),
    status: z.enum(
      ["not started", "in progress", "completed"],
      "Incorrect status chosen",
    ),
    priority: z.enum(
      ["low", "medium", "high"],
      "incorrect priority field chosen",
    ),
  })
  .strict();

export const validtodoUpdateSchema = z
  .object({
    title: z.string().min(8, "Title must be of minimum length 8").optional(),
    status: z
      .enum(
        ["not started", "completed", "in progress"],
        "Incorrect status chosen ",
      )
      .optional(),
    priority: z
      .enum(["low", "medium", "high"], "incorrect priority field chosen")
      .optional(),
  })
  .strict();

export const getTodoSchema = z
  .object({
    page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
    limit: z.coerce
      .number()
      .int()
      .min(1, "Limit must be at least 1")
      .max(100, "Limit must not exceed 100")
      .default(10),

    status: z
      .enum(
        ["not started", "in progress", "completed"],
        "Incorrect status chosen",
      )
      .optional(),
    priority: z
      .enum(["low", "medium", "high"], "Incorrect priority field chosen")
      .optional(),
    sort: z
      .enum(["createdAt", "updatedAt", "title"], "Incorrect sort option chosen")
      .default("createdAt"),
    order: z.enum(["asc", "desc"], "Incorrect order chosen").default("asc"),
  })
  .strict();
