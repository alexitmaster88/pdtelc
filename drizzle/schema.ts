import {
  pgTable,
  pgEnum,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  unique,
  serial,
  uuid,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

export const registrationStatusEnum = pgEnum("registration_status", [
  "pending",
  "verified",
  "paid",
  "completed",
  "cancelled",
])

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "completed",
  "failed",
  "cancelled",
])

export const examLevels = pgTable("exam_levels", {
  id: serial("id").primaryKey(),
  level: text("level").notNull().unique(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const exams = pgTable("exams", {
  id: serial("id").primaryKey(),
  levelId: integer("level_id").notNull(),
  region: text("region").notNull(),
  address: text("address"),
  examDate: timestamp("exam_date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  capacity: integer("capacity").notNull().default(30),
  registeredCount: integer("registered_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const registrations = pgTable(
  "registrations",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id"), // Supabase auth.users UUID (nullable for anonymous)
    examId: integer("exam_id").notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    phoneNumber: text("phone_number").notNull(),
    email: text("email").notNull(),
    passportNumber: text("passport_number").notNull(),
    status: registrationStatusEnum("status").default("pending").notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    paymentVerified: boolean("payment_verified").default(false).notNull(),
    registrationDate: timestamp("registration_date").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [unique("unique_passport_exam").on(table.passportNumber, table.examId)]
)

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  providerTrnId: serial("provider_trn_id"), // Paynet-compatible serial ID
  registrationId: integer("registration_id").notNull(),
  bookingId: text("booking_id"), // For Paynet integration
  paynetTransactionId: text("paynet_transaction_id"),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  status: paymentStatusEnum("status").default("pending").notNull(),
  gateway: text("gateway").default("manual"),
  transactionId: text("transaction_id"),
  verifiedAt: timestamp("verified_at"),
  paidAt: timestamp("paid_at"),
  // Payme (Paycom) Merchant API fields
  paymeTransactionId: text("payme_transaction_id"),
  paymeCreateTime: text("payme_create_time"),   // Unix ms (stored as text to avoid bigint JSON issues)
  paymePerformTime: text("payme_perform_time"),
  paymeCancelTime: text("payme_cancel_time"),
  paymeReason: integer("payme_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const otpVerifications = pgTable("otp_verifications", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  otp: text("otp").notNull(),
  verified: boolean("verified").default(false).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Relations
export const examsRelations = relations(exams, ({ one }) => ({
  level: one(examLevels, { fields: [exams.levelId], references: [examLevels.id] }),
}))

export const registrationsRelations = relations(registrations, ({ one }) => ({
  exam: one(exams, { fields: [registrations.examId], references: [exams.id] }),
}))

export const paymentsRelations = relations(payments, ({ one }) => ({
  registration: one(registrations, { fields: [payments.registrationId], references: [registrations.id] }),
}))

// Types
export type ExamLevel = typeof examLevels.$inferSelect
export type InsertExamLevel = typeof examLevels.$inferInsert
export type Exam = typeof exams.$inferSelect
export type InsertExam = typeof exams.$inferInsert
export type Registration = typeof registrations.$inferSelect
export type InsertRegistration = typeof registrations.$inferInsert
export type Payment = typeof payments.$inferSelect
export type InsertPayment = typeof payments.$inferInsert
export type OtpVerification = typeof otpVerifications.$inferSelect
