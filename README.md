# Morning Exercise

A small exercise-habit app for a coffee walk past a Singapore fitness corner. The default routine uses a push-up platform, a pull-up bar and parallel bars. A second fixed session, **Exercise with kids**, runs at home.

## Experience

Open the app → see the workout → Start. No first-run setup or goal picker. A discreet edit button changes only the morning time ceiling; the default is two minutes. The header switches between **Morning** and **With kids**, with no extra setup.

The normal two-minute routine is the user’s requested sequence: **8 platform push-ups → 8 knee raises → 10-second pull-up bar hang → 10-second parallel-bar hold → 8 squats**. The timer gives 8 seconds to prepare, 24 seconds for each set of reps, 10 seconds for each hold, and four 5-second rest/transition windows. Total: 120 seconds. Rep targets are ceilings, not a requirement to rush: stop early or pause for more rest and station changes. Hands stay elevated for push-ups, hang and support holds stay steady, and squats use a clear level standing area. No floor work, pull-ups, dips, jumps or drops. The one-minute small routine keeps the five movements at 3 reps each and 5-second holds, with preparation and rests.


**Exercise with kids** is exactly **20 seconds jumping jacks → 20 seconds rest → 20 seconds squats → 20 seconds rest**, once through, for 80 seconds total. It starts immediately with jumping jacks. The kids session has no Time control or one-minute shortcut. Selecting it does not change the morning time preference.

Finishing or tapping **End workout** returns immediately to the selected session’s original overview, ready for **Start workout** again. There is no save, feedback, completion screen, daily credit, progression, recovery-day substitution or resumed feedback draft. Every start resets the timer and phase order: preparation for Morning, jumping jacks for With kids. Session selection is kept in memory for the current page visit only. The completion bell and voice still play; an accessible status announces the return without adding a screen.

Only Time changes persist, under `on-the-way.preferences.v1`, as `{timeBudget}`. When this preference is absent, the current legacy profile's valid time choice can be read from `on-the-way.v1`. Legacy visits, levels and `on-the-way.pending.v1` drafts do not affect the app and are left untouched. Blocked storage does not prevent exercising. Time does not sync between devices.

The timer pauses when backgrounded or interrupted. Tapping Start unlocks a soft bell and bundled English trainer voice clips. A bell marks the beginning of the session, each phase boundary and completion. The voice says Get ready, Start, Rest and Workout complete, and counts the final five seconds of longer phases. Short phases prioritize their opening cue, then count the remaining seconds. Pause, guidance, End workout, a hidden tab and page navigation cancel pending cues. Resume restarts the current phase cue without replaying elapsed countdowns. The nine voice clips total about 30 KB and do not require installed device voices or a speech-service account. Browser speech is a fallback if clips cannot load. On Safari versions supporting the Audio Session API, Start and Resume select the playback session before opening Web Audio, avoiding the ambient route that iPhone Silent Mode can mute. Pause, page backgrounding and completion restore the previous session type after pending audio has ended. Older browsers continue with their existing audio behavior. Visual cues remain available; audible volume depends on device sound settings. Keep the app visible while exercising. The navy Ninja Arena background moves gently between workouts. Use its header pause control to stop it; it also stays still during a workout, in a hidden tab, or when Reduce Motion is enabled.

Small 8-bit movement previews appear in the routine list. During a strength step, the same pixel-art man demonstrates the movement beside the timer. Push-ups, knee raises and squats repeat on a three-second demonstration cycle; both the pull-up bar hang and parallel-bar support stay still. The hang reuses the knee-raise atlas’s initial straight-arm pose; squats have a matching new four-frame atlas. Demo poses follow the existing workout clock, pause with it, and do not restart on resume. Reduce Motion shows a static pose. Preparation and rests keep their existing timer. Artwork was generated with the built-in image-generation tool; the original atlas and complete prompt are saved in `assets/sprites/` and the five transparent four-frame strips are in `dist/sprites/`. The added squat source and exact generation prompt are saved as `assets/sprites/squat-source.png` and `assets/sprites/SQUAT-PROMPT.md`. Jumping jacks use a matching front-view four-frame strip on a two-second demonstration cycle; its source and exact prompt are `assets/sprites/jumping-jacks-source.png` and `assets/sprites/JUMPING-JACKS-PROMPT.md`. Timed demos show the movement without imposing a rep target.

These low repetition counts and short hold durations are personal app choices, not a validated clinical prescription. Movement references: [NASM incline push-up](https://www.nasm.org/resource-center/exercise-library/incline-push-up) and [Catalyst Athletics hanging leg raise and scaling options](https://www.catalystathletics.com/exercise/45/Hanging-Leg-Raise/). Concerning pain or unusual symptoms mean stop; professional guidance is appropriate where needed.

## Development

```sh
node --test tests/*.test.mjs
node --check dist/app.mjs
python3 -m http.server 8791 --bind 127.0.0.1 --directory dist
```

Buildless HTML/CSS/JavaScript; no API keys, account system, analytics, GPS or uploads. Production: https://morning-exercise-sg.vercel.app — deployed to Vercel on 22 October 2026. The two-minute routine is available over HTTPS without the Mac or shared Wi-Fi. Source: https://github.com/febriy/morning-exercise. Vercel serves `dist/` using the root `vercel.json`. Deploy from this directory with `vercel deploy --prod`. The GitHub repository is connected to the existing Vercel project. Pushes to `main` automatically deploy to the production address; other branches receive preview deployments. `.vercel/` contains ignored local project linking. Only the selected time is stored per browser and origin. Workouts are not recorded.

Safari audio routing reference: [WebKit issue 251532](https://bugs.webkit.org/show_bug.cgi?id=251532), including its recommendation to select `navigator.audioSession.type = "playback"`. The regression fixture models the documented Silent Mode routing behavior; it does not substitute for an audible check on a physical iPhone.
