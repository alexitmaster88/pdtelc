import { eq, and } from "drizzle-orm"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import {
  examLevels,
  exams,
  registrations,
  payments,
  otpVerifications,
} from "../drizzle/schema"

let _client: ReturnType<typeof postgres> | null = null
let _db: ReturnType<typeof drizzle> | null = null

export function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    _client = postgres(process.env.DATABASE_URL, { prepare: false })
    _db = drizzle(_client)
  }
  if (!_db) throw new Error("DATABASE_URL is not set")
  return _db
}

// ─── Exam Level queries ───────────────────────────────────────────────────────

export async function getExamLevels() {
  const db = getDb()
  return db.select().from(examLevels).orderBy(examLevels.level)
}

export async function getExamLevelByLevel(level: string) {
  const db = getDb()
  const result = await db.select().from(examLevels).where(eq(examLevels.level, level)).limit(1)
  return result[0] ?? null
}

export async function updateExamLevelPrice(levelId: number, price: string) {
  const db = getDb()
  return db.update(examLevels).set({ price }).where(eq(examLevels.id, levelId))
}

// ─── Exam queries ─────────────────────────────────────────────────────────────

export async function getAllExams() {
  const db = getDb()
  return db.select().from(exams).orderBy(exams.examDate)
}

export async function getExamsByRegionAndLevel(region: string, levelId: number) {
  const db = getDb()
  return db
    .select()
    .from(exams)
    .where(and(eq(exams.region, region), eq(exams.levelId, levelId)))
    .orderBy(exams.examDate)
}

export async function getExamById(examId: number) {
  const db = getDb()
  const result = await db.select().from(exams).where(eq(exams.id, examId)).limit(1)
  return result[0] ?? null
}

export async function createExam(data: {
  levelId: number
  region: string
  address?: string
  examDate: Date
  startTime: string
  endTime: string
  capacity?: number
}) {
  const db = getDb()
  const result = await db.insert(exams).values(data).returning({ id: exams.id })
  return result[0]
}

export async function updateExam(examId: number, data: Partial<typeof exams.$inferInsert>) {
  const db = getDb()
  return db.update(exams).set(data).where(eq(exams.id, examId))
}

export async function deleteExam(examId: number) {
  const db = getDb()
  return db.delete(exams).where(eq(exams.id, examId))
}

// ─── Registration queries ─────────────────────────────────────────────────────

export async function createRegistration(data: {
  userId?: string | null
  examId: number
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
  passportNumber: string
}) {
  const db = getDb()
  const result = await db
    .insert(registrations)
    .values({ ...data, status: "pending" })
    .returning({ id: registrations.id })
  return result[0] ?? null
}

export async function getRegistrationById(registrationId: number) {
  const db = getDb()
  const result = await db
    .select()
    .from(registrations)
    .where(eq(registrations.id, registrationId))
    .limit(1)
  return result[0] ?? null
}

export async function getRegistrationsByUserId(userId: string) {
  const db = getDb()
  return db.select().from(registrations).where(eq(registrations.userId, userId))
}

export async function getAllRegistrations() {
  const db = getDb()
  return db.select().from(registrations).orderBy(registrations.createdAt)
}

export async function updateRegistration(
  registrationId: number,
  data: Partial<typeof registrations.$inferInsert>
) {
  const db = getDb()
  return db.update(registrations).set(data).where(eq(registrations.id, registrationId))
}

export async function checkDuplicatePassportExam(passportNumber: string, examId: number) {
  const db = getDb()
  const result = await db
    .select({ id: registrations.id })
    .from(registrations)
    .where(
      and(eq(registrations.passportNumber, passportNumber), eq(registrations.examId, examId))
    )
    .limit(1)
  return result.length > 0
}

// ─── Payment queries ──────────────────────────────────────────────────────────

export async function createPayment(data: {
  registrationId: number
  amount: string
  paymentMethod: string
  status?: "pending" | "completed" | "failed" | "cancelled"
}) {
  const db = getDb()
  const result = await db
    .insert(payments)
    .values({ ...data, status: data.status ?? "pending" })
    .returning({ id: payments.id, providerTrnId: payments.providerTrnId })
  return result[0] ?? null
}

export async function getPaymentByRegistrationId(registrationId: number) {
  const db = getDb()
  const result = await db
    .select()
    .from(payments)
    .where(eq(payments.registrationId, registrationId))
    .limit(1)
  return result[0] ?? null
}

export async function updatePayment(paymentId: number, data: Partial<typeof payments.$inferInsert>) {
  const db = getDb()
  return db.update(payments).set(data).where(eq(payments.id, paymentId))
}

// ─── OTP queries ──────────────────────────────────────────────────────────────

export async function createOtp(email: string, otp: string, expiresAt: Date) {
  const db = getDb()
  return db.insert(otpVerifications).values({ email, otp, verified: false, expiresAt })
}

export async function getOtpByEmailAndCode(email: string, otp: string) {
  const db = getDb()
  const result = await db
    .select()
    .from(otpVerifications)
    .where(and(eq(otpVerifications.email, email), eq(otpVerifications.otp, otp)))
    .limit(1)
  return result[0] ?? null
}

export async function markOtpAsVerified(otpId: number) {
  const db = getDb()
  return db.update(otpVerifications).set({ verified: true }).where(eq(otpVerifications.id, otpId))
}
