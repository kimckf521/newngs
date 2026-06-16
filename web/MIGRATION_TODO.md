# Frontend Migration TODO

This file tracks the remaining cleanup work after the April 2026 refactor that
addressed the original 20-issue frontend review.

## What's already done

- **Phase A — Quick wins**: All 10 items fixed (max-height rule, alt text,
  honeypot, error/loading/not-found pages, rel attributes, h1 demotion,
  inline styles, common/ folder).
- **Phase B — Foundation**: `next/font` set up (Albert Sans + Josefin Sans
  via Google Fonts), color tokens consolidated in `tailwind.config.ts`,
  Bootstrap removed (carousel CSS inlined), `next/image` optimization
  enabled.
- **Phase C — Component unification (home page)**: 13 layout/section
  components merged from `…En.tsx` + `…Zh.tsx` into single locale-aware
  components:
  - `layout/Navbar.tsx` (also replaces NavbarBehavior — state is now React)
  - `layout/Footer.tsx`
  - `layout/CustomerServiceFab.tsx`
  - `layout/HtmlLang.tsx` (new — sets per-route `<html lang>`)
  - `sections/Hero.tsx`
  - `sections/PartnerIntro.tsx`
  - `sections/OurPrograms.tsx`
  - `sections/FounderStory.tsx`
  - `sections/PartnerWithUs.tsx`
  - `sections/IndexForm.tsx`
  - `sections/GlobalCommunity.tsx`
  - `sections/Inspires.tsx`
  - `sections/Media.tsx`
  - `sections/PartnersLists.tsx`
  - `pages/Home.tsx` (replaces HomeZh + HomeEn)
- **Routing**: Pages live in `app/(zh)/` and `app/(en)/` route groups, each
  with its own layout that calls `<HtmlLang>` to set the lang attribute.
- **Inner pages updated**: All ~16 inner-page components had their imports
  rewritten to use the unified components for the migrated sections (Navbar,
  Footer, Hero, Media, Inspires, GlobalCommunity, IndexForm, OurPrograms,
  PartnerWithUs, FounderStory, PartnerIntro, PartnersLists, CustomerServiceFab).
- **Content**: Strings extracted to `src/content/{navbar,footer,home,founder,forms}.ts`.
- **Legacy CSS**: 193 dead empty class declarations removed (~13.5 KB).
  `backup.css` and `fonts.css` deleted. Hard-coded font names replaced with
  `var(--font-*)` references that resolve to `next/font` definitions.

## What still needs to be done

### Inner-page sections still in `…En.tsx` / `…Zh.tsx` form

These follow the same pattern as the migrated home-page sections. For each
pair, the migration is:
1. Read both files, extract strings to `src/content/<section>.ts` with
   `{ en, zh }` shape.
2. Create a single locale-aware component `<SectionName>.tsx` that takes a
   `locale` prop.
3. Replace all `<img>` with `<Image>` from `next/image`.
4. Replace all `<a href="/internal-route">` with `<Link>` from `next/link`.
5. Update inner-page imports to use the new unified component.
6. Delete the old En/Zh files.

#### Sections to migrate (~70 files)

| Section | Files | Used by |
|---|---|---|
| AdmissionsPlans | `AdmissionsPlansEn.tsx` (370L), `AdmissionsPlansZh.tsx` (358L) | `/admissions`, `/admissions_en` |
| AdmissionsRequirement | `AdmissionsRequirement{En,Zh}.tsx` | `/admissions*` |
| TakeCharge | `TakeCharge{En,Zh}.tsx` | `/admissions*` |
| StudentReviews | `StudentReviews{En,Zh}.tsx` | `/admissions*` |
| PartnerWithNgs | `PartnerWithNgs{En,Zh}.tsx` | `/admissions*` |
| CclrIntro | `CclrIntro{En,Zh}.tsx` | `/cclr_programs*` |
| Comprehensive | `Comprehensive{En,Zh}.tsx` | `/cclr_programs*` |
| TakeCharge (already listed) | | |
| HighschoolMappingProgram | `HighschoolMappingProgram{En,Zh}.tsx` | `/highschool_mapping*` |
| HighschoolMappingSections | `HighschoolMappingSections{En,Zh}.tsx` | `/highschool_mapping*` |
| K12School | `K12School{En,Zh}.tsx` | `/highschool_mapping*` |
| CollegeCounseling | `CollegeCounseling{En,Zh}.tsx` | `/college_mentorship*` |
| Mentorship | `Mentorship{En,Zh}.tsx` | `/college_mentorship*` |
| ConnectsCards | `ConnectsCards{En,Zh}.tsx` | `/ngs_connects*` |
| ConnectToParents | `ConnectToParents{En,Zh}.tsx` | `/ngs_connects*` |
| ConnectToSchools | `ConnectToSchools{En,Zh}.tsx` | `/ngs_connects*` |
| ConnectToExperts | `ConnectToExperts{En,Zh}.tsx` | `/ngs_connects*` |
| IntroConnects | `IntroConnects{En,Zh}.tsx` | `/ngs_connects*` |
| SubscribeConnects (zh-only) | `SubscribeConnectsZh.tsx` | `/ngs_connects` |
| Subscribe | `SubscribeEn.tsx` (en-only — needs zh) | `/ngs_connects_en` |
| GlobalIndustryLeaders | `GlobalIndustryLeaders{En,Zh}.tsx` | `/ngs_inspires*` |
| GlobalUniversities | `GlobalUniversities{En,Zh}.tsx` | `/ngs_inspires*` |
| SparkLab | `SparkLab{En,Zh}.tsx` | `/ngs_inspires*` |
| IntroInspires | `IntroInspires{En,Zh}.tsx` | `/ngs_inspires*` |
| SubscribeInspires (zh-only) | `SubscribeInspiresZh.tsx` | `/ngs_inspires` |
| IntroHybrid (in legacy CSS, not yet listed) | check | `/hybrid_learning*` |
| FormHybrid | `FormHybrid{En,Zh}.tsx` | `/hybrid_learning*` |
| FormDualTrack | `FormDualTrack{En,Zh}.tsx` | `/dual_track_learning*` |
| DiplomaProgram (zh-only) | `DiplomaProgramZh.tsx` | `/online_diploma_program` |
| FormOnlineDiploma | `FormOnlineDiploma{En,Zh}.tsx` | `/online_diploma_program*` |
| Programmes | `Programmes{En,Zh}.tsx` | `/programs*` |
| ProgramOptions | `ProgramOptions{En,Zh}.tsx` | `/programs*` |
| GlobalApplication | `GlobalApplication{En,Zh}.tsx` | `/programs*` |
| Faculties | `Faculties{En,Zh}.tsx` | `/faculty*` |
| NgsGlobal | `NgsGlobal{En,Zh}.tsx` | `/faculty*` |
| Progress | `Progress{En,Zh}.tsx` | `/in_progress*` |
| PrivacyPolicy | `PrivacyPolicy{En,Zh}.tsx` | `/privacy*` |
| TermsOfService | `TermsOfService{En,Zh}.tsx` | `/termsofservice*` |
| YcsIntro / YcsPrograms / YcsTeams (zh-only) | `YcsIntroZh.tsx`, `YcsProgramsZh.tsx`, `YcsTeamsZh.tsx` | `/yinghua_online` |

#### Inner page wrappers still in En/Zh form

These should each become a 2-line wrapper that imports a unified `<Page>`
component and passes `locale`:

- `AdmissionsEn.tsx` / `AdmissionsZh.tsx`
- `CclrProgramsEn.tsx` / `CclrProgramsZh.tsx`
- `CollegeMentorshipEn.tsx` / `CollegeMentorshipZh.tsx`
- `DualTrackEn.tsx` / `DualTrackZh.tsx`
- `FacultyEn.tsx` / `FacultyZh.tsx`
- `HighschoolMappingEn.tsx` / `HighschoolMappingZh.tsx`
- `HybridLearningEn.tsx` / `HybridLearningZh.tsx`
- `IbHerosEn.tsx` / `IbHerosZh.tsx`
- `InProgressEn.tsx` / `InProgressZh.tsx`
- `NgsConnectsEn.tsx` / `NgsConnectsZh.tsx`
- `NgsInspiresEn.tsx` / `NgsInspiresZh.tsx`
- `OnlineDiplomaEn.tsx` / `OnlineDiplomaZh.tsx`
- `PrivacyEn.tsx` / `PrivacyZh.tsx`
- `ProgramsEn.tsx` / `ProgramsZh.tsx`
- `TermsEn.tsx` / `TermsZh.tsx`
- `YinghuaOnlineEn.tsx` / `YinghuaOnlineZh.tsx`

### CSS / styling

Most of `styles/legacy/styles.css` (still ~9,900 lines) cannot be deleted
until the inner-page sections are migrated, because the unmigrated
components reference its BEM classes.

After migration, the eventual goal is:

1. Replace each migrated component's BEM class names (`media__flex-col`,
   `inspires__circle`, `index__rounded-7873`, etc.) with Tailwind utility
   classes.
2. As classes get replaced, delete the corresponding blocks from
   `styles/legacy/styles.css`.
3. Once all migration is done, delete:
   - `styles/legacy/styles.css` (10K lines)
   - `styles/legacy/site.css` (only `:root` vars + a few base styles —
     replaceable with Tailwind theme)
   - `styles/legacy/test.css`, `progress.css`, `policy.css`,
     `partnership_lists.css`, `ycs_intro.css`, `ycs_teams.css`
   - The whole `@import` block in `globals.css`
4. The `inspires-zh__grid-cols` selector in `Inspires.tsx` is the last
   place a `_zh` suffix sneaks into the unified components — replace it
   with `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` (or similar) once
   that section is fully Tailwind-ified.

### Image optimization

`next/image` is now configured (`next.config.mjs`) and the migrated
components use `<Image>`. Inner-page sections still use raw `<img>` tags
— these should become `<Image>` during migration. Specifically:

- `static/img/` is 76 MB and `static/videos/tutors/` is 72 MB
- 18 PNG/JPG files are over 1 MB (e.g. `harvard.png`, `painting.jpg`,
  `Studywithus.png`, several `connects/*.png` files)
- 0 WebP files exist — `next/image` will now serve WebP automatically
  for the migrated `<Image>` components, but the source files are still
  large. Consider running them through `sharp` / `squoosh` for a one-time
  source-side reduction.
- Tutor videos (23/28/18/3 MB) are loaded eagerly with `<video controls
  loop>`. They should be lazy with `preload="none"` and a `<poster>`
  attribute, served only on hover for the desktop card UX.

### Misc

- `globals.css` body still hardcodes `color: #1f2937` and
  `background-color: #f9fafb`. After Tailwind migration, replace these
  with `bg-page text-ink` on the `<body>` className.
- The legacy `:root` variables in `legacy/site.css` (`--page-bg`,
  `--surface`, `--text`, `--muted`, `--border`, `--brand`,
  `--brand-dark`, `--shadow-sm`, `--shadow-lg`, `--radius-lg`,
  `--radius-md`, `--max-w`) are now duplicated by the equivalents in
  `tailwind.config.ts`. After migration, delete the `:root` block.

## Quick reference

| Counts | Before | After |
|---|---|---|
| Lines of legacy CSS | 13,278 | 12,431 (-847) |
| `legacy/styles.css` | 10,741 | 9,894 |
| Component files in `pages/` and `sections/` | 119 | 96 (-23) |
| Bootstrap dependency | yes | **removed** |
| `<html lang>` matches route locale | no (always `zh`) | **yes** |
| `next/font` for body / heading | no | **yes (Google Fonts)** |
| `next/image` for hero, navbar, footer, all migrated sections | no | **yes** |
| `next/link` for navbar, footer, all migrated sections | no | **yes** |
| `error.tsx` / `loading.tsx` / `not-found.tsx` | no | **yes** |
