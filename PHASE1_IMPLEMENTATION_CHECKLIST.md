# Phase 1 Implementation Checklist: MVP Polish (2 weeks)

**Goal**: Polish single lesson to production quality  
**Timeline**: 2 weeks / 80 hours  
**Owner**: You  
**Status**: Ready to start

---

## Week 1: Foundation & Cleanup

### Day 1-2: UI Cleanup & Non-Essentials Removal

- [ ] **Branch**: Create `feature/mvp-polish-week1`

- [ ] **Remove sidebar UI** (Keep it in code, just hide)
  - [ ] In `ClassroomLayout.tsx` or `MainWorkspace.tsx`, remove `<ClassroomSidebar />`
  - [ ] OR set to `display: none`
  - [ ] Adjust grid from `46% 54%` to `100%` for RightPanel
  - [ ] Test: Board should fill most screen

- [ ] **Remove leaderboard**
  - [ ] In `ClassroomSidebar.tsx`, comment out `<Leaderboard />` section
  - [ ] Or remove that component entirely

- [ ] **Remove activity feed** (temporarily)
  - [ ] In `ClassroomSidebar.tsx`, comment out `<ActivityFeed />`
  - [ ] Keep transcript in left panel

- [ ] **Simplify tutor panel**
  - [ ] Focus on: Avatar + Transcript + Status
  - [ ] Remove "Ask Doubt" button (or hide for MVP)
  - [ ] Test: Should feel cleaner

- [ ] **Commit**: `git commit -m "chore: hide non-essential UI for MVP"`

---

### Day 2-3: Add Error Handling

- [ ] **Create ErrorBoundary component**
  ```typescript
  // src/components/shared/ErrorBoundary.tsx
  export class ErrorBoundary extends React.Component {
    render() {
      if (this.state.hasError) {
        return <ErrorScreen error={this.state.error} />;
      }
      return this.props.children;
    }
  }
  ```

- [ ] **Create ErrorScreen component**
  ```typescript
  // src/components/shared/ErrorScreen.tsx
  export function ErrorScreen({ error }: { error: Error }) {
    return (
      <div style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        padding: "40px",
      }}>
        <h1>Oops! Something went wrong</h1>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>
          Reload Page
        </button>
      </div>
    );
  }
  ```

- [ ] **Wrap app with ErrorBoundary**
  ```typescript
  // src/app/page.tsx
  <ErrorBoundary>
    <ClassroomLayout />
  </ErrorBoundary>
  ```

- [ ] **Test**: Intentionally break something, verify error screen appears

- [ ] **Commit**: `git commit -m "feat: add error boundary and error screen"`

---

### Day 4: Validation Feedback Fix (Nonce Problem)

- [ ] **Fix validation feedback anti-pattern**
  - [ ] Current: Uses `Date.now()` as nonce
  - [ ] Problem: Non-deterministic, React anti-pattern
  
  ```typescript
  // src/lib/lesson-engine/validationEngine.ts
  
  // Before:
  actions.setValidationFeedback({
    squares: ["e4"],
    status: "success",
    nonce: Date.now()  // ❌ Non-deterministic
  });
  
  // After:
  const feedbackId = `feedback-${Date.now()}-${Math.random()}`;
  actions.setValidationFeedback({
    id: feedbackId,
    squares: ["e4"],
    status: "success",
    expiresAt: Date.now() + 1050
  });
  
  // Then auto-clear by ID
  useEffect(() => {
    const timer = setTimeout(() => {
      if (store.validationFeedback?.id === feedbackId) {
        store.clearValidationFeedback();
      }
    }, 1050);
    
    return () => clearTimeout(timer);
  }, [feedbackId]);
  ```

- [ ] **Update store**:
  ```typescript
  // src/store/lessonStore.ts
  validationFeedback: {
    id: string;
    squares: string[];
    status: "success" | "failure";
    expiresAt: number;
  } | null;
  ```

- [ ] **Test**: Click same square twice quickly, feedback should work correctly

- [ ] **Commit**: `git commit -m "fix: replace nonce-based feedback with proper ID tracking"`

---

### Day 5: Consolidate Lesson Data

- [ ] **Remove duplicate lesson data**
  - [ ] Delete or rename `src/lesson-engine/coordinateLesson.ts`
  - [ ] This duplicates `src/data/lessons/day1-board-coordinates.json`
  - [ ] Keep only JSON source of truth

- [ ] **Update lesson usage**:
  ```typescript
  // src/hooks/useLessonEngine.ts
  import day1BoardCoordinates from "@/data/lessons/day1-board-coordinates.json";
  
  export function useLessonEngine(lessonData: unknown = day1BoardCoordinates) {
    // rest unchanged
  }
  ```

- [ ] **Remove old import**:
  ```typescript
  // Was: import { COORDINATE_LESSON_STEPS } from "@/lesson-engine/coordinateLesson";
  // Now: removed
  ```

- [ ] **Update useClassroomSession if needed**:
  - [ ] Should not import from old coordinateLesson
  - [ ] Should get progress from actual lesson steps

- [ ] **Commit**: `git commit -m "chore: consolidate lesson data, remove duplicate coordinateLesson"`

---

### Day 6: Add Loading States

- [ ] **Create LoadingScreen component**:
  ```typescript
  // src/components/shared/LoadingScreen.tsx
  export function LoadingScreen() {
    return (
      <div style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
      }}>
        <div className="spinner" />
        <p>Loading lesson...</p>
      </div>
    );
  }
  ```

- [ ] **Add Suspense boundary**:
  ```typescript
  // src/app/page.tsx
  <Suspense fallback={<LoadingScreen />}>
    <ClassroomLayout />
  </Suspense>
  ```

- [ ] **Test**: Page should show loading briefly

- [ ] **Commit**: `git commit -m "feat: add loading state and Suspense boundary"`

---

### Day 7: Add Lesson Completion Screen

- [ ] **Create CompletionScreen component**:
  ```typescript
  // src/components/lesson/CompletionScreen.tsx
  export function CompletionScreen({
    onRestart,
  }: {
    onRestart: () => void;
  }) {
    return (
      <div style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "32px",
        padding: "40px",
      }}>
        <div style={{ fontSize: "64px" }}>🎉</div>
        <h1>Lesson Complete!</h1>
        <p style={{ fontSize: "18px" }}>
          Great work! You've mastered chessboard coordinates.
        </p>
        <button
          onClick={onRestart}
          style={{
            padding: "12px 32px",
            fontSize: "16px",
            backgroundColor: "#22c55e",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Restart Lesson
        </button>
      </div>
    );
  }
  ```

- [ ] **Update ClassroomLayout to show completion screen**:
  ```typescript
  // src/components/classroom/ClassroomLayout.tsx
  const isLessonComplete = useLessonStore(s => s.isLessonCompleted);
  const resetLesson = () => {
    // Reload lesson
  };
  
  if (isLessonComplete) {
    return <CompletionScreen onRestart={resetLesson} />;
  }
  ```

- [ ] **Test**: Complete lesson, should see celebration screen

- [ ] **Commit**: `git commit -m "feat: add completion screen with restart option"`

---

## Week 2: Persistence & Polish

### Day 8-9: Add localStorage Persistence

- [ ] **Create persistence hook**:
  ```typescript
  // src/hooks/useLessonPersistence.ts
  export function useLessonPersistence() {
    const store = useLessonStore();
    
    // Save on change
    useEffect(() => {
      const state = {
        currentStepIndex: store.currentStepIndex,
        transcriptMessages: store.transcriptMessages,
        isLessonCompleted: store.isLessonCompleted,
        timestamp: Date.now(),
      };
      localStorage.setItem("lesson-session", JSON.stringify(state));
    }, [store.currentStepIndex, store.isLessonCompleted]);
    
    // Load on init
    useEffect(() => {
      const saved = localStorage.getItem("lesson-session");
      if (saved) {
        const state = JSON.parse(saved);
        // Restore state (but be careful not to break lesson)
        store.loadLesson(store.currentLesson); // reload from start
        // or better: have a restore function
      }
    }, []);
  }
  ```

- [ ] **Integrate into ClassroomLayout**:
  ```typescript
  export function ClassroomLayout() {
    useLessonPersistence();
    // rest unchanged
  }
  ```

- [ ] **Test**: Complete some steps, refresh page, progress should persist

- [ ] **Commit**: `git commit -m "feat: add localStorage persistence for lesson progress"`

---

### Day 9-10: End-to-End Testing

- [ ] **Test complete lesson flow**:
  1. [ ] Start lesson
  2. [ ] Read initial dialogue
  3. [ ] Click A2 (correct)
  4. [ ] Click D5 (correct)
  5. [ ] Move E2-E4
  6. [ ] See celebration
  7. [ ] Restart lesson
  8. [ ] Refresh page (progress persists)

- [ ] **Test error paths**:
  1. [ ] Click wrong square → should show error feedback
  2. [ ] Click same square multiple times → feedback should work
  3. [ ] Timeout (don't respond) → should auto-advance
  4. [ ] Intentionally break lesson data → should show error boundary

- [ ] **Test UI**:
  1. [ ] Responsive on different screen sizes
  2. [ ] Board highlights work
  3. [ ] Arrows display correctly
  4. [ ] Transcript auto-scrolls

- [ ] **Document findings**:
  - [ ] Create TEST_RESULTS.md
  - [ ] List any remaining issues
  - [ ] Note edge cases

- [ ] **Commit**: `git commit -m "test: complete end-to-end testing, document results"`

---

### Day 11: UI Polish

- [ ] **Review and fix visual issues**:
  - [ ] Colors are consistent
  - [ ] Spacing is balanced
  - [ ] Fonts are readable
  - [ ] No layout jank or flicker
  - [ ] Buttons are appropriately sized

- [ ] **Add some animations**:
  ```typescript
  // Optional: subtle fade-in for transcript messages
  <Transcript text={text} animate={true} />
  ```

- [ ] **Mobile check**:
  - [ ] Test on mobile browser (or DevTools)
  - [ ] Board is still playable
  - [ ] Touch interactions work (if supported)

- [ ] **Commit**: `git commit -m "style: polish UI and fix visual issues"`

---

### Day 12: Documentation & PR

- [ ] **Write MVPDONE.md**:
  - [ ] What's included
  - [ ] What's still TODO
  - [ ] Known issues
  - [ ] Testing results
  - [ ] Deployment instructions

- [ ] **Create PR**:
  ```bash
  git push origin feature/mvp-polish-week1
  ```
  - [ ] Link ARCHITECTURE_AUDIT.md in PR description
  - [ ] Summarize changes
  - [ ] Link any issues fixed

- [ ] **Self-review PR**:
  - [ ] Code quality OK?
  - [ ] No debug logs left?
  - [ ] Type safety maintained?
  - [ ] Tests pass?

- [ ] **Merge PR** when satisfied

- [ ] **Commit**: `git commit -m "docs: add MVP completion documentation"`

---

## Daily Standup Template (If pairing/reviewing)

### Each Day, Answer:
1. ✅ **What did I complete?** (specific tasks from above)
2. ⏳ **What's next?** (tomorrow's tasks)
3. 🚫 **What's blocking?** (if anything)
4. ⚠️ **Any issues?** (bugs, design questions)

### Example (Day 1):
- ✅ Removed sidebar UI, adjusted grid layout, board fills screen
- ⏳ Next: Remove leaderboard and activity feed
- 🚫 Nothing blocking
- ⚠️ Question: Should we keep "Ask Doubt" button for future or remove for MVP?

---

## Success Criteria (Week 1-2 Complete)

When you're done, you should have:

- ✅ Single lesson playable end-to-end
- ✅ No crashes or unhandled errors
- ✅ Clear feedback for all interactions
- ✅ Celebration on completion with restart option
- ✅ Progress persists across page refreshes
- ✅ Clean, polished UI without non-essentials
- ✅ Fixed nonce-based feedback pattern
- ✅ All test paths verified
- ✅ Documentation complete

**Your MVP is ready to share with real users!**

---

## What NOT to Do (Common Traps)

❌ **Don't start adding new features**  
→ Focus only on polishing current features

❌ **Don't refactor store yet**  
→ That's Phase 2, keep focused

❌ **Don't add voice/audio**  
→ That's Phase 4, too early

❌ **Don't optimize for performance**  
→ Optimize when you have real data

❌ **Don't build lesson editor**  
→ That's Phase 6, polish first

❌ **Don't add multiplayer**  
→ That's Phase 3, need backend

---

## Quick Troubleshooting

### "Board highlighting not working"
→ Check `buildSquareStyles()` in `ChessBoard.tsx`  
→ Verify `highlightedSquares` array has values

### "Lesson doesn't progress after interaction"
→ Check validation result status  
→ Verify `nextStep()` is called correctly  
→ Check store subscription in component

### "localStorage not persisting"
→ Check browser allow localStorage?  
→ Verify object serialization doesn't fail  
→ Test in different browser/incognito

### "Error boundary not showing"
→ Make sure it wraps the component  
→ Check error actually thrown  
→ Verify fallback component renders

---

## Phase 2 Preview (When you're ready)

After this MVP is polished:
1. Add multiple-choice UI component
2. Add text-input UI component
3. Create 2nd lesson
4. Refactor store (batch setters)
5. Build lesson browser
6. Launch with real users!

---

**Estimated total time**: 80 hours (2 weeks at 40 hrs/week)

**Ready to start?** Begin with Day 1 tasks above!
