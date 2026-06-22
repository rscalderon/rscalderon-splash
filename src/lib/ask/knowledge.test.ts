import { describe, it, expect } from 'vitest';
import { knowledge, MATCH_THRESHOLD } from './knowledge';

describe('knowledge base', () => {
  it('has entries', () => {
    expect(knowledge.length).toBeGreaterThan(0);
  });

  it('every entry has an id, at least one non-empty question, and a non-empty answer', () => {
    for (const e of knowledge) {
      expect(e.id, 'id').toBeTruthy();
      expect(e.questions.length, `${e.id} questions`).toBeGreaterThan(0);
      expect(e.questions.every((q) => q.trim().length > 0), `${e.id} blank question`).toBe(true);
      expect(e.answer.trim().length, `${e.id} answer`).toBeGreaterThan(0);
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
      expect(email.test(e.answer), `email leak in ${e.id}`).toBe(false);
      expect(phone.test(e.answer), `phone leak in ${e.id}`).toBe(false);
    }
  });

  it('uses a sane match threshold', () => {
    expect(MATCH_THRESHOLD).toBeGreaterThan(0);
    expect(MATCH_THRESHOLD).toBeLessThan(1);
  });
});
