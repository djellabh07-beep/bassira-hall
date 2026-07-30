# Bassira Hall — Backend Build Prompts

How to use this: paste one prompt at a time, in order, into a conversation with Claude. Each one assumes the outputs of the ones before it exist (schema, includes, etc.) — if you're starting a fresh conversation partway through, upload or paste in the relevant files first so Claude has them in context.

Core decisions already locked in, baked into every prompt below so nothing has to be re-explained each time:
- **Stack:** PHP + MySQL, classic server-rendered pages (PHP echoes data directly into HTML), no frontend framework, no iframe/SPA router — real `.php` files with real navigation.
- **Voice is the primary interface.** Bassira (wake word "بصيرة") drives the whole site. Every command: **echo what was heard → act**. For destructive/irreversible actions (submit homework, delete a note or answer), add a **second spoken confirmation** ("قولي 'نعم' للتأكيد") before executing.
- **Trilingual:** Arabic (primary), French, English — via a `lang/{ar,fr,en}.php` dictionary + `t('key')` helper, switching UI text, `dir`, STT locale, and TTS voice together.
- **Pages:** `index.php` (Bassira home hub), `courses.php`, `notes.php`, `homework.php`, `messages.php`, `settings.php`. No dashboard.
- Accessibility groundwork (alt text, aria-labels, aria-live, aria-current, RTL) is already done on the frontend — preserve and extend it, don't regress it.

---

## Prompt 1 — Database schema

```
Design and write schema.sql for Bassira Hall, a voice-first accessible classroom
platform for blind/visually impaired university students. Stack: MySQL, PHP (PDO
with prepared statements everywhere).

Entities needed:
- users: student/teacher accounts, with a role, hashed password, and a
  preferred_language column (ar/fr/en) plus a speech_rate preference.
- courses: owned by a teacher.
- enrollments: student <-> course join, no progress-bar fields needed (no
  dashboard page in this project).
- materials: PDF-backed course content uploaded by teachers. Needs to store the
  file path AND a structured, page-and-line-segmented extraction of the PDF's
  text (JSON), because the voice assistant navigates by page and by line
  ("go to page 5", "read the previous line") and needs exact addressable units,
  not just a raw text blob.
- reading_progress: per student, per material, tracks last page + line read, so
  Bassira can resume ("we stopped at page 3") instead of restarting.
- notes: tied to a course (auto-named after the course when created via the
  "take a note" voice command during a reading session), plus a source column
  (manual vs voice-dictated), full text content.
- homework: PDF-backed like materials, tied to a course, has a due date.
- submissions: one per student per homework, with a submitted_at and a status
  (draft vs submitted) since submission is a two-step-confirmed voice action.
- submission_answers: per submission, one row per question NUMBER (a plain
  integer the student states out loud, not something parsed from the PDF's
  structure — PDF question-boundary detection is unreliable, don't attempt it),
  with the answer text and an updated_at.
- messages: sender/recipient (both reference users), body, sent_at, read_at.

Requirements:
- All foreign keys defined properly, sensible ON DELETE behavior.
- Every table that a voice command can delete from should support soft
  awareness of "what was deleted" for a moment (either a deleted_at column or
  application-level confirmation before hard delete — pick one and justify it
  briefly in a comment).
- Output just the SQL file with comments explaining any non-obvious design
  choice (especially the materials JSON structure and why submission_answers
  is keyed by a spoken number, not a foreign key to a parsed question).
```

---

## Prompt 2 — Core includes: DB, auth, i18n

```
Using schema.sql from before, build the shared includes every page will need:

1. includes/db.php — a single PDO connection (MySQL), errmode set to throw
   exceptions, charset utf8mb4 (required for Arabic).

2. includes/auth.php — session_start(), a require_login() that redirects to
   login.php if $_SESSION['user_id'] isn't set, and a require_role($role)
   helper for teacher-only pages (material/homework upload, message inbox as
   a teacher).

3. login.php / login_action.php / logout.php — plain PHP form, password_verify(),
   session_regenerate_id() on successful login, session_destroy() on logout.

4. lang/ar.php, lang/fr.php, lang/en.php — associative arrays of UI strings.
   Seed them with whatever strings exist on the current frontend pages (I'll
   paste those in / they're in the uploaded file) plus placeholders for
   anything voice-related (greetings, confirmation prompts, error messages).

5. includes/i18n.php — a t($key) function that reads $_SESSION['lang']
   (default 'ar'), loads the right dictionary, and returns the string (falling
   back to the key itself if missing, never a fatal error). Also a helper that
   returns 'rtl' or 'ltr' for the current language, and the right BCP-47 locale
   code for STT/TTS (ar-DZ, fr-FR, en-US).

Prepared statements only, no raw string interpolation into SQL anywhere.
```

---

## Prompt 3 — Shared layout: nav + header/footer

```
Build includes/nav.php and includes/header.php / includes/footer.php to be
included by every page (index, courses, notes, homework, messages, settings —
no dashboard).

Requirements:
- nav.php takes the current page as a variable (e.g. $page = 'courses';, set
  before the include) and marks the matching item aria-current="page".
- Every icon-only nav link keeps an aria-label, translated via t(), matching
  the accessibility pass already done on the frontend (don't regress it).
- header.php sets <html dir="..." lang="...">  based on the session language
  from includes/i18n.php, includes the existing Tailwind config, and loads
  assets/js/voice_assistant.js (from the next prompt) on every page.
- Preserve the existing visual design system (color tokens, RTL layout,
  Material Symbols icons) from the current frontend — I'll paste in the
  current dashboard.html or courses.html as a style reference if needed.
- No dashboard link anywhere in the nav.
```

---

## Prompt 4 — Bassira's voice engine core

```
Build assets/js/voice_assistant.js: the shared, page-independent voice engine
that every page loads via header.php.

Behavior required:
1. Wake-word only activation. Wake word is "بصيرة" (plus common
   mis-transcriptions "بصير"/"بصيره" — list a few more likely ASR variants).
   No push-to-talk fallback.
2. State machine: idle (always listening via continuous SpeechRecognition,
   auto-restarting on `onend`) -> active (after wake word, plays a short
   earcon, sets the page's aria-live status region to "أستمع...", captures
   the next utterance as the command) -> idle again. If no command follows the
   wake word within ~4 seconds, speak a "لم أسمع أمرًا" message and return to
   idle.
3. Command handling: check `window.pageVoiceCommands` (page-specific, set by
   each page before this script loads) first, then a built-in GLOBAL_COMMANDS
   registry (navigate to any of the 5 pages, "ماذا يمكنني أن أقول؟" reads out
   available commands for the CURRENT page, "توقف"/"اسكت" cancels current
   speech/listening).
4. Every command follows echo -> act: speak back what was understood, then
   perform it. For any command flagged `destructive: true` in its
   registration, instead do: echo -> ask "قولي 'نعم' للتأكيد" -> wait for a
   yes/no utterance -> only then act (or cancel on anything else / no
   response within ~5s).
5. STT/TTS locale (recognition.lang, and the voice picked from
   speechSynthesis.getVoices()) must come from the current session language
   (ar-DZ/fr-FR/en-US), not be hardcoded.
6. Handle onerror gracefully: 'not-allowed' stops the loop entirely (no mic
   permission — nothing to restart), 'no-speech'/'network' just let onend's
   restart handle it.
7. Mic permission: provide a small init function pages can call from a single
   explicit user gesture (a button) that requests mic access once; after
   that, recognition.start() should work with no further prompt on every
   subsequent page load (browser remembers the grant per-origin).
8. Every echoed/spoken utterance also gets written into the page's
   [aria-live="polite"] status region (already present on every page) so
   there's a visible transcript, not just audio.

Output the JS file plus a short usage note showing how a page registers
page-specific commands before this script loads.
```

---

## Prompt 5 — Home page

```
Build index.php: the Bassira hub / landing page.

- No dashboard-style content. On load, show the existing voice-prompt-card
  visual layout (already on the current index.html) but its only real job is
  to trigger voice_assistant.js's mic-permission init on first click, and
  otherwise sit idle.
- Sets window.pageVoiceCommands = {} (no page-specific commands — home only
  needs the global navigation set).
- On activation, Bassira greets the logged-in student by name (pulled from
  $_SESSION) and asks how she can help, in the current session language.
- Include nav.php with $page = 'index'.
```

---

## Prompt 6 — Courses page + PDF reading pipeline

```
This is the core feature. Build:

1. A teacher-facing upload flow (simple form: course + PDF -> materials
   table) with server-side extraction: pull text per PDF page, split each
   page into sentence-level "lines", store as the structured JSON described
   in schema.sql. Use a PHP PDF text-extraction library (recommend one and
   justify the choice given we're on shared/simple hosting, not a heavy
   server). Flag clearly in comments what happens when a PDF has no
   extractable text (scanned/image-only) — return a clear error to the
   teacher rather than silently storing nothing.

2. courses.php (student-facing): lists enrolled courses. Voice-openable by
   course name ("بصيرة، افتحي [اسم المقرر]") — this can be a page-specific
   command on courses.php OR a global command that works from anywhere;
   pick the more consistent option given the rest of the command design and
   say why.

3. The reading experience once a course/material is open: Bassira announces
   the material name, then reads sequentially by "line" from the stored JSON.
   window.pageVoiceCommands here should include (all against the CURRENT
   material only): "بصيرة توقف" (pause), "بصيرة تابعي" (resume), "بصيرة اذهبي
   لصفحة رقم X" (jump to page X, read its first line), "بصيرة اقرأي السطر
   السابق" (re-read previous line), and "بصيرة خذي ملاحظة" which switches
   into dictation mode: the next utterance is captured verbatim (not matched
   against any command list) and saved as a new row in notes, titled with the
   course's name, then Bassira confirms it was saved and resumes reading from
   where she left off.

4. reading_progress gets updated as the student reads, so re-opening the same
   material later resumes instead of restarting, and Bassira should mention
   the resume point ("توقفنا عند الصفحة ٣") when reopening.

Keep the visual layout close to the existing courses.html design (already
cleaned up for accessibility) — the interactive redesign is about the voice
layer underneath, not the visuals.
```

---

## Prompt 7 — Notes page

```
Build notes.php.

- Lists notes grouped by course (both manually created and auto-generated
  from the "خذي ملاحظة" command during course reading).
- Voice-openable by course name, same pattern as courses.php.
- window.pageVoiceCommands: "بصيرة اقرئي الملاحظة" (read it aloud), "بصيرة
  عدّلي" (enters dictation mode for a replacement, then echoes the new
  content back and asks for confirmation before saving — this is a
  destructive-class action since it overwrites, use the confirmation flow
  from voice_assistant.js), "بصيرة احذفي هذه الملاحظة" (destructive, requires
  confirmation).
```

---

## Prompt 8 — Homework & Exams page

```
Build homework.php, reusing the PDF reading engine from courses.php (same
material-reading command set: stop, resume, go to page X, previous line)
plus assignment-specific commands:

- "بصيرة اقرئي السؤال مرة أخرى" — re-read the current line/section (same
  underlying mechanism as "read previous line").
- "بصيرة الإجابة على السؤال [رقم] هي: ..." — dictation mode, saves/updates a
  row in submission_answers keyed by that spoken question number (no
  automatic linkage to actual PDF question structure, per the schema design).
  Echo the answer back for confirmation before saving (it's overwriting a
  previous answer if one exists for that question number — destructive).
- "بصيرة احذفي إجابة السؤال [رقم]" — destructive, requires confirmation.
- "بصيرة سلّمي الواجب" (submit) — destructive/irreversible, requires the full
  confirmation flow, then flips the submission's status and sets
  submitted_at. After submission, further answer edits to that submission
  should be rejected with a clear spoken message, not silently allowed.
```

---

## Prompt 9 — Messages page

```
Build messages.php for the student side (voice-driven) and a plain typed
interface for teachers (they're sighted, no voice requirement on their side).

Student voice commands: "بصيرة اقرئي رسائلي" (reads unread messages aloud,
oldest first, marking each read_at as it's read), "بصيرة أرسلي رسالة إلى
[اسم الأستاذ]" -> dictation mode for the body -> echo back -> confirm (send is
not really destructive but IS a real-world action with consequences, so use
the same confirm step) -> send.
```

---

## Prompt 10 — Settings page

```
Build settings.php.

- Language switch (ar/fr/en) — updates users.preferred_language, and takes
  effect immediately (dir, nav labels, STT locale, TTS voice) without needing
  a fresh login. Voice-settable too: "بصيرة غيّري اللغة إلى الفرنسية" should
  work as a global command from ANY page, not just settings.php — implement
  it in voice_assistant.js's GLOBAL_COMMANDS, not as a page-specific command.
- Speech rate control (affects speechSynthesis rate for all future Bassira
  speech this session, stored in users.speech_rate).
- A "re-enable microphone" button for when permission was previously denied
  and needs to be manually re-granted through the browser.
```

---

## Prompt 11 — Trilingual pass

```
Now that the Arabic build is working end to end, extend lang/fr.php and
lang/en.php to full parity with lang/ar.php, and verify (or fix) that every
place in the codebase that currently assumes Arabic (recognition.lang, TTS
voice selection, dir attribute, wake-word variant list) actually reads from
the session language instead of being hardcoded. Test wake-word detection
across all three locales and note anywhere the wake word "بصيرة"/"Bassira"
needs an additional phonetic variant per language's recognizer.
```

---

## Notes for whoever's running these

- Run them roughly in order — 6, 7, and 8 share the PDF-reading engine, so 6 should be solid before starting 7/8.
- Prompt 4 (the voice engine) is the highest-risk piece technically — budget the most back-and-forth there, and test it in an actual browser early rather than trusting it in the abstract.
- After 6, 7, 8 are done, it's worth a dedicated pass specifically clicking through with a screen reader (NVDA or VoiceOver) with the mouse unplugged, not just reading the code — that's the only way to catch what still silently assumes sight.
