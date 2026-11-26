import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
const maxSize = 5 * 1024 * 1024

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Authentication required' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin.from('profiles').select('is_admin').eq('id', user.id).maybeSingle()
  if (!profile?.is_admin) return Response.json({ error: 'Admin access required' }, { status: 403 })

  const formData = await request.formData()
  const file = formData.get('file')
  const playerTag = String(formData.get('playerTag') || '').trim().toUpperCase()
  const playerName = String(formData.get('playerName') || '').trim()
  const townHallLevel = Number(formData.get('townHallLevel'))

  if (!(file instanceof File)) return Response.json({ error: 'Image file is required' }, { status: 400 })
  if (!playerTag || !playerName) return Response.json({ error: 'Player tag and name are required' }, { status: 400 })
  if (!allowedTypes.has(file.type)) return Response.json({ error: 'Only JPEG, PNG, and WebP images are allowed' }, { status: 400 })
  if (file.size > maxSize) return Response.json({ error: 'Image must be 5 MB or smaller' }, { status: 400 })
  if (!Number.isInteger(townHallLevel) || townHallLevel < 1 || townHallLevel > 20) return Response.json({ error: 'Invalid Town Hall level' }, { status: 400 })

  const normalizedTag = playerTag.startsWith('#') ? playerTag : `#${playerTag}`
  const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const storagePath = `current-war/${normalizedTag.replace(/^#/, '').toUpperCase()}.${extension}`

  const { data: existing } = await admin.from('war_base_images').select('storage_path').eq('player_tag', normalizedTag).maybeSingle()
  if (existing?.storage_path) await admin.storage.from('war-base-images').remove([existing.storage_path])

  const { error: uploadError } = await admin.storage.from('war-base-images').upload(storagePath, file, { contentType: file.type, upsert: true })
  if (uploadError) return Response.json({ error: uploadError.message }, { status: 500 })

  const { data: publicUrl } = admin.storage.from('war-base-images').getPublicUrl(storagePath)
  const { data: signed } = await admin.storage.from('war-base-images').createSignedUrl(storagePath, 3600)
  const imageUrl = signed?.signedUrl || publicUrl.publicUrl

  const { error: databaseError } = await admin.from('war_base_images').upsert({
    player_tag: normalizedTag,
    player_name: playerName,
    town_hall_level: townHallLevel,
    base_type: 'War Base',
    image_url: imageUrl,
    storage_path: storagePath,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'player_tag' })

  if (databaseError) {
    await admin.storage.from('war-base-images').remove([storagePath])
    return Response.json({ error: databaseError.message }, { status: 500 })
  }

  return Response.json({ success: true, image_url: imageUrl, storage_path: storagePath })
}
