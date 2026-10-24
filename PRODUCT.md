# Morning Exercise

A personal web app for building an exercise habit at a Singapore fitness corner during a morning coffee walk. Success is opening the app, seeing an approachable workout and starting it immediately.

## Constraints

- Phone first, often outdoors. Make instructions readable in daylight and controls easy to tap.
- No onboarding, account, goal picker, dashboard or history screen. The sole goal is building the habit.
- Finishing must offer a clear return to the main workout. Feedback is optional. The routine remains visible after today’s visit, and Start again resets the timer without deleting history or awarding duplicate daily progression credit.
- The normal two-minute routine has exactly five movements in order: 8 platform push-ups, 8 knee raises, a 10-second pull-up bar hang, a 10-second parallel-bar hold and 8 squats. It includes preparation and four short station rests. The one-minute version reduces reps and holds.
- Preserve recovery handling, feedback, time choices and locally saved history. Repetition and hold targets remain at the user’s requested counts; stages must not silently increase them.
- No floor exercises, pull-ups, dips, jumps or drops.
- Tone: calm, direct, encouraging without pressure or invented fitness claims.
- Familiar, Apple-like simplicity; one primary action per screen.
- Visual identity: the user chose Ninja Arena, an outrageous athlete/obstacle-arena style with navy, red and cyan, oversized athletic type and moving course lines. Keep the operation simple within that bold visual world.

## Delivery

Buildless HTML/CSS/JavaScript in `dist/`. Tests use Node's standard test runner. GitHub `main` deploys automatically to https://morning-exercise-sg.vercel.app through the existing Vercel project.
