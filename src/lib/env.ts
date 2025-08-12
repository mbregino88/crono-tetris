import { z } from 'zod'

/**
 * Server-side environment variable schema
 */
const serverEnvSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required')
    .url('DATABASE_URL must be a valid URL')
    .refine(
      (url) => url.startsWith('postgresql://') || url.startsWith('postgres://'),
      'DATABASE_URL must be a PostgreSQL connection string'
    ),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z
    .string()
    .url('NEXTAUTH_URL must be a valid URL')
    .optional()
    .default('http://localhost:3000'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .optional()
    .default('development'),
})

/**
 * Client-side environment variable schema
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .min(1, 'NEXT_PUBLIC_SUPABASE_URL is required')
    .url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
})

/**
 * Validate server environment variables
 */
export function validateServerEnv() {
  try {
    const env = serverEnvSchema.parse({
      DATABASE_URL: process.env.DATABASE_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NODE_ENV: process.env.NODE_ENV,
    })
    return { success: true, data: env, error: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map(
        (err) => `${err.path.join('.')}: ${err.message}`
      )
      return {
        success: false,
        data: null,
        error: `Environment validation failed:\n${errors.join('\n')}`,
      }
    }
    return {
      success: false,
      data: null,
      error: 'Unknown error validating environment variables',
    }
  }
}

/**
 * Validate client environment variables
 */
export function validateClientEnv() {
  try {
    const env = clientEnvSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })
    return { success: true, data: env, error: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map(
        (err) => `${err.path.join('.')}: ${err.message}`
      )
      return {
        success: false,
        data: null,
        error: `Environment validation failed:\n${errors.join('\n')}`,
      }
    }
    return {
      success: false,
      data: null,
      error: 'Unknown error validating environment variables',
    }
  }
}

/**
 * Get validated environment variables
 */
export function getEnv() {
  const serverResult = validateServerEnv()
  const clientResult = validateClientEnv()
  
  if (!serverResult.success) {
    throw new Error(serverResult.error!)
  }
  
  if (!clientResult.success) {
    throw new Error(clientResult.error!)
  }
  
  return {
    ...serverResult.data,
    ...clientResult.data,
  }
}

/**
 * Type-safe environment variables
 */
export type Env = ReturnType<typeof getEnv>

/**
 * Singleton instance of validated environment variables
 */
let envInstance: Env | null = null

export function env(): Env {
  if (!envInstance) {
    envInstance = getEnv()
  }
  return envInstance
}

export default env