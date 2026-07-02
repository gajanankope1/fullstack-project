import { z } from "zod";

export const createChallengeSchema = z
  .object({
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    entryAmount: z.number().int().positive(),
  })
  .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: "End time must be after start time",
    path: ["endTime"],
  })
  .refine((data) => new Date(data.startTime) > new Date(), {
    message: "Start time must be in the future",
    path: ["startTime"],
  });

export const selectCoinSchema = z.object({
  coinId: z.string().trim().min(1),
});

export type CreateChallengeInput = z.infer<typeof createChallengeSchema>;
export type SelectCoinInput = z.infer<typeof selectCoinSchema>;
