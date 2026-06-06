# Architecture Audit - Quick Reference & Action Plan

## Quick Health Check

| System | Score | Status | Primary Issue |
|--------|-------|--------|---|
| **Classroom Model** | 60% | 1 AI ↔ 1 Student (mock multiplayer UI) | No real participants |
| **Lesson Control** | 40% | Fully AI-controlled, linear | No pause/resume, teacher intervention |
| **Lesson Engine** | 55% | Timeline-based, JSON-defined | No branching, no templating |
| **State Management** | 45% | Single Zustand store, 20+ pieces | Duplicated state, poor scalability |
| **Board Architecture** | 70% | Well-separated, good design | Move validation doesn't sync with board state |
| **Transcript System** | 50% | Simple append-only array | No participant roles, no voice metadata |
| **Interaction Validation** | 55% | Centralized, type-specific | Nonce-based feedback, no UI for text/choice |
| **Participant System** | 15% | Mock only | No real auth, no lifecycle, no real-time |
| **Voice + Lip-Sync** | 0% | Not implemented | No TTS, STT, audio sync, lip-sync |
| **UI/UX Architecture** | 65% | Good components, modern design | No theme system, poor accessibility, not responsive |
| **File Structure** | 50% | Feature-based in components | Dual lesson-engine folders, mixed concerns |
| **MVP Readiness** | 65% | Mostly there | Needs polish, error handling, removal of non-essentials |

---

## Critical Blockers (Must fix before production)

### 🔴 1. Hardcoded Lesson Data
**Current**: 2 JSON files hardcoded, duplicate data in TypeScript  
**Fix**: Single source of truth in `/data/lessons/`, remove TypeScript duplicates  
**Effort**: 4 hours  
**Blocker**: Can't scale to 100+ lessons  

### 🔴 2. No Real Database
**Current**: All state in React (localStorage only)  
**Fix**: Add backend + PostgreSQL  
**Effort**: 40 hours  
**Blocker**: Can't persist across sessions, multiplayer impossible  

### 🔴 3. Mock Socket Layer
**Current**: Random events, no real communication  
**Fix**: Implement real WebSocket  
**Effort**: 30 hours  
**Blocker**: Can't support real classrooms  

### 🔴 4. Validation Feedback Anti-Pattern
**Current**: Uses `Date.now()` as nonce for re-renders  
**Fix**: Use proper event ID tracking  
**Effort**: 6 hours  
**Blocker**: Can cause timing bugs with fast interactions  

---

## Phase-Based Implementation Roadmap

### Phase 1: MVP Polish (2 weeks) 🎯 DO THIS FIRST

**Goal**: Single lesson, polished, error-handled

**Tasks**:
- [ ] Remove sidebar, leaderboard, activity feed (they're premature)
- [ ] Add error boundary component
- [ ] Add lesson completion screen
- [ ] Add loading states
- [ ] Consolidate lesson data (remove coordinateLesson.ts duplicate)
- [ ] Test day1 lesson end-to-end
- [ ] Add localStorage persistence
- [ ] Create simple lesson browser UI

**Effort**: 80 hours  
**Outcome**: Playable MVP

---

### Phase 2: Single-Player Maturity (2 weeks)

**Goal**: Multiple lessons, robust interactions

**Tasks**:
- [ ] Implement multiple-choice UI component
- [ ] Implement text-input UI component
- [ ] Add attempt tracking system
- [ ] Create 2nd polished lesson
- [ ] Refactor store (batch setters, remove duplication)
- [ ] Build lesson selection dashboard
- [ ] Add basic analytics events

**Effort**: 60 hours  
**Outcome**: 2-3 complete lessons

---

### Phase 3: Realtime Foundation (4 weeks) 🔴 CRITICAL PATH

**Goal**: Replace mocks with real backend

**Tasks**:
- [ ] Setup backend (Next.js API or separate server)
- [ ] Setup database (PostgreSQL)
- [ ] Implement WebSocket/Socket.io
- [ ] Implement JWT authentication
- [ ] Create classroom session model
- [ ] Persist lesson progress to DB
- [ ] Setup error tracking (Sentry)
- [ ] Replace mockClassroomSocket

**Effort**: 120 hours  
**Outcome**: Real multiplayer classroom (1 teacher, 1 student)

---

### Phase 4: Voice Integration (4 weeks)

**Goal**: Add TTS + lip-sync magic

**Tasks**:
- [ ] Choose TTS provider (Google Cloud recommended)
- [ ] Implement TTS service
- [ ] Add audio timing to lesson store
- [ ] Build audio playback component
- [ ] Find/create avatar 3D model
- [ ] Implement lip-sync from phonemes
- [ ] Add STT integration
- [ ] Sync lesson progression with audio

**Effort**: 120 hours  
**Outcome**: Fully voiced AI tutor

---

### Phase 5: Multi-Student (4 weeks)

**Goal**: Support small groups

**Tasks**:
- [ ] Extend participant system for multiple students
- [ ] Implement active speaker detection
- [ ] Build hand-raise queue
- [ ] Add classroom control panel for teacher
- [ ] Build real participant tracking
- [ ] Add teacher dashboard
- [ ] Load test to 50 concurrent users

**Effort**: 100 hours  
**Outcome**: Small group classroom

---

### Phase 6: Lesson Management (4 weeks)

**Goal**: Move lessons to database, add editor

**Tasks**:
- [ ] Create lesson admin panel
- [ ] Build lesson editor UI
- [ ] Implement lesson versioning
- [ ] Add branching/conditionals support
- [ ] Create template system
- [ ] Author 10-15 chess lessons
- [ ] Setup A/B testing framework

**Effort**: 100 hours  
**Outcome**: Lesson library + editor

---

---

## Store Refactoring Plan

### Current Problem
```typescript
type LessonState = {
  currentLesson: Lesson | null;
  currentStepIndex: number;
  currentStep: LessonStep | null;  // ← Derived, should not exist
  isLessonCompleted: boolean;  // ← Derived
  highlightedSquares: string[];
  activeArrows: NonNullable<LessonStep["arrows"]>;
  overlayMessage: string | null;
  teacherStatus: TeacherStatus;
  currentDialogue: string | null;
  isTyping: boolean;
  currentSpeaker: string;
  transcriptMessages: TranscriptMessage[];
  isLessonRunning: boolean;  // ← Derived
  isWaitingForInteraction: boolean;
  expectedInteraction: ExpectedInteraction | null;
  currentInteractionType: LessonInteractionType | null;  // ← Derived
  lastValidationResult: ValidationResult;
  validationFeedback: { squares: string[]; status: "success" | "failure"; nonce: number } | null;
  timelineQueue: LessonStep[];  // ← Unused
  currentTimelineStep: LessonStep | null;  // ← Same as currentStep
  
  // 20+ setter methods
  loadLesson: (lesson: Lesson) => void;
  setOverlayMessage: (message: string | null) => void;
  setTeacherStatus: (status: TeacherStatus) => void;
  // ... many more single-property setters
};
```

### Proposed Structure
```typescript
interface LessonSessionState {
  // ═══ Lesson Definition ═══
  lesson: Lesson | null;
  
  // ═══ Execution (primary state only) ═══
  currentStepIndex: number;
  phase: "loading" | "running" | "waiting" | "paused" | "complete";
  
  // ═══ Tutor Presentation ═══
  tutor: {
    status: TeacherStatus;
    dialogue: string | null;
    isTyping: boolean;
    speaker: string;
  };
  
  // ═══ Student Interaction ═══
  interaction: {
    isWaiting: boolean;
    expected: ExpectedInteraction | null;
    lastValidation: ValidationResult;
    feedbackEvents: Array<{
      id: string;
      squares: string[];
      status: "success" | "failure";
      duration: number;
    }>;
  };
  
  // ═══ Board Visuals ═══
  board: {
    highlightedSquares: string[];
    activeArrows: Arrow[];
    overlayMessage: string | null;
  };
  
  // ═══ Transcript (read-only collection) ═══
  transcript: TranscriptMessage[];
  
  // ═══ Batch Action Methods (5 instead of 20!) ═══
  setTutorState: (state: Partial<TutorState>) => void;
  setInteractionState: (state: Partial<InteractionState>) => void;
  setBoardState: (state: Partial<BoardState>) => void;
  advanceToStep: (index: number) => void;
  addTranscriptMessage: (...) => void;
}
```

### Migration Steps
1. Create new structure (1 day)
2. Update store implementation (1 day)
3. Update all consuming components (2 days)
4. Remove old setters (1 day)
5. Test thoroughly (1 day)

**Total effort**: 1 week  
**Benefits**: ~30% performance improvement, easier debugging, cleaner code

---

## File Structure Reorganization

### Current Problem
```
src/
├── lesson-engine/              # ← OLD, hardcoded data
│   └── coordinateLesson.ts    # ← DUPLICATE of day1.json
│
├── lib/lesson-engine/         # ← REAL lesson engine
│   ├── lessonParser.ts
│   ├── stepExecutor.ts
│   └── validationEngine.ts
```

### Target Structure
```
src/
├── features/                   # Feature modules (future state)
│   ├── lesson/
│   │   ├── engine/
│   │   │   ├── executor.ts
│   │   │   ├── parser.ts
│   │   │   └── validator.ts
│   │   ├── data/
│   │   │   ├── day1-board-coordinates.json
│   │   │   ├── day2-piece-movement.json
│   │   │   └── ...
│   │   ├── components/
│   │   └── types/
│   │
│   ├── board/
│   ├── classroom/
│   └── ...
│
├── config/                     # Configuration
│   ├── constants.ts
│   ├── app.config.ts
│   └── ui.config.ts
│
└── (rest of structure)
```

### Migration Steps
1. Create `/config/` folder and extract magic numbers (2 hours)
2. Create `/features/lesson/` folder structure (2 hours)
3. Move components and engine to features (4 hours)
4. Update imports (4 hours)
5. Remove old folders (1 hour)

**Total effort**: 1 day

---

## 10 Most Impactful Fixes (In Priority Order)

| # | Fix | Impact | Effort | Start Week |
|---|-----|--------|--------|-----------|
| 1 | Remove mock UI (sidebar, leaderboard) | MVP clarity | 4h | Week 1 |
| 2 | Fix validation feedback nonce pattern | Reliability | 6h | Week 1 |
| 3 | Add error boundary | Stability | 3h | Week 1 |
| 4 | Consolidate lesson data (remove dup) | Maintainability | 4h | Week 1 |
| 5 | Refactor store structure | Performance | 40h | Week 2 |
| 6 | Implement real database | Scalability | 40h | Week 3-4 |
| 7 | Replace mock socket | Functionality | 30h | Week 3-4 |
| 8 | Add UI components (multiple-choice, text-input) | Functionality | 16h | Week 2 |
| 9 | Implement TTS integration | Engagement | 30h | Week 5 |
| 10 | Build teacher controls | Classroom management | 40h | Week 7 |

---

## Risk Mitigation Checklist

### Before Launch (Critical)
- [ ] Replace mock socket with real WebSocket
- [ ] Implement real database persistence
- [ ] Add error boundary and error recovery
- [ ] Test lesson end-to-end (all paths)
- [ ] Add validation feedback fix
- [ ] Remove non-essential UI

### Before 100 Students (Major)
- [ ] Refactor store to reduce re-subscriptions
- [ ] Add lesson branching support
- [ ] Implement database-backed lesson management
- [ ] Add attempt tracking
- [ ] Setup error monitoring (Sentry)
- [ ] Load test to 100 concurrent users

### Before 1000 Students (Moderate)
- [ ] Add authentication layer
- [ ] Implement API rate limiting
- [ ] Add performance monitoring (APM)
- [ ] Setup CDN for static assets
- [ ] Implement caching strategy
- [ ] Add database indexing

---

## Team Growth Plan

### Currently: Solo Developer
- Architecture design: You
- Frontend: You
- Backend: You
- DevOps: You
- QA: Manual

### Recommended Growth (When ready)

**Month 3**: Add Frontend Engineer
- You: Backend + Architecture
- Frontend dev: UI polish, interactions, animations

**Month 6**: Add Backend Engineer
- You: Architecture + DevOps
- Frontend dev: Keep growing features
- Backend dev: Database, optimization, infrastructure

**Month 9**: Add Content/Product
- You: Keep architecture oversight
- Frontend dev: New UI features
- Backend dev: Performance, scaling
- Content specialist: Lesson design and curation

---

## Metrics to Track

### Launch Day
- [ ] First lesson completion rate
- [ ] Lesson abandonment rate
- [ ] Interaction validation accuracy
- [ ] Load time
- [ ] Error rate

### Monthly
- [ ] New students onboarded
- [ ] Lesson completion rate
- [ ] Repeat usage rate
- [ ] Feature engagement (click-square vs move-piece vs text input)
- [ ] Average session duration
- [ ] Student satisfaction (NPS)

### Technical
- [ ] Error rate
- [ ] P95 latency
- [ ] Database query time
- [ ] Audio playback quality
- [ ] User retention

---

## Dependency Map (What Blocks What)

```
Lesson Data Consolidation ──→ Multiple Lessons
                             ↓
                       MVP Ready
                             ↓
Database Implementation ─→ Multiplayer
                             ↓
Real Socket Layer ────────── Classroom
                             ↓
Voice Integration ────────→ Wow Factor
                             ↓
Teacher Controls ────────→ Production Ready
```

**Critical path**: Database → Socket → Voice  
**Can parallelize**: Lesson authoring, UI components

---

## Success Criteria per Phase

### Phase 1 (MVP): 2 weeks
- ✅ 1 complete lesson (day1) playable end-to-end
- ✅ No crashes or unhandled errors
- ✅ Clear feedback for all interactions
- ✅ Celebration on completion
- ✅ Can restart lesson

### Phase 2 (Single-Player): +2 weeks
- ✅ 2-3 polished lessons
- ✅ Lesson browser
- ✅ Student dashboard
- ✅ Attempt tracking working
- ✅ Ready for real user testing

### Phase 3 (Realtime): +4 weeks
- ✅ 1 teacher + 1 student in real session
- ✅ Progress persists across refreshes
- ✅ Real-time updates working
- ✅ Basic teacher controls
- ✅ Load test passes (50 concurrent)

### Phase 4 (Voice): +4 weeks
- ✅ AI speaks complete lessons
- ✅ Avatar lip-syncs
- ✅ Student can respond via voice
- ✅ Timing stays in sync
- ✅ Audio quality acceptable

### Phase 5 (Scaling): +4 weeks
- ✅ 1 teacher + 5 students in session
- ✅ Hand-raise queue working
- ✅ Active speaker detection accurate
- ✅ Load test passes (100 concurrent)
- ✅ No data loss during scaling

---

## Decision Matrix

### Architecture Decisions Made (Good!)

| Decision | Rationale | Still Valid |
|----------|-----------|------------|
| Next.js + React | Modern, scalable, easy to deploy | ✅ Yes |
| Zustand for state | Lightweight, performant | ✅ Yes (after refactor) |
| JSON lessons as data | Easy to version, human-readable | ✅ Yes |
| chess.js for validation | Well-tested, standard library | ✅ Yes |
| react-chessboard UI | Good component, feature-complete | ✅ Yes |
| TypeScript everywhere | Type safety, easier refactoring | ✅ Yes |

### Decisions Needing Reversal

| Decision | Issue | Fix |
|----------|-------|-----|
| Mock socket | Can't scale | Implement real WebSocket |
| Hardcoded student | Can't personalize | Dynamic participant system |
| No database | Can't persist | Add PostgreSQL |
| No auth | Security risk | Implement JWT/OAuth |
| React only frontend | No backend | Add Node/Python server |

---

## Quick Start: Day 1 Tasks

**If starting today, do this:**

1. ✅ Read ARCHITECTURE_AUDIT.md (this file + full audit)
2. ✅ Create branch: `feature/mvp-polish`
3. ✅ Remove non-essential components:
   - Hide sidebar (show only transcript)
   - Hide leaderboard
   - Hide activity feed
4. ✅ Test day1 lesson end-to-end
5. ✅ Add error boundary
6. ✅ Add localStorage persistence

**By end of Week 1**:
7. ✅ Add lesson completion screen
8. ✅ Remove coordinateLesson.ts duplicate
9. ✅ Add loading states
10. ✅ Deploy and test with 2-3 real users

---

## Resources & References

### Documentation
- Full audit: [ARCHITECTURE_AUDIT.md](./ARCHITECTURE_AUDIT.md)
- Quick ref: This file

### Technology Decisions
- **Backend**: Next.js API routes (keep monolithic) vs Separate Node.js (for scale)
- **Database**: PostgreSQL (recommended) vs MongoDB
- **WebSocket**: Socket.io vs native WebSocket
- **TTS**: Google Cloud (best phonemes) vs ElevenLabs (best quality) vs OpenAI (fastest)

### External Tools
- Monitoring: Sentry.io
- Analytics: PostHog or Mixpanel
- 3D Avatar: Ready Player Me or custom Babylon.js
- CDN: Vercel or CloudFlare

---

**Last Updated**: May 16, 2026  
**Status**: Complete Architecture Audit Ready for Implementation  
**Next**: Begin Phase 1 (MVP Polish)
