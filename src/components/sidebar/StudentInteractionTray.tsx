"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Mic, Send } from "lucide-react";

type StudentInteractionTrayProps = {
  options: string[];
  isWaitingForInteraction: boolean;
  onSubmit: (message: string) => void;
};

type ChipTone = {
  emoji: string;
  gradient: string;
  shadow: string;
};

const CHIP_TONES: Record<string, ChipTone> = {
  good: {
    emoji: "\u{1F60A}",
    gradient: "linear-gradient(135deg, #22c55e 0%, #10b981 52%, #059669 100%)",
    shadow: "0 10px 24px rgba(16,185,129,0.28)",
  },
  excited: {
    emoji: "\u{1F680}",
    gradient: "linear-gradient(135deg, #fde047 0%, #f59e0b 52%, #f97316 100%)",
    shadow: "0 10px 24px rgba(245,158,11,0.30)",
  },
  ready: {
    emoji: "\u{1F3AF}",
    gradient: "linear-gradient(135deg, #60a5fa 0%, #8b5cf6 52%, #7c3aed 100%)",
    shadow: "0 10px 24px rgba(124,58,237,0.30)",
  },
};

function getChipTone(option: string) {
  const normalized = option.toLowerCase();
  if (normalized.includes("excited")) return CHIP_TONES.excited;
  if (normalized.includes("ready") || normalized.includes("learn")) return CHIP_TONES.ready;
  return CHIP_TONES.good;
}

function withEmoji(option: string, emoji: string) {
  return /[\u{1F300}-\u{1FAFF}]/u.test(option) ? option : `${emoji} ${option}`;
}

type StudentInteractionTrayPropsInternal = StudentInteractionTrayProps & { embedded?: boolean };

export function StudentInteractionTray({ options, isWaitingForInteraction, onSubmit, embedded = false }: StudentInteractionTrayPropsInternal) {
  const [draft, setDraft] = useState("");
  const [locked, setLocked] = useState(false);
  const quickResponses = useMemo(() => options.filter(Boolean), [options]);

  const submitMessage = (message: string) => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || locked) {
      return;
    }

    setLocked(true);
    onSubmit(trimmedMessage);
    setDraft("");
    window.setTimeout(() => setLocked(false), 650);
  };

  return (
    <div
      style={{
        flexShrink: 0,
        borderRadius: embedded ? "8px" : "16px",
        border: embedded ? (isWaitingForInteraction ? "1px solid rgba(52,211,153,0.16)" : "1px solid rgba(0,0,0,0.0)") : (isWaitingForInteraction ? "1px solid rgba(52,211,153,0.34)" : "1px solid rgba(148,163,184,0.12)"),
        background: embedded ? 'transparent' : "linear-gradient(180deg, rgba(15,23,42,0.82), rgba(2,6,23,0.68)), radial-gradient(circle at 18% 0%, rgba(16,185,129,0.16), transparent 42%)",
        padding: embedded ? "0" : "10px",
        boxShadow: embedded ? 'none' : (isWaitingForInteraction ? "0 0 26px rgba(16,185,129,0.12)" : "none"),
        backdropFilter: embedded ? 'none' : "blur(18px)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        {quickResponses.map((option) => {
          const tone = getChipTone(option);
          return (
            <motion.button
              key={option}
              type="button"
              whileHover={{ scale: locked ? 1 : 1.045, y: locked ? 0 : -2 }}
              whileTap={{ scale: 0.96 }}
              disabled={locked}
              onClick={() => submitMessage(option)}
              style={{
                height: "38px",
                borderRadius: "9999px",
                border: "1px solid rgba(255,255,255,0.34)",
                background: tone.gradient,
                color: "#ffffff",
                fontSize: "11.5px",
                fontWeight: 900,
                padding: "0 12px",
                cursor: locked ? "not-allowed" : "pointer",
                boxShadow: tone.shadow,
                opacity: locked ? 0.64 : 1,
                textShadow: "0 1px 8px rgba(0,0,0,0.32)",
                flexShrink: 0,
              }}
            >
              {withEmoji(option, tone.emoji)}
            </motion.button>
          );
        })}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            submitMessage(draft);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flex: "1 1 300px",
            minWidth: "260px",
          }}
        >
          <div
            style={{
              flex: 1,
              minWidth: 0,
              height: "38px",
              display: "flex",
              alignItems: "center",
              gap: "7px",
              borderRadius: "12px",
              border: "1px solid rgba(148,163,184,0.18)",
              background: "rgba(15,23,42,0.74)",
              padding: "0 10px",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            <button
              type="button"
              aria-label="Voice response coming soon"
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "9999px",
                border: "1px solid rgba(96,165,250,0.22)",
                background: "rgba(59,130,246,0.14)",
                color: "#bfdbfe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                cursor: "default",
                opacity: 0.76,
              }}
            >
              <Mic size={13} />
            </button>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Type your response here..."
              maxLength={140}
              style={{
                width: "100%",
                minWidth: 0,
                border: "none",
                outline: "none",
                background: "transparent",
                color: "#f8fafc",
                fontSize: "12px",
                fontWeight: 650,
              }}
            />
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: locked ? 1 : 1.04, y: locked ? 0 : -1 }}
            whileTap={{ scale: 0.94 }}
            disabled={locked || draft.trim().length === 0}
            aria-label="Send response"
            style={{
              width: "38px",
              height: "38px",
              flexShrink: 0,
              borderRadius: "12px",
              border: "1px solid rgba(52,211,153,0.35)",
              background:
                locked || draft.trim().length === 0
                  ? "rgba(15,23,42,0.72)"
                  : "linear-gradient(135deg, #34d399 0%, #06b6d4 100%)",
              color: locked || draft.trim().length === 0 ? "rgba(148,163,184,0.62)" : "#ecfeff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: locked || draft.trim().length === 0 ? "not-allowed" : "pointer",
              boxShadow: locked || draft.trim().length === 0 ? "none" : "0 0 20px rgba(34,211,238,0.22)",
            }}
          >
            <Send size={15} />
          </motion.button>
        </form>
      </div>
    </div>
  );
}
