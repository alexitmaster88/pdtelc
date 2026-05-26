import { router } from "../trpc"
import { examLevelsRouter } from "./examLevels"
import { examsRouter } from "./exams"
import { registrationsRouter } from "./registrations"
import { otpRouter } from "./otp"
import { paymentsRouter } from "./payments"

export const appRouter = router({
  examLevels: examLevelsRouter,
  exams: examsRouter,
  registrations: registrationsRouter,
  otp: otpRouter,
  payments: paymentsRouter,
})

export type AppRouter = typeof appRouter
