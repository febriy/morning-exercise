# Morning Exercise

A personal web app for building an exercise habit at a Singapore fitness corner during a morning coffee walk, and at home with his kids. Success is opening the app, seeing an approachable workout and starting it immediately.

## Constraints

- Phone first, often outdoors. Instructions must be readable and controls easy to tap.
- No onboarding, account, goal picker, dashboard, history screen or workout saving. The sole goal is building the habit.
- Finishing or ending returns immediately to the selected session’s original overview with **Start workout** ready. There is no completion page, effort feedback, saved-visit message, daily lockout, progression or automatic recovery routine. Each start resets the timer and movement order.
- The default two-minute routine has exactly five movements: 8 platform push-ups, 8 knee raises, a 10-second pull-up bar hang, a 10-second parallel-bar hold and 8 squats. Preparation and four station rests are included. The one-minute option reduces reps and holds.
- A header selector switches between **Morning** and **With kids** without setup. **Exercise with kids** is a default 85-second session: Get ready 5 seconds, jumping jacks 20 seconds, rest 20 seconds, squats 20 seconds, rest 20 seconds. One preparation phase, with no extra rounds. Completion and End return to this same selected session, ready to restart. Selection lasts for the current page visit only.
- **Edit session** opens a simple editor for the selected session: choose an existing exercise type, change its seconds, add or remove steps, and Save changes. Get ready and Rest are editable steps too. The live total includes every step; allow 1–600 whole seconds per step, at least one exercise, at most 20 steps and no more than 10 minutes total. Back discards a draft. Restore original routine previews the default in the editor and needs Save to apply.
- The chosen morning time and edited session configurations are remembered on this browser; completed workouts are never recorded. Custom routines are timed, with all steps shown in their exact order. The original morning routine retains its rep targets until edited. Time presets and the one-minute shortcut apply to the default morning routine only. Legacy visits and feedback drafts are ignored; existing stored records are left untouched. Without browser storage, workouts still start and reset normally.
- The default morning session has no floor exercises, pull-ups, dips, jumps or drops. The home session includes the explicitly requested jumping jacks. Keep movement guidance, rest breaks, Pause, and stop-for-pain instructions.
- Bell, voice cues, pixel demonstrations, background motion controls and Reduce Motion remain available.
- Tone: calm, direct, encouraging without pressure or invented fitness claims. Familiar operation with one primary action per screen.
- Visual identity: Ninja Arena, the user's chosen athlete/obstacle-arena style with navy, red and cyan, oversized athletic type and moving course lines.

## Delivery

Buildless HTML/CSS/JavaScript in `dist/`. Tests use Node's standard runner. GitHub `main` deploys automatically to https://morning-exercise-sg.vercel.app through the existing Vercel project.
