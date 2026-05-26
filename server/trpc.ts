import { initTRPC, TRPCError } from "@trpc/server"
import superjson from "superjson"
import type { Context } from "./context"

const t = initTRPC.context<Context>().create({
  transformer: superjson,
})

export const router = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Login required" })
  }
  return next({ ctx: { ...ctx, user: ctx.user } })
})

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail || ctx.user.email !== adminEmail) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" })
  }
  return next({ ctx })
})
