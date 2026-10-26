# Next exercise announcements

Eleven same-origin AAC files in `dist/audio/next-<exercise-id>.m4a`, generated locally with macOS Samantha at 190 words per minute. Each says “Next exercise.” followed by the exercise name. Hyphens in push-up/pull-up/parallel-bar names are read as normal word spaces.

Generation: `/usr/bin/say -v Samantha -r 190 -o <source.aiff> <phrase>`, then FFmpeg mono, 22,050 Hz, AAC 48 kbps. Temporary AIFF sources are ignored under `.openai/audio/`. No remote speech service is used.

- `next-platform-pushup.m4a`: Next exercise. Platform push ups.
- `next-hanging-knee-raise.m4a`: Next exercise. Knee raises.
- `next-bar-hang.m4a`: Next exercise. Pull up bar hang.
- `next-support-hold.m4a`: Next exercise. Parallel bar hold.
- `next-squat.m4a`: Next exercise. Squats.
- `next-jumping-jacks.m4a`: Next exercise. Jumping jacks.
- `next-kettlebell-squat.m4a`: Next exercise. Kettlebell squats.
- `next-incline-pushup.m4a`: Next exercise. Incline push ups.
- `next-kettlebell-swing.m4a`: Next exercise. Kettlebell swings.

- `next-trampoline.m4a`: Next exercise. Trampoline.
- `next-packing-squats.m4a`: Next exercise. Packing with squats.
