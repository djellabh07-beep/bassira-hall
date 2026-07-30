# Bassira Hall (بصيرة)

Voice-first accessible learning platform for blind/visually impaired university
students. Voice assistant "Bassira" (wake word "بصيرة") drives navigation and
reading; trilingual (Arabic primary, French, English).

## Repo structure

```
bassira-hall/
├── frontend/           # Static HTML/Tailwind mockups — current visual design system
│   ├── index.html          Bassira home hub
│   ├── courses.html        Student course list
│   ├── lessonreader.html   PDF reading screen (a STATE within the course flow,
│   │                       not a standalone route — see note below)
│   ├── notes.html
│   ├── homework.html
│   ├── messages.html
│   ├── settings.html       Language, speech rate, mic permission
│   └── assets/
│       ├── css/base.css           shared base styles (fonts, material icons)
│       └── js/tailwind-config.js  shared design tokens (single source of truth)
├── docs/
│   └── backend_prompts.md   Ordered prompt sequence for building the PHP/MySQL backend
└── README.md
```

## Current status

The frontend is **static design mockups only** — no backend, no real data, no
working voice recognition yet. What's done:

- All 7 pages cross-link correctly (real navigation, `aria-current="page"` on
  the active nav item, `aria-label` on every icon-only nav link).
- Design tokens (colors, fonts, spacing) unified into a single
  `assets/js/tailwind-config.js` — the individual pages had drifted from each
  other (e.g. two different values for the "primary" color) since each was
  generated independently. This file is now the single source of truth.
- `settings.html` was built from scratch to match the existing design system —
  it didn't exist before even though every other page already linked to it.

### Note on `lessonreader.html`

Per `docs/backend_prompts.md` (Prompt 6), the PDF reading experience is meant
to live **inside `courses.php`** as a state (open a material, read
sequentially, voice commands to navigate) — not as its own page/route. It's
kept here as a separate file purely because it was generated as a distinct
Stitch mockup; it should be merged into the courses page's markup during
backend/frontend integration, not turned into its own `lessonreader.php`.

### Known gaps to close before backend work starts

- No dashboard page (intentionally dropped — the backend prompts explicitly
  call for 6 pages with no dashboard).
- Accessibility pass was incomplete: before this pass, only `index.html` had
  any `aria-label`s. Nav is now fixed; body content (forms, buttons, cards on
  each page) should still get a dedicated accessibility review before/after
  the PHP build, per the note at the end of `docs/backend_prompts.md`.

## Next step

Work through `docs/backend_prompts.md` in order (Prompt 1 → 11) in a fresh
conversation, pasting in the relevant frontend file(s) from `frontend/` as
style reference where each prompt calls for it.
