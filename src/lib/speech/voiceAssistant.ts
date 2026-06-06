type SpeakOptions = {
  onEnd?: () => void;
  rate?: number;
  pitch?: number;
  volume?: number;
};

const FEMALE_VOICE_HINTS = [
  "samantha",
  "zira",
  "karen",
  "victoria",
  "moira",
  "fiona",
  "alva",
  "helena",
  "serena",
  "anna",
  "emma",
  "veena",
  "tessa",
  "maria",
  "female",
];

function isSpeechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

function scoreVoice(voice: SpeechSynthesisVoice) {
  const voiceName = voice.name.toLowerCase();
  const language = voice.lang.toLowerCase();
  let score = 0;

  if (language.startsWith("en")) {
    score += 4;
  }

  if (language.includes("us")) {
    score += 2;
  }

  for (const hint of FEMALE_VOICE_HINTS) {
    if (voiceName.includes(hint)) {
      score += 6;
      break;
    }
  }

  if (voice.default) {
    score += 1;
  }

  return score;
}

function pickPreferredVoice(voices: SpeechSynthesisVoice[]) {
  if (voices.length === 0) {
    return null;
  }

  return [...voices].sort((left, right) => scoreVoice(right) - scoreVoice(left))[0] ?? null;
}

function waitForVoices(timeoutMs = 300) {
  return new Promise<SpeechSynthesisVoice[]>((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    let settled = false;
    const finish = () => {
      if (settled) {
        return;
      }

      settled = true;
      window.speechSynthesis.removeEventListener("voiceschanged", finish);
      resolve(window.speechSynthesis.getVoices());
    };

    window.speechSynthesis.addEventListener("voiceschanged", finish, { once: true });
    window.setTimeout(finish, timeoutMs);
  });
}

export function cancelLessonSpeech() {
  if (!isSpeechSupported()) {
    return;
  }

  window.speechSynthesis.cancel();
}

export async function speakLessonText(text: string, options: SpeakOptions = {}) {
  if (!isSpeechSupported()) {
    options.onEnd?.();
    return false;
  }

  const trimmedText = text.trim();
  if (!trimmedText) {
    options.onEnd?.();
    return false;
  }

  cancelLessonSpeech();

  const voices = await waitForVoices();
  const utterance = new SpeechSynthesisUtterance(trimmedText);
  const voice = pickPreferredVoice(voices);

  utterance.lang = voice?.lang ?? "en-US";
  utterance.rate = options.rate ?? 1;
  utterance.pitch = options.pitch ?? 1.08;
  utterance.volume = options.volume ?? 1;

  if (voice) {
    utterance.voice = voice;
  }

  return await new Promise<boolean>((resolve) => {
    utterance.onend = () => {
      options.onEnd?.();
      resolve(true);
    };

    utterance.onerror = () => {
      options.onEnd?.();
      resolve(false);
    };

    window.speechSynthesis.resume();
    window.speechSynthesis.speak(utterance);
  });
}
