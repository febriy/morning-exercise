# Morning Exercise

A personal web app for building an exercise habit at a Singapore fitness corner during a morning coffee walk. Success is opening the app, seeing an approachable workout and starting it immediately.

## Constraints

- Phone first, often outdoors. Make instructions readable in daylight and controls easy to tap.
- No onboarding, account, goal picker, dashboard or history screen. The sole goal is building the habit.
- Default two-minute routine includes preparation, three platform push-ups, one small hanging knee raise, a short parallel-bar support and generous rests.
- Preserve the existing plain-hang fallback, recovery policy, feedback, progression, time choices and locally saved history.
- No floor exercises, pull-ups, dips, jumps or drops.
- Tone: calm, direct, encouraging without pressure or invented fitness claims.
- Familiar, Apple-like simplicity; one primary action per screen.

## Delivery

Buildless HTML/CSS/JavaScript in `dist/`. Tests use Node's standard test runner. GitHub `main` deploys automatically to https://morning-exercise-sg.vercel.app through the existing Vercel project.
