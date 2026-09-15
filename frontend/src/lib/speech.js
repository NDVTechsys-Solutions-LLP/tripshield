// Text-to-speech helper — prefers a deep/male English voice (Web Speech Synthesis API)
let cachedVoice = null;

const MALE_HINTS = [
  "male", "david", "daniel", "alex", "rishi", "fred",
  "google uk english male", "microsoft mark", "microsoft guy", "arthur", "aaron",
];

function pickVoice() {
  const synth = window.speechSynthesis;
  if (!synth) return null;
  const voices = synth.getVoices();
  if (!voices.length) return null;
  const en = voices.filter((v) => /en(-|_|$)/i.test(v.lang));
  const pool = en.length ? en : voices;
  let v = pool.find((x) => MALE_HINTS.some((h) => x.name.toLowerCase().includes(h)));
  if (!v) {
    v =
      pool.find((x) => x.lang.toLowerCase().includes("en-in")) ||
      pool.find((x) => x.lang.toLowerCase().includes("en-gb")) ||
      pool[0];
  }
  return v;
}

export function initSpeech() {
  const synth = window.speechSynthesis;
  if (!synth) return;
  const load = () => { cachedVoice = pickVoice(); };
  load();
  synth.onvoiceschanged = load;
}

export function speak(text, { interrupt = true } = {}) {
  const synth = window.speechSynthesis;
  if (!synth) return;
  if (!cachedVoice) cachedVoice = pickVoice();
  if (interrupt) synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  if (cachedVoice) u.voice = cachedVoice;
  u.pitch = 0.7; // deeper => more masculine
  u.rate = 0.98;
  u.volume = 1;
  synth.speak(u);
}

export function stopSpeaking() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}
