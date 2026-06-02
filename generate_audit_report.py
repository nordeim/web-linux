#!/usr/bin/env python3
"""
UbuntuOS Web — Codebase Audit Report
Consolidated severity-ranked findings from multi-phase audit.
"""

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, HRFlowable, ListFlowable, ListItem,
    CondPageBreak,
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# ━━ Palette ━━
ACCENT       = colors.HexColor('#4e26c7')
TEXT_PRIMARY  = colors.HexColor('#1c1d1e')
TEXT_MUTED    = colors.HexColor('#7b8388')
BG_SURFACE   = colors.HexColor('#dce1e5')
BG_PAGE      = colors.HexColor('#eef0f2')

TABLE_HEADER_COLOR = ACCENT
TABLE_HEADER_TEXT  = colors.white
TABLE_ROW_EVEN     = colors.white
TABLE_ROW_ODD      = BG_SURFACE

# ━━ Severity Colors ━━
SEV_CRITICAL = colors.HexColor('#dc2626')
SEV_HIGH     = colors.HexColor('#ea580c')
SEV_MEDIUM   = colors.HexColor('#ca8a04')
SEV_LOW      = colors.HexColor('#2563eb')
SEV_INFO     = colors.HexColor('#16a34a')

# ━━ Fonts ━━
FONT_DIR = '/usr/share/fonts/truetype'
pdfmetrics.registerFont(TTFont('DejaVuSerif', os.path.join(FONT_DIR, 'dejavu/DejaVuSerif.ttf')))
pdfmetrics.registerFont(TTFont('DejaVuSerif-Bold', os.path.join(FONT_DIR, 'dejavu/DejaVuSerif-Bold.ttf')))
pdfmetrics.registerFont(TTFont('DejaVuSans', os.path.join(FONT_DIR, 'dejavu/DejaVuSans.ttf')))
pdfmetrics.registerFont(TTFont('DejaVuSans-Bold', os.path.join(FONT_DIR, 'dejavu/DejaVuSans-Bold.ttf')))

from reportlab.pdfbase.pdfmetrics import registerFontFamily
registerFontFamily('DejaVuSerif', normal='DejaVuSerif', bold='DejaVuSerif-Bold')
registerFontFamily('DejaVuSans', normal='DejaVuSans', bold='DejaVuSans-Bold')

# ━━ Page Setup ━━
PAGE_W, PAGE_H = A4
LEFT_M = 20*mm
RIGHT_M = 20*mm
TOP_M = 20*mm
BOTTOM_M = 20*mm
CONTENT_W = PAGE_W - LEFT_M - RIGHT_M

OUTPUT = '/home/z/my-project/download/UbuntuOS_Web_Codebase_Audit_Report.pdf'

# ━━ Styles ━━
styles = getSampleStyleSheet()

sH1 = ParagraphStyle('H1', fontName='DejaVuSans-Bold', fontSize=22, leading=28, textColor=ACCENT,
                      spaceBefore=24, spaceAfter=10)
sH2 = ParagraphStyle('H2', fontName='DejaVuSans-Bold', fontSize=16, leading=22, textColor=TEXT_PRIMARY,
                      spaceBefore=18, spaceAfter=8)
sH3 = ParagraphStyle('H3', fontName='DejaVuSans-Bold', fontSize=12, leading=16, textColor=ACCENT,
                      spaceBefore=12, spaceAfter=6)
sBody = ParagraphStyle('Body', fontName='DejaVuSerif', fontSize=10, leading=15, textColor=TEXT_PRIMARY,
                        alignment=TA_JUSTIFY, spaceBefore=3, spaceAfter=3)
sBodyBold = ParagraphStyle('BodyBold', parent=sBody, fontName='DejaVuSerif-Bold')
sMuted = ParagraphStyle('Muted', fontName='DejaVuSerif', fontSize=9, leading=13, textColor=TEXT_MUTED,
                         alignment=TA_JUSTIFY, spaceBefore=2, spaceAfter=2)
sBullet = ParagraphStyle('Bullet', parent=sBody, leftIndent=16, bulletIndent=6,
                          bulletFontName='DejaVuSerif', bulletFontSize=10)
sTableCell = ParagraphStyle('TableCell', fontName='DejaVuSans', fontSize=8.5, leading=11.5,
                             textColor=TEXT_PRIMARY, alignment=TA_LEFT, wordWrap='CJK')
sTableCellBold = ParagraphStyle('TableCellBold', parent=sTableCell, fontName='DejaVuSans-Bold')
sTableHeader = ParagraphStyle('TableHeader', fontName='DejaVuSans-Bold', fontSize=8.5, leading=11.5,
                               textColor=TABLE_HEADER_TEXT, alignment=TA_LEFT)
sSevCrit = ParagraphStyle('SevCrit', parent=sTableCell, fontName='DejaVuSans-Bold', textColor=SEV_CRITICAL)
sSevHigh = ParagraphStyle('SevHigh', parent=sTableCell, fontName='DejaVuSans-Bold', textColor=SEV_HIGH)
sSevMed  = ParagraphStyle('SevMed',  parent=sTableCell, fontName='DejaVuSans-Bold', textColor=SEV_MEDIUM)
sSevLow  = ParagraphStyle('SevLow',  parent=sTableCell, fontName='DejaVuSans-Bold', textColor=SEV_LOW)
sSevInfo = ParagraphStyle('SevInfo', parent=sTableCell, fontName='DejaVuSans-Bold', textColor=SEV_INFO)
sCoverTitle = ParagraphStyle('CoverTitle', fontName='DejaVuSans-Bold', fontSize=32, leading=38,
                              textColor=ACCENT, alignment=TA_CENTER)
sCoverSub = ParagraphStyle('CoverSub', fontName='DejaVuSerif', fontSize=14, leading=20,
                            textColor=TEXT_MUTED, alignment=TA_CENTER)
sCoverMeta = ParagraphStyle('CoverMeta', fontName='DejaVuSerif', fontSize=11, leading=16,
                             textColor=TEXT_MUTED, alignment=TA_CENTER)


# ━━ Helpers ━━
def P(text, style=sBody):
    return Paragraph(text, style)

def HR():
    return HRFlowable(width="100%", thickness=0.5, color=ACCENT, spaceBefore=6, spaceAfter=6)

def sev_style(sev):
    return {'Critical': sSevCrit, 'High': sSevHigh, 'Medium': sSevMed,
            'Low': sSevLow, 'Informational': sSevInfo}.get(sev, sTableCell)

def make_table(headers, rows, col_widths=None):
    """Create a styled table with header row and alternating row colors."""
    hdr = [Paragraph(h, sTableHeader) for h in headers]
    data = [hdr]
    for row in rows:
        data.append([Paragraph(str(c), sTableCell) if not isinstance(c, Paragraph) else c for c in row])
    if col_widths is None:
        col_widths = [CONTENT_W / len(headers)] * len(headers)
    else:
        total = sum(col_widths)
        col_widths = [w / total * CONTENT_W for w in col_widths]
    t = Table(data, colWidths=col_widths, repeatRows=1)
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), TABLE_HEADER_TEXT),
        ('FONTNAME', (0, 0), (-1, 0), 'DejaVuSans-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 8.5),  # keep for make_table
        ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
        ('TOPPADDING', (0, 0), (-1, 0), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#c0c4c8')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 1), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 3),
    ]
    for i in range(1, len(data)):
        bg = TABLE_ROW_EVEN if i % 2 == 1 else TABLE_ROW_ODD
        style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))
    t.setStyle(TableStyle(style_cmds))
    return t

def finding_table(findings, include_phase=False):
    """Create a findings table with severity-colored severity column."""
    if include_phase:
        headers = ['#', 'Severity', 'Category', 'Finding', 'Location', 'Impact', 'Phase']
        widths = [0.03, 0.08, 0.10, 0.28, 0.20, 0.20, 0.08]
    else:
        headers = ['#', 'Severity', 'Category', 'Finding', 'Location', 'Impact']
        widths = [0.04, 0.09, 0.11, 0.30, 0.22, 0.24]
    hdr = [Paragraph(h, sTableHeader) for h in headers]
    data = [hdr]
    for idx, f in enumerate(findings, 1):
        sev_p = Paragraph(f['severity'], sev_style(f['severity']))
        row = [Paragraph(str(idx), sTableCell), sev_p]
        row.append(Paragraph(f.get('category', ''), sTableCell))
        row.append(Paragraph(f['finding'], sTableCell))
        row.append(Paragraph(f['location'], sTableCell))
        row.append(Paragraph(f['impact'], sTableCell))
        if include_phase:
            row.append(Paragraph(f.get('phase', ''), sTableCell))
        data.append(row)
    total = sum(widths)
    col_widths = [w / total * CONTENT_W for w in widths]
    t = Table(data, colWidths=col_widths, repeatRows=1)
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), TABLE_HEADER_TEXT),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#c0c4c8')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 3),
        ('RIGHTPADDING', (0, 0), (-1, -1), 3),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]
    for i in range(1, len(data)):
        bg = TABLE_ROW_EVEN if i % 2 == 1 else TABLE_ROW_ODD
        style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))
    t.setStyle(TableStyle(style_cmds))
    return t


# ━━ Document ━━
doc = SimpleDocTemplate(
    OUTPUT,
    pagesize=A4,
    leftMargin=LEFT_M, rightMargin=RIGHT_M,
    topMargin=TOP_M, bottomMargin=BOTTOM_M,
    title='UbuntuOS Web Codebase Audit Report',
    author='Z.ai Codebase Audit Analyst',
    subject='Multi-phase security, reliability, and documentation accuracy audit',
)

story = []

# ━━ COVER ━━
story.append(Spacer(1, 80))
story.append(HR())
story.append(Spacer(1, 20))
story.append(P('UbuntuOS Web', sCoverTitle))
story.append(Spacer(1, 8))
story.append(P('Codebase Audit Report', ParagraphStyle('ct2', parent=sCoverTitle, fontSize=24, leading=30, textColor=TEXT_PRIMARY)))
story.append(Spacer(1, 16))
story.append(HR())
story.append(Spacer(1, 30))
story.append(P('Consolidated Severity-Ranked Findings from Multi-Phase Audit', sCoverSub))
story.append(Spacer(1, 12))
story.append(P('Evidence-Grounded Review: Documentation vs. Source Code', sCoverSub))
story.append(Spacer(1, 30))
story.append(P('Audit Date: 2026-06-02', sCoverMeta))
story.append(P('Security Audit Baseline: 2026-05-31', sCoverMeta))
story.append(P('Codebase Snapshot: codebase_fileset_bundle.md', sCoverMeta))
story.append(Spacer(1, 40))
# Summary block
summary_data = [
    [Paragraph('<b>Audit Summary</b>', sTableHeader), Paragraph('', sTableHeader), Paragraph('', sTableHeader)],
    [Paragraph('Critical Issues', sTableCell), Paragraph('0', sSevCrit), Paragraph('No active exploitable vulnerabilities found', sTableCell)],
    [Paragraph('High-Severity Issues', sTableCell), Paragraph('2', sSevHigh), Paragraph('17+ unvalidated localStorage reads; ~587 KB dead import', sTableCell)],
    [Paragraph('Medium-Severity Issues', sTableCell), Paragraph('8', sSevMed), Paragraph('Doc-code discrepancies, test gaps, convention violations', sTableCell)],
    [Paragraph('Low-Severity Issues', sTableCell), Paragraph('5', sSevLow), Paragraph('Dead code, cosmetic issues, minor optimizations', sTableCell)],
    [Paragraph('Informational', sTableCell), Paragraph('6', sSevInfo), Paragraph('Confirmed positives, validated security fixes', sTableCell)],
]
st = Table(summary_data, colWidths=[0.25*CONTENT_W, 0.10*CONTENT_W, 0.65*CONTENT_W])
st.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
    ('SPAN', (0, 0), (-1, 0)),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#c0c4c8')),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('BACKGROUND', (0, 1), (-1, 1), TABLE_ROW_EVEN),
    ('BACKGROUND', (0, 2), (-1, 2), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 3), (-1, 3), TABLE_ROW_EVEN),
    ('BACKGROUND', (0, 4), (-1, 4), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 5), (-1, 5), TABLE_ROW_EVEN),
]))
story.append(st)
story.append(PageBreak())

# ━━ TABLE OF CONTENTS ━━
story.append(P('Table of Contents', sH1))
story.append(HR())
toc_items = [
    ('1', 'Project Overview and Architecture'),
    ('2', 'Phase 1: Document-by-Document Deep Extraction'),
    ('3', 'Phase 2: Cross-Document Reconciliation'),
    ('4', 'Phase 3: Source Code Validation'),
    ('5', 'Phase 4: Multi-Dimensional Critical Audit'),
    ('6', 'Phase 5: Consolidated Severity-Ranked Findings'),
    ('7', 'Improvement Recommendations'),
]
for num, title in toc_items:
    story.append(P(f'<b>{num}.</b>  {title}', ParagraphStyle('toc', parent=sBody, fontSize=11, leading=18, spaceBefore=4, spaceAfter=4)))
story.append(PageBreak())

# ━━ SECTION 1: PROJECT OVERVIEW ━━
story.append(P('1. Project Overview and Architecture', sH1))
story.append(HR())

story.append(P(
    'UbuntuOS Web is a comprehensive, high-fidelity web-based replica of the Ubuntu Linux desktop environment, '
    'built as a Single Page Application (SPA) that runs entirely in the browser. The project features a custom window '
    'manager, a virtual file system with localStorage persistence, and 54 interactive applications spanning seven '
    'categories: System (7), Productivity (10), Internet (7), Media (7), Games (11), DevTools (8), and Creative (4).'
))

story.append(P('1.1 Core Architecture', sH2))
story.append(P(
    'The application follows a centralized state management pattern using React Context + useReducer, exposed through '
    'the <b>useOS</b> hook (<code>src/hooks/useOSStore.tsx</code>). The OS store manages window lifecycle, focus via '
    'z-index stacking, desktop icons, dock items, notifications, context menus, theme state, and Alt+Tab navigation. '
    'The <b>Virtual File System</b> (<code>src/hooks/useFileSystem.ts</code>) provides an ID-based hierarchical node '
    'structure with CRUD operations, trash handling, path resolution, and localStorage persistence. All app components '
    'are registered in <code>src/apps/registry.ts</code> and routed through <code>src/apps/AppRouter.tsx</code> using '
    'React.lazy() + Suspense for code splitting.'
))

story.append(P('1.2 Tech Stack (Verified from package.json)', sH2))
stack_rows = [
    ['React', '19.2.0', 'Component-based UI and hook-based logic'],
    ['TypeScript', '5.9.3', 'Strict type safety across the OS store'],
    ['Vite', '7.2.4', 'Build tool with code splitting and dev server'],
    ['Tailwind CSS', '3.4.19', 'Utility-first styling with Ubuntu design tokens'],
    ['DOMPurify', '3.4.7', 'XSS sanitization for user-generated HTML'],
    ['Zod', '4.3.5', 'Runtime schema validation for persistence'],
    ['Lucide React', '0.562.0', 'Vector iconography for apps and UI'],
    ['Vitest', '4.1.7', 'Unit testing framework'],
]
story.append(make_table(['Technology', 'Version', 'Purpose'], stack_rows, [0.18, 0.15, 0.67]))
story.append(Spacer(1, 8))

story.append(P('1.3 Security Architecture', sH2))
story.append(P(
    'A comprehensive security audit and remediation was completed on 2026-05-31. The remediation replaced all '
    '<code>eval()</code> and <code>new Function()</code> calls with a hardened shunting-yard math parser '
    '(<code>safeEval.ts</code>), wrapped all <code>dangerouslySetInnerHTML</code> instances in DOMPurify-based '
    'sanitization (<code>sanitizeHtml.ts</code>), and added zod schema validation for all OS-level localStorage '
    'reads (<code>storageValidation.ts</code>). A convenience utility (<code>safeJsonParse.ts</code>) was introduced '
    'for ad-hoc app-specific localStorage validation. The audit found these core security fixes to be properly '
    'implemented and confirmed in the source code.'
))

story.append(PageBreak())

# ━━ SECTION 2: PHASE 1 — DOCUMENT EXTRACTION ━━
story.append(P('2. Phase 1: Document-by-Document Deep Extraction', sH1))
story.append(HR())

story.append(P('2.1 AGENTS.md (AI Agent Briefing)', sH2))
story.append(P(
    'This is the primary technical reference for AI agents. It documents the window manager state machine (z-index '
    'stacking with 2147483647 cap, state transitions for minimize/maximize/restore/close), the safeEval mandatory '
    'rule, the sanitizeHtml mandatory rule, the localStorage validation mandatory rule, and the Virtual File System '
    'architecture (ID-based nodes, versioned key <code>ubuntuos_filesystem_v2</code>, legacy migration support). '
    'It lists 4 outstanding issues: (1) ~17 apps with unvalidated JSON.parse, (2) VFS localStorage 5MB limit, '
    '(3) Accessibility gaps in games and media apps, (4) No CI/CD pipeline. It also documents performance patterns '
    'including React.lazy + Suspense code splitting and the shared DynamicIcon component.'
))

story.append(P('2.2 CLAUDE.md (Coding Standards)', sH2))
story.append(P(
    'Defines implementation standards for React 19 + TypeScript with strict mode. Key rules: no <code>any</code> type, '
    'use <code>useOS</code> hook for global state, build hygiene with <code>noUnusedLocals</code> and '
    '<code>noUnusedParameters</code>. Lists forbidden patterns: <code>eval()</code>, raw '
    '<code>dangerouslySetInnerHTML</code>, unvalidated localStorage. Recommends named imports from lucide-react '
    '(not <code>import * as Icons</code>). Documents the safeEval, sanitizeHtml, and safeJsonParse utilities. '
    'Recommends migrating VFS to IndexedDB, adding CI/CD, splitting osReducer, and fixing ~17 remaining raw '
    'JSON.parse apps.'
))

story.append(P('2.3 GEMINI.md (Project Context)', sH2))
story.append(P(
    'Provides a concise project overview with the same security rules as AGENTS.md and CLAUDE.md. Lists all '
    'technologies with versions. Specifies development conventions: strict typing, functional components with memo, '
    'hooks-first business logic, and PascalCase/camelCase naming. The security section is nearly identical to '
    'CLAUDE.md, reinforcing the non-negotiable nature of the safeEval, sanitizeHtml, and zod validation rules.'
))

story.append(P('2.4 README.md (User-Facing Documentation)', sH2))
story.append(P(
    'The most detailed public-facing document. Lists exact dependency versions in a tech stack table. Claims '
    '41 tests in the Vitest suite, 54 functional applications, and documents the security remediation history. '
    'Includes a features table with app category counts matching the registry. Lists 6 known issues and '
    'recommendations. References REMEDIATION.md for the full audit report (not provided in the codebase bundle). '
    'Claims the test suite has "41 tests" and documents build commands.'
))

story.append(PageBreak())

# ━━ SECTION 3: PHASE 2 — CROSS-DOCUMENT RECONCILIATION ━━
story.append(P('3. Phase 2: Cross-Document Reconciliation', sH1))
story.append(HR())

story.append(P(
    'The following table reconciles key claims across all four documentation files. Verdicts indicate whether '
    'documents agree (Consistent), disagree on facts (Discrepant), or one document omits a topic covered by '
    'others (Gap).'
))

recon_rows = [
    ['App count = 54', 'Consistent', 'All four documents state 54 apps. Registry.tsx confirms 54 entries.'],
    ['React 19', 'Consistent', 'All docs agree. package.json: react 19.2.0.'],
    ['TypeScript 5.9', 'Consistent', 'All docs agree. package.json: typescript ~5.9.3.'],
    ['Vite 7.2', 'Consistent', 'GEMINI.md and README agree. package.json: vite ^7.2.4.'],
    ['DOMPurify version', 'Gap', 'README says 3.4.7. package.json: dompurify ^3.4.7. Other docs omit version.'],
    ['Zod version', 'Gap', 'README says 4.3.5. package.json: zod ^4.3.5. Other docs omit version.'],
    ['Lucide version', 'Discrepant', 'README says 0.562.0 exact. package.json: ^0.562.0 (range). Minor.'],
    ['osReducer line count', 'Discrepant', 'AGENTS.md: "499-line osReducer". CLAUDE.md: "499-line". README: "500-line". Actual: ~350 lines of reducer code.'],
    ['Test count', 'Gap', 'Only README claims "41 tests". Other docs do not state a number.'],
    ['Dev server port', 'Gap', 'Only GEMINI.md says "http://localhost:3000". vite.config.ts confirms port: 3000.'],
    ['eval/new Function removed', 'Consistent', 'All docs state these are eliminated. Source code confirms.'],
    ['safeEval mandatory', 'Consistent', 'All docs mandate safeEval for math. Code confirms usage in Spreadsheet + Terminal.'],
    ['sanitizeHtml mandatory', 'Consistent', 'All docs mandate sanitization. 4 of 5 dangerouslySetInnerHTML instances sanitized.'],
    ['17 apps unvalidated JSON.parse', 'Consistent', 'AGENTS.md and CLAUDE.md list same 17 apps. Code confirms 21 raw JSON.parse calls in those apps.'],
    ['localStorage key', 'Consistent', 'All docs say ubuntuos_filesystem_v2. Code confirms.'],
    ['Vitest version', 'Gap', 'README says "4.x". package.json: vitest ^4.1.7. Other docs omit version.'],
]
story.append(make_table(['Topic', 'Verdict', 'Details'], recon_rows, [0.22, 0.12, 0.66]))
story.append(Spacer(1, 10))

story.append(P('3.1 Key Discrepancies', sH2))
story.append(P(
    '<b>osReducer line count:</b> AGENTS.md and CLAUDE.md claim "499-line osReducer" while README says "500-line". '
    'The actual reducer function in the provided code is approximately 350 lines (lines 31321-31669 of the bundle). '
    'This discrepancy suggests the documentation was written before a refactoring that reduced the reducer size, '
    'and the line count claims were not updated. This is a documentation accuracy issue, not a code bug.'
))
story.append(P(
    '<b>Test count:</b> README.md claims "41 tests" but this is unverifiable without running the full test suite. '
    'The provided test files contain approximately 30 visible test cases across safeEval.test.ts (24 cases), '
    'safeJsonParse.test.ts (3 cases), safeJsonParse-integration.test.ts (3 cases), osReducer-zindex.test.tsx (2 cases), '
    'osReducer.test.ts (1 placeholder), NotImplemented.test.tsx (unknown count, file truncated), and '
    'ContextMenu-actions.test.tsx (unknown count, file truncated). The "41 tests" claim cannot be fully verified '
    'from the provided code bundle alone.'
))

story.append(PageBreak())

# ━━ SECTION 4: PHASE 3 — SOURCE CODE VALIDATION ━━
story.append(P('4. Phase 3: Source Code Validation', sH1))
story.append(HR())

story.append(P(
    'Each material claim from the documentation was traced to the corresponding source code and verified. '
    'Outcomes: Confirmed (code supports the claim), Discrepant (code contradicts the claim), or Unverifiable '
    '(required source not available in the bundle).'
))

validation_rows = [
    ['54 apps in registry', 'Confirmed', 'registry.ts contains exactly 54 AppDefinition entries with correct category counts.'],
    ['React.lazy + Suspense in AppRouter', 'Confirmed', 'AppRouter.tsx uses React.lazy() for all 55 app components; NotImplemented is the only eagerly imported fallback.'],
    ['Z-index cap at 2147483647', 'Confirmed', 'OPEN_WINDOW, FOCUS_WINDOW, and END_ALT_TAB all use Math.min(nextZIndex + 1, 2147483647).'],
    ['eval() eliminated from Spreadsheet', 'Confirmed', 'Spreadsheet.tsx imports and uses safeEval from @/utils/safeEval (line 21216). No eval() found.'],
    ['eval() eliminated from Terminal', 'Confirmed', 'Terminal.tsx imports and uses safeEval from @/utils/safeEval (line 26020). No eval() found.'],
    ['DOMPurify sanitization for all dangerouslySetInnerHTML', 'Discrepant', '4 of 5 instances sanitized. chart.tsx (line 7983) uses dangerouslySetInnerHTML without sanitizeHtml.'],
    ['safeJsonParse used in PasswordManager, Contacts, Browser', 'Confirmed', 'All three import and use safeJsonParse with zod schemas for localStorage reads.'],
    ['storageValidation for desktop icons + VFS', 'Confirmed', 'useOSStore.tsx uses validateDesktopIcons(); useFileSystem.ts uses validateFileSystem().'],
    ['DynamicIcon shared component with memo()', 'Confirmed', 'src/components/DynamicIcon.tsx exists, uses memo(), and is imported by 7+ components.'],
    ['osReducer exported for testing', 'Confirmed', 'osReducer is exported as a named export from useOSStore.tsx.'],
    ['Side effects extracted from reducer', 'Confirmed', 'Desktop icon localStorage writes moved to useEffect in OSProvider. Reducer is pure.'],
    ['NotImplemented.tsx has lucide-react import', 'Discrepant', 'NotImplemented.tsx still has "import * as Icons from lucide-react" (line 1910). Documentation says bug was fixed.'],
    ['Named imports only for lucide-react', 'Discrepant', 'WindowFrame.tsx (line 8907) and NotImplemented.tsx (line 1910) still use wildcard imports. DynamicIcon.tsx is the authorized exception.'],
    ['VFS key ubuntuos_filesystem_v2', 'Confirmed', 'storageValidation.ts uses FILESYSTEM_KEY = "ubuntuos_filesystem_v2" and LEGACY_FILESYSTEM_KEY for migration.'],
    ['No CI/CD pipeline', 'Unverifiable', 'No CI/CD config files provided in bundle. Cannot confirm or deny.'],
    ['Test count = 41', 'Unverifiable', 'Cannot run test suite from bundle. Visible test cases total approximately 30+, but some test files are truncated.'],
    ['Bundle reduced from ~1MB to ~360KB', 'Unverifiable', 'Cannot run build from bundle. React.lazy pattern is confirmed in code, which supports the claim.'],
]
story.append(make_table(['Claim', 'Verdict', 'Evidence'], validation_rows, [0.25, 0.10, 0.65]))
story.append(Spacer(1, 8))

story.append(P('4.1 Source Code Gap Identification (Independent of Documentation)', sH2))
story.append(P(
    'The following issues were found by scanning source code independently, without reference to documentation claims. '
    'These represent bugs, dead code, missing patterns, or architectural concerns discovered during the audit.'
))

gap_rows = [
    ['WindowFrame.tsx uses wildcard lucide import', 'src/components/WindowFrame.tsx line 8907', 'Imports entire ~587KB library unnecessarily; component also imports DynamicIcon.'],
    ['NotImplemented.tsx dead wildcard import', 'src/components/NotImplemented.tsx line 1910', 'Imports * as Icons but only uses Icons.HelpCircle and Icons.Hammer; DynamicIcon already imported.'],
    ['Desktop.tsx commented-out import', 'src/components/Desktop.tsx line 1252', 'Commented "import * as Icons" line remains; should be removed for cleanliness.'],
    ['osReducer.test.ts is a placeholder', 'src/hooks/__tests__/osReducer.test.ts', 'Contains only "expect(true).toBe(true)" and comments saying osReducer is not testable. But osReducer IS now exported.'],
    ['sanitizeMarkdownHtml is local to MarkdownPreview', 'src/apps/MarkdownPreview.tsx line 11743', 'Not exported from @/utils/sanitizeHtml as documentation implies. It is a local function in MarkdownPreview.tsx.'],
    ['CASCADE_WINDOWS does not cap z-index', 'src/hooks/useOSStore.tsx line 31637', 'CASCADE_WINDOWS increments z without the Math.min cap. Potential overflow in long sessions.'],
    ['MINIMIZE_ALL does not save prevPosition/prevSize', 'src/hooks/useOSStore.tsx line 31653', 'MINIMIZE_ALL sets state to minimized but does not capture prevPosition/prevSize, making restore impossible.'],
    ['GlobalErrorBoundary not used in WindowManager', 'src/components/WindowManager.tsx', 'GlobalErrorBoundary exists but is not imported or used in WindowManager or AppRouter. Apps can crash the shell.'],
]
story.append(make_table(['Issue', 'Location', 'Detail'], gap_rows, [0.28, 0.25, 0.47]))

story.append(PageBreak())

# ━━ SECTION 5: PHASE 4 — MULTI-DIMENSIONAL AUDIT ━━
story.append(P('5. Phase 4: Multi-Dimensional Critical Audit', sH1))
story.append(HR())

# Security
story.append(P('5.1 Security Audit', sH2))
story.append(P(
    'The security audit traced all user input to render pipelines and verified the presence of stated mitigations. '
    'The core security architecture is sound: eval() and new Function() have been completely eliminated, DOMPurify '
    'sanitization is applied to 4 of 5 dangerouslySetInnerHTML instances, and OS-level localStorage reads are '
    'validated with zod schemas. However, several gaps remain.'
))

story.append(P('5.1.1 Unvalidated localStorage Reads (High Severity)', sH3))
story.append(P(
    'Twenty-one raw JSON.parse calls across 17 application files read from localStorage without zod schema validation. '
    'This violates the mandatory rule stated in all documentation files. If localStorage data is corrupted (by user '
    'editing DevTools, browser extensions, or disk errors), the parsed objects will have an unknown shape at runtime, '
    'potentially causing crashes, undefined behavior, or rendering of unexpected content. The apps affected are: '
    'Clock (2 calls), Todo (2), ColorPalette (1), ColorPicker (2), TextEditor (1), Calendar (1), Reminders (1), '
    'Memory (1), Spreadsheet (1), Chat (1), RssReader (1), Settings (1), Notes (2), ArchiveManager (1), '
    'ScreenRecorder (1), Calculator (1), and VoiceRecorder (1). The PasswordManager, Contacts, and Browser apps '
    'already use the correct safeJsonParse pattern and serve as reference implementations.'
))

story.append(P('5.1.2 Unsanitized dangerouslySetInnerHTML in chart.tsx (Medium Severity)', sH3))
story.append(P(
    'The chart.tsx UI component (line 7983) uses dangerouslySetInnerHTML to inject dynamically generated CSS from '
    'ChartConfig color values. While the content is built from configuration objects rather than direct user input, '
    'this still bypasses the mandatory sanitization policy. If a chart color value were ever sourced from user '
    'input (e.g., custom theme colors), this would become an XSS vector. The fix is straightforward: wrap the '
    'generated CSS string in sanitizeHtml() or add a code comment explicitly documenting the exemption and its '
    'safety justification.'
))

story.append(P('5.1.3 Password Manager Security Note (Informational)', sH3))
story.append(P(
    'The PasswordManager stores passwords in localStorage using safeJsonParse with zod validation. While the '
    'persistence layer is validated, the passwords themselves are stored as plaintext strings in localStorage. '
    'This is a design limitation rather than a bug (any web-accessible JavaScript can read localStorage), but it '
    'should be documented as a known security constraint. In a production environment, passwords should be encrypted '
    'before storage or handled by a dedicated secrets API.'
))

# Bug & Reliability
story.append(P('5.2 Bug and Reliability Audit', sH2))

story.append(P('5.2.1 MINIMIZE_ALL Does Not Save Window Positions (Medium Severity)', sH3))
story.append(P(
    'The MINIMIZE_ALL reducer case (useOSStore.tsx line 31653) sets all windows to minimized state but does not '
    'capture prevPosition and prevSize on each window. This means that after a "Minimize All" action (Super+D), '
    'restoring individual windows will fall back to their current position/size rather than their pre-minimize '
    'positions. In contrast, the individual MINIMIZE_WINDOW action correctly saves prevPosition and prevSize. '
    'This inconsistency creates a user experience regression where the restore behavior differs depending on '
    'whether windows were minimized individually or via "Minimize All".'
))

story.append(P('5.2.2 CASCADE_WINDOWS Missing Z-Index Cap (Medium Severity)', sH3))
story.append(P(
    'The CASCADE_WINDOWS action (useOSStore.tsx line 31637) increments the z-index counter in a loop without '
    'applying the Math.min(state.nextZIndex + 1, 2147483647) cap that is present in OPEN_WINDOW, FOCUS_WINDOW, '
    'and END_ALT_TAB. If a user repeatedly triggers CASCADE_WINDOWS in a long session, the z-index could exceed '
    'the CSS maximum, causing window focus to become erratic. The documentation specifically notes this as a fixed '
    'issue with "confirm all three locations have the cap," but it missed the CASCADE_WINDOWS case.'
))

story.append(P('5.2.3 GlobalErrorBoundary Not Wired Into Component Tree (Medium Severity)', sH3))
story.append(P(
    'The GlobalErrorBoundary component (src/components/GlobalErrorBoundary.tsx) is implemented and documented as '
    'a wrapper that prevents individual app crashes from taking down the entire desktop shell. However, it is not '
    'imported or used in the WindowManager.tsx or AppRouter.tsx component tree. This means a thrown error in any '
    'app component will propagate up to the React root and potentially crash the entire UbuntuOS shell, defeating '
    'the purpose of the error boundary. The component should wrap each AppRouter invocation inside WindowFrame.'
))

story.append(P('5.2.4 Stale osReducer.test.ts Placeholder (Low Severity)', sH3))
story.append(P(
    'The file src/hooks/__tests__/osReducer.test.ts contains a comment stating "osReducer is not exported from '
    'useOSStore.tsx" and a single placeholder test "expect(true).toBe(true)". However, osReducer IS now exported '
    '(line 31321: "export function osReducer"). The test file was apparently written before the export was added '
    'and never updated. This means the osReducer has only 2 z-index-specific tests in osReducer-zindex.test.tsx '
    'and no tests for its other 25+ action types (MINIMIZE_WINDOW, RESTORE_WINDOW, ADD_NOTIFICATION, etc.).'
))

story.append(CondPageBreak(80))

# Architecture
story.append(P('5.3 Architecture and Design Audit', sH2))

story.append(P('5.3.1 Monolithic Reducer (Medium Severity)', sH3))
story.append(P(
    'The osReducer handles window management, dock state, notifications, context menus, desktop icons, theme, '
    'and Alt+Tab navigation in a single function. All documentation files acknowledge this as a known issue and '
    'recommend splitting into domain-specific reducers. The current structure makes testing individual domains '
    'difficult, increases cognitive load for developers, and creates merge conflict risks. The recommended split '
    'is: windowReducer, dockReducer, notificationReducer, contextMenuReducer, iconReducer, themeReducer, and '
    'altTabReducer.'
))

story.append(P('5.3.2 Lucide React Wildcard Import Bundle Bloat (Medium Severity)', sH3))
story.append(P(
    'Two components (WindowFrame.tsx and NotImplemented.tsx) import the entire lucide-react library using '
    '"import * as Icons from lucide-react", which adds approximately 587 KB to the bundle. DynamicIcon.tsx is '
    'the single authorized wildcard import because it needs to resolve icons by string name at runtime. '
    'WindowFrame.tsx already imports DynamicIcon, so the wildcard import is redundant. NotImplemented.tsx uses '
    'Icons.HelpCircle and Icons.Hammer, which could be replaced with named imports. Despite the explicit '
    'documentation rule against wildcard imports, these violations persist.'
))

story.append(P('5.3.3 sanitizeMarkdownHtml Not Exported from Utils (Low Severity)', sH3))
story.append(P(
    'All three AI agent documents (AGENTS.md, CLAUDE.md, GEMINI.md) reference sanitizeMarkdownHtml() as a '
    'function available from the @/utils/sanitizeHtml module. However, the actual implementation is a local '
    'function defined inside MarkdownPreview.tsx (line 11743), not exported from the utils module. This means '
    'any new app that needs markdown sanitization cannot import it as documented and would need to duplicate the '
    'logic or import it from the MarkdownPreview app file directly, which violates the project structure conventions.'
))

# Testing
story.append(P('5.4 Testing Audit', sH2))
story.append(P(
    'The test infrastructure is built on Vitest with jsdom environment and @testing-library/jest-dom matchers. '
    'The provided test files cover safeEval (24 test cases), safeJsonParse (3 unit + 3 integration tests), and '
    'osReducer z-index cap (2 tests). However, significant gaps exist: no component-level tests for WindowFrame, '
    'Desktop, Dock, or AppRouter (all identified as high-value targets in CLAUDE.md); the osReducer.test.ts file '
    'is a placeholder; and the NotImplemented.test.tsx and ContextMenu-actions.test.tsx files are present but '
    'partially truncated in the bundle. The total visible test count is approximately 30-33, which is below the '
    'README claim of 41 tests (though this cannot be definitively confirmed without running the suite).'
))

# Documentation Accuracy
story.append(P('5.5 Documentation Accuracy Audit', sH2))
doc_acc_rows = [
    ['osReducer "499-line" / "500-line"', 'Discrepant', 'Actual reducer is approximately 350 lines. Documentation counts are stale.'],
    ['NotImplemented.tsx bug "fixed"', 'Discrepant', 'Wildcard import still present. Documentation claims fix is applied.'],
    ['sanitizeMarkdownHtml in @/utils/sanitizeHtml', 'Discrepant', 'Function is local to MarkdownPreview.tsx, not in utils module.'],
    ['Z-index cap "in all three locations"', 'Discrepant', 'CASCADE_WINDOWS also increments z-index without cap. Four locations, not three.'],
    ['No eval() / new Function() in codebase', 'Confirmed', 'Thorough search found zero instances in application code.'],
    ['54 apps in registry', 'Confirmed', 'Exact count and category distribution verified.'],
    ['safeEval used in Spreadsheet + Terminal', 'Confirmed', 'Both import and use safeEval. No raw eval found.'],
    ['safeJsonParse used in PasswordManager, Contacts, Browser', 'Confirmed', 'All three use safeJsonParse with zod schemas.'],
    ['React.lazy + Suspense code splitting', 'Confirmed', 'All apps use lazy() in AppRouter with Suspense fallback.'],
    ['Side effects extracted from reducer', 'Confirmed', 'localStorage writes in useEffect; reducer is pure.'],
]
story.append(make_table(['Claim', 'Verdict', 'Detail'], doc_acc_rows, [0.28, 0.10, 0.62]))

story.append(PageBreak())

# ━━ SECTION 6: CONSOLIDATED FINDINGS ━━
story.append(P('6. Phase 5: Consolidated Severity-Ranked Findings', sH1))
story.append(HR())

# Critical
story.append(P('6.1 Critical Issues', sH2))
story.append(P(
    'No critical issues were identified. There are no active, exploitable security vulnerabilities in the codebase. '
    'The core security architecture (safeEval replacing eval, DOMPurify sanitization, zod validation for OS-level '
    'persistence) is properly implemented and confirmed through source code verification.'
))

# High
story.append(P('6.2 High-Severity Issues', sH2))
high_findings = [
    {
        'severity': 'High', 'category': 'Security',
        'finding': '21 raw JSON.parse calls across 17 apps read localStorage without zod validation. '
                   'Corrupted or maliciously modified localStorage data can cause crashes, undefined behavior, '
                   'or unexpected content rendering. This violates the mandatory validation rule stated in all '
                   'documentation files.',
        'location': 'Clock.tsx, Todo.tsx, ColorPalette.tsx, ColorPicker.tsx, TextEditor.tsx, Calendar.tsx, '
                    'Reminders.tsx, Memory.tsx, Spreadsheet.tsx, Chat.tsx, RssReader.tsx, Settings.tsx, '
                    'Notes.tsx, ArchiveManager.tsx, ScreenRecorder.tsx, Calculator.tsx, VoiceRecorder.tsx',
        'impact': 'Runtime crashes from malformed localStorage data; potential stored-XSS if parsed content '
                  'reaches dangerouslySetInnerHTML; violates documented security policy',
        'phase': 'P3+P4',
    },
    {
        'severity': 'High', 'category': 'Performance',
        'finding': 'WindowFrame.tsx and NotImplemented.tsx import the entire lucide-react library (~587 KB) '
                   'via wildcard imports, directly contradicting the documented rule "Do not use import * as '
                   'Icons from lucide-react". These imports add unnecessary bundle weight and negate part of '
                   'the code-splitting savings.',
        'location': 'src/components/WindowFrame.tsx line 8907; src/components/NotImplemented.tsx line 1910',
        'impact': '~587 KB unnecessary bundle bloat per wildcard import; violates documented coding convention; '
                  'increases initial load time for chunks containing these components',
        'phase': 'P3+P4',
    },
]
story.append(finding_table(high_findings, include_phase=True))
story.append(Spacer(1, 12))

# Medium
story.append(P('6.3 Medium-Severity Issues', sH2))
med_findings = [
    {
        'severity': 'Medium', 'category': 'Security',
        'finding': 'dangerouslySetInnerHTML in chart.tsx (UI component) injects dynamically generated CSS '
                   'without sanitizeHtml() wrapping, violating the mandatory sanitization policy.',
        'location': 'src/components/ui/chart.tsx line 7983',
        'impact': 'Policy violation; potential XSS if chart color values ever come from user input',
        'phase': 'P4',
    },
    {
        'severity': 'Medium', 'category': 'Reliability',
        'finding': 'MINIMIZE_ALL reducer does not save prevPosition/prevSize, unlike individual MINIMIZE_WINDOW. '
                   'Restoring windows after "Minimize All" loses original positions.',
        'location': 'src/hooks/useOSStore.tsx line 31653-31664',
        'impact': 'UX regression: window restore behavior inconsistent depending on minimize method',
        'phase': 'P4',
    },
    {
        'severity': 'Medium', 'category': 'Reliability',
        'finding': 'CASCADE_WINDOWS increments z-index without the Math.min cap present in OPEN_WINDOW, '
                   'FOCUS_WINDOW, and END_ALT_TAB. Can overflow CSS max z-index in long sessions.',
        'location': 'src/hooks/useOSStore.tsx line 31637-31651',
        'impact': 'Erratic window focus in long sessions after repeated cascade operations',
        'phase': 'P4',
    },
    {
        'severity': 'Medium', 'category': 'Reliability',
        'finding': 'GlobalErrorBoundary component exists but is not wired into the component tree. App errors '
                   'can propagate to the React root and crash the entire desktop shell.',
        'location': 'src/components/GlobalErrorBoundary.tsx; src/components/WindowManager.tsx',
        'impact': 'Single app crash can take down the entire UbuntuOS shell; defeats error boundary purpose',
        'phase': 'P4',
    },
    {
        'severity': 'Medium', 'category': 'Architecture',
        'finding': 'Monolithic osReducer handles 25+ action types across 7 domains. Difficult to test, '
                   'maintain, and reason about. All documentation acknowledges this issue.',
        'location': 'src/hooks/useOSStore.tsx',
        'impact': 'High cognitive load for developers; merge conflict risk; difficult to test individual domains',
        'phase': 'P2+P4',
    },
    {
        'severity': 'Medium', 'category': 'Documentation',
        'finding': 'Documentation claims NotImplemented.tsx lucide import bug is "fixed", but wildcard import '
                   'still present at line 1910. Icons.HelpCircle and Icons.Hammer are still used.',
        'location': 'src/components/NotImplemented.tsx line 1910; AGENTS.md, CLAUDE.md',
        'impact': 'Documentation-code mismatch; developers may trust incorrect documentation',
        'phase': 'P3',
    },
    {
        'severity': 'Medium', 'category': 'Documentation',
        'finding': 'sanitizeMarkdownHtml is documented as available from @/utils/sanitizeHtml but is actually '
                   'a local function in MarkdownPreview.tsx. New apps cannot import it as documented.',
        'location': 'src/apps/MarkdownPreview.tsx line 11743; AGENTS.md, CLAUDE.md, GEMINI.md',
        'impact': 'Documentation-code mismatch; developers will encounter import errors following the docs',
        'phase': 'P3',
    },
    {
        'severity': 'Medium', 'category': 'Documentation',
        'finding': 'Z-index cap documented as "present in all three locations" (OPEN_WINDOW, FOCUS_WINDOW, '
                   'END_ALT_TAB) but CASCADE_WINDOWS also increments z-index without the cap.',
        'location': 'src/hooks/useOSStore.tsx line 31637; AGENTS.md troubleshooting section',
        'impact': 'Incomplete fix; documentation understates the scope of the z-index overflow risk',
        'phase': 'P3+P4',
    },
]
story.append(finding_table(med_findings, include_phase=True))
story.append(Spacer(1, 12))

# Low
story.append(P('6.4 Low-Severity Issues', sH2))
low_findings = [
    {
        'severity': 'Low', 'category': 'Testing',
        'finding': 'osReducer.test.ts is a placeholder with a single "expect(true).toBe(true)" test. The '
                   'osReducer is now exported but the test file was never updated.',
        'location': 'src/hooks/__tests__/osReducer.test.ts',
        'impact': '25+ action types in osReducer have no test coverage',
        'phase': 'P4',
    },
    {
        'severity': 'Low', 'category': 'Code Quality',
        'finding': 'Desktop.tsx retains a commented-out "import * as Icons from lucide-react" line that should '
                   'be removed for cleanliness.',
        'location': 'src/components/Desktop.tsx line 1252',
        'impact': 'Dead commented code; minor hygiene issue',
        'phase': 'P3',
    },
    {
        'severity': 'Low', 'category': 'Documentation',
        'finding': 'osReducer line count claimed as "499-line" (AGENTS.md, CLAUDE.md) or "500-line" (README) '
                   'but actual code is approximately 350 lines. Stale documentation.',
        'location': 'AGENTS.md, CLAUDE.md, README.md',
        'impact': 'Minor documentation inaccuracy; no functional impact',
        'phase': 'P2',
    },
    {
        'severity': 'Low', 'category': 'Testing',
        'finding': 'No component-level tests for WindowFrame, Desktop, Dock, or AppRouter despite being '
                   'identified as high-value test targets in CLAUDE.md.',
        'location': 'Missing: src/components/__tests__/WindowFrame.test.tsx, etc.',
        'impact': 'Core UI components have no test coverage; regressions may go undetected',
        'phase': 'P4',
    },
    {
        'severity': 'Low', 'category': 'Security',
        'finding': 'PasswordManager stores passwords as plaintext in localStorage. Not a bug, but a design '
                   'limitation that should be documented.',
        'location': 'src/apps/PasswordManager.tsx',
        'impact': 'Passwords readable by any JS code in the same origin; acceptable for demo, not for production',
        'phase': 'P4',
    },
]
story.append(finding_table(low_findings, include_phase=True))
story.append(Spacer(1, 12))

# Informational
story.append(P('6.5 Informational Observations (Confirmed Positives)', sH2))
info_findings = [
    {
        'severity': 'Informational', 'category': 'Security',
        'finding': 'eval() and new Function() completely eliminated from all application code. safeEval '
                   'shunting-yard parser is properly implemented with character whitelist validation.',
        'location': 'src/utils/safeEval.ts; Spreadsheet.tsx; Terminal.tsx',
        'impact': 'No arbitrary code execution vectors in math evaluation paths',
        'phase': 'P3',
    },
    {
        'severity': 'Informational', 'category': 'Security',
        'finding': 'DOMPurify sanitization correctly applied to 4 of 5 dangerouslySetInnerHTML instances: '
                   'MarkdownPreview, CodeEditor, Notes, and RegexTester.',
        'location': 'src/apps/MarkdownPreview.tsx, CodeEditor.tsx, Notes.tsx, RegexTester.tsx',
        'impact': 'Stored XSS vectors mitigated for markdown, code, notes, and regex content',
        'phase': 'P3',
    },
    {
        'severity': 'Informational', 'category': 'Architecture',
        'finding': 'React.lazy + Suspense code splitting properly implemented in AppRouter with AppSkeleton '
                   'fallback. NotImplemented is correctly the only eagerly imported component.',
        'location': 'src/apps/AppRouter.tsx',
        'impact': 'Initial bundle significantly reduced; apps loaded on demand',
        'phase': 'P3',
    },
    {
        'severity': 'Informational', 'category': 'Architecture',
        'finding': 'Shared DynamicIcon component with memo() eliminates icon rendering duplication across '
                   '7+ components (Dock, WindowFrame, Desktop, AppLauncher, etc.).',
        'location': 'src/components/DynamicIcon.tsx',
        'impact': 'Consistent icon rendering with performance optimization',
        'phase': 'P3',
    },
    {
        'severity': 'Informational', 'category': 'Architecture',
        'finding': 'Reducer purity maintained: localStorage side effects extracted to useEffect in OSProvider. '
                   'Reducer is deterministic and testable.',
        'location': 'src/hooks/useOSStore.tsx lines 31684-31686',
        'impact': 'Clean separation of concerns; reducer behavior is reproducible',
        'phase': 'P3',
    },
    {
        'severity': 'Informational', 'category': 'Validation',
        'finding': 'safeEval test suite has 24 comprehensive cases covering basic arithmetic, decimals, '
                   'parentheses, exponentiation, whitespace, edge cases, and injection rejection.',
        'location': 'src/utils/__tests__/safeEval.test.ts',
        'impact': 'Security-critical code has thorough test coverage',
        'phase': 'P4',
    },
]
story.append(finding_table(info_findings, include_phase=True))

story.append(PageBreak())

# ━━ SECTION 7: RECOMMENDATIONS ━━
story.append(P('7. Improvement Recommendations', sH1))
story.append(HR())
story.append(P(
    'The following recommendations are prioritized by impact and urgency. Each is directly traceable to a specific '
    'finding from this audit.'
))

rec_rows = [
    ['P0', 'Migrate 17 apps from raw JSON.parse to safeJsonParse with zod schemas. Follow the PasswordManager/Contacts/Browser reference pattern. This eliminates the largest remaining security/reliability gap.',
     'High #1'],
    ['P1', 'Remove wildcard lucide-react imports from WindowFrame.tsx and NotImplemented.tsx. Replace with named imports (HelpCircle, Hammer) or use the existing DynamicIcon component. Saves ~587 KB per import.',
     'High #2'],
    ['P1', 'Wire GlobalErrorBoundary into the WindowManager component tree, wrapping each AppRouter invocation inside WindowFrame. This prevents single app crashes from taking down the desktop.',
     'Medium #4'],
    ['P2', 'Add Math.min cap to CASCADE_WINDOWS z-index increment. The fix is a one-line change mirroring the pattern in OPEN_WINDOW/FOCUS_WINDOW/END_ALT_TAB.',
     'Medium #3'],
    ['P2', 'Fix MINIMIZE_ALL to save prevPosition and prevSize for each window before minimizing, consistent with individual MINIMIZE_WINDOW behavior.',
     'Medium #2'],
    ['P2', 'Export sanitizeMarkdownHtml from @/utils/sanitizeHtml and update MarkdownPreview.tsx to import from the shared module. This aligns code with documentation.',
     'Medium #7'],
    ['P2', 'Wrap chart.tsx dangerouslySetInnerHTML content in sanitizeHtml() or add an explicit exemption comment documenting why sanitization is skipped for CSS-only injection.',
     'Medium #1'],
    ['P3', 'Update osReducer.test.ts to test the now-exported osReducer function. Add tests for MINIMIZE_WINDOW, RESTORE_WINDOW, ADD_NOTIFICATION, and other action types.',
     'Low #1'],
    ['P3', 'Split osReducer into domain-specific reducers (windowReducer, dockReducer, notificationReducer, contextMenuReducer, iconReducer, themeReducer, altTabReducer) for better testability and maintainability.',
     'Medium #5'],
    ['P3', 'Update documentation: (a) correct osReducer line count, (b) mark NotImplemented import fix as incomplete, (c) correct z-index cap scope to include CASCADE_WINDOWS, (d) correct sanitizeMarkdownHtml location.',
     'Medium #6, #8; Low #3'],
    ['P4', 'Remove commented-out import line from Desktop.tsx. Add component-level tests for WindowFrame, Desktop, and Dock. Document PasswordManager plaintext storage limitation.',
     'Low #2, #4, #5'],
]
story.append(make_table(['Priority', 'Recommendation', 'Traceability'], rec_rows, [0.06, 0.76, 0.18]))

story.append(Spacer(1, 20))
story.append(HR())
story.append(Spacer(1, 8))
story.append(P(
    '<b>Audit Methodology:</b> This report was produced by a five-phase audit process: (1) document-by-document '
    'deep extraction from AGENTS.md, CLAUDE.md, GEMINI.md, and README.md; (2) cross-document reconciliation to '
    'identify consistencies, discrepancies, and gaps; (3) source code validation of every material claim against '
    'the actual codebase; (4) independent multi-dimensional audit across security, reliability, architecture, '
    'testing, and documentation accuracy dimensions; and (5) consolidation into severity-ranked findings with '
    'evidence traceability. All findings are grounded in specific lines of code, configuration values, or '
    'documentation statements from the provided codebase bundle.',
    sMuted
))

# ━━ Build ━━
doc.build(story)
print(f'PDF generated: {OUTPUT}')
