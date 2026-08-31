# Signup Onboarding Prototype

Standalone Vite + React + TypeScript prototype for the signup and onboarding flow at `/signup`.

## Run

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173/signup`.

## Flow

1. Business name
2. Current selling channels
3. First setup priority
4. Social media handles
5. Cococart shop link with mocked availability check
6. Email

The flow is intentionally linear so every screen is easy to inspect during engineering handoff.

## Auth screens

`/login` — email and password, based on the shadcn `login-05` block with the SSO
buttons removed. "Send me a code" (beside the password label) swaps the form for
a 6-digit one-time code, which can be resent or abandoned via "Change email
address". The prototype accepts `123456`; anything else shows the error state.

`/reset-password` — request a link, a "check your email" screen, then the new
password step and a confirmation. Since there is no mail to open, the sent
screen has an "Open the reset link (for prototype only)" button that stands in
for the emailed link; visiting `/reset-password?token=…` directly lands on the
same step.

`/activate-account` — where an invited user lands from their activation email:
name, password and confirm password in one form, then a confirmation that links
back to login. Passwords need at least 8 characters and the two entries must
match. Unlike `/signup` it takes a password, and unlike `/reset-password` it
names the account as well.

All three screens are mocked end to end — a successful login just navigates to
`/admin`.
