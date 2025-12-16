# 🔐 Clerk Authentication Setup Guide

## Overview

The AI Content Detector uses Clerk for authentication to protect advanced features. Users can access:

- **Without Login:** Text detection and Voice assistant
- **With Google Login:** Text, Image, Video, and Document detection

## Why Clerk?

Clerk provides a complete authentication solution with:

- Pre-built UI components (sign-in modal, user button)
- Multiple OAuth providers (Google, GitHub, etc.)
- User management dashboard
- Session management out of the box
- Easy integration with Next.js

## Setup Instructions

### 1. Create a Clerk Account

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Sign up for a free account
3. Create a new application:
   - **Application Name:** AI Content Detector
   - **Choose how users will sign in:** Select Google

### 2. Get Your API Keys

1. In your Clerk dashboard, go to **API Keys**
2. Copy the following values:
   - **Publishable Key** (starts with `pk_test_...`)
   - **Secret Key** (starts with `sk_test_...`)

### 3. Configure Google OAuth (Optional - Clerk includes it by default)

Clerk provides Google OAuth out of the box, but you can customize it:

1. In Clerk dashboard, go to **User & Authentication** → **Social Connections**
2. Google is enabled by default
3. (Optional) Add your own Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add redirect URI: `https://your-clerk-frontend-api.clerk.accounts.dev/v1/oauth_callback`
   - Paste Client ID and Secret in Clerk dashboard

### 4. Configure Environment Variables

1. Navigate to the `frontend-next` directory
2. Create `.env.local` file:

   ```bash
   cp .env.local.example .env.local
   ```

3. Edit `.env.local` and add your Clerk keys:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   CLERK_SECRET_KEY=sk_test_your_secret_here
   ```

### 5. Start the Application

```bash
cd frontend-next
npm run dev
```

Visit `http://localhost:3000/detector` and test the Google login!

## Features

### Login Button

- Appears at the top of the detector page
- Shows "Sign in with Google" when logged out
- Opens a beautiful modal for authentication
- Shows user name and "Logout" button when logged in
- Managed by Clerk's pre-built components

### Protected Features

When not logged in, users see a lock screen for:

- Image Detection
- Video Detection
- Document Detection

The lock screen includes:

- Clear message explaining authentication requirement
- "Sign in with Google" button (opens Clerk modal)
- Visual lock icon animation

### Available Features

| Feature            | Without Login  | With Google Login |
| ------------------ | -------------- | ----------------- |
| Text Detection     | ✅ Full Access | ✅ Full Access    |
| Image Detection    | ❌ Locked      | ✅ Full Access    |
| Video Detection    | ❌ Locked      | ✅ Full Access    |
| Document Detection | ❌ Locked      | ✅ Full Access    |
| Voice Assistant    | ✅ Full Access | ✅ Full Access    |

## Files Created/Modified

### New Files

- `middleware.ts` - Clerk middleware for route protection
- `.env.local.example` - Environment variable template

### Modified Files

- `app/layout.tsx` - Added ClerkProvider wrapper
- `components/LoginButton.tsx` - Uses Clerk's SignInButton and useUser hook
- `components/ProtectedFeature.tsx` - Uses Clerk's useUser hook for auth state
- `lib/auth.ts` - No longer needed (Clerk handles everything)

### Removed Files

- `app/auth/callback/route.ts` - Not needed with Clerk (handles OAuth internally)

## How It Works

### Authentication Flow

```
1. User clicks "Sign in with Google"
   ↓
2. Clerk modal opens with Google button
   ↓
3. User authorizes on Google
   ↓
4. Clerk handles OAuth callback automatically
   ↓
5. User is redirected back to the app
   ↓
6. Session is created and managed by Clerk
   ↓
7. User is now authenticated!
```

### Session Management

- Clerk automatically manages sessions via cookies
- Sessions persist across page refreshes
- `useUser()` hook provides real-time auth state
- Session expires based on Clerk settings (configurable in dashboard)
- Middleware protects routes server-side

### Middleware Protection

The `middleware.ts` file protects routes:

- **Public routes:** `/`, text detection API, voice API
- **Protected routes:** Image, video, document detection APIs
- Automatically redirects unauthenticated users

## Clerk Components Used

### Client Components

- `<SignInButton>` - Triggers sign-in modal
- `<SignOutButton>` - Handles logout
- `useUser()` - Hook for user state and authentication status

### Provider

- `<ClerkProvider>` - Wraps the entire app in layout.tsx

## Security Notes

- Never commit `.env.local` to version control (already in .gitignore)
- Publishable key is safe to expose (public by design)
- Secret key must be kept secure (server-side only)
- Clerk handles all security best practices

## Troubleshooting

### "Sign in with Google" button doesn't work

**Check:**

1. Clerk keys are correct in `.env.local`
2. Both `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are set
3. Application is running on `http://localhost:3000`
4. No errors in browser console (F12)

**Test:**

- Open browser console to check for errors
- Verify environment variables are loaded
- Check Clerk dashboard for any setup issues

### Modal doesn't open

**Fix:**

1. Hard refresh the page (Ctrl+Shift+R)
2. Clear browser cache
3. Check that ClerkProvider is wrapping the app in `layout.tsx`
4. Ensure middleware.ts is in the root of your app directory

### Session not persisting

**Fix:**

1. Check that cookies are enabled in your browser
2. Ensure you're using `http://localhost:3000` (not `127.0.0.1`)
3. Clear cookies and try again
4. Check Clerk dashboard → Sessions settings

### Protected features still showing when logged out

**Fix:**

1. Hard refresh the page (Ctrl+Shift+R)
2. Check that middleware.ts is configured correctly
3. Verify `useUser()` is returning correct state
4. Check browser console for errors

## User Management

### Clerk Dashboard Features

1. **Users Tab:** View all registered users
2. **Analytics:** See sign-up rates and active users
3. **Session Management:** Configure session duration
4. **Customize:** Change appearance of sign-in modal
5. **Webhooks:** Get notified of user events

### Customization

You can customize the sign-in experience:

1. Go to Clerk dashboard → **Customization**
2. Customize:
   - Logo and branding
   - Colors and theme
   - Sign-in modal appearance
   - Email templates

## Production Deployment

When deploying to production:

### 1. Update Clerk Settings

1. In Clerk dashboard, go to **Domains**
2. Add your production domain: `https://yourdomain.com`
3. Update allowed origins and redirect URLs

### 2. Update Environment Variables

In your hosting platform (Vercel, Netlify, etc.), set:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_production_key
CLERK_SECRET_KEY=sk_live_your_production_secret
```

⚠️ **Important:** Use production keys (pk*live*_ and sk*live*_) in production!

### 3. Deploy

Deploy your application - Clerk will automatically work in production!

## Additional Clerk Features

### Multi-Factor Authentication

Enable 2FA in Clerk dashboard → **User & Authentication** → **Multi-factor**

### Email/Password Authentication

Enable in **Social Connections** to allow email signup

### More OAuth Providers

Clerk supports:

- GitHub
- Facebook
- Twitter
- Microsoft
- Discord
- And many more!

Enable them in **Social Connections**

### User Metadata

Store custom data on users:

```tsx
import { useUser } from "@clerk/nextjs";

const { user } = useUser();
await user.update({
  publicMetadata: { plan: "premium" },
});
```

## API Routes Protection

Protect API routes with Clerk:

```typescript
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Your protected logic here
}
```

## Support

For issues or questions:

- Clerk Documentation: https://clerk.com/docs
- Clerk Discord: https://clerk.com/discord
- GitHub Issues: Your repository

---

**🎉 Your authentication is now powered by Clerk!**

Clerk provides the most developer-friendly authentication experience with minimal setup and maximum features.
