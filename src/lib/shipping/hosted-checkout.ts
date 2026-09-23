import { z } from "zod";
import {
  normalizeCanadianPostalCode,
  normalizeCanadianRegion,
  postalCodeMatchesRegion,
  isDeliveryProvince,
} from "./pricing";

const field = z.string().trim().min(1).max(150);
const address = z
  .object({
    name: field,
    line1: field,
    line2: z.string().trim().max(150).default(""),
    city: field,
    state: z.string().max(50),
    postalCode: z.string().max(12),
  })
  .strict()
  .transform((value, ctx) => {
    const state = normalizeCanadianRegion(value.state);
    const postalCode = normalizeCanadianPostalCode(value.postalCode);
    if (
      !state ||
      !isDeliveryProvince(state) ||
      !postalCode ||
      !postalCodeMatchesRegion(postalCode, state)
    ) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "invalid-address" });
      return z.NEVER;
    }
    return {
      name: value.name,
      address: {
        country: "CA" as const,
        line1: value.line1,
        line2: value.line2,
        city: value.city,
        state,
        postal_code: postalCode,
      },
    };
  });

export const hostedCheckoutSchema = z.discriminatedUnion("method", [
  z.object({ method: z.literal("delivery"), shipping: address }).strict(),
  z
    .object({
      method: z.literal("pickup"),
      location: z.enum(["montreal", "quebec-city"]),
    })
    .strict(),
]);
export type HostedFulfilment = z.output<typeof hostedCheckoutSchema>;
export type HostedCheckoutSummary = {
  fingerprint: string;
  subtotalCents: number;
  rates: Record<string, number>;
  items: {
    id: string;
    title: string;
    variant: string;
    quantity: number;
    totalCents: number;
  }[];
};
