import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // Intercept Supabase password recovery codes that land on any page other than
  // /auth/callback (this happens when Supabase's redirect_to is set to the site root).
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  if (code && type === 'recovery' && pathname !== '/auth/callback') {
    const callbackUrl = request.nextUrl.clone()
    callbackUrl.pathname = '/auth/callback'
    return NextResponse.redirect(callbackUrl)
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isPendingPage = request.nextUrl.pathname === '/pending'

  // Let static files, favicon, etc. pass through
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname === '/favicon.ico'
  ) {
    return response
  }

  const isAuthCallback =
    request.nextUrl.pathname === '/auth/callback' ||
    request.nextUrl.pathname === '/auth/update-password' ||
    request.nextUrl.pathname.startsWith('/auth/threads/')

  if (!user && !isAuthPage && !isPendingPage && !isAuthCallback) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  if (user) {
    // Query database for user profile details
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_approved, role')
      .eq('user_id', user.id)
      .maybeSingle()

    const isApproved = profile?.is_approved || false
    const role = profile?.role || 'user'

    if (!isApproved) {
      if (!isPendingPage && !isAuthPage && !isAuthCallback) {
        return NextResponse.redirect(new URL('/pending', request.url))
      }
    } else {
      if (isPendingPage) {
        return NextResponse.redirect(new URL('/', request.url))
      }
      if (isAuthPage && !isAuthCallback) {
        return NextResponse.redirect(new URL('/', request.url))
      }
      if (request.nextUrl.pathname.startsWith('/admin') && role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
