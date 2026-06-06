# Focus Mode Implementation Guide

## Overview

Focus Mode is a specialized UI state for the AI Chess Classroom that automatically adjusts the layout and interactions when teaching specific concepts that require student focus.

## Features

### 1. **Automatic Layout Transformation**
   - **When `focusMode=true`**: 
     - Hides Blackboard/Chat Panel (left side)
     - Hides/Dims Chess Board Panel (right side)
     - Expands Tutor and Question panels
     - Creates a centered, focused learning environment

   - **When `focusMode=false`** (default):
     - Preserves current classroom layout
     - Shows all panels
     - Normal 46% / 54% split layout

### 2. **State Management**
Focus Mode manages 4 distinct classroom states:

| State | Description | Behavior |
|-------|-------------|----------|
| **TEACHING** | Normal instruction phase | Panels visible, normal layout |
| **QUESTION** | MCQ dropdown opens, student focuses | Panels hidden/expanded, MCQ open |
| **WAITING_FOR_ANSWER** | Student is selecting answer | MCQ accepting input |
| **FEEDBACK** | Showing result (success/failure) | MCQ closed, feedback displayed |

### 3. **Automatic MCQ Dropdown**
- Opens automatically when focus mode activates (300ms delay for animation)
- Displays multiple choice options
- Auto-closes when student selects answer
- Shows success/failure feedback with icons
- Auto-restores normal layout after 2 seconds

### 4. **Smooth Animations**
All transitions use Framer Motion with:
- 300ms enter/exit animations
- Smooth opacity changes
- Scale effects for board dimming
- Staggered option animations in MCQ

## Lesson JSON Structure

### Adding Focus Mode to a Lesson Step

```json
{
  "id": "focus-question",
  "type": "multiple-choice",
  "speaker": "Coco",
  "message": "Which square is most important?",
  "options": ["e4", "d4", "c3"],
  "expectedResponses": ["e4"],
  "successMessage": "Great! E4 is the most central square.",
  "failureMessage": "Not quite. E4 controls the center.",
  "focusMode": true,
  "timeoutDuration": 15000,
  "continueIfTimeout": true
}
```

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ✓ | Unique step identifier |
| `type` | string | ✓ | Must be "multiple-choice" or other interaction type |
| `focusMode` | boolean | ✗ | Activates Focus Mode when `true` (default: `false`) |
| `message` | string | ✓ | Question text displayed in MCQ dropdown |
| `options` | string[] | ✓ | Array of answer choices |
| `expectedResponses` | string[] | ✓ | Correct answers (first option is primary) |
| `successMessage` | string | ✗ | Feedback when correct |
| `failureMessage` | string | ✗ | Feedback when incorrect |
| `timeoutDuration` | number | ✗ | Milliseconds before timeout |
| `continueIfTimeout` | boolean | ✗ | Continue to next step on timeout |

## Hooks

### `useFocusMode()`
Central hook for managing Focus Mode state.

```typescript
import { useFocusMode } from "@/hooks/useFocusMode";

const focusMode = useFocusMode();

// Properties
focusMode.isActive                    // boolean - is focus mode active?
focusMode.shouldHideBoardPanel        // boolean
focusMode.shouldHideBlackboardPanel   // boolean
focusMode.isMCQDropdownOpen           // boolean
focusMode.isShowingFeedback           // boolean
focusMode.feedbackType                // "success" | "failure" | null
focusMode.feedbackMessage             // string
focusMode.animationPhase              // "enter" | "active" | "exit" | "normal"

// Methods
focusMode.closeMCQDropdown()          // Manually close MCQ
focusMode.restoreNormalLayout()       // Manually restore layout
```

## Components

### MCQDropdown
Displays multiple-choice question with options, selection, and feedback.

**Props:**
```typescript
interface MCQDropdownProps {
  isOpen: boolean;
  options: string[];
  onSelect: (selectedOption: string) => void;
  isLoading?: boolean;
  isShowingFeedback?: boolean;
  feedbackType?: "success" | "failure" | null;
  feedbackMessage?: string;
}
```

## Flow Diagram

```
Step with focusMode=true loaded
    ↓
useFocusMode detects focusMode
    ↓
Animation starts (300ms)
    ↓
MCQ dropdown opens
    ↓
Student selects answer
    ↓
MCQ closes, validation runs
    ↓
Feedback displayed (2 seconds)
    ↓
Layout restores to normal
    ↓
Next step
```

## Example Lesson

See `src/data/lessons/sample-lesson.json` for a complete example including:
- Regular teaching steps
- Focus Mode MCQ step
- Interaction step after focus mode

## Backward Compatibility

✓ **Fully compatible** with existing lessons
- Focus Mode is optional (`focusMode` defaults to `false`)
- All existing lessons work without modification
- Can mix focus mode and normal steps in same lesson

## Best Practices

1. **Use for Key Concepts**: Focus Mode works best for critical decision points
2. **Keep Questions Concise**: MCQ text should be clear and direct
3. **Provide Good Feedback**: Use success/failure messages to reinforce learning
4. **Set Reasonable Timeouts**: 10-20 seconds typically works well
5. **Mix with Other Steps**: Alternate focus mode with regular teaching for pacing

## Troubleshooting

| Issue | Solution |
|-------|----------|
| MCQ doesn't open | Check `focusMode: true` is set and step type is "multiple-choice" |
| Layout doesn't restore | Verify `continueIfTimeout` or validation triggers properly |
| Animation choppy | Check Framer Motion is installed (`npm install framer-motion`) |
| Options not showing | Ensure `options` array is populated in step JSON |
