---
name: On the Way
description: Bright morning energy for a small, approachable exercise habit.
colors:
  ink: "#153d28"
  muted: "#405c35"
  green: "#173f29"
  green-hover: "#0e3020"
  energy: "#d4f458"
  canvas: "#edf5d5"
  surface: "#fff"
  line: "#d7e3ce"
  soft: "#e2efc3"
  focus: "#245c35"
  orbit: "#e1edac"
  ground: "#deedb6"
typography:
  display:
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif'
    fontSize: "2.75rem"
    fontWeight: 750
    lineHeight: 1.02
    letterSpacing: "-.035em"
  headline:
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif'
    fontSize: "2rem"
    fontWeight: 650
    lineHeight: 1.15
    letterSpacing: "-.035em"
  body:
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif'
    fontSize: "1rem"
    lineHeight: 1.55
rounded:
  small: "8px"
  text-control: "10px"
  control: "12px"
  group: "16px"
  circle: "50%"
spacing:
  micro: "4px"
  small: "8px"
  control: "12px"
  standard: "16px"
  group: "20px"
  gutter: "24px"
  section: "32px"
  spacious: "40px"
components:
  button-primary:
    backgroundColor: "{colors.green}"
    textColor: "{colors.surface}"
    rounded: "{rounded.group}"
    padding: "16px 22px"
    width: "100%"
  button-primary-hover:
    backgroundColor: "{colors.green-hover}"
  button-text:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.text-control}"
    padding: "12px"
  button-icon:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
  routine-group:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.group}"
    padding: "0 20px"
  time-option:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
    rounded: "{rounded.control}"
  time-option-selected:
    backgroundColor: "{colors.green}"
    textColor: "{colors.surface}"
---

# Design System: On the Way

## Overview

**Creative North Star: "Bright morning energy"**

The existing phone-first exercise interface has an energetic lime morning atmosphere. Deep forest text and controls keep the screen legible outdoors; the solid white routine group provides a stable reading surface. Preserve the familiar single-column composition, direct language, workout content and immediate path from opening the app to starting a workout.

Three large, cropped CSS shapes move slowly behind the interface. Their motion is peripheral and settles as soon as a workout begins, including while that workout is paused. The backdrop remains CSS geometry. Small pixel-art movement demos supply practical guidance in the foreground.

**Key Characteristics:**
- Bright lime atmosphere with forest-green functional contrast.
- One solid white routine group and one clear primary action.
- Familiar system typography with a heavier workout heading.
- Slow geometric background motion that yields to exercising and user preferences.

## Colors

Lime provides the energy; forest greens carry reading and action; pale green and white separate background from content. The frontmatter records source values.

### Primary
- **Morning Lime** (`energy`): the filled background circle, selection highlight and primary-button icon accent.
- **Forest Action** (`green`): primary actions, selected time choices, movement icons and timer progress. Its deeper hover variant is reserved for interactive response.

### Neutral
- **Forest Ink** (`ink`): headings, body cues and feedback labels.
- **Leaf Text** (`muted`): supporting copy, station labels, metadata and secondary actions.
- **Morning Canvas** (`canvas`): page background and timer interior.
- **White Surface** (`surface`): opaque routine, time-choice and feedback surfaces.
- **Leaf Line** (`line`): borders, dividers and unfilled timer track.
- **Soft Leaf** (`soft`): guidance panels, completion symbol and secondary-control hover.
- **Orbit Leaf** (`orbit`) and **Ground Leaf** (`ground`): background ring and low ellipse.
- **Forest Focus** (`focus`): keyboard focus outlines.

**The Readable Foreground Rule.** Keep routine content on its opaque white surface and functional text in the forest palette; the moving scene stays behind the interface.

## Typography

**Display and Body Font:** the incumbent system stack recorded in the frontmatter. The current Operate scope explicitly preserves this familiar typography.

**Character:** compact, direct and readable. The heavier workout heading supplies emphasis while tabular numbers keep quantities and countdowns steady.

### Hierarchy
- **Workout display:** the `display` role (44px at the default browser font size). At heights up to 720px and widths 360–699px it becomes 36px; at heights up to 620px and widths below 360px the final override is 32px. Weight, tracking and line height remain unchanged.
- **Page headline:** the `headline` role (32px), used for setup, feedback and completion. The narrow, short viewport override reduces the base heading to 28px.
- **Player title:** 28px, weight 650, line height 1.15 and tracking −.035em; reduced to 24px at heights up to 720px and widths below 700px.
- **Section title:** 20px, weight 600, line height 1.3 and tracking −.02em.
- **Countdown:** 64px, weight 500, line height 1.15, tracking −.035em and tabular figures; reduced to 52px in the compact player.
- **Body:** 16px with paragraph line height 1.55; player cues use 1.6. Supporting text uses 14px, station text 13px and small safety/unit text 12px.
- **Movement label:** 15px, weight 600, line height 1.35; reduced to 14px below 360px wide. Quantities use 24px, weight 750 and line height 1.1.

The inherited system-family display is an observed, explicitly preserved implementation choice, not a new display-face precedent for unrelated surfaces.

## Layout

Keep the single-column shell at a maximum width of 480px with 24px side gutters, reduced to 20px below 360px wide. The shell fills at least the small viewport height and includes bottom safe-area padding. The default header is at least 88px high, reducing to 72px on compact phone heights and 64px on narrow, short phones.

The routine is one grouped list, with 20px horizontal padding, 84px minimum movement rows and thin dividers. Below 360px wide, group padding reduces to 16px and row gaps to 10px. Compact-height overrides tighten rows and surrounding spacing; the narrowest, shortest case uses 72px minimum rows with 10px vertical padding. Preserve scrolling when content needs more room.

The Start area follows content and uses available vertical space on phones. At 700px and wider, the centered shell gains 20px top padding, the workout gains 24px top padding and Start follows with a 16px top margin. Time choices form four equal columns, becoming two columns below 360px wide.

**The Immediate Start Rule.** The default screen remains the workout overview with its Start action. Background controls must not add an introductory step.

## Elevation & Depth

The interface has no box shadows. Depth comes from opaque white surfaces, pale-green tonal separation, thin borders and cropped background geometry. The fixed scene has strict containment, clips overflow, ignores pointer events and sits below the positioned app. No blur or translucent reading surface is used.

## Shapes

Controls and feedback rows use gently curved corners; routine groups and primary buttons use the larger group radius. Circles belong to the timer, completion symbol and background scene.

The background has exactly three bounded CSS layers: a filled circle (540 × 540px), a ring (850 × 850px with a 54px stroke), and a low ellipse (720 × 400px). They are cropped by the fixed viewport and retain their source positions and transforms.

## Components

### Buttons

Primary actions are full-width forest controls with white labels, lime SVG icons, at least 58px height and the group radius. Hover-capable pointers receive the deeper forest background; pressing scales the control to .985. Background and transform transitions take 160ms with ease-out.

Secondary text actions remain transparent and at least 48px high. Icon and Time controls have at least 44px targets; icons are inline stroked SVG. Keyboard focus uses a 3px forest outline with a 4px offset. Disabled buttons use .45 opacity.

### Routine Group

One opaque white list contains the movements. Each strength row pairs a static 48px pixel-art movement preview and station label with a right-aligned quantity. Previews reduce to 40px below 375px wide. Recovery rows retain the small line icon. Borders separate rows; the final row has no divider.

### Time Choices

Native radio inputs sit inside visible labels. Unselected choices are white with leaf borders; selection fills the choice with forest green, white text and weight 600. Each choice is at least 56px high. Keyboard focus outlines the entire label.

### Player, Feedback and Notices

The centered player uses a functional circular countdown (220px diameter, 172px in compact phone layouts) with a 10px total difference between outer and inner diameter. Forest progress and the leaf track surround a solid canvas interior. One cue, optional guidance, next movement and Pause follow the countdown. Guidance expands into a soft-leaf panel and pauses the active workout.

Feedback choices are opaque white, bordered, rounded rows with at least 66px height. Hover-capable pointers get the shipped subtle border/background change. Warm notices carry storage and safety messages; preserve readable safety copy and every existing option.

### Movement Sprites

The same friendly pixel-art man wears a forest shirt, lime shorts and white trainers. Grey-green equipment clearly distinguishes a high push-up platform, overhead pull-up bar and parallel bars. Transparent four-frame PNG strips live in `dist/sprites/`; source and prompt live in `assets/sprites/`. Use pixelated image rendering and preserve the square frame aspect ratio.

Strength steps show one demo beside a 156px timer; preparation, rest and recovery retain the centered timer. The demo is 184px normally, 156px below 400px wide and 140px below 375px. On the narrow layout, the timer becomes 132px. Countdown type is 48px beside a demo and 42px below 375px wide; status type is 13px. No new controls or introductory screen accompany the demos. Text cues, quantities and guidance remain the authority.

Demo frames derive from elapsed workout time rather than independent animation loops. Platform push-ups take five seconds per cycle; the knee raise plays once over 2.4 seconds and settles into the hang pose; parallel-bar support stays still with straight arms. Pause, expanded guidance, a hidden tab and interrupted timing freeze the pose with the workout. Resume continues the same demonstration rather than restarting an attempt. Reduce Motion shows the first static pose, including live preference changes.

### Background Motion and Control

The three layers use transform-only, ease-in-out, infinite alternate animations: the filled circle takes 22s, the ring 28s and the low ellipse 26s. Translations, scale and rotation stay within the source keyframes. There are no animated layout properties, filters or opacity loops.

The accessible header button toggles “Pause background motion” and “Play background motion,” with matching inline SVG and title. Manual pause persists for the current app session. The background is automatically still whenever a workout exists, including a paused workout, and whenever the document is hidden. The player header omits the background control. After the workout ends, motion can resume only when the document is visible, manual pause is off and Reduce Motion is off.

The live `prefers-reduced-motion` preference disables animations and transitions and hides the redundant background-motion control. Changing that preference or tab visibility immediately synchronizes the background state.

**The Exercise Stillness Rule.** Start settles the decorative background for the entire active workout; pausing the workout never restarts the background.

## Do's and Don'ts

### Do:
- **Do** keep lime energy behind a solid, legible routine group.
- **Do** preserve the existing content, system typography, single-column structure and direct Start path.
- **Do** keep background motion slow, bounded and transform-only.
- **Do** honor manual pause, hidden tabs and live Reduce Motion changes.
- **Do** retain visible keyboard focus, generous tap targets and readable safety instructions.

### Don't:
- **Don't** run decorative background motion during an active or paused workout.
- **Don't** add onboarding or another step before the workout overview.
- **Don't** replace the CSS geometry with raster assets or extra animated layers.
- **Don't** turn the routine into separate floating movement cards or add shadows to the flat surface system.
