import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { router, publicProcedure, adminProcedure } from "../trpc"
import * as db from "../db"

export const paymentsRouter = router({
  create: publicProcedure
    .input(
      z.object({
        registrationId: z.number(),
        amount: z.string(),
        paymentMethod: z.enum(["click", "payme", "other"]),
      })
    )
    .mutation(async ({ input }) => {
      const registration = await db.getRegistrationById(input.registrationId)
      if (!registration) throw new TRPCError({ code: "NOT_FOUND" })

      return db.createPayment(input)
    }),

  get: publicProcedure
    .input(z.object({ registrationId: z.number() }))
    .query(({ input }) => db.getPaymentByRegistrationId(input.registrationId)),

  // Marks payment as completed (manual verification by admin or stub for QR flow)
  verify: publicProcedure
    .input(z.object({ paymentId: z.number() }))
    .mutation(async ({ input }) => {
      await db.updatePayment(input.paymentId, {
        status: "completed",
        verifiedAt: new Date(),
        paidAt: new Date(),
      })
      return { success: true }
    }),
})
