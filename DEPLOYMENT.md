# QuickShow Vercel Deployment

This repository contains two separate apps. Deploy them as **two Vercel projects** from the same GitHub repository.

## 1. Backend Vercel project

- Import `SANDEEPPATE1/movieTicket`.
- Set **Root Directory** to `server`.
- Keep the included `server/vercel.json`.
- Add these Environment Variables for Production, Preview, and Development as appropriate:

| Variable | Value |
| --- | --- |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `MONGODB_DB_NAME` | `QuickShow` (optional; this is the code default) |
| `CLERK_SECRET_KEY` | Clerk secret key for the same Clerk application used by the frontend |
| `TMDB_ACCESS_TOKEN` | TMDB v4 API Read Access Token; alternatively use `TMDB_API_KEY` for a v3 API key |
| `FRONTEND_URL` | Deployed frontend URL, e.g. `https://your-frontend.vercel.app` |
| `STRIPE_SECRET_KEY` | Stripe secret key (needed for checkout) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (needed to confirm payments) |
| `SMTP_USER` | Brevo SMTP login (needed for email) |
| `SMTP_PASS` | Brevo SMTP key (needed for email) |
| `SENDER_EMAIL` | Verified sender email (needed for email) |
| `INNGEST_EVENT_KEY` | Inngest event key (needed for background functions) |
| `INNGEST_SIGNING_KEY` | Inngest signing key (needed for background functions) |

Do not put secrets in frontend variables, source code, or GitHub.

After deployment, open `https://YOUR-BACKEND.vercel.app/api/health`. It should return JSON with `success: true`, `database: "connected"`, and `tmdbConfigured: true`.

## 2. Frontend Vercel project

- Import the same GitHub repository again as a **new Vercel project**.
- Set **Root Directory** to `frontend`.
- Build command: `npm run build`.
- Output directory: `dist`.
- Add these frontend Environment Variables:

| Variable | Value |
| --- | --- |
| `VITE_BASE_URL` | Backend Vercel URL only, e.g. `https://your-backend.vercel.app` (no trailing slash and no `/api`) |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key for the same Clerk application |
| `VITE_CURRENCY` | Optional display currency, e.g. `₹` |

Redeploy the frontend after setting or changing Vite environment variables.

## 3. MongoDB Atlas

- In Atlas, open Network Access and allow connections from your deployment environment. For a quick deployment test, Atlas documents the broad `0.0.0.0/0` option; use least-privilege network access where possible.
- Confirm the database user in the URI has read/write access.
- The application uses the `QuickShow` database by default.

## 4. Clerk

- Use the same Clerk application for frontend and backend.
- Add the frontend Vercel domain to Clerk's allowed origins / domains.
- Set the backend `CLERK_SECRET_KEY` and frontend `VITE_CLERK_PUBLISHABLE_KEY`.
- Set the admin user's **Private Metadata** to `{ "role": "admin" }`.

## 5. TMDB

- Use a TMDB v4 Read Access Token in backend `TMDB_ACCESS_TOKEN`, or a v3 key in `TMDB_API_KEY`.
- Never expose the TMDB token with a `VITE_` variable.
- The local `ETIMEDOUT` shown in the developer's terminal means that computer/network could not open a TCP connection to TMDB. It is separate from Vercel's outbound connection. Test the deployed backend using the Add Shows page after configuring the backend variable.

## 6. Logout and MongoDB users

Logging out ends the Clerk session; it does **not** delete the MongoDB user document. The project deletes a MongoDB user only on Clerk's `clerk/user.deleted` event (permanent account deletion). This is intentional so bookings and favorites are not lost on ordinary logout.

## 7. Deploy order

1. Deploy backend and copy its Vercel URL.
2. Set frontend `VITE_BASE_URL` to that backend URL.
3. Deploy frontend.
4. Open backend `/api/health`.
5. Test login, Movies, Favorites, My Bookings, Admin, Add Shows, List Shows, and List Bookings.

A successful build does not prove that external environment variables, MongoDB access, Clerk, Stripe, Inngest, SMTP, or TMDB are configured. Verify each integration at runtime.
