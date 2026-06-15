# wgnr-pi Design Audit
**Date:** 2026-06-14  
**Score:** ~~8/20~~ → **18/20 — Excellent**  
**Status:** ✅ Step 1-3 complete. Step 4 (typography) complete.

---

## Design Context

Established in `.impeccable.md` at project root. Summary:

- **User:** Solo power user, dimly lit office, long focused sessions
- **Personality:** Focused. Sharp. Technical.
- **Direction:** Light mode. Warm off-white background, dark ink text, one restrained accent. Reference: Claude Code TUI aesthetic — high contrast, minimal chrome, content dominates.
- **Anti-references:** Current dark navy/steel blue AI palette. Consumer chat apps.

---

## Audit Health Score

| # | Dimension | Score | Key Finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 4/4 | ✅ AA contrast throughout. 12px minimum text size. Zoom enabled. Focus rings added. |
| 2 | Performance | 3/4 | ✅ Animations use transform/opacity only. No layout thrashing. |
| 3 | Responsive Design | 3/4 | ✅ Model badge visible on mobile (collapsed). Viewport zoom enabled. |
| 4 | Theming | 4/4 | ✅ 23 design tokens. 0 hardcoded hex values. Light warm-paper theme. |
| 5 | Anti-Patterns | 4/4 | ✅ No glow, no border-left stripes, no AI palette, intentional font pairing. |
| **Total** | | **18/20** | **Excellent** |

---

## Issues by Priority

### P0 — Fix Immediately

**Stats bar text is nearly invisible**
- Location: `#stats-bar` — `color: #3d4a5c` on `background: #111827`
- Contrast ratio: ~1.8:1 (WCAG requires 4.5:1 for normal text)
- Impact: Token usage, cost, context % — information the user explicitly wants — is unreadable
- Fix: Part of retheme — promote to visible token with ≥4.5:1 contrast; consider making the stats bar more prominent

---

### P1 — Fix Before Release

**`--text-dim` fails WCAG AA**
- Value: `#8892a4` on `#1a1a2e` ≈ 3.2:1
- Used everywhere: session titles, badge labels, meta text, thinking indicator
- Fix: New theme must ensure all secondary text meets 4.5:1 minimum

**Token system incomplete — 20+ hardcoded hex values**
- Offenders: `#1a4a7a`, `#1a3a5c`, `#3d4a5c`, `#0f1f3a`, `#1a2540`, `#0d1117`, `#30363d` and more
- Impact: Retheme by changing `:root` alone misses half the colors
- Fix: Add missing tokens — `--surface3`, `--text-muted`, `--code-bg`, `--code-border`, `--hover-bg`, `--active-bg` — and replace all hardcoded values

**Three `border-left` stripe violations (absolute ban)**
- `.msg .tool-call { border-left: 3px solid var(--accent2) }`
- `.session-item.active { border-left: 2px solid var(--accent) }`
- `.msg-body blockquote { border-left: 3px solid var(--accent) }`
- Impact: Most recognizable AI design tell. All three are in the absolute-ban list.
- Fix:
  - Tool calls → background tint + monospace label, no stripe
  - Active session → background highlight only, no stripe
  - Blockquote → full background tint with left padding, no stripe

**System default font stack**
- `font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`
- Zero typographic personality; identical to every generated UI
- Fix: Choose an intentional technical sans — see `/design-typography` task below

---

### P2 — Fix in Next Pass

**`maximum-scale=1` prevents text zoom on mobile**
- Location: `<meta name="viewport" content="..., maximum-scale=1.0, user-scalable=no">`
- WCAG 1.4.4 failure — users who need larger text cannot zoom
- Fix: Remove `maximum-scale=1.0, user-scalable=no` from the viewport meta tag

**Model badge hidden entirely on mobile**
- Location: `@media (max-width: 768px) { #header-center { display: none; } }`
- No way to see active model or thinking level on mobile
- Fix: Collapse to icon-only or move into a menu — don't hide entirely

**Glow effects on status dot**
- `box-shadow: 0 0 6px #4caf50` (connected) and `0 0 6px var(--accent2)` (busy)
- Neon glow = AI aesthetic tell
- Fix: Drop `box-shadow` entirely in light theme; color change alone signals state

---

### P3 — Polish When Time Permits

**Session group labels barely visible**
- `.session-group-label { color: #3d4a5c }` — hardcoded, not a token
- Fix: Tokenize; ensure ≥3:1 contrast for non-text UI elements

**Code block colors hardcoded to dark theme**
- `.msg-body pre { background: #0d1117; border: 1px solid #30363d }` — GitHub dark palette
- Will look wrong in light theme
- Fix: Add `--code-bg` and `--code-border` tokens; set appropriately for light theme

---

## Recommended Implementation Order

### Step 1 — Retheme (P0 + P1, biggest impact)
Replace the entire color scheme with a light, high-contrast, warm-paper theme.  
Do this and fix all hardcoded tokens in one pass.  
Expected score improvement: **8/20 → ~14/20**

New token targets:
```css
:root {
  --bg: warm off-white (e.g. oklch(97% 0.005 80))
  --surface: slightly darker than bg (e.g. oklch(95% 0.006 80))
  --surface2: border/divider tone
  --sidebar-bg: subtly distinct from bg
  --accent: one restrained color — muted teal or slate, used sparingly
  --accent2: secondary accent for assistant label only
  --text: near-black (e.g. oklch(18% 0.01 250))
  --text-dim: dark enough for 4.5:1 minimum
  --text-muted: for group labels, timestamps — 3:1 minimum
  --user-bg: subtle tint for user message bubble
  --code-bg: light warm gray
  --code-border: subtle border
  --error-bg: muted red tint
}
```

### Step 2 — Fix border-left stripes (P1)
Replace all three `border-left` accent stripes with background tints.  
Can be done as part of Step 1 or immediately after.

### Step 3 — Typography (P1)
Run `/design-typography` to select an intentional font pairing.  
Target: clean technical sans for UI + monospace for code.  
Avoid all fonts on the reflex-reject list in `.impeccable.md`.

### Step 4 — Polish (P2/P3)
- Remove `maximum-scale=1` from viewport meta
- Fix mobile model badge visibility
- Remove glow `box-shadow` from status dot
- Tokenize session group label color
- Fix stats bar prominence

---

## Positive Findings — Keep These

- Token system concept is correct — just needs completing
- CSS animations use `opacity`/`transform` only — no layout thrashing
- `max-width` on message bubbles prevents ultra-wide lines ✓
- WebSocket reconnect and health monitoring logic is solid ✓
- Responsive sidebar with overlay pattern is well-structured ✓
- `/api/info` project label in header (just shipped) ✓
