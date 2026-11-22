# Feature landscape of TOEIC/vocab apps and requirements for a local web app that complements parroto.app (as of 11/2026)

Note on method: about 18 searches and fetches. Parroto, Study4, and ts-fsrs were checked against official pages. Santa comes from App Store listings and Riiid papers on arXiv. Many vendor claims are not independently verified, and each one is marked where it appears. Features of Anki, Quizlet, Memrise, Magoosh, and ELSA were not fetched directly this time, so they are only in Inferences and Gaps.

## 1. What does parroto.app offer today?

### Takeaway
Parroto already covers well: dictation and shadowing from real videos with AI scoring, SRS vocabulary with TOEIC decks (600 Essential Words, ETS 1,600, idioms), 4 sets x 10 full 7-part TOEIC mock tests with a timer, 10-990 scoring and per-part practice, plus a listening/speaking progress chart and streaks. It does not visibly have a detailed wrong-answer log for TOEIC, a test-to-vocab link, per-question-type analytics, score prediction, or a daily plan tied to a target. It needs an internet connection.

### Cited Findings
- Dictation (/dictation): type what you hear word by word, AI accuracy check, suggested corrections. Shadowing (/shadowing): AI scores pronunciation, intonation, and rhythm in real time. — [parroto.app](https://parroto.app/)
- 1-1 voice chat with learners at your level (/practice-english-speaking); Stories with audio, word highlighting, and grammar notes; Games and Vocab Battle (/games, /vocab-battle); Podcast. — [parroto.app](https://parroto.app/)
- Content from movies, cartoons, TV shows, news, songs, business, and travel; levels A1–C2; several accents (US/UK/AU/CA); adjustable playback speed. — [parroto.app](https://parroto.app/)
- Analytics: listening/speaking level chart over time, practice history, "recurring mistakes", "Smart Error Review" after each exercise, streaks, personalized recommendations. — [parroto.app](https://parroto.app/)
- TOEIC: 4 sets of 10 tests each (Parroto TOEIC Practice Vol.1, TOEIC 2026, 2024, 2023); all 7 parts (P1 6, P2 25, P3 39, P4 30, P5 30, P6 16, P7 54 questions); 200 questions / 120 minutes; timer; 10–990 scoring via a conversion table; answer explanations; full tests or single parts. The page says a mock test shows "which Part is holding you back". — [parroto.app/exams/toeic](https://parroto.app/exams/toeic)
- The TOEIC page does not mention error review or wrong-answer tracking, and does not link test content to vocabulary. — [parroto.app/exams/toeic](https://parroto.app/exams/toeic)
- Vocabulary: SRS based on the forgetting curve (algorithm not named, intervals not described); about 20 decks (Oxford 3000/5000, IELTS, SAT, TOEFL...) plus community decks; TOEIC decks: "600 Essential Words for the TOEIC" (622), "ETS TOEIC Vocabulary" (1,600), "Common TOEIC Idioms" (114); cards have IPA, meaning, example sentences from videos, audio; tap a word in a video to save it to a deck; recommends 10–15 minutes of daily SRS. No export mentioned. — [parroto.app/vocabulary](https://parroto.app/vocabulary)
- Mobile apps on iOS and Android; requires internet; free to download with in-app purchases. — [parroto.app](https://parroto.app/); [App Store](https://apps.apple.com/app/id6752111996)
- The "90% improvement" and 4.8 rating figures are vendor claims without independent sources. — [parroto.app](https://parroto.app/)

### Inferences
- **Leave to Parroto**: Part 1–4 dictation, shadowing/pronunciation, full mock tests with official-style timing, speaking with real people, general listening content from videos, and the basic TOEIC 600/ETS vocab decks. The local app should not rebuild any of these.
- **Gap the local app can fill**: (a) a detailed error log tagged by Part 2 trap / Part 5 grammar point / Part 7 question type, recorded after taking Parroto tests; (b) a "words from my mistakes / my sentences" deck with transparent FSRS scheduling and JSON/CSV export; (c) a dashboard tracking by question type and a 30-day plan; (d) targeted micro-drills (Part 2 traps, Part 5 grammar, paraphrase, Part 7 timed speed).
- Parroto has no visible export, so moving data into the local app is mostly manual (enter the error log after each test) or done by pasting words in.

### Gaps
- Could not log in, so the depth of Parroto's TOEIC "answer explanations" and the real content of "Smart Error Review" / "recurring mistakes" are unconfirmed.
- Parroto's paid tiers and pricing are not on the website.
- The mechanics of Games/Vocab Battle are not described.

## 2. Features of popular TOEIC/vocab apps

### Takeaway
The market splits into three groups: (1) test banks plus explanations plus analytics (Study4, TOEIC Max, Prep), (2) adaptive AI with score prediction and weakness targeting (Santa/Riiid, on EdNet data with 131M interactions), (3) general SRS/gamification (Anki, Quizlet, Duolingo). For a personal app, the most valuable ideas to copy are error tagging by question type plus per-type analytics (Study4), a lightweight score estimate per Part with uncertainty (Santa), and a wrong-answer notebook / mini games (Handy 990-style apps).

### Cited Findings
**Study4 (study4.com)**
- Flashcards with spaced repetition (/flashcards/); test library (/tests/); results tracked by day and **by question type**; personalized roadmap toward a target score; level test; AI scores speaking/writing; Complete TOEIC course 1,050,000đ (strategy, vocab, grammar, listening, includes dictation). — [study4.com](https://study4.com/)
- Separate "Study4 TOEIC" app on the App Store. — [App Store](https://apps.apple.com/us/app/study4-toeic/id6772137489)

**Prep (prepedu.com / Prep.vn)**
- "Virtual practice room" for TOEIC 4 skills, simulating the computer-based test; AI scoring for Speaking/Writing claimed "up to 85% accuracy" (vendor claim, method not disclosed); feedback on grammar, pronunciation, vocab, and sentence structure; "TOEIC Transformer" translates feedback into Vietnamese; suggests upgrades to your writing based on your own ideas. — [prepedu.com news](https://prepedu.com/vi/news/phong-luyen-de-toeic-4-ky-nang)
- FPT Shop review: Writing AI analyzes grammar, spelling, vocab, structure, and cohesion. — [fptshop.com.vn](https://fptshop.com.vn/tin-tuc/danh-gia/prep-181619)
- AI teacher "Teacher Bee AI". — [prepedu.com](https://prepedu.com/vi/blog/teacher-bee-ai-giao-vien-ai)

**Santa TOEIC (Riiid, now listed as Socra AI)**
- 3-minute diagnostic test that predicts a TOEIC score; analyzes weaknesses by Part (listening, vocab, grammar...); recommends a personalized path; predicted score updates after each session; JP listing claims 95% accuracy, based on 300M (EN) or 450M (JP) data points. Vendor claims with conflicting figures. — [App Store Santa](https://apps.apple.com/app/id1148006701); [JP listing](https://apps.apple.com/JP/app/id1148006701)
- Developer reply in reviews: after only the diagnostic, one mistake on a question the AI expected you to get right can swing the predicted score a lot; it stabilizes as you do more questions. — [App Store Santa](https://apps.apple.com/app/id1148006701)
- EdNet (Choi et al.): Santa logs, 131,441,538 interactions from 784,309 students, used for knowledge tracing, score prediction, and dropout prediction. — [arXiv 1912.03072](https://arxiv.org/abs/1912.03072)
- Lee et al.: deep attentive score prediction in Santa; **score prediction accuracy significantly affects user engagement**. — [arXiv 2005.05021](https://arxiv.org/abs/2005.05021v5)
- Kim et al.: real TOEIC scores are scarce (Santa gives small gifts to users who report their scores), so they use pre-training to work around it. — [arXiv 2107.04009](https://arxiv.org/pdf/2107.04009v2)
- Riiid Kaggle "Answer Correctness Prediction": best public AUC about 0.790. — reported in a search summary, not checked against the original Kaggle page.

**TOEIC Max**
- Vietnamese App Store: tests, detailed explanations, full mock tests; VIP about 249k/month, 399k/3 months, 499k/year, 1,299k lifetime. No error notebook or game mentioned. — [App Store VN](https://apps.apple.com/vn/app/toeic-max-luy%E1%BB%87n-thi-toeic/id6450526000)
- A different app (Handy 990, per a search summary) has a wrong-answer notebook, a "Word Invaders" arcade game, a "Phrase Match" tile-flip game, and "Smart Review" SRS. — [App Store (unverified that this is Handy 990)](https://apps.apple.com/app/id6776127243)

**Other**
- Lume: per-skill score report after each test, AI builds a study plan. — [lumetest.com](https://lumetest.com/vi/our-tests/toeic)

### Inferences
- Standard features in Vietnamese TOEIC apps: test bank plus explanations, per-part/question-type analytics, flashcard SRS, a roadmap toward a target. Differentiators: score prediction (Santa), AI grading of S/W (Prep, Study4).
- A personal app cannot reach Santa-level knowledge tracing (needs huge datasets). A practical substitute: estimate per-Part accuracy with a Beta-Bernoulli model or EWMA plus a confidence interval, then convert to a score band using a raw-to-scaled table. Show it as a range (e.g. 620–700), not a single number, to avoid the false precision that Santa's developer admitted to.
- Common general-app features (well known, not fetched this time): Anki (SM-2/FSRS, cloze, custom card templates, add-ons), Quizlet (Learn/Test/Match game), Memrise (native-speaker videos), Duolingo (streaks, XP, leagues, hearts, streak freeze). Treat these as background knowledge.

### Gaps
- Did not fetch Magoosh TOEIC, ELSA, Quizlet, Anki, Memrise, or Duolingo pages directly. Specific features of "TOEIC Max/ELSA" (possibly confused with ELSA Speak) are unconfirmed.
- No independent Vietnamese review of Study4 or TOEIC Max was found.
- No app explicitly found with mind maps for TOEIC vocab, or AI sentence writing (for vocab practice) with feedback, apart from Prep's Writing grading.

## 3. Which mechanics have evidence for retention/learning vs. pure engagement gimmicks?

### Takeaway
Strong evidence: spaced retrieval practice (spaced >> massed, g ≈ 0.74) and testing/practice testing. Spacing also works for L2 vocab. Streaks have only **company evidence on retention** (Duolingo D7 +14%) and **no independent evidence that they improve language ability**. Expanding intervals are no better than uniform intervals. Accurate score prediction increases engagement (Riiid).

### Cited Findings
- Meta-analysis of spaced retrieval (29 studies): spaced vs. massed retrieval g = 0.74; expanding vs. uniform intervals not significantly different (g = 0.034). — [Educational Psychology Review, Springer](https://link.springer.com/10.1007/s10648-020-09572-8) (author list not checked)
- L2 meta-analysis: 98 effect sizes, 48 experiments, N = 3,411; most L2 studies favor spacing (Kim & Webb 2022). — [MSU thesis](https://d.lib.msu.edu/etd/48649/OBJ/download); [Cambridge Applied Psycholinguistics](https://www.cambridge.org/core/product/4D03D1F5169B719D90F14BBE474015F5)
- Caveat: more repetitions at the cost of spacing improves the **immediate** test, especially for hard words. Relevant when the exam is close (end of the 30 days). — mentioned in search results (Indonesian vocab study, original not fetched)
- Cepeda et al. 2006 (Psychological Bulletin) and Adesope et al. 2017 (Review of Educational Research, practice testing) are cited as foundations. — cited via [Springer](https://link.springer.com/10.1007/s10648-020-09572-8); originals not fetched
- Duolingo: streak A/B tests raised D1/D7/D14 retention, most at D7 (+14%); their research shows learners who "binge" lessons are more likely to quit. — [Duolingo Blog](https://blog.duolingo.com/how-duolingo-streak-builds-habit); [making.duolingo.com](https://making.duolingo.com/how-streaks-keep-duolingo-learners-committed-to-their-language-goals)
- No independent study shows streaks improve proficiency; commentary warns streaks reward low-effort "speed-running" ("streak plateau"). — [dev.to](https://dev.to/pocket_linguist/why-duolingos-gamification-works-and-when-it-doesnt-1d4); [case study](https://jiwonvyoo.github.io/portfolio/case/duolingo/duo.html)
- Score prediction accuracy significantly affects engagement in Santa. — [arXiv 2005.05021](https://arxiv.org/abs/2005.05021v5)

### Inferences
- Priority by evidence: (1) FSRS/spaced retrieval for vocab and errors (re-asking questions you got wrong = retrieval practice); (2) timed practice tests (Part 7 speed); (3) immediate feedback with explanations. Streaks/XP are fine for habit building but should count **completed reviews/quality**, not logins. Avoid leagues/hearts (they penalize mistakes and discourage practice).
- Matching/speed-round games: mostly engagement value; recognition rather than recall. Use them as a warm-up or for low-energy days, not as the main review.
- Since the exam is fixed at 30 days, FSRS's `request_retention` can be raised gradually or `maximum_interval` capped near the exam date (e.g. ≤ days remaining), so cards get reviewed before the test. Inference based on the ts-fsrs parameters.

### Gaps
- No direct evidence found for mind maps in L2 vocab learning, or for AI feedback on sentence writing in TOEIC.
- No experiment found comparing FSRS vs. SM-2 on actual learning (only memory model metrics, not fetched).

## 4. Technical options for an offline local app (HTML/JS, browser storage)

### Takeaway
Recommended stack: plain HTML/JS or Vite, **ts-fsrs** (MIT, FSRS-6) for scheduling, **IndexedDB** (via Dexie or idb) for data plus JSON export/import as backup, **speechSynthesis** for offline TTS (depends on installed voices), SpeechRecognition only as optional (default may go online; on-device requires `processLocally` + `install()`), **markmap** (MIT) for mind maps from Markdown, PWA (manifest + service worker) for phone use. LLM feedback is opt-in (user's own API key or a local Ollama).

### Cited Findings
- ts-fsrs: repo open-spaced-repetition/ts-fsrs, MIT license per Snyk/aggregators; README v5.4.1 has an FSRS-v6 badge. — [Snyk](https://security.snyk.io/package/npm/ts-fsrs); [README](https://cdn.jsdelivr.net/npm/ts-fsrs@5.4.1/README.md); [docs](https://open-spaced-repetition.github.io/ts-fsrs)
- ts-fsrs API: `fsrs()`, `createEmptyCard()`, `repeat()` (preview 4 outcomes), `next()` (apply rating); Rating Again/Hard/Good/Easy; states New/Learning/Review/Relearning; parameters `request_retention`, `maximum_interval`, `enable_fuzz`, `enable_short_term`, `learning_steps`, `relearning_steps`; optimizer is a separate package `@open-spaced-repetition/binding`; README mentions Node ≥ 20 (for npm; a browser example lives at example/example.html). — [README](https://cdn.jsdelivr.net/npm/ts-fsrs@5.4.1/README.md)
- Note: one source says ts-fsrs@4.x needs Node ≥ 18, the 5.4.1 README says Node ≥ 20. Only matters for the build step, not in the browser. — [jsDelivr](https://www.jsdelivr.com/package/npm/ts-fsrs) vs [README](https://cdn.jsdelivr.net/npm/ts-fsrs@5.4.1/README.md)
- Web Speech API: SpeechSynthesis uses the device's synthesizer; for SpeechRecognition the browser decides between a remote service and on-device; on-device can be required (Permissions-Policy `on-device-speech-recognition`, `SpeechRecognition.available()` / `install()`, `processLocally`). — [MDN Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- markmap: markmap and markmap-view packages are MIT; autoloader loads from jsDelivr, any element with class `markmap` renders automatically, config via `window.markmap.autoLoader`. Offline use means self-hosting the files. — [markmap autoloader docs](https://markmap.js.org/docs/packages--markmap-autoloader); [npm markmap-view](https://npmjs.com/package/markmap-view)

### Inferences
- **Storage**: IndexedDB (stores: `cards`, `reviewLogs`, `errors`, `sessions`, `plan`, `settings`) is better than localStorage (about 5MB limit, synchronous, strings only). Call `navigator.storage.persist()` to reduce the risk of eviction, plus a "Download backup JSON" button and a weekly reminder. Safari/iOS may wipe data for PWAs that go unused for a long time, so export matters. (General knowledge, not fetched.)
- **Offline**: bundle ts-fsrs/markmap/d3 locally (no CDN) and use a service worker that caches the app shell. Opening via `file://` blocks service workers and some APIs, so run it with `npx serve` / `python -m http.server`, or install as a PWA from localhost.
- **TTS**: `speechSynthesis.getVoices()` and pick an en-US/en-GB voice; let the user choose an accent (TOEIC uses US/UK/AU/CA). On iOS, voices are offline once installed.
- **Pronunciation**: leave to Parroto (it already has AI shadowing). SpeechRecognition is only for an optional "say the word" check.
- **LLM sentence feedback**: optional module; send a sentence plus target word plus a rubric (correct grammar/collocation, TOEIC business register) and get JSON {errors, corrected, better}. Keep the API key in local settings only and never commit it. Without a key, fall back to self-check against a sample answer.
- **Charts**: Chart.js or plain SVG/d3 for the dashboard (accuracy by tag, review forecast from FSRS due dates).

### Gaps
- Did not check the ts-fsrs LICENSE file directly or the official UMD/ESM CDN bundle (README says nothing about CDN).
- No current (2026) SpeechRecognition browser support table (MDN compat tables were not in the scrape); on-device recognition is likely mainly Chrome.
- Did not check the markmap-autoloader license directly.

## 5. Prioritized feature list (MVP vs. later), mapped to goals, with what to leave to Parroto

### Takeaway
MVP = 6 modules: (1) FSRS vocab deck tied to context/errors, (2) error log tagged by Part/question type, (3) Part 5 grammar micro-drills, (4) Part 2 trap drills, (5) daily plan for 30 days, (6) basic dashboard plus backup. Later: paraphrase matcher, Part 7 speed reader, score band estimate, mind maps, games, LLM sentence feedback, PWA. Parroto keeps listening/dictation/shadowing/full mock tests.

### Cited Findings (basis for prioritization)
- Spaced retrieval has the strongest effect → FSRS sits at the center of the MVP. — [Springer meta-analysis](https://link.springer.com/10.1007/s10648-020-09572-8)
- Parroto lacks a visible TOEIC error log and a test-to-vocab link → the error log is the highest-value gap. — [parroto.app/exams/toeic](https://parroto.app/exams/toeic)
- Study4 tracks results by question type; Santa diagnoses by Part → dashboard by tag. — [study4.com](https://study4.com/); [Santa App Store](https://apps.apple.com/app/id1148006701)
- Accurate score prediction increases engagement, but early predictions are unstable → show a band with uncertainty, and push it to "later". — [arXiv 2005.05021](https://arxiv.org/abs/2005.05021v5); [Santa App Store](https://apps.apple.com/app/id1148006701)
- Streaks help retention (company data), not proven for learning → lightweight streak based on finished reviews. — [Duolingo Blog](https://blog.duolingo.com/how-duolingo-streak-builds-habit)

### Inferences: feature table

**MVP (week 1–2 of the build)**
| # | Feature | Goal | Technical notes |
|---|---|---|---|
| M1 | **Vocab FSRS deck**: card = word + IPA + VN meaning + collocation + TOEIC example sentence + source (Parroto test #, Part, sentence); reverse (VN→EN, cloze) modes; TTS button | Vocab, paraphrase | ts-fsrs `next()`; IndexedDB `cards` + `reviewLogs`; `maximum_interval` ≤ days to the exam; bulk import from CSV/paste (copy the words you saved in Parroto) |
| M2 | **Error log**: after each Parroto test/part, quickly enter question #, Part, tag (P2: similar-sound/same-word trap, indirect answer, wrong wh-word...; P5: word form, tense, preposition, conjunction, pronoun, vocab-meaning...; P7: inference, NOT/TRUE, synonym, insert sentence...), cause (vocab/grammar/time/careless), note, correct answer. Each error automatically becomes an FSRS card | Error log, P2, P5, P7 | One schema `errors{id, date, source, part, tag[], cause, prompt, answer, note}`; a "Re-ask" button = retrieval practice; filter by tag |
| M3 | **Part 5 grammar drill**: self-made/imported question bank (JSON) tagged by grammar point; 10-question sessions favoring weak tags (most wrong in the last 7 days); 20s/question timer | P5 | Weighted random selection by error rate per tag (simple bandit); explanation per question |
| M4 | **Part 2 trap drill**: text-only (or TTS reads it aloud) question + 3 responses; label the trap type after answering | P2 traps | Use TTS for the audio (offline); Parroto still owns real listening practice. This drill only trains trap recognition |
| M5 | **30-day daily plan**: today's checklist = FSRS due cards + 1 Parroto block (link out: dictation P3/4, mock test on days X) + 1 micro-drill for the weakest tag; tick off when done | Daily plan | Plan template JSON for 30 days; streak counts days the checklist was finished (not logins); deep links to parroto.app |
| M6 | **Basic dashboard + backup**: accuracy by Part/tag (7-day/all-time), review forecast for the next 7 days, number of words mature/learning, Parroto mock scores entered by hand (line chart); JSON export/import | Dashboard | Chart.js/SVG; `navigator.storage.persist()`; reminder to back up |

**Later (week 3+)**
| # | Feature | Goal | Technical notes |
|---|---|---|---|
| L1 | **Paraphrase matcher**: pairs (phrase in passage ↔ synonym in answer) taken from errors/P7; "match" mode + fill in the paraphrase | Paraphrase, P3/4/7 | Matching game (engagement, use as warm-up); synonym-pair cards also go into FSRS |
| L2 | **Part 7 speed reader**: paste a passage plus questions, timer target (e.g. 1 min/question), track words per minute and accuracy; skimming mode (hide text after N seconds) | P7 speed | Store time per question; dashboard WPM trend |
| L3 | **Score band estimate**: per-Part accuracy (Beta prior, last N questions) × raw-to-scaled conversion table → L/R band with an interval | Dashboard | Show a range; only after ≥ X questions/Part (avoids the instability Santa admitted to) |
| L4 | **Mind maps**: vocab by topic (Office, Finance, Travel...) / word family (produce, product, productive...) as Markdown → markmap | Vocab | Self-host markmap-view + d3 (MIT); generate the Markdown from cards tagged with a topic |
| L5 | **Speed-round / matching games**: 60s word↔meaning, collocation | Vocab (engagement) | Recognition only; does not replace FSRS review |
| L6 | **Sentence writing with LLM feedback**: write a sentence with the target word; optional API (user's own key) or local Ollama returns corrections | Vocab active use, writing | Opt-in, off by default; JSON rubric; without a key, show a sample sentence to self-check |
| L7 | **PWA** for phone use (manifest, service worker, installable) | All | Cache the app shell; storage is separate per device, so sync by exporting/importing JSON (or a file in iCloud/Drive) |
| L8 | **FSRS optimizer** after enough review logs (~1,000+) | Vocab | `@open-spaced-repetition/binding` (maybe Node/WASM only; check before using) |

**Leave to Parroto (do not build)**: Part 1–4 dictation, shadowing/pronunciation scoring, full 200-question/120-minute mock tests with official scoring, speaking with real people, listening from video/podcasts/stories, the basic TOEIC 600/ETS 1,600 vocab decks (only pull words you got wrong or don't know into the local app). The local app is the **"notebook + scheduler + targeted drills"** layer around Parroto.

### Gaps
- No ready-made, freely licensed TOEIC question bank (P2/P5/P7) was found to bundle. You will likely have to write your own, take them from your own Parroto mistakes, or generate them with an LLM and check them by hand (watch for copyright on ETS material).
- The official raw-to-scaled conversion table is not published by ETS. Parroto says it uses an "official table", but its source is not public. The band estimate should use a widely circulated reference table and say clearly that it is approximate.
