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
  session-picker:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.text-control}"
    padding: "10px 12px"
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
  time-option:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
    rounded: "{rounded.control}"
    height: "64px"
  guidance-panel:
    backgroundColor: "{colors.soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "16px"
  time-option-selected:
    backgroundColor: "{colors.energy}"
    textColor: "{colors.canvas}"
    rounded: "{rounded.control}"
    height: "64px"
---

# Design System: On the Way — Ninja Arena

## Overview

**Creative North Star: "Ninja Arena"**

Ninja Arena gives a small personal workout the presence of an athlete’s arena entrance. Midnight navy, signal red, ice cyan and oversized condensed type carry the energy; clear instructions and familiar controls keep the operation calm and direct.

Cropped course rails move at the edge of the view. The foreground is a disciplined reading and action layer: aligned numbered stations, exact quantities, one primary action, and unchanged pixel-art movement demos. The identity is athletic without competition, scores or extra tasks.

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
- **Ice Cyan** (`energy`, `focus`): station numbers, metadata rule, selected session and time choices, active progress, selection, caret and keyboard focus.

### Neutral
- **Midnight Navy** (`canvas`): page, background scene and dark text on cyan.
- **Arena Surface** (`surface`) and **Soft Arena** (`soft`): timer, unselected time choices and opened guidance; secondary hover surfaces.
- **White Ink** (`ink`), **Tinted Secondary** (`muted`) and **Arena Line** (`line`): primary reading, supporting copy and thin dividers. Scrollbars use line over canvas.
- **Pale Demo Ground** (`preview`): separates existing pixel sprites from the dark arena.
- **Course Rail**, **Course Red** and **Course Ground**: restrained background geometry, distinct from the functional foreground.
- **Notice Ground** and **Notice Text**: warm storage and safety notices.

**The Action Color Rule.** Red identifies the primary action; cyan identifies station order, selection, focus and active progress.

## Typography

**Display Font:** self-hosted Barlow Condensed, with Arial Narrow and sans-serif fallbacks. Black Italic (900) supplies the hero and wordmark; upright ExtraBold (800) supplies actions, quantities, countdowns, duration and section titles. Font synthesis is disabled.

**Body Font:** the system stack recorded in frontmatter. Supporting text remains upright and readable outdoors.

The hero is uppercase, tightly tracked and deliberately oversized. Its default responsive scale is the frontmatter `display`; the home heading grows to 6rem on desktop. Setup uses 3.75rem; the player uses 3.5rem. Compact phone height reduces home headings to 3.5rem and player headings to 2.75rem. The wordmark is 1.375rem italic.

The upright hierarchy uses the recorded headline, button, duration, dose and countdown roles. A countdown beside a demo is 4.5rem, reducing to 3.75rem on narrow phones. All quantities and timers use tabular numerals. Body cues are 1rem; supporting copy ranges from .75rem to .9375rem. Movement station labels are .75rem, dose units .6875rem; narrow phones reduce movement labels to .8125rem and station labels to .6875rem. Preserve the distinction between expressive titles and plain instructions.

## Layout

Phone first: a centered shell (maximum 520px) uses 24px side gutters, at least 100svh height and bottom safe-area padding. The header is at least 76px high. The overview flows from hero to metadata, five-row morning circuit or five-row kids sequence, and Start area. Normal rows are at least 68px high with 10px vertical padding; the Start area uses remaining vertical space without overlapping content.

At widths below 375px, gutters become 20px, row gaps 8px, static previews 32px and time choices switch from four columns to two. At heights up to 720px and widths below 900px, the header becomes 56px, rows at least 52px with 6px vertical padding, surrounding gaps tighten and primary controls become at least 58px high. Allow vertical scrolling: the 320×568 view requires it, with no horizontal overflow. The 390×844 and 375×667 home views fit all five movements and Start.

At 900px and wider, only the overview expands into two work areas within a maximum 1180px shell, with 48px side padding and an 80px column gap. The hero and action occupy the left; duration, circuit and note occupy the right. Rows become at least 86px high and previews 48px. Setup and player retain their narrow, centered shells.

**The Immediate Start Rule.** Show the workout and its single primary Start action without adding an introductory step.

## Elevation & Depth

No box shadows or backdrop blur. Depth comes from navy tonal separation, pale demo grounds, hairline row dividers and large cropped course geometry. The fixed background is clipped, contained, pointer-inert and below the app; it is never a reading surface or an overlay on controls.

## Shapes

Rectangular controls with modest curved corners define the foreground. Preview frames use the smallest radius, controls the standard radius, and timer panels the panel radius. Rows remain unboxed. The countdown is a broad rectangle with a 6px bottom progress strip, despite the legacy timer name in source.

The brand mark is two red diagonal strokes. Course geometry uses a triple oval rail (1080×600px, 2px strokes), red bar and thick lower loop, rotated across the margins. These are background course markings, not component borders or floating cards. The icon repeats the navy/red diagonal-stroke identity.

## Components

### Buttons and Header

Primary controls are full-width red with white uppercase upright condensed labels, a trailing 24px SVG icon, at least 64px height and standard control corners. Hover darkens red; press also scales to .985. The transition is 160ms ease-out. Compact phone height lowers the minimum height to 58px. Disabled buttons use .45 opacity.

Text, Time and icon actions are transparent with tinted secondary text; hover uses the soft arena surface and white text. Text and icon targets are at least 44px. The overview header carries the Morning / With kids selector and background-motion toggle. Time appears only for Morning; time editing replaces the selector with Back. The player carries the italic wordmark or With kids label. Below 375px, the Time text is hidden while its icon and accessible name remain.

Keyboard focus is a 3px cyan outline offset by 4px. Selection is cyan with navy text; the caret is cyan. Keep these native interaction treatments on future controls.

### Session Selector

A native button group uses Morning and With kids, with full accessible names and `aria-pressed` on each button. The selected choice uses cyan with navy text; the other choice is transparent with tinted text and a soft hover surface. Buttons use 800 upright condensed 1.125rem type, 10px corners, 10px by 12px padding, 4px gap and at least 44px height. Selection changes the visible workout directly without setup and keeps one Start action.

### Circuit Rows

A continuous transparent list uses numbered cyan stations, a pale square static sprite, a two-line label and a right-aligned condensed dose. A cyan 3px rule separates metadata from the first row; thin arena lines divide every movement. Static previews are 38px normally. Preserve the exact five morning movements and dose order. The kids overview shows the five-second preparation followed by all four timed intervals, including both rests; never deduplicate them. Both overviews have one primary Start below.

### Time Choices

Time choices are native radio inputs inside visible labels, with four equal columns normally. Unselected choices use the arena surface, line border and tinted label; selection fills cyan with navy text. Focus outlines the whole label. Choices are at least 64px high.

### Countdown, Guidance and Sprites

The timer is a surface-colored panel with centered upright countdown and supporting status. Its bottom cyan strip shows active progress; rest uses tinted secondary and paused status turns cyan. Demo steps place the existing square sprite beside it (168px, or 128px below 375px); narrow demo timers are at least 152px high, other panels at least 176px. Sprites remain pixelated and square, using transparent four-frame strips on a pale ground. Frame selection follows exercise time; it stops when the workout is paused.

The guidance disclosure has a 44px summary target and a simple chevron. Opening it reveals a soft arena panel and pauses the workout. The single red Pause/Resume action follows cue and next-step text; End workout remains secondary.

### Returning to the workout and Motion

Finishing or ending returns directly to the same selected session’s overview with **Start workout** ready. No completion page, saved-visit state, effort feedback or recovery substitution interrupts the loop. The completion bell and voice remain, with a visually hidden status announcement. Morning time choice is the only remembered preference; session selection lasts for the current page visit. The kids sequence is fixed at five seconds of preparation followed by four 20-second intervals, totaling 85 seconds. Its jumping-jacks demo loops every two seconds; the squat demo retains its three-second cycle.

Three bounded background elements share one course-drift animation: 24 seconds, ease-in-out, alternating between small opposing translations. This creates one slow peripheral drift. The background toggle controls it; Reduce Motion removes transitions and animations and hides the motion toggle. Hidden tabs stop the background and pause an active workout. Screen changes focus the main landmark; countdown updates do not move focus.

**The Exercise Stillness Rule.** Decorative course motion stays frozen throughout active and paused workouts and yields to manual pause, hidden tabs and Reduce Motion.

## Do's and Don'ts

### Do:
- **Do** retain the large athletic display face and the quieter system-font instructions.
- **Do** align station numbers, movement labels and right-aligned doses in one continuous list.
- **Do** keep the normal routine at 8 push-ups, 8 knee raises, a 10-second hang, a 10-second hold and 8 squats.
- **Do** keep focus visible, secondary text tinted, tap targets generous and short screens scrollable.
- **Do** preserve the existing sprites on pale square grounds and the one-primary-action flow.

### Don't:
- **Don't** restore the superseded lime-and-forest palette or white grouped-card identity.
- **Don't** add photos, new raster decoration, floating movement cards, shadows or competitive metrics.
- **Don't** animate the course during an active or paused workout.
- **Don't** replace the rectangular countdown and bottom progress strip with a circular dial.
