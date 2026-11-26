import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ items: [] })

  const { data, error } = await supabase
    .from('search_history')
    .select('id, query, resource_type, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    if (error.code === 'PGRST205') return Response.json({ items: [], warning: 'Search history table is not migrated yet.' })
    return Response.json({ error: error.message }, { status: 500 })
  }
  return Response.json({ items: data || [] })
}

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ items: [] })

  const body = await request.json()
  const query = String(body.query || '').trim()
  const resourceType = String(body.resourceType || 'search').trim().slice(0, 30)
  if (!query) return Response.json({ error: 'Search query is required' }, { status: 400 })

  const { error } = await supabase.from('search_history').insert({
    user_id: user.id,
    query,
    resource_type: resourceType,
  })

  if (error) {
    if (error.code === 'PGRST205') return Response.json({ success: false, warning: 'Search history table is not migrated yet.' })
    return Response.json({ error: error.message }, { status: 500 })
  }
  return Response.json({ success: true })
}

export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ success: true })
  const { error } = await supabase.from('search_history').delete().eq('user_id', user.id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true })
}
