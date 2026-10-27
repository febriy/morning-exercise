---
name: On the Way — Ninja Arena
description: Broadcast-sport energy for a simple fitness-corner routine.
colors:
  "canvas": "#07172e"
  "surface": "#102742"
  "ink": "#ffffff"
  "muted": "#b8cce1"
  "line": "#304862"
  "soft": "#173651"
  "action": "#e51f34"
  "action-hover": "#ce182c"
  "energy": "#67dfff"
  "focus": "#67dfff"
  "preview": "#dcebf3"
  "rest-canvas": "#103e47"
  "rest-surface": "#164d56"
  "course-rail": "#245b77"
  "course-red": "#8e2338"
  "course-ground": "#102a45"
  "notice-bg": "#473315"
  "notice-text": "#ffdf9e"
typography:
  display:
    fontFamily: "\"Barlow Condensed\", \"Arial Narrow\", sans-serif"
    fontSize: "clamp(3.5rem, 17vw, 5.5rem)"
    fontWeight: 900
    lineHeight: 0.92
    letterSpacing: "-.02em"
  headline:
    fontFamily: "\"Barlow Condensed\", \"Arial Narrow\", sans-serif"
    fontSize: "1.75rem"
    fontWeight: 800
    lineHeight: 1.05
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"
    fontSize: "1rem"
    lineHeight: 1.5
  movement-label:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"
    fontSize: ".875rem"
    fontWeight: 650
    lineHeight: 1.3
  button-label:
    fontFamily: "\"Barlow Condensed\", \"Arial Narrow\", sans-serif"
    fontSize: "1.625rem"
    fontWeight: 800
    lineHeight: 1.1
  duration:
    fontFamily: "\"Barlow Condensed\", \"Arial Narrow\", sans-serif"
    fontSize: "1.875rem"
    fontWeight: 800
    lineHeight: 1
  dose:
    fontFamily: "\"Barlow Condensed\", \"Arial Narrow\", sans-serif"
    fontSize: "2.125rem"
    fontWeight: 800
    lineHeight: 0.95
  countdown:
    fontFamily: "\"Barlow Condensed\", \"Arial Narrow\", sans-serif"
    fontSize: "6rem"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-.02em"
rounded:
  "preview": "6px"
  "small": "8px"
  "text-control": "10px"
  "control": "12px"
  "panel": "16px"
spacing:
  "4": "4px"
  "8": "8px"
  "10": "10px"
  "12": "12px"
  "16": "16px"
  "20": "20px"
  "24": "24px"
  "28": "28px"
  "32": "32px"
  "36": "36px"
  "48": "48px"
  "64": "64px"
  "80": "80px"
components:
  editor-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px"
    height: "48px"
  editor-add-step:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.energy}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
    height: "48px"
  session-picker:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.text-control}"
    padding: "10px 8px"
    height: "44px"
  session-picker-selected:
    backgroundColor: "{colors.energy}"
    textColor: "{colors.canvas}"
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.ink}"
    typography: "{typography.button-label}"
    rounded: "{rounded.control}"
    padding: "16px 22px"
    height: "64px"
    width: "100%"
  button-primary-hover:
    backgroundColor: "{colors.action-hover}"
  button-text:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.text-control}"
    padding: "12px"
  button-icon:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.control}"
    padding: "10px"
    size: "44px"
  routine-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    padding: "10px 0"
    height: "68px"
  countdown-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    height: "176px"
    width: "100%"
  countdown-panel-rest:
    backgroundColor: "{colors.rest-surface}"
  guidance-panel:
    backgroundColor: "{colors.soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "16px"
---

# Design System: On the Way — Ninja Arena

## Overview

**Creative North Star: "Ninja Arena"**

Ninja Arena gives a small personal workout the presence of an athlete’s arena entrance. Midnight navy, signal red, ice cyan and oversized condensed type carry the energy; clear instructions and familiar controls keep the operation calm and direct.

Cropped course rails move at the edge of the view. The foreground is a disciplined reading and action layer: aligned numbered stations, exact quantities, one primary action, and matching pixel-art movement demos. The identity is athletic without competition, scores or extra tasks.

**Key Characteristics:**
- Midnight navy with white reading text, red actions and cyan station markers.
- Black italic display type paired with upright condensed numerals and system body text.
- Flat, aligned movement rows and rectangular timing panels.
- One slow course drift that stops throughout active and paused workouts.

## Colors

The palette is a dark arena with high-contrast reading and deliberately separated action and state colors. Frontmatter values are normative.

### Primary
- **Signal Red** (`action`, `action-hover`): primary Start, Pause, Resume and return controls; white labels meet 4.59:1 contrast on the default red.

### Secondary
- **Ice Cyan** (`energy`, `focus`): station numbers, metadata rule, selected sessions, active progress, selection, caret and keyboard focus.
- **Rest Teal** (`rest-canvas`) and **Rest Surface** (`rest-surface`): the full preparation/rest background and its countdown panel, including paused breaks. Keep explicit phase labels alongside this state color.

### Neutral
- **Midnight Navy** (`canvas`): page, background scene and dark text on cyan.
- **Arena Surface** (`surface`) and **Soft Arena** (`soft`): timer, editor fields and opened guidance; secondary hover surfaces.
- **White Ink** (`ink`), **Tinted Secondary** (`muted`) and **Arena Line** (`line`): primary reading, supporting copy and thin dividers. Scrollbars use line over canvas.
- **Pale Demo Ground** (`preview`): separates existing pixel sprites from the dark arena.
- **Course Rail**, **Course Red** and **Course Ground**: restrained background geometry, distinct from the functional foreground.
- **Notice Ground** and **Notice Text**: warm storage and safety notices.

**The Action Color Rule.** Red identifies the primary action; cyan identifies station order, selection, focus and active progress.

## Typography

**Display Font:** self-hosted Barlow Condensed, with Arial Narrow and sans-serif fallbacks. Black Italic (900) supplies the hero and wordmark; upright ExtraBold (800) supplies actions, quantities, countdowns, duration and section titles. Font synthesis is disabled.

**Body Font:** the system stack recorded in frontmatter. Supporting text remains upright and readable outdoors.

The hero is uppercase, tightly tracked and deliberately oversized. Its default responsive scale is the frontmatter `display`; the overview heading grows to 6rem on desktop. The player uses 3.5rem. Compact phone height reduces overview headings to 3.5rem and player headings to 2.75rem. The wordmark is 1.375rem italic.

The upright hierarchy uses the recorded headline, button, duration, dose and countdown roles. A countdown beside a demo is 4.5rem, reducing to 3.75rem on narrow phones. All quantities and timers use tabular numerals. Body cues are 1rem; supporting copy ranges from .75rem to .9375rem. Movement station labels are .75rem, dose units .6875rem; narrow phones reduce movement labels to .8125rem and station labels to .6875rem. Preserve the distinction between expressive titles and plain instructions.

## Layout

Phone first: a centered shell (maximum 520px) uses 24px side gutters, at least 100svh height and bottom safe-area padding. The header is at least 76px high. The overview flows from hero to metadata, the default five-row Morning circuit, four-row At home circuit or five-row kids sequence, or every step of a custom routine, and Start area. Normal rows are at least 68px high with 10px vertical padding; the Start area uses remaining vertical space without overlapping content.

At widths below 375px, gutters become 20px, row gaps 8px and static previews 32px. At heights up to 720px and widths below 900px, the header becomes 56px, rows at least 52px with 6px vertical padding, surrounding gaps tighten and primary controls become at least 58px high. Allow vertical scrolling: the 320×568 view requires it, with no horizontal overflow. The 390×844 At home overview fits its four activities, timing note and Start; compact and short phones keep lower controls reachable by scrolling.

At 900px and wider, only the overview expands into two work areas within a maximum 1180px shell, with 48px side padding and an 80px column gap. The hero and action occupy the left; duration, circuit and note occupy the right. Rows become at least 86px high and previews 48px. The session editor and player retain their narrow, centered shells.

**The Immediate Start Rule.** Show the workout and its single primary Start action without adding an introductory step.

## Elevation & Depth

No box shadows or backdrop blur. Depth comes from navy tonal separation, pale demo grounds, hairline row dividers and large cropped course geometry. The fixed background is clipped, contained, pointer-inert and below the app; it is never a reading surface or an overlay on controls.

## Shapes

Rectangular controls with modest curved corners define the foreground. Preview frames use the smallest radius, controls the standard radius, and timer panels the panel radius. Rows remain unboxed. The countdown is a broad rectangle with a 6px bottom progress strip, despite the legacy timer name in source.

The brand mark is two red diagonal strokes. Course geometry uses a triple oval rail (1080×600px, 2px strokes), red bar and thick lower loop, rotated across the margins. These are background course markings, not component borders or floating cards. The app favicon and iPhone Home Screen icon use the user-selected 💪 emoji on midnight navy; the in-app diagonal-stroke mark remains unchanged.

## Components

### Buttons and Header

Primary controls are full-width red with white uppercase upright condensed labels, a trailing 24px SVG icon, at least 64px height and standard control corners. Hover darkens red; press also scales to .985. The transition is 160ms ease-out. Compact phone height lowers the minimum height to 58px. Disabled buttons use .45 opacity.

Text and icon actions are transparent with tinted secondary text; hover uses the soft arena surface and white text. Text and icon targets are at least 44px. The overview header carries the Morning / At home / With kids selector and background-motion toggle. Edit session is the metadata row’s timing action; the former Time presets are retired. Every overview, including custom routines, retains the secondary Bare minimum action below Start. Session editing replaces the selector with Back. The player carries the italic wordmark or the At home, With kids or Bare minimum label.

Keyboard focus is a 3px cyan outline offset by 4px. Selection is cyan with navy text; the caret is cyan. Keep these native interaction treatments on future controls.

### Session Selector

A native three-button group uses Morning, At home and With kids, with full accessible names and `aria-pressed` on each button. The selected choice uses cyan with navy text; the other choices are transparent with tinted text and a soft hover surface. Buttons use 800 upright condensed 1.125rem type, 10px corners, 10px vertical by 8px horizontal padding, 4px gap and the existing minimum 44px height. Each button shares the available width without wrapping its label. Selection changes the visible workout directly without setup and keeps one Start action.

### Circuit Rows

A continuous transparent list uses numbered cyan stations, a pale square static sprite, a two-line label and a right-aligned condensed dose. A cyan 3px rule separates metadata from the first row; thin arena lines divide every movement. Static previews are 38px normally. Preserve the exact five default morning movements and dose order: 8 platform push-ups, 8 knee raises, a 10-second pull-up bar hang, a 10-second parallel-bar hold and 8 squats. Eight seconds of preparation, 24 seconds for each rep set, 10 seconds for each hold and four 15-second rests total 2 min 40 sec. The overview note explicitly states “15 sec rest between exercises.” The default At home overview groups four activities in order: 20 seconds of incline push-ups, 20 seconds of kettlebell swings, two minutes on the trampoline and five minutes packing with squats. The last two doses show 2 and 5 with the min unit, keeping the existing aligned dose treatment. Its total is 8 min 40 sec, and its note explicitly states “15 sec prep · 15 sec rest between activities.” Packing means normal packing for five minutes, using a comfortable squat only for floor pickups; its station label is “Squat for floor pickups.” Kettlebell squats remain available in the editor for explicit custom routines but are absent from this default. The default kids overview shows the five-second preparation followed by all four timed intervals, including both rests; never deduplicate them. Custom routines show every step in order, including duplicate rests. The duration row carries a 44px Edit session action; all three overviews keep one primary Start below.

### Session Editor

The editor inherits the narrow shell, Back header and arena colors. A fixed 3.5rem title identifies the task; the selected session appears below. Each numbered fieldset pairs a native exercise select with a numeric Seconds input and a 48px remove action. Inputs use system 1rem type to remain readable and avoid phone focus zoom, 48px height, 12px corners, arena surface and line border. The default grid is flexible exercise / 76px seconds / 44px removal, with 8px gaps. Below 375px, the exercise spans the full width and seconds/removal form the next row, keeping long exercise names readable.

A full-width secondary Add step follows the list. The live total, browser-storage explanation, red Save changes action and quiet Restore original routine action complete the flow. Empty drafts explain how to add a movement. Validation uses the existing warm notice colors, points to the invalid step, marks invalid numeric fields and focuses the error; controls retain the cyan focus ring. Back discards without writing. Restore only changes the draft until saved. All eight default At home phases are editable: 15 seconds prep, 20 seconds incline push-ups, 15 seconds rest, 20 seconds kettlebell swings, 15 seconds rest, 120 seconds trampoline, 15 seconds rest and 300 seconds packing with squats, totaling 520 seconds. Morning, At home and With kids settings persist independently under the existing `on-the-way.sessions.v1` key using payload version 3. Loading accepts versions 1, 2 and 3; version-1 and version-2 At home overrides retire so this replacement default appears. Other sessions stay saved. The existing version-1 Morning rest migration still changes rests to 15 seconds in memory, preserving the original legacy routine if that would exceed ten minutes. Version-2 and version-3 explicit Morning rest edits retain their exact durations, version-3 At home edits remain exact, and migration never writes automatically. Retired time preferences remain untouched and ignored. Session editing never adds a completion or history screen.

### Countdown, Guidance and Sprites

Preparation and rest use the teal `rest-canvas` across the background and `rest-surface` on the timer panel. Explicit Get ready / Rest headings and Prep time left / Rest time left labels distinguish the phase without relying on color. A 2rem upright condensed Next heading (1.75rem on compact-height phones) names the upcoming exercise; its station is cyan 0.875rem below. The Next prefix is a small inline system label, not a separate eyebrow. The existing 168px demo sits beside the current phase countdown; its animation follows the break clock, freezes on pause, and is static with Reduce Motion. Starting the actual movement resets its demonstration and retains its complete exercise time. Look ahead to the next movement/hold even across intervening prep/rest steps. Preparation and rest also announce “Next exercise” followed by the same upcoming movement name, including edited sequences. Twenty bundled voice clips include all eleven movement announcements, including Trampoline and Packing with squats; countdown numbers wait for the complete name and skip expired counts. Final rest shows All movements done, a full-width timer and no preview or invented next-exercise announcement. Finishing or ending restores the original navy background.

The timer is a surface-colored panel with centered upright countdown and supporting status. Its bottom cyan strip shows active progress; rest uses tinted secondary and paused status turns cyan. Demo steps place the existing square sprite beside it (168px, or 128px below 375px); narrow demo timers are at least 152px high, other panels at least 176px. Sprites remain pixelated and square, using transparent four-frame strips on a pale ground. Frame selection follows exercise time; it stops when the workout is paused. The kettlebell squat, swing and trampoline strips match the existing pixel character, palette and four-frame format. Incline push-ups reuse the platform push-up sprite; Bare minimum and Packing with squats use the bodyweight squat sprite. Packing’s accessible demo description and visible guidance identify the squat as the floor-pickup movement, with no continuous squat pace or rep target.

The guidance disclosure has a 44px summary target and a simple chevron. Opening it reveals a soft arena panel and pauses the workout. The single red Pause/Resume action follows cue and next-step text; End workout remains secondary.

### Returning to the workout and Motion

Finishing or ending returns directly to the same selected session’s overview with **Start workout** ready, including its saved custom routine. No completion page, saved-visit state, effort feedback or recovery substitution interrupts the loop. The completion bell and voice remain, with a visually hidden status announcement. All three independently edited session configurations are remembered; session selection lasts for the current page visit. The default kids sequence starts with five seconds of preparation followed by four 20-second intervals, totaling 85 seconds. Its jumping-jacks demo loops every two seconds; squat, kettlebell squat and packing pickup demos retain the three-second cycle, while kettlebell swings and trampoline loop every two seconds.

**Bare minimum · 20s squats** is a quiet text action on every overview, including custom routines. It replaces the former one-minute shortcut and starts a separate 25-second run: five seconds of preparation followed by 20 seconds of bodyweight squats, without rest or a rep target. It never changes the selected session or any saved settings. Completion and End return to the selected overview; Bare minimum never becomes its replacement.

Three bounded background elements share one course-drift animation: 24 seconds, ease-in-out, alternating between small opposing translations. This creates one slow peripheral drift. The background toggle controls it; Reduce Motion removes transitions and animations and hides the motion toggle. Hidden tabs stop the background and pause an active workout. Screen changes focus the main landmark; countdown updates do not move focus.

**The Exercise Stillness Rule.** Decorative course motion stays frozen throughout active and paused workouts and yields to manual pause, hidden tabs and Reduce Motion.

## Do's and Don'ts

### Do:
- **Do** retain the large athletic display face and the quieter system-font instructions.
- **Do** align station numbers, movement labels and right-aligned doses in one continuous list.
- **Do** keep the normal routine at 8 push-ups, 8 knee raises, a 10-second hang, a 10-second hold and 8 squats, with four 15-second rests and a 2 min 40 sec total.
- **Do** keep focus visible, secondary text tinted, tap targets generous and short screens scrollable.
- **Do** preserve the existing sprites on pale square grounds and the one-primary-action flow.

### Don't:
- **Don't** restore the superseded lime-and-forest palette or white grouped-card identity.
- **Don't** add photos, new raster decoration, floating movement cards, shadows or competitive metrics.
- **Don't** animate the course during an active or paused workout.
- **Don't** replace the rectangular countdown and bottom progress strip with a circular dial.
