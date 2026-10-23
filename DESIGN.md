# Morning Exercise design

## Direction

Refine the established quiet green identity. This is an interface for completing a small task outdoors. Precision and readability take priority over decoration. Preserve the familiar system typeface, single-column phone composition, existing workout behavior and restrained tone.

## Foundations

- System UI type; 16px body, 32px page headings, 28px workout step titles. Tracking no tighter than -0.035em.
- Ink `#20382c`, secondary `#59695e`, action `#28543e`, action hover `#1d4430`.
- Canvas `#f5f7f4`, surface `#ffffff`, line `#dce3db`, secondary surface `#e8eee6`.
- Spacing: 4, 8, 12, 16, 20, 24, 32, 40px. Page maximum width 480px, phone gutter 24px, narrow phone gutter 20px.
- Radius: 12px small controls and feedback rows, 16px routine group and primary button.
- Primary buttons at least 58px high; other tap targets at least 44px. Visible keyboard focus, readable safety copy, reduced-motion support.

## Screens

- Workout: heading, short explanation, duration/rest metadata, a grouped movement list with station labels and clear quantities, then Start. No decorative badges or repeated section labels.
- Player: current movement and station, a large functional countdown ring, one cue, optional guidance, next movement and Pause. No decorative exercise pictures.
- Time: existing four choices and one update action. Selection uses the action color and a strong border/focus state.
- Feedback and completion: the same type, color and control system. Preserve every feedback option and safety instruction.

## Verification

Inspect at 320px, 390px and desktop widths. Check text enlargement, focus, contrast, the complete start/pause/guidance/end/feedback path, saved time, recovery and completion. Keep JavaScript model tests passing. Use Impeccable's detector as an additional signal, with rendered UI inspection as the final visual check.
