Goal
Continue executing the dpsk-2 audit remediation plan phase by phase (Phase 1: zod validation for 14 apps, Phase 2: ARIA, Phase 3: focus outlines, Phase 4: docs).

Constraints & Preferences
- (none)

Progress
Done
- Created REMEDIATION_PLAN_DPSK2.md with validated remediation plan
- Clock.tsx converted from raw JSON.parse to safeJsonParse + zod schema (AlarmSchema)
- Calculator.tsx converted from raw JSON.parse to safeJsonParse + zod schema
- TypeScript compilation verified after all changes

In Progress
- Phase 1: Adding zod validation to remaining 11 apps (Calendar, Chat, ColorPalette, ColorPicker, Memory, Notes, Reminders, RssReader, ScreenRecorder, Settings, Spreadsheet, ArchiveManager)

Blocked
- (none)

Key Decisions
- Using raw ?? '[]' pattern when localStorage.getItem() returns null, since safeJsonParse expects a string
- Will batch process remaining apps for efficiency after establishing the Clock.tsx reference pattern
- Working OWNED: Solving for build/compilation issues as they come up to minimize back-and-forth

Next Steps
1. Batch 1: Calendar.tsx, Chat.tsx, ColorPalette.tsx (zod schemas + safeJsonParse)
2. Batch 2: ColorPicker.tsx, Memory.tsx, Notes.tsx
3. Batch 3: Reminders.tsx, RssReader.tsx, ScreenRecorder.tsx
4. Batch 4: Settings.tsx, Spreadsheet.tsx, ArchiveManager.tsx
5. Phase 2: Add ARIA attributes (Desktop, Dock, WindowFrame)
6. Phase 3: Add focus outlines + mock data comments
7. Phase 4: Update AGENTS.md, CLAUDE.md, README.md

Critical Context
- safeJsonParse utility lives in src/utils/safeJsonParse.ts and expects (raw: string, schema: ZodSchema, fallback: T)
- zod v4.3.5 is installed
- Reference apps (PasswordManager, Contacts, Browser) already use the correct safeJsonParse pattern
- Clock.tsx: loadCities and loadAlarms now use safeJsonParse with z.array(z.string()) and z.array(AlarmSchema)
- Calculator.tsx: calc_history and calc_memory now use safeJsonParse with z.array(z.object({expr: z.string(), result: z.string()})) and z.number()
- TypeScript compilation passes (tsc -b --noEmit)

Relevant Files
- REMEDIATION_PLAN_DPSK2.md: Validated remediation plan with timeline estimates
- src/apps/Clock.tsx: Reference implementation with zod schemas (AlarmSchema) and safeJsonParse
- src/apps/Calculator.tsx: Fixed app with calc_history and calc_memory zod schemas
- src/apps/Calendar.tsx: Next app to fix (has ubuntuos_calendar_events localStorage key)
- src/apps/Chat.tsx: Next app to fix (has chat_conversations localStorage key)
- src/apps/ColorPalette.tsx: Next app to fix (has color_palettes localStorage key)
- src/utils/safeJsonParse.ts: Utility for safe JSON parsing with zod validation
