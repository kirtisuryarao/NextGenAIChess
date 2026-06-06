# AI Chess Classroom - UI/UX Design System

## 1. DESIGN PHILOSOPHY

### Core Principles

**1. Clarity**
- Every interface element should have a clear purpose
- Remove visual clutter and unnecessary elements
- Use whitespace strategically
- Consistent labeling and icons

**2. Feedback**
- Immediate visual response to every action
- Color-coded status (green=success, red=error, yellow=warning)
- Animation shows state transitions
- Sound effects complement major actions

**3. Accessibility**
- High contrast ratios (WCAG AA minimum)
- Large touch targets (48px minimum)
- Keyboard navigation support
- Screen reader friendly semantic HTML
- No color-only information (always add text/icon)

**4. Performance**
- Snappy interactions (< 200ms response time)
- Smooth animations (60fps)
- Progressive loading (show board first, then panels)
- Minimal redraws and calculations

**5. Inclusivity**
- Adjustable text size
- Optional voice narration
- Colorblind-friendly palette
- Multiple learning modalities (visual, auditory, kinesthetic)

---

## 2. SCREEN LAYOUTS

### A. Main Classroom View (Desktop)

```
HEIGHT: 100vh | WIDTH: 100vw

┌─────────────────────────────────────────────────────────────┐
│ TOPBAR (64px height)                                         │
│ [Logo] [Lesson Title: Day 1 - Board Coordinates] [Settings] │
├──────────────────────────┬────────────────────┬──────────────┤
│                          │                    │              │
│  LEFT PANEL (20%)        │  CENTER (60%)      │ RIGHT (20%)  │
│                          │                    │              │
│ ┌──────────────────────┐ │ ┌────────────────┐ │ ┌──────────┐ │
│ │ [Coco Avatar]        │ │ │                │ │ │   Chat   │ │
│ │ (large, center)      │ │ │    ╔════════╗  │ │ │   Feed   │ │
│ │                      │ │ │    ║ BOARD  ║  │ │ │          │ │
│ │ Dialogue Box:        │ │ │    ║ ████   ║  │ │ │ • Coco:  │ │
│ │ "Click square A1"    │ │ │    ║ ████   ║  │ │ │   "Well  │ │
│ │                      │ │ │    ╚════════╝  │ │ │   done!" │ │
│ │ [Speaker Toggle]     │ │ │                │ │ │          │ │
│ │  🔊 (blue if on)     │ │ │ Coordinates    │ │ │ • Vihaan:│ │
│ │                      │ │ │ Visible (a-h,  │ │ │  "Clicked│ │
│ │ Status: Listening 🎧 │ │ │  1-8)          │ │ │   A1"    │ │
│ │                      │ │ │                │ │ │          │ │
│ └──────────────────────┘ │ └────────────────┘ │ │ ┌────────┐│
│                          │                    │ │ │ Tabs:  ││
│                          │                    │ │ │ [Chat] ││
│                          │                    │ │ │ Parts  ││
│                          │                    │ │ │ Moves  ││
│                          │                    │ │ │ Board  ││
│                          │                    │ │ └────────┘│
│                          │                    │              │
└──────────────────────────┴────────────────────┴──────────────┘
```

**Panel Heights:**
- TopBar: 64px
- Content Area: calc(100vh - 64px)
- Gutters: 12px between panels

### B. Focus Mode Layout (Expanded Board)

```
┌─────────────────────────────────────────────────────────────┐
│ TOPBAR (48px - collapsed)                                    │
├─────┬─────────────────────────────────────────────┬──────────┤
│     │                                             │          │
│ LT  │           CENTER (85%)                      │  Right   │
│(8%) │                                             │ (12%)    │
│     │ ┌─────────────────────────────────────────┐ │          │
│ [C] │ │                                         │ │ [MCQ or] │
│ [o] │ │           ╔════════════════╗           │ │ [Text]   │
│ [c] │ │           ║ BIG BOARD      ║           │ │ [Input]  │
│ [o] │ │           ║                ║           │ │          │
│ [A] │ │           ║  (Full aspect)  ║           │ │ Submit▶  │
│     │ │           ║                ║           │ │          │
│     │ │           ╚════════════════╝           │ │          │
│     │ │                                         │ │          │
│     │ └─────────────────────────────────────────┘ │          │
│     │                                             │          │
│     │                                             │          │
└─────┴─────────────────────────────────────────────┴──────────┘

Transition: 400ms (smooth expand animation)
Board scales from 60% → 85% width
Left panel collapses: 20% → 8%
Right panel narrows: 20% → 12%
```

### C. Tablet View (768px - 1199px)

```
┌───────────────────────────────────────────────────┐
│ TOPBAR (56px)                                      │
├───────────────────────────────────────────────────┤
│                                                    │
│  CENTER (70%, full height)                         │
│  ┌─────────────────────────────────────────────┐  │
│  │                                             │  │
│  │     ╔════════════════╗                      │  │
│  │     ║ BOARD          ║                      │  │
│  │     ║ (responsive)   ║                      │  │
│  │     ╚════════════════╝                      │  │
│  │                                             │  │
│  └─────────────────────────────────────────────┘  │
│                                                    │
│  RIGHT (30%, scrollable panels)                    │
│  ┌──────────────────────┐                         │
│  │ [Chat] Parts Moves  │                         │
│  │─────────────────────┤                         │
│  │ • Coco: "Well done" │                         │
│  │ • Vihaan: Clicked A │                         │
│  │ • Scroll...         │                         │
│  └──────────────────────┘                         │
│                                                    │
└───────────────────────────────────────────────────┘

Left panel (Tutor) hidden, moved to popup or overlay
```

### D. Mobile View (< 768px)

```
┌─────────────────────────────┐
│ TOPBAR (48px)               │
│ [☰ Menu] Lesson [⚙]         │
├─────────────────────────────┤
│                             │
│  BOARD (100% width)         │
│  ┌─────────────────────────┐│
│  │  ╔═════════════════╗   ││
│  │  ║ BOARD           ║   ││
│  │  ║ (square)        ║   ││
│  │  ╚═════════════════╝   ││
│  └─────────────────────────┘│
│                             │
│ [Tutor Dialogue - Expandable]
│ ┌─────────────────────────┐ │
│ │ "Click square A1" ▼     │ │
│ └─────────────────────────┘ │
│                             │
│ [Chat Feed - Scrollable]    │
│ ┌─────────────────────────┐ │
│ │ • Coco: "Well done!"   │ │
│ │ • Vihaan: Clicked A1   │ │
│ │ ...                     │ │
│ └─────────────────────────┘ │
│                             │
│ [MCQ / Input - Bottom]      │
│ ┌─────────────────────────┐ │
│ │ (A) Option 1            │ │
│ │ (B) Option 2  [SUBMIT]  │ │
│ └─────────────────────────┘ │
│                             │
└─────────────────────────────┘

Stacked vertical layout
Full-width interactive elements
Tap targets > 44px
```

---

## 3. COMPONENT SPECIFICATIONS

### A. Chess Board

```
SPECIFICATIONS:
- Aspect Ratio: 1:1 (square)
- Min Size: 300px × 300px
- Max Size: 600px × 600px (desktop)
- Responsive scaling in containers
- Pieces: Unicode chess symbols (♔♕♖♗♘♙)
- Colors: Light #ebecd0, Dark #779556

INTERACTIVE OVERLAYS:
┌──────────────────────────┐
│ Highlighted Squares:     │
│ ✓ Green pulse (target)   │
│ ✓ Blue pulse (selected)  │
│ ✓ Yellow pulse (last move)
│ ✓ Red pulse (check)      │
│                          │
│ Arrows:                  │
│ ✓ Green arrow (hint)     │
│ ✓ Yellow arrow (option)  │
│ ✓ Red arrow (threat)     │
└──────────────────────────┘

ANIMATIONS:
- Piece movement: 200ms easeInOut
- Square highlight: 400ms infinite pulse
- Check animation: 600ms red glow
```

### B. Tutor Avatar (Coco)

```
SPECIFICATIONS:
- Size: 160px × 160px (default)
- Style: Animated character (SVG or image)
- Position: Center of left panel
- Background: Subtle gradient backdrop

STATES:
┌────────────────────────────────┐
│ Idle: Still, neutral expression │
│ Speaking: Mouth moves, animated │
│ Thinking: Eyes look up, pulse   │
│ Celebrating: Jumps, confetti ✨ │
│ Concerned: Sad face, slower     │
└────────────────────────────────┘

ANIMATIONS:
- Mouth sync: Realtime during speech
- Idle bounce: 3s infinite ease-in-out
- Success jump: 600ms elastic
- Failure shake: 400ms ease-out
```

### C. Dialogue Box

```
LAYOUT:
┌──────────────────────────────────┐
│ Speaker Label (12px, muted gray) │
│ ──────────────────────────────   │
│ Message text (14px, white)       │
│ Wraps naturally, max 40 chars    │
│ ──────────────────────────────   │
│ [Speaker Icon] [Repeat Button]   │
└──────────────────────────────────┘

STYLES:
- Background: rgba(52, 73, 94, 0.8)
- Border: 1px solid rgba(100, 200, 100, 0.3)
- Border Radius: 8px
- Padding: 16px
- Font Size: 14px
- Line Height: 1.6
- Max Width: 100% of panel
- Animation: Fade in 300ms

INTERACTIONS:
- Hover: Slight brightness increase
- Click [Repeat]: Replay audio
- Auto-advance: Fade out after 3s (or manual nextStep)
```

### D. Student Interaction Tray (MCQ/Text Input)

```
LAYOUT (in Right Panel):

Multiple Choice Mode:
┌─────────────────────────────┐
│ Question: "What was that?"  │
├─────────────────────────────┤
│ ( ) Option 1                │
│ ( ) Option 2                │
│ ( ) Option 3                │
│ ( ) Option 4                │
├─────────────────────────────┤
│        [SUBMIT]             │
└─────────────────────────────┘

Text Response Mode:
┌─────────────────────────────┐
│ Question: "Your answer?"    │
├─────────────────────────────┤
│ [Text input box...........]│
│ (Optional hint below)       │
├─────────────────────────────┤
│        [SUBMIT]             │
└─────────────────────────────┘

STYLES:
- Options: Radio buttons, 44px tall each
- Hover: Light background color
- Selected: Green border, checked indicator
- Submit: Green button, 48px height, bold text
- Disabled: Gray, 50% opacity until interaction valid
- Focus: Blue outline, keyboard accessible

ANIMATIONS:
- Option hover: 200ms background fade
- Submit click: 100ms scale(0.95) feedback
- Success: Green flash + next step
- Failure: Red flash + shake animation
```

### E. Transcript Chat Feed

```
LAYOUT:
┌──────────────────────────────────┐
│ AI Classroom Feed                │
├──────────────────────────────────┤
│ [Auto-scrolling content area]    │
│                                  │
│ • Coco: "Let's begin" [6:45 PM] │
│ ✓ Vihaan: "Clicked A1" [6:46]  │
│ ✓ Coco: "Correct!" [6:46 PM]   │
│ ⚠ Hint: "Try again" [6:46 PM]  │
│ ✗ Vihaan: "Clicked B2" [6:47]  │
│ ...                              │
│                                  │
└──────────────────────────────────┘

COLORS:
- Student message: White bg, left align
- Tutor message: Green bg, right align (success)
- Error message: Red bg (failure)
- Hint message: Yellow bg (system)
- Timestamp: Small gray, 10px

STYLES:
- Font: 12px regular
- Padding: 8px per message
- Border Radius: 4px
- Emoji icons: ✓ ✗ ⚠ 
- Auto-scroll: On new message
- Max Height: Container height, scrollable
```

### F. Leaderboard

```
LAYOUT:
┌────────────────────────────┐
│ 🏆 Leaderboard             │
├────────────────────────────┤
│ 1. 👑 Emma       12 pts ⭐⭐ │
│ 2.    Arun       10 pts ⭐  │
│ 3.    Zara        8 pts     │
│ 4.    Kai         6 pts     │
│ 5.    Priya       4 pts     │
│                            │
│ [View All ▼]               │
└────────────────────────────┘

STYLES:
- Rank: Bold number, left-aligned
- Name: Avatar + name
- Points: Right-aligned, larger font
- Top 3: Gold/silver/bronze badge
- Badges: ⭐ (accuracy), 🔥 (streak)
- Hover: Slight highlight

ANIMATION:
- Rank change: Smooth slide animation
- New points: Brief "+2" popup animation
- Real-time updates: Fade in/out
```

### G. Participant Panel

```
LAYOUT:
┌──────────────────────────┐
│ 👥 Participants (5)      │
├──────────────────────────┤
│ 🟢 Emma (hand raised)    │
│ 🔴 Arun (muted)          │
│ 🟢 Zara (active)         │
│ 🟡 Kai (away)            │
│ 🔴 Priya (camera off)    │
│                          │
│ [Sort: Active ▼]         │
└──────────────────────────┘

STATUS INDICATORS:
- 🟢 Green: Active, participating
- 🟡 Yellow: Away, inactive
- 🔴 Red: Disconnected/muted
- ✋ Hand icon: Raised hand
- 🎙️ Mic off: Muted
- 📹 Camera off: No video

STYLES:
- Avatar: 32px circle, colored
- Name: 12px, light text
- Status: Icon + color dot
- Hover: Slight highlight
```

---

## 4. COLOR PALETTE & USAGE

### Primary Colors

```
Success Green:    #22c55e
  Usage: Correct answers, positive feedback, confirmed actions
  RGB: (34, 197, 94)
  Hover: #16a34a (darker)
  Light: #dcfce7 (light bg)

Error Red:        #ef4444
  Usage: Wrong answers, errors, failures, danger
  RGB: (239, 68, 68)
  Hover: #dc2626 (darker)
  Light: #fee2e2 (light bg)

Warning Amber:    #fcd34d
  Usage: Hints, warnings, pending actions
  RGB: (252, 211, 77)
  Hover: #f59e0b (darker)
  Light: #fefce8 (light bg)

Info Blue:        #3b82f6
  Usage: General information, selected state, highlights
  RGB: (59, 130, 246)
  Hover: #2563eb (darker)
  Light: #eff6ff (light bg)
```

### Background Colors

```
Dark Slate (primary):      #1e293b
Dark Slate (lighter):      #334155
Dark Slate (border):       #475569
Text (primary):            #f1f5f9
Text (secondary):          #cbd5e1
Text (muted):              #94a3b8
Text (dim):                #64748b
```

### Chess Board Colors

```
Light Square: #ebecd0 (cream)
Dark Square:  #779556 (sage green)

Highlight Tints:
- Green overlay: rgba(34, 197, 94, 0.22)
- Blue overlay: rgba(59, 130, 246, 0.20)
- Yellow overlay: rgba(251, 191, 36, 0.12)
- Red overlay: rgba(239, 68, 68, 0.18)
```

### Usage Matrix

```
┌─────────────────┬──────────┬──────────┬────────┬─────────┐
│ Component       │ Primary  │ Hover    │ Active │ Disabled│
├─────────────────┼──────────┼──────────┼────────┼─────────┤
│ Button (Action) │ Green    │ Darker   │ Scale  │ Gray    │
│ Button (Submit) │ Green    │ Darker   │ Scale  │ Gray    │
│ MCQ Option      │ Border   │ Light    │ Green  │ Gray    │
│ Error Message   │ Red      │ Red      │ N/A    │ N/A     │
│ Success Message │ Green    │ Green    │ N/A    │ N/A     │
│ Link            │ Blue     │ Lighter  │ Blue   │ Gray    │
│ Card Border     │ Subtle   │ Bright   │ Blue   │ Dim     │
└─────────────────┴──────────┴──────────┴────────┴─────────┘
```

---

## 5. TYPOGRAPHY

### Font Stack

```
system-ui, 
-apple-system, 
"Segoe UI", 
Roboto, 
"Helvetica Neue", 
Arial, 
sans-serif
```

### Type Scale

```
Display:  28px bold     (section headers)
H1:       24px semibold (page titles)
H2:       20px semibold (panel titles)
H3:       16px semibold (subsection headers)
Body:     14px regular  (main content)
Small:    12px regular  (secondary info)
Tiny:     10px regular  (metadata, timestamps)

Line Heights:
- Headers: 1.2 (tight)
- Body: 1.5 (comfortable)
- Labels: 1.4 (snug)

Letter Spacing:
- Headers: -0.01em (tight)
- Body: 0 (default)
- Labels: 0.05em (loose)
```

### Font Weights

```
400 (Regular)   - Body text, descriptions
500 (Medium)    - Button labels, smaller headings
600 (Semibold)  - Headings, emphasis
700 (Bold)      - Major headings, important labels
800 (ExtraBold) - Display text only
```

---

## 6. SPACING SYSTEM

### Base Unit: 4px

```
Spacing Scale:
0   = 0px
1   = 4px    (minimal)
2   = 8px    (small gap)
3   = 12px   (standard)
4   = 16px   (medium)
5   = 20px   (larger)
6   = 24px   (big gap)
8   = 32px   (large block)
12  = 48px   (xl gap)
16  = 64px   (section separator)

USAGE EXAMPLES:
- Component padding: 16px (4)
- Internal spacing: 12px (3)
- Section gap: 24px (6)
- Panel gap: 12px (3)
- Button padding: 12px 24px (3-6)
```

### Border Radius

```
Subtle:  4px    (minor elements)
Normal:  8px    (buttons, cards, panels)
Large:   12px   (board, containers)
Full:    9999px (circular - avatars)
```

---

## 7. ANIMATIONS & TRANSITIONS

### Timing Functions

```
ease-out:      cubic-bezier(0, 0, 0.2, 1)  - Snappy, direct
ease-in-out:   cubic-bezier(0.4, 0, 0.2, 1) - Smooth, balanced
ease-in:       cubic-bezier(0.4, 0, 1, 1)   - Acceleration
elastic:       custom spring motion         - Bouncy, playful
```

### Standard Durations

```
Fast:    100ms   (feedback, micro-interactions)
Medium:  200ms   (UI transitions, piece moves)
Slow:    300ms   (panel expansions, large changes)
XSlow:   400ms   (focus mode toggle, major layout shift)
```

### Animation Library: Framer Motion

```tsx
// Scale feedback on click
<motion.button
  whileTap={{ scale: 0.95 }}
  transition={{ duration: 0.1 }}
>

// Smooth panel expansion
<motion.div
  initial={{ width: "20%" }}
  animate={{ width: "85%" }}
  transition={{ duration: 0.4, ease: "easeInOut" }}
>

// Pulsing highlight
<motion.div
  animate={{ opacity: [1, 0.6, 1] }}
  transition={{ duration: 1, repeat: Infinity }}
>

// Slide in from side
<motion.div
  initial={{ x: -100, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  transition={{ duration: 0.3 }}
>
```

### Specific Animations

```
Square Highlight:
- Pulse effect: 1s infinite
- Glow shadow: spread, color-based

Piece Move:
- Duration: 200ms
- Easing: easeInOut
- Arc path (optional)

Button Click:
- Scale: 0.95
- Duration: 100ms
- Return: 200ms elastic

Success Feedback:
- Green flash: 600ms
- Checkmark icon: 400ms scale
- Confetti: 1s (if boss challenge)

Failure Shake:
- X-axis oscillation: ±8px
- Duration: 400ms
- Frequency: 3 cycles

Page Transition:
- Fade: 300ms
- Slide: Depends on direction
```

---

## 8. INTERACTION PATTERNS

### Button States

```
DEFAULT (Idle):
- Background: Color
- Text: White
- Cursor: pointer
- Shadow: subtle

HOVER:
- Background: Darker shade
- Text: White
- Shadow: More pronounced
- Scale: Slight increase (103%)

ACTIVE / PRESSED:
- Scale: 95%
- Shadow: Inset
- Opacity: Slightly reduced

DISABLED:
- Background: Gray
- Text: Darker gray
- Cursor: not-allowed
- Opacity: 50%

LOADING:
- Spinner icon
- Text: "Loading..."
- Disabled state
```

### Card/Panel Interaction

```
HOVER:
- Background: Slight brightness increase
- Border: Color brightens
- Shadow: More pronounced
- Scale: Imperceptible (1.01x)

FOCUS (Keyboard):
- Blue outline: 2px
- Ring offset: 4px

SELECTED:
- Border: 2px solid color
- Background: Light tint
```

### Form Input Interaction

```
DEFAULT:
- Border: Subtle gray
- Background: Dark slate
- Text: Light gray

FOCUS:
- Border: Blue, 2px
- Shadow: Blue glow
- Cursor: text

VALID:
- Border: Green, 1px
- Checkmark icon
- No error message

INVALID:
- Border: Red, 2px
- Error icon
- Error message below
```

---

## 9. ACCESSIBILITY GUIDELINES

### Keyboard Navigation

```
TAB:      Move focus to next interactive element
SHIFT+TAB: Move focus to previous element
ENTER:    Activate focused button/link
SPACE:    Toggle checkbox/radio
ESCAPE:   Close modal/popup
ARROW:    Navigate within list/tabs
```

### ARIA Labels & Roles

```html
<!-- Button with icon -->
<button aria-label="Repeat audio">🔊</button>

<!-- Interactive region -->
<section aria-label="Chess board" role="region">

<!-- Status message -->
<div aria-live="polite" aria-atomic="true">
  Correct! Great work.
</div>

<!-- Multi-choice options -->
<div role="radiogroup">
  <div role="radio" aria-checked="false">Option 1</div>
  <div role="radio" aria-checked="true">Option 2</div>
</div>
```

### Color Contrast

```
Minimum Ratios (WCAG AA):
- Normal text: 4.5:1
- Large text: 3:1
- UI components: 3:1

Examples:
✓ White (#f1f5f9) on Dark (#1e293b): 14.3:1
✓ Green (#22c55e) on Dark (#1e293b): 4.8:1
✓ Amber (#fcd34d) on Dark (#1e293b): 4.2:1
```

### Screen Reader Testing

```
- Semantic HTML (headings, lists, etc.)
- Descriptive link text (not "click here")
- Alt text for images
- Form labels explicitly associated
- Status messages announced
- Focus management clear
```

---

## 10. RESPONSIVE DESIGN

### Breakpoints

```
MOBILE:      0px - 479px
TABLET:      480px - 1023px
DESKTOP:     1024px - 1439px
WIDE:        1440px+

GRID SYSTEM:
Mobile:  1 column (full width)
Tablet:  2 columns (50% each)
Desktop: 3 columns (20%, 60%, 20%)
Wide:    4 columns (flexible)
```

### Adjustments per Breakpoint

```
MOBILE (< 480px):
- Stacked layout
- Full-width elements
- 44px touch targets
- Font sizes +1 step (readability)
- No sidebars
- Bottom panel for interactions

TABLET (480px - 1023px):
- 2-panel layout (board + chat)
- Tutor panel hidden/overlay
- Portrait-friendly spacing
- Medium touch targets
- Smaller fonts (body: 13px)

DESKTOP (1024px+):
- Full 3-panel layout
- All panels visible
- Optimized spacing
- Standard font sizes
- Hover effects enabled
```

---

## 11. DARK MODE (CURRENT DEFAULT)

All colors specified above are for dark mode.

**Light Mode** (future):
- Invert backgrounds (light → dark, dark → light)
- Adjust text colors for contrast
- Same hue family, different values
- Preserve accent colors (green, red, amber, blue)

**Implementation:**
```tsx
// Use CSS variables for theming
:root {
  --bg-primary: #1e293b;
  --bg-secondary: #334155;
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
}

[data-theme="light"] {
  --bg-primary: #f8fafc;
  --bg-secondary: #f1f5f9;
  --text-primary: #1e293b;
  --text-secondary: #475569;
}
```

---

## 12. COMPONENT LIBRARY STATUS

### Implemented Components

- ✅ ChessBoard (interactive, responsive)
- ✅ Tutor Avatar (basic SVG)
- ✅ Dialogue Box (animated text)
- ✅ StudentInteractionTray (MCQ, text input)
- ✅ Leaderboard (real-time updates)
- ✅ CollaborationPanel (transcript chat)
- ✅ TopBar (navigation, settings)
- ✅ LeftPanel (tutor interface)
- ✅ RightPanel (collaboration)
- ✅ MainWorkspace (layout container)

### To-Do Components

- ⏳ Focus Mode animations (in progress)
- ⏳ Particle effects (confetti on win)
- ⏳ Sound effects integration
- ⏳ Toast notifications
- ⏳ Modal dialogs
- ⏳ Dropdown menus
- ⏳ Progress bar
- ⏳ Skeleton loaders

---

## 13. BRAND VOICE & TONE

### Tutor Personality (Coco)

**Tone:**
- Encouraging and positive
- Patient and supportive
- Enthusiastic about learning
- Age-appropriate (friendly to kids, not patronizing)

**Example Messages:**
```
✓ "Excellent! That is correct. D4 is in the D file, 4th rank."
✗ "Almost! Try again. Remember, D4 is in the middle of the board."
⏱ "No worries. Take your time. The board is waiting for you."
⭐ "Beautiful work! You've mastered board coordinates!"
```

### Vocabulary Level

**For Ages 6-12:**
- Short sentences (< 15 words)
- Common words
- Avoid jargon
- Repeat key terms

**For Ages 13+:**
- Standard sentences (< 20 words)
- Chess terminology
- More detailed explanations
- Assume prior knowledge

---

## 14. DESIGN CHECKLIST

Before launching any feature, verify:

- [ ] Meets accessibility guidelines (WCAG AA)
- [ ] Touch targets ≥ 44px (mobile) or 48px (desktop)
- [ ] Color contrast ≥ 4.5:1 (normal text)
- [ ] Animations < 300ms for feedback, < 500ms for transitions
- [ ] Responsive on mobile, tablet, desktop
- [ ] Keyboard navigable
- [ ] Screen reader tested
- [ ] Error states clearly indicated
- [ ] Loading states shown
- [ ] Success feedback visible (animation + message)
- [ ] Consistent with design system
- [ ] No text-only color information
- [ ] High-DPI display tested (Retina)

---

**Version**: 1.0  
**Last Updated**: June 6, 2026  
**Maintained By**: Design System Team
