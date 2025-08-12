import { createSupabaseBrowserClient } from './supabase-browser'
import type { Deal } from './types'

// Use consistent browser client for all data operations
export const supabase = createSupabaseBrowserClient()

// Fetch all deals from the database
export async function fetchDeals(): Promise<Deal[]> {
  try {
    
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .order('data_janela', { ascending: true })

    if (error) {
      console.error('❌ Supabase error fetching deals:', error)
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return []
    }

    
    if (data && data.length > 0) {
      // Sort with custom backlog order for NULL data_janela, then by date for others
      
      // Sort with custom backlog order for NULL data_janela, then by date for others
      const sortedData = data.sort((a, b) => {
        // Both are backlog deals (NULL data_janela)
        if (!a.data_janela && !b.data_janela) {
          // Sort by backlog_order if available, otherwise by creation date
          if (a.backlog_order !== null && b.backlog_order !== null) {
            return a.backlog_order - b.backlog_order
          }
          if (a.backlog_order !== null) return -1
          if (b.backlog_order !== null) return 1
          // Fallback to creation date for both without backlog_order
          return a.criado_em.localeCompare(b.criado_em)
        }
        
        // Handle mixed NULL/non-NULL (backlog first)
        if (!a.data_janela) return -1  // NULL values first
        if (!b.data_janela) return 1
        
        // Sort valid dates normally
        return a.data_janela.localeCompare(b.data_janela)
      })
      
      return sortedData as Deal[]
    }

    return data as Deal[]
  } catch (error) {
    console.error('💥 Unexpected error in fetchDeals:', error)
    return []
  }
}

// Update a deal in the database
export async function updateDeal(deal_uuid: string, updates: Partial<Deal>): Promise<Deal | null> {
  try {
    console.log('🔄 Attempting to update deal:', deal_uuid)
    console.log('📝 Update payload:', JSON.stringify(updates, null, 2))
    
    const { data, error } = await supabase
      .from('deals')
      .update(updates)
      .eq('deal_uuid', deal_uuid)
      .select()
      .single()

    if (error) {
      console.error('❌ Supabase error updating deal:', error)
      console.error('Raw error object:', JSON.stringify(error, null, 2))
      console.error('Error details:', {
        message: error.message || 'No message',
        details: error.details || 'No details', 
        hint: error.hint || 'No hint',
        code: error.code || 'No code',
        statusCode: (error as { statusCode?: number }).statusCode || 'No status code'
      })
      
      // Log specific field issues if available
      if (error.message && error.message.includes('violates')) {
        console.error('🔍 Possible constraint violation - check field values against database constraints')
      }
      if (error.message && error.message.includes('permission')) {
        console.error('🔒 Possible permission issue - check RLS policies for UPDATE operations')
      }
      if (error.message && error.message.includes('column') && error.message.includes('does not exist')) {
        console.error('📋 Possible field name mismatch - check if update fields match database schema')
      }
      
      return null
    }

    console.log('✅ Deal updated successfully:', data)
    return data as Deal
  } catch (error) {
    console.error('💥 Unexpected error in updateDeal:', error)
    console.error('Error type:', typeof error)
    console.error('Error stack:', (error as Error).stack)
    console.error('Deal UUID:', deal_uuid)
    console.error('Updates payload:', JSON.stringify(updates, null, 2))
    return null
  }
}

// Create a new deal in the database using server-side API
export async function createDeal(dealData: Omit<Deal, 'deal_uuid' | 'criado_em'>): Promise<Deal | null> {
  try {
    console.log('📝 Attempting to create deal via API with payload:', JSON.stringify(dealData, null, 2))
    
    // Call our server-side API instead of direct Supabase
    const response = await fetch('/api/deals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dealData),
      credentials: 'same-origin' // Important for cookies/auth
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('❌ API error creating deal:', result)
      console.error('Error details:', {
        status: response.status,
        error: result.error,
        message: result.message || 'No message',
        details: result.details || 'No details',
        hint: result.hint || 'No hint',
        code: result.code || 'No code'
      })
      
      // Log specific field issues if available
      if (result.message && result.message.includes('violates')) {
        console.error('🔍 Possible constraint violation - check required fields')
      }
      if (result.message && result.message.includes('permission')) {
        console.error('🔒 Possible permission issue - check RLS policies')
      }
      if (result.error === 'Unauthorized') {
        console.error('🔐 Authentication required - user may need to log in again')
      }
      
      // Throw error with detailed message for the form to catch
      throw new Error(result.message || result.error || 'Failed to create deal')
    }

    console.log('✅ Deal created successfully via API:', result.data)
    return result.data as Deal
  } catch (error) {
    console.error('💥 Unexpected error in createDeal:', error)
    console.error('Error type:', typeof error)
    console.error('Error stack:', (error as Error).stack)
    
    // Re-throw the error so the form can handle it properly
    throw error
  }
}

// Get enum values for a specific field from the database
export async function getEnumValues(tableName: string, columnName: string): Promise<string[]> {
  try {
    
    // Get distinct values from existing data
    const { data: distinctData, error: distinctError } = await supabase
      .from(tableName)
      .select(columnName)
      .not(columnName, 'is', null)
      .not(columnName, 'eq', '')
    
    if (distinctError) {
      console.error(`❌ Error fetching distinct values for ${columnName}:`, distinctError)
      console.error('Error details:', {
        message: distinctError.message,
        details: distinctError.details,
        hint: distinctError.hint,
        code: distinctError.code
      })
      return []
    }
    
    if (!distinctData || distinctData.length === 0) {
      return []
    }
    
    // Extract unique values and filter out nulls/empty strings
    const uniqueValues = [...new Set(
      distinctData
        ?.map(row => (row as unknown as Record<string, unknown>)[columnName])
        ?.filter(value => value && value.toString().trim() !== '')
    )] as string[]
    
    return uniqueValues.sort()
    
  } catch (error) {
    console.error(`💥 Unexpected error getting enum values for ${columnName}:`, error)
    return []
  }
}

// Get all enum values for deal form fields
export async function getAllDealEnums(): Promise<Record<string, string[]>> {
  try {
    
    // Start with essential fields only to reduce error surface
    const enumFields = [
      'veiculo',
      'produto', 
      'setor',
      'principal_indexador',
      'ipo_fon',
      'tipo',
      'publico_alvo',
      'status_deal',
      'tipo_cota'
    ]
    
    const enumMap: Record<string, string[]> = {}
    
    // Process fields sequentially to better track which ones fail
    for (const field of enumFields) {
      try {
        const values = await getEnumValues('deals', field)
        
        if (values && values.length > 0) {
          enumMap[field] = values
        } else {
          enumMap[field] = [] // Empty array, will trigger fallback
        }
      } catch (error) {
        console.error(`❌ Failed to load enum values for ${field}:`, error)
        enumMap[field] = [] // Empty array, will trigger fallback
      }
    }
    
    
    return enumMap
    
  } catch (error) {
    console.error('💥 Critical error loading deal enums:', error)
    return {}
  }
}

// Check database permissions for the deals table
export async function checkDatabasePermissions(): Promise<{
  canSelect: boolean
  canInsert: boolean
  canUpdate: boolean
  canDelete: boolean
  errors: string[]
}> {
  const errors: string[] = []
  let canSelect = false
  let canInsert = false
  let canUpdate = false
  let canDelete = false

  try {
    // Test SELECT permission
    const { error: selectError } = await supabase
      .from('deals')
      .select('deal_uuid')
      .limit(1)
    
    if (!selectError) {
      canSelect = true
    } else {
      errors.push(`SELECT error: ${selectError.message}`)
    }

    // Test INSERT permission with minimal data
    const testDeal = {
      nome_fundo: 'TEST_PERMISSION_CHECK',
      status_deal: 'Test',
      publico_alvo: 'Test',
      aprov_leitura: 'Test',
      aprov_analise: 'Test',
      resp_dcm: 'Test'
    }

    const { data: insertData, error: insertError } = await supabase
      .from('deals')
      .insert([testDeal])
      .select()
      .single()

    if (!insertError && insertData) {
      canInsert = true
      
      // If insert succeeded, test UPDATE
      const { error: updateError } = await supabase
        .from('deals')
        .update({ nome_fundo: 'TEST_UPDATED' })
        .eq('deal_uuid', insertData.deal_uuid)
      
      if (!updateError) {
        canUpdate = true
      } else {
        errors.push(`UPDATE error: ${updateError.message}`)
      }

      // Test DELETE
      const { error: deleteError } = await supabase
        .from('deals')
        .delete()
        .eq('deal_uuid', insertData.deal_uuid)
      
      if (!deleteError) {
        canDelete = true
      } else {
        errors.push(`DELETE error: ${deleteError.message}`)
      }
    } else if (insertError) {
      errors.push(`INSERT error: ${insertError.message}`)
      console.error('Insert error details:', {
        code: insertError.code,
        details: insertError.details,
        hint: insertError.hint
      })
    }

  } catch (error) {
    errors.push(`Unexpected error: ${error}`)
  }

  console.log('🔐 Permission check results:', {
    canSelect,
    canInsert,
    canUpdate,
    canDelete,
    errors
  })

  return {
    canSelect,
    canInsert,
    canUpdate,
    canDelete,
    errors
  }
}

// Delete a deal from the database
export async function deleteDeal(deal_uuid: string): Promise<boolean> {
  try {
    
    const { error } = await supabase
      .from('deals')
      .delete()
      .eq('deal_uuid', deal_uuid)

    if (error) {
      console.error('❌ Supabase error deleting deal:', error)
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return false
    }

    return true
  } catch (error) {
    console.error('💥 Unexpected error in deleteDeal:', error)
    return false
  }
}

// Get a single deal by ID
export async function getDeal(deal_uuid: string): Promise<Deal | null> {
  try {
    
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('deal_uuid', deal_uuid)
      .single()

    if (error) {
      console.error('❌ Supabase error fetching deal:', error)
      return null
    }

    return data as Deal
  } catch (error) {
    console.error('💥 Unexpected error in getDeal:', error)
    return null
  }
}

// Update backlog order for multiple deals
export async function updateBacklogOrder(dealUpdates: { deal_uuid: string, backlog_order: number }[]): Promise<boolean> {
  try {
    
    // Update each deal's backlog_order
    const updates = dealUpdates.map(update => 
      supabase
        .from('deals')
        .update({ backlog_order: update.backlog_order })
        .eq('deal_uuid', update.deal_uuid)
    )
    
    const results = await Promise.all(updates)
    
    // Check for errors
    const hasErrors = results.some(result => result.error)
    if (hasErrors) {
      console.error('❌ Some backlog order updates failed:', results.filter(r => r.error))
      return false
    }
    
    return true
  } catch (error) {
    console.error('💥 Unexpected error in updateBacklogOrder:', error)
    return false
  }
}