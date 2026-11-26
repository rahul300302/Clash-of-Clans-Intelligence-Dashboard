import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { PLAYER_SESSION_COOKIE, readPlayerSession } from '@/lib/player-session'

export async function proxy(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  let response = NextResponse.next({ request: { headers: request.headers } })
  const path = request.nextUrl.pathname
  const playerTag = readPlayerSession(request.cookies.get(PLAYER_SESSION_COOKIE)?.value)
  const isAuthPage = path === '/login' || path === '/register'

  if (!url || !key) {
    if (playerTag && isAuthPage) {
      const dashboardUrl = request.nextUrl.clone()
      dashboardUrl.pathname = '/dashboard'
      return NextResponse.redirect(dashboardUrl)
    }
    return response
  }

  let user = null
  try {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    })
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
  }
  if ((user || playerTag) && isAuthPage) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/dashboard'
    return NextResponse.redirect(dashboardUrl)
  }
  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/my-clans/:path*', '/settings/:path*', '/login', '/register'],
}
