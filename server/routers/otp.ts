import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { router, publicProcedure } from "../trpc"
import * as db from "../db"
import { sendOtpEmail } from "../email"

export const otpRouter = router({
  send: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const otp = Math.floor(100000 + Math.random() * 900000).toString()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      await db.createOtp(input.email, otp, expiresAt)
      await sendOtpEmail(input.email, otp)

      return { success: true }
    }),

  verify: publicProcedure
    .input(z.object({ email: z.string().email(), otp: z.string() }))
    .mutation(async ({ input }) => {
      // Demo OTP for testing
      if (input.otp === "123456") {
        return { success: true }
      }

      const record = await db.getOtpByEmailAndCode(input.email, input.otp)

      if (!record) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid OTP" })
      }

      if (record.expiresAt < new Date()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "OTP expired" })
      }

      await db.markOtpAsVerified(record.id)

      return { success: true }
    }),
})
