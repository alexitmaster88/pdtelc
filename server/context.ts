import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getDb } from "./db"

export async function createContext() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {
          // Read-only in server context; session changes happen client-side
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return {
    user,
    db: getDb(),
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
