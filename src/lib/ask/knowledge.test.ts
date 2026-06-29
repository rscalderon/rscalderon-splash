import { describe, it, expect } from 'vitest';
import { knowledge, MATCH_THRESHOLD, type Entry } from './knowledge';

/**
 * Visible text of an answer (joins segments). The PII check must use this, not
 * the raw answer: a link href legitimately contains '@' (e.g. the Medium URL),
 * which isn't a leaked email address.
 */
const answerText = (a: Entry['answer']): string =>
  typeof a === 'string' ? a : a.map((s) => s.text).join('');

describe('knowledge base', () => {
  it('has entries', () => {
    expect(knowledge.length).toBeGreaterThan(0);
  });

  it('every entry has an id, at least one non-empty question, and a non-empty answer', () => {
    for (const e of knowledge) {
      expect(e.id, 'id').toBeTruthy();
      expect(e.questions.length, `${e.id} questions`).toBeGreaterThan(0);
      expect(e.questions.every((q) => q.trim().length > 0), `${e.id} blank question`).toBe(true);
      expect(answerText(e.answer).trim().length, `${e.id} answer`).toBeGreaterThan(0);
    }
  });

  it('has unique ids', () => {
    const ids = knowledge.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('never leaks PII (no email or phone in any answer)', () => {
    const email = /@/;
    const phone = /\d{3}[.\-\s]?\d{3}[.\-\s]?\d{4}/;
    for (const e of knowledge) {
      expect(email.test(answerText(e.answer)), `email leak in ${e.id}`).toBe(false);
      expect(phone.test(answerText(e.answer)), `phone leak in ${e.id}`).toBe(false);
    }
  });

  it('uses a sane match threshold', () => {
    expect(MATCH_THRESHOLD).toBeGreaterThan(0);
    expect(MATCH_THRESHOLD).toBeLessThan(1);
  });

  it('answers writing/essays questions with an "essays" link to Medium (no dead command)', () => {
    const w = knowledge.find((e) => e.id === 'writing');
    expect(w).toBeDefined();
    const answer = w!.answer;
    expect(Array.isArray(answer)).toBe(true);
    if (!Array.isArray(answer)) return; // narrow for TS
    const essays = answer.find((s) => s.text.toLowerCase() === 'essays');
    expect(essays?.href).toMatch(/medium\.com/);
    // The old copy said "Run the `writing` command" — that command no longer exists.
    expect(answer.map((s) => s.text).join('').toLowerCase()).not.toContain('command');
  });
});
