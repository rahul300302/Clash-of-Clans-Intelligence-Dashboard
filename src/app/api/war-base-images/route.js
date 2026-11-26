import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('war_base_images')
    .select('*')
    .order('town_hall_level', { ascending: false })

  if (error) {
    if (error.code === 'PGRST205' || error.message?.includes('Could not find')) {
      return Response.json({ error: 'War Base database is not configured. Apply migration 202611250002_add_war_base_images.sql.' }, { status: 503 })
    }
    return Response.json({ error: error.message }, { status: 500 })
  }

  const images = await Promise.all((data || []).map(async (item) => {
    if (!item.storage_path) return item
    const { data: signed, error: signedError } = await admin.storage
      .from('war-base-images')
      .createSignedUrl(item.storage_path, 3600)
    return { ...item, signed_url: signedError ? null : signed?.signedUrl || null }
  }))

  return Response.json({ items: images })
}

export async function DELETE(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Authentication required' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin.from('profiles').select('is_admin').eq('id', user.id).maybeSingle()
  if (!profile?.is_admin) return Response.json({ error: 'Admin access required' }, { status: 403 })

  const { searchParams } = request.nextUrl
  const playerTag = searchParams.get('playerTag')
  if (!playerTag) return Response.json({ error: 'playerTag is required' }, { status: 400 })

  const { data: record } = await admin.from('war_base_images').select('storage_path').eq('player_tag', playerTag).maybeSingle()
  if (!record) return Response.json({ error: 'Image not found' }, { status: 404 })

  if (record.storage_path) {
    const { error: storageError } = await admin.storage.from('war-base-images').remove([record.storage_path])
    if (storageError) return Response.json({ error: storageError.message }, { status: 500 })
  }

  const { error } = await admin.from('war_base_images').delete().eq('player_tag', playerTag)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true })
}
