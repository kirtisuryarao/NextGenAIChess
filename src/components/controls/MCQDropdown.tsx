"use client";

/**
 * MCQDropdown Component
 * 
 * Displays multiple choice question options in a focus mode dropdown.
 * Auto-opens when focusMode=true on multiple-choice steps.
 * Handles selection validation and feedback.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { useLessonStore } from "@/store/lessonStore";
import type { LessonStep } from "@/types/lesson";

interface MCQDropdownProps {
  isOpen: boolean;
  options: string[];
  onSelect: (selectedOption: string) => void;
  isLoading?: boolean;
  isShowingFeedback?: boolean;
  feedbackType?: "success" | "failure" | null;
  feedbackMessage?: string;
}

export function MCQDropdown({
  isOpen,
  options,
  onSelect,
  isLoading = false,
  isShowingFeedback = false,
  feedbackType = null,
  feedbackMessage = "",
}: MCQDropdownProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const currentStep = useLessonStore((state) => state.currentStep);
  const setWaitingForInteraction = useLessonStore((state) => state.setWaitingForInteraction);
  const addTranscriptMessage = useLessonStore((state) => state.addTranscriptMessage);

  const handleOptionSelect = (index: number, option: string) => {
    if (isLoading || isShowingFeedback) {
      return;
    }

    setSelectedIndex(index);
    setWaitingForInteraction(false);

    // Add to transcript
    addTranscriptMessage({
      type: "student",
      sender: "You",
      message: option,
    });

    // Notify parent
    onSelect(option);
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="mcq-dropdown"
          style={{
            background: "rgba(14, 8, 34, 0.95)",
            border: "1px solid rgba(139, 92, 246, 0.5)",
            borderRadius: "12px",
            padding: "16px",
            backdropFilter: "blur(12px)",
            boxShadow: "0 8px 32px rgba(139, 92, 246, 0.2)",
          }}
        >
          {/* Question text */}
          {currentStep?.message && (
            <p
              style={{
                color: "#f8fafc",
                fontSize: "14px",
                fontWeight: 600,
                marginBottom: "16px",
                lineHeight: 1.4,
              }}
            >
              {currentStep.message}
            </p>
          )}

          {/* Options container */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {options.map((option, index) => (
              <motion.button
                key={`${index}-${option}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                onClick={() => handleOptionSelect(index, option)}
                disabled={isLoading || isShowingFeedback}
                style={{
                  padding: "12px 14px",
                  background:
                    selectedIndex === index
                      ? "rgba(139, 92, 246, 0.3)"
                      : "rgba(139, 92, 246, 0.08)",
                  border:
                    selectedIndex === index
                      ? "1.5px solid rgba(139, 92, 246, 0.8)"
                      : "1.5px solid rgba(139, 92, 246, 0.2)",
                  borderRadius: "8px",
                  color:
                    selectedIndex === index
                      ? "#c4b5fd"
                      : isShowingFeedback && feedbackType === "success" && selectedIndex === index
                        ? "#86efac"
                        : isShowingFeedback && feedbackType === "failure" && selectedIndex === index
                          ? "#fca5a5"
                          : "#e2e8f0",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: isLoading || isShowingFeedback ? "not-allowed" : "pointer",
                  transition: "all 0.15s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  opacity: isLoading && selectedIndex !== index ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && !isShowingFeedback) {
                    e.currentTarget.style.background = "rgba(139, 92, 246, 0.15)";
                    e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.5)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    selectedIndex === index
                      ? "rgba(139, 92, 246, 0.3)"
                      : "rgba(139, 92, 246, 0.08)";
                  e.currentTarget.style.borderColor =
                    selectedIndex === index
                      ? "rgba(139, 92, 246, 0.8)"
                      : "rgba(139, 92, 246, 0.2)";
                }}
              >
                <span style={{ flex: 1, textAlign: "left" }}>{option}</span>
                {selectedIndex === index && !isShowingFeedback && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{ flexShrink: 0, marginLeft: "8px" }}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity }}
                        style={{
                          width: "16px",
                          height: "16px",
                          border: "2px solid rgba(139, 92, 246, 0.3)",
                          borderTop: "2px solid #c4b5fd",
                          borderRadius: "50%",
                        }}
                      />
                    ) : null}
                  </motion.div>
                )}
                {selectedIndex === index && isShowingFeedback && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{ flexShrink: 0, marginLeft: "8px" }}
                  >
                    {feedbackType === "success" ? (
                      <Check size={16} color="#86efac" strokeWidth={2.5} />
                    ) : (
                      <X size={16} color="#fca5a5" strokeWidth={2.5} />
                    )}
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>

          {/* Feedback message */}
          <AnimatePresence>
            {isShowingFeedback && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                style={{
                  marginTop: "12px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  background:
                    feedbackType === "success"
                      ? "rgba(34, 197, 94, 0.15)"
                      : "rgba(239, 68, 68, 0.15)",
                  border:
                    feedbackType === "success"
                      ? "1px solid rgba(34, 197, 94, 0.3)"
                      : "1px solid rgba(239, 68, 68, 0.3)",
                  color:
                    feedbackType === "success"
                      ? "#bbf7d0"
                      : "#fecaca",
                  fontSize: "12px",
                  fontWeight: 500,
                  textAlign: "center",
                }}
              >
                {feedbackMessage}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
