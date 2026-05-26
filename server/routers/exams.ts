import { z } from "zod"
import { router, publicProcedure, adminProcedure } from "../trpc"
import * as db from "../db"

export const examsRouter = router({
  list: publicProcedure.query(() => db.getAllExams()),

  getByRegionAndLevel: publicProcedure
    .input(z.object({ region: z.string(), levelId: z.number() }))
    .query(({ input }) => db.getExamsByRegionAndLevel(input.region, input.levelId)),

  get: publicProcedure
    .input(z.object({ examId: z.number() }))
    .query(({ input }) => db.getExamById(input.examId)),

  create: adminProcedure
    .input(
      z.object({
        levelId: z.number(),
        region: z.string(),
        address: z.string().optional(),
        examDate: z.date(),
        startTime: z.string(),
        endTime: z.string(),
        capacity: z.number().optional().default(30),
      })
    )
    .mutation(({ input }) => {
      const { levelId, region, examDate, startTime, endTime, capacity, address } = input
      return db.createExam({ levelId, region, examDate, startTime, endTime, capacity, ...(address !== undefined && { address }) })
    }),

  update: adminProcedure
    .input(z.object({ examId: z.number(), data: z.record(z.unknown()) }))
    .mutation(({ input }) =>
      db.updateExam(input.examId, input.data as Parameters<typeof db.updateExam>[1])
    ),

  delete: adminProcedure
    .input(z.object({ examId: z.number() }))
    .mutation(({ input }) => db.deleteExam(input.examId)),
})
