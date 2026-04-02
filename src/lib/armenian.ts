/**
 * Multi-character consonant units in Armenian romanization, longest first
 * so partial matches (e.g. "ts" before "ts'") don't shadow longer ones.
 */
const DIGRAPHS = ["ts'", "ch'", "kh", "sh", "zh", "gh", "ts", "dz", "ch", "rr", "p'", "t'", "k'"];
const VOWELS = new Set(["a", "e", "i", "o", "u", "ə"]);

/**
 * Break an Armenian romanization string into syllables.
 *
 * Approach: consonants accumulate into an onset buffer; each vowel flushes
 * the buffer + itself as a new syllable. Trailing consonants attach to the
 * last syllable (coda). This matches how a beginner would naturally chunk
 * the word when reading it aloud.
 *
 * Examples:
 *   "Barev"           → ["Ba", "rev"]
 *   "Yerekha"         → ["Ye", "re", "kha"]
 *   "Shnorhakalutyun" → ["Shno", "rha", "ka", "lu", "tyun"]
 *   "Katù"            → ["Ka", "tu"]
 *   "Jur"             → ["Jur"]
 */
export function syllabify(romanization: string): string[] {
  const syllables: string[] = [];
  let pending = "";
  let i = 0;

  while (i < romanization.length) {
    // Try to match a digraph/trigraph at current position (case-insensitive)
    const rest = romanization.slice(i).toLowerCase();
    let chunk: string | null = null;
    for (const d of DIGRAPHS) {
      if (rest.startsWith(d)) {
        chunk = romanization.slice(i, i + d.length); // preserve original case
        i += d.length;
        break;
      }
    }

    if (chunk === null) {
      chunk = romanization[i];
      i++;
    }

    const isVowel = VOWELS.has(chunk.toLowerCase());
    pending += chunk;

    if (isVowel) {
      syllables.push(pending);
      pending = "";
    }
  }

  // Trailing consonants attach to the last syllable as a coda
  if (pending) {
    if (syllables.length > 0) {
      syllables[syllables.length - 1] += pending;
    } else {
      syllables.push(pending); // entire word is consonants (shouldn't happen)
    }
  }

  return syllables.filter(Boolean);
}
