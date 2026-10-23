# Morning Exercise

A small exercise-habit app for a coffee walk past a Singapore fitness corner. The default routine uses a push-up platform, a pull-up bar and parallel bars. No floor work, pull-ups or dips.

## Experience

Open the app → see the workout → Start. No first-run setup or goal picker. A discreet edit button changes only the time ceiling; the default is two minutes.

The default is now two minutes. The first session has 20 seconds of preparation, up to three slow platform push-ups in a 15-second window, 25 seconds to rest and move, one small hanging knee raise in a five-second window, 25 seconds to rest and move, a three-second parallel-bar support hold, then 27 seconds of rest. Complete only the prescribed reps and rest for the rest of each window; no continuous repetitions to fill the timer. Hands are elevated on a high, stable platform, with feet on the ground. For the knee raise, bend the knees and make a small controlled curl without swinging. If it is too hard, use the familiar plain hang for up to three seconds instead. No pull-ups, dips, floor work, jumps or drops.

One-tap feedback guides the next visit. Strength days have a rest calendar day between them, at most three in seven days. Recovery days stay feet-down at the parallel bars, with no loaded holds, push-ups or knee raises. Three easy full visits over at least seven calendar days can advance a stage. Progression alternates a single additional push-up (maximum six) with a single additional second of support (maximum six). The knee raise stays at one attempt, with no automatic progression to straight-leg raises. Normal and recovery sessions use the selected time; the optional small session and the return after a week away last one minute. The time ceiling is never expanded.

Existing `personal-bars-v1` profiles migrate once to `personal-corner-v2`, resetting the dose and setting two minutes while preserving visit history. Current-program time preferences persist on subsequent loads. Browser-local storage does not sync between devices. The timer pauses when backgrounded or interrupted. Tapping Start unlocks a soft bell and bundled English trainer voice clips. A bell marks the beginning of the session, each phase boundary and completion. The voice says Get ready, Start, Rest and Workout complete, and counts the final five seconds of longer phases. Short phases prioritize their opening cue, then count the remaining seconds. Pause, guidance, End workout, a hidden tab and page navigation cancel pending cues. Resume restarts the current phase cue without replaying elapsed countdowns. The nine voice clips total about 30 KB and do not require installed device voices or a speech-service account. Browser speech is a fallback if clips cannot load. Visual cues remain available; audible volume depends on device sound settings. Keep the app visible while exercising. The lime-green morning background moves gently between workouts. Use its header pause control to stop it; it also stays still during a workout, in a hidden tab, or when Reduce Motion is enabled.

These low repetition counts, short hold durations and progression thresholds are personal app heuristics, not a validated clinical prescription. Movement references: [NASM incline push-up](https://www.nasm.org/resource-center/exercise-library/incline-push-up) and [Catalyst Athletics hanging leg raise and scaling options](https://www.catalystathletics.com/exercise/45/Hanging-Leg-Raise/). Concerning pain or unusual symptoms mean stop; professional guidance is appropriate where needed.

## Development

```sh
node --test tests/*.test.mjs
node --check dist/app.mjs
python3 -m http.server 8791 --bind 127.0.0.1 --directory dist
```

Buildless HTML/CSS/JavaScript; no API keys, account system, analytics, GPS or uploads. Production: https://morning-exercise-sg.vercel.app — deployed to Vercel on 22 October 2026. The two-minute routine is available over HTTPS without the Mac or shared Wi-Fi. Source: https://github.com/febriy/morning-exercise. Vercel serves `dist/` using the root `vercel.json`. Deploy from this directory with `vercel deploy --prod`. The GitHub repository is connected to the existing Vercel project. Pushes to `main` automatically deploy to the production address; other branches receive preview deployments. `.vercel/` contains ignored local project linking. Progress is stored per browser and origin, so the hosted app starts with fresh local history rather than importing LAN-preview history.
