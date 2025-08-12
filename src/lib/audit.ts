import { supabase } from './supabase'

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE'

export interface AuditLog {
  id?: string
  user_id: string
  user_email: string
  deal_uuid: string
  deal_name: string
  action: AuditAction
  field_name?: string
  old_value?: string
  new_value?: string
  reason?: string
  timestamp: string
  ip_address?: string
  user_agent?: string
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        ...log,
        timestamp: new Date().toISOString(),
        user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : null
      })
      .select()
      .single()

    if (error) {
      // Log the raw error (might be empty object)
      console.warn('⚠️ Audit logging failed - falling back to console logging')
      
      // Always show the audit action in console since database failed
      console.warn('📝 AUDIT LOG:', {
        action: log.action,
        deal_name: log.deal_name,
        field_name: log.field_name || 'N/A',
        old_value: log.old_value || 'N/A',
        new_value: log.new_value || 'N/A',
        reason: log.reason || 'N/A',
        user: log.user_email,
        timestamp: new Date().toISOString()
      })
      
      // Show error details if available (null-safe)
      if (error?.message || error?.code) {
        console.error('Database error details:', {
          message: error.message || 'No message',
          code: error.code || 'No code',
          details: error.details || 'No details'
        })
      } else {
        console.warn('💡 This usually means the audit_logs table doesn\'t exist.')
        console.warn('📋 To enable database audit logging, run: database/migrations/create_audit_logs.sql')
      }
      
      // Don't throw - we don't want audit failures to break the app
      return null
    }

    return data
  } catch (error) {
    console.warn('⚠️ Audit logging exception - falling back to console logging')
    console.error('Exception details:', error)
    
    // Always ensure audit trail is preserved in console
    console.warn('📝 AUDIT LOG (FALLBACK):', {
      action: log.action,
      deal_name: log.deal_name,
      field_name: log.field_name || 'N/A',
      old_value: log.old_value || 'N/A',
      new_value: log.new_value || 'N/A',
      reason: log.reason || 'N/A',
      user: log.user_email,
      timestamp: new Date().toISOString()
    })
    
    console.warn('💡 To enable database audit logging, run: database/migrations/create_audit_logs.sql')
    return null
  }
}

/**
 * Log a field update
 */
export async function logFieldUpdate(
  dealUuid: string,
  dealName: string,
  fieldName: string,
  oldValue: string | number | boolean | null | undefined,
  newValue: string | number | boolean | null | undefined,
  userId: string = 'system',
  userEmail: string = 'system@app.com'
) {
  // Don't log if values are the same
  if (oldValue === newValue) return

  return createAuditLog({
    user_id: userId,
    user_email: userEmail,
    deal_uuid: dealUuid,
    deal_name: dealName,
    action: 'UPDATE',
    field_name: fieldName,
    old_value: String(oldValue || ''),
    new_value: String(newValue || '')
  })
}

/**
 * Log deal deletion
 */
export async function logDealDeletion(
  dealUuid: string,
  dealName: string,
  reason: string,
  userId: string = 'system',
  userEmail: string = 'system@app.com'
) {
  return createAuditLog({
    user_id: userId,
    user_email: userEmail,
    deal_uuid: dealUuid,
    deal_name: dealName,
    action: 'DELETE',
    reason
  })
}

/**
 * Log deal creation
 */
export async function logDealCreation(
  dealUuid: string,
  dealName: string,
  userId: string = 'system',
  userEmail: string = 'system@app.com'
) {
  return createAuditLog({
    user_id: userId,
    user_email: userEmail,
    deal_uuid: dealUuid,
    deal_name: dealName,
    action: 'CREATE'
  })
}

/**
 * Log status change
 */
export async function logStatusChange(
  dealUuid: string,
  dealName: string,
  oldStatus: string,
  newStatus: string,
  userId: string = 'system',
  userEmail: string = 'system@app.com'
) {
  return createAuditLog({
    user_id: userId,
    user_email: userEmail,
    deal_uuid: dealUuid,
    deal_name: dealName,
    action: 'STATUS_CHANGE',
    field_name: 'status_deal',
    old_value: oldStatus,
    new_value: newStatus
  })
}

/**
 * Get audit logs for a deal
 */
export async function getDealAuditLogs(dealUuid: string) {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('deal_uuid', dealUuid)
      .order('timestamp', { ascending: false })

    if (error) {
      console.error('Error fetching audit logs:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Failed to fetch audit logs:', error)
    return []
  }
}

/**
 * Compare two objects and log all changes
 */
export async function logObjectChanges(
  dealUuid: string,
  dealName: string,
  oldData: Record<string, unknown>,
  newData: Record<string, unknown>,
  userId: string = 'system',
  userEmail: string = 'system@app.com'
) {
  const changes: Promise<unknown>[] = []

  // Check all keys in newData
  Object.keys(newData).forEach(key => {
    const oldValue = oldData[key]
    const newValue = newData[key]

    // Skip if values are the same or if it's an ID field
    if (oldValue === newValue || key === 'deal_uuid' || key === 'criado_em') return

    // Format values for comparison
    const formattedOld = formatValueForAudit(oldValue)
    const formattedNew = formatValueForAudit(newValue)

    if (formattedOld !== formattedNew) {
      changes.push(
        logFieldUpdate(
          dealUuid,
          dealName,
          key,
          formattedOld,
          formattedNew,
          userId,
          userEmail
        )
      )
    }
  })

  // Execute all audit logs in parallel
  await Promise.all(changes)
}

/**
 * Format a value for audit logging
 */
function formatValueForAudit(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não'
  if (typeof value === 'number') return value.toString()
  if (value instanceof Date) return value.toISOString()
  return String(value)
}