Goal
Continue executing the dpsk-2 audit remediation plan phase by phase (Phase 1: zod validation for 14 apps, Phase 2: ARIA, Phase 3: focus outlines, Phase 4: docs).

Constraints & Preferences
- (none)

Progress
Done
- Created REMEDIATION_PLAN_DPSK2.md with validated remediation plan
- Phase 1: Complete - Fixed all 14 apps with zod validation and safeJsonParse
  - Clock.tsx, Calculator.tsx, Calendar.tsx, Chat.tsx, ColorPalette.tsx, ColorPicker.tsx
  - Memory.tsx, Notes.tsx, Reminders.tsx, RssReader.tsx, ScreenRecorder.tsx
  - Settings.tsx, Spreadsheet.tsx, ArchiveManager.tsx
- TypeScript compilation verified after all changes

In Progress
- Phase 2: Add ARIA attributes to Desktop, Dock, WindowFrame components

-dotnet

Blocked
- (none)

Key Decisions
- Using raw ?? '[]' pattern when localStorage.getItem() returns null, since safeJsonParse expects a string
- Will batch process remaining apps for efficiency after establishing the Clock.tsx reference pattern
- Working OWNED: Solving for build/compilation issues as they come up to minimize back-and-forth

Next Steps
1. Phase 2: Add ARIA attributes to Desktop, Dock, WindowFrame components
2. Phase 3: Add focus outlines + mock data comments
3. Phase 4: Update AGENTS.md, CLAUDE.md, README.md with Phase 1 and Phase 2 changes

Critical Context
- safeJsonParse utility lives in src/utils/safeJsonParse.ts and expects (raw: string, schema: ZodSchema, fallback: T)
- zod v4.3.5 is installed
- Reference apps (PasswordManager, Contacts, Browser) already use the correct safeJsonParse pattern
- Clock.tsx: loadCities and loadAlarms now use safeJsonParse with z.array(z.string()) and z.array(AlarmSchema)
- Calculator.tsx: calc_history and calc_memory now use safeJsonParse with z.array(z.object({expr: z.string(), result: z.string()})) and z.number()
- Memory.tsx: getHighScore now uses safeJsonParse with z.object({ moves: z.number(), time: z.number() })
- Notes.tsx: loadNotes and loadFolders now use safeJsonParse with z.array(NoteSchema) and z.array(FolderItemSchema)
- Reminders.tsx: loadReminders now uses safeJsonParse with z.array(ReminderSchema) and z.enum(['low', 'medium', 'high'])
- RssReader.tsx: loadReadState now uses safeJsonParse with z.array(z.string())
- ScreenRecorder.tsx: loadRecordings now uses safeJsonParse with z.array(ScreenRecordingSchema) and z.enum(['screen', 'window', 'area'])
- Settings.tsx: settings state now uses safeJsonParse with z.record(z.string(), z.any())
- Spreadsheet.tsx: loadSheets now uses safeJsonParse with z.array(SheetSchema) and z.record(z.string(), CellDataSchema)
- ArchiveManager.tsx: loadArchives now uses safeJsonParse with z.array(ArchiveFileSchema) and z.lazy for recursive ArchiveEntrySchema
- TypeScript compilation passes (tsc -b --noEmit)

Relevant Files
- REMEDIATION_PLAN_DPSK2.md: Validated remediation plan with timeline estimates
- src/apps/Clock.tsx: Reference implementation with zod schemas (AlarmSchema) and safeJsonParse
- src/apps/Calculator.tsx: Fixed app with calc_history and calc_memory zod schemas
- src/utils/safeJsonParse.ts: Utility for safe JSON parsing with zod validation
