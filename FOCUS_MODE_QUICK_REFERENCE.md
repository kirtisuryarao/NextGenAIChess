# Focus Mode Quick Reference

## 🎯 Core Files

### Hooks (State & Logic)

#### [useFocusMode.ts](src/hooks/useFocusMode.ts)
**Purpose**: Central state management for focus mode
**Key Methods**:
- `closeMCQDropdown()` - Manually close MCQ
- `restoreNormalLayout()` - Restore to normal layout

**Key State**:
```typescript
isActive                    // boolean
shouldHideBoardPanel       // boolean
shouldHideBlackboardPanel  // boolean
isMCQDropdownOpen          // boolean
isShowingFeedback          // boolean
feedbackType               // "success" | "failure" | null
feedbackMessage            // string
animationPhase             // "enter" | "active" | "exit" | "normal"
```

#### [useFocusModeInteraction.ts](src/hooks/useFocusModeInteraction.ts)
**Purpose**: Handle MCQ answer validation and processing
**Key Method**:
- `handleMCQAnswer(selectedOption: string)` - Process student answer

---

### Components

#### [MainWorkspace.tsx](src/components/classroom/MainWorkspace.tsx)
**Purpose**: Layout container with focus mode panel management
**Features**:
- Conditional panel rendering
- Dynamic grid layout switching
- Panel animations with Framer Motion

#### [RightPanel.tsx](src/components/classroom/RightPanel.tsx)
**Purpose**: Right side panel (board + question area)
**Features**:
- MCQ dropdown integration
- Board dimming animation
- Banner animation handling

#### [MCQDropdown.tsx](src/components/controls/MCQDropdown.tsx)
**Purpose**: Multiple choice question display component
**Props**:
```typescript
isOpen: boolean
options: string[]
onSelect: (option: string) => void
isShowingFeedback?: boolean
feedbackType?: "success" | "failure" | null
feedbackMessage?: string
```

---

## 📊 State Transitions

```
TEACHING
    ↓ (focusMode=true detected)
QUESTION (MCQ opens)
    ↓ (student clicks option)
WAITING_FOR_ANSWER
    ↓ (validation completes)
FEEDBACK (show result, 2 sec)
    ↓
TEACHING (auto-restore)
```

---

## 📝 Lesson JSON Template

```json
{
  "id": "unique-id",
  "type": "multiple-choice",
  "speaker": "Coco",
  "message": "Your question here?",
  "options": ["option1", "option2", "option3"],
  "expectedResponses": ["option1"],
  "successMessage": "Great job!",
  "failureMessage": "Not quite right.",
  "focusMode": true,
  "timeoutDuration": 15000,
  "continueIfTimeout": true
}
```

---

## 🎬 Animation Timings

| Animation | Duration | Details |
|-----------|----------|---------|
| Panel hide/show | 300ms | Opacity + slide |
| MCQ dropdown | 200ms | Appear/disappear |
| Option entrance | 80ms | Staggered between options |
| Board dim | 300ms | Opacity + scale |
| Feedback display | 2000ms | Then auto-hide |

---

## 🔧 Key Integration Points

### In useLessonEngine
- Detects `focusMode` on current step
- Sets lesson stage to "QUESTION" when focus mode active
- Already handles MCQ validation

### In lessonStore (Zustand)
- `lessonStage: "TEACHING" | "QUESTION" | "WAITING_FOR_ANSWER" | "FEEDBACK"`
- `setLessonStage()` action
- All existing state management compatible

### In validationEngine
- `processLessonInteraction()` handles MCQ validation
- Checks answer against `expectedResponses`
- Handles success/failure/timeout cases

---

## ✅ Testing Checklist

- [ ] Load sample lesson
- [ ] Verify focus mode step loads
- [ ] Confirm MCQ dropdown appears
- [ ] Click an option
- [ ] See feedback message
- [ ] Verify layout restores
- [ ] Check next step loads
- [ ] Test with incorrect answer
- [ ] Test timeout behavior
- [ ] Verify animations are smooth

---

## 📱 Browser DevTools Tips

### Check Animation Performance
1. Open DevTools (F12)
2. Go to Performance tab
3. Record while interacting
4. Look for 60fps in FPS graph
5. Check for jank in animations

### Debug State Changes
1. Open Console
2. Look for messages from useLessonEngine
3. Check lesson store in React DevTools
4. Verify lessonStage changes

---

## 🚀 Quick Start for New Lesson

1. Copy a lesson JSON file
2. Add a focus mode MCQ step:
   ```json
   {
     "id": "my-question",
     "type": "multiple-choice",
     "message": "What's your answer?",
     "options": ["A", "B", "C"],
     "expectedResponses": ["A"],
     "focusMode": true
   }
   ```
3. Load lesson and test
4. Adjust feedback messages as needed

---

## 💡 Pro Tips

1. **Keep options concise** - One line max
2. **Use clear distinctions** - Make choices obviously different
3. **Meaningful feedback** - Reinforce learning in messages
4. **Mix pacing** - Don't use focus mode for entire lesson
5. **Test timeouts** - Verify appropriate timeout duration

---

## 🔗 Documentation Files

- [FOCUS_MODE_GUIDE.md](FOCUS_MODE_GUIDE.md) - Complete user guide
- [FOCUS_MODE_IMPLEMENTATION_SUMMARY.md](FOCUS_MODE_IMPLEMENTATION_SUMMARY.md) - Full technical summary
- [Sample Lesson](src/data/lessons/sample-lesson.json) - Working example

---

## 📞 Common Issues

**MCQ doesn't appear**
→ Check `focusMode: true` and `type: "multiple-choice"`

**Animations choppy**
→ Check browser DevTools performance, disable extensions

**Answer not validating**
→ Verify `expectedResponses` matches option text exactly (case-sensitive)

**Layout doesn't restore**
→ Check lesson continues to next step properly

---

**Last Updated**: June 6, 2026
