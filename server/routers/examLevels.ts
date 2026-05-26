import { z } from "zod"
import { router, publicProcedure, adminProcedure } from "../trpc"
import * as db from "../db"

export const examLevelsRouter = router({
  list: publicProcedure.query(() => db.getExamLevels()),

  get: publicProcedure
    .input(z.object({ level: z.string() }))
    .query(({ input }) => db.getExamLevelByLevel(input.level)),

  update: adminProcedure
    .input(z.object({ levelId: z.number(), price: z.string() }))
    .mutation(({ input }) => db.updateExamLevelPrice(input.levelId, input.price)),
})
