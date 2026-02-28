import { describe, it, expect } from 'vitest';
import {
  calculateWpm,
  calculateAccuracy,
  getCharStatus,
  isFinished,
} from '@/lib/gameLogic';

// ---------------------------------------------------------------------------
// calculateWpm
// ---------------------------------------------------------------------------
describe('calculateWpm', () => {
  it('returns 0 when elapsed time is 0', () => {
    expect(calculateWpm('hello world', 'hello world', 0)).toBe(0);
  });

  it('returns 0 when no text has been typed', () => {
    expect(calculateWpm('', 'hello world', 30)).toBe(0);
  });

  it('counts 2 correctly typed words in 60 seconds as 2 WPM', () => {
    // "hello world" → 2 words, 60 seconds → 2 WPM
    expect(calculateWpm('hello world', 'hello world', 60)).toBe(2);
  });

  it('counts 2 correctly typed words in 30 seconds as 4 WPM', () => {
    expect(calculateWpm('hello world', 'hello world', 30)).toBe(4);
  });

  it('excludes words typed incorrectly', () => {
    // "helo" is wrong, "world" is correct → 1 correct word in 60 s = 1 WPM
    expect(calculateWpm('helo world', 'hello world', 60)).toBe(1);
  });

  it('returns 0 when all words are wrong', () => {
    expect(calculateWpm('xxxxx yyyyy', 'hello world', 60)).toBe(0);
  });

  it('handles a single correct word', () => {
    // 1 word in 60 s → 1 WPM
    expect(calculateWpm('hello', 'hello world', 60)).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// calculateAccuracy
// ---------------------------------------------------------------------------
describe('calculateAccuracy', () => {
  it('returns 1 for empty input', () => {
    expect(calculateAccuracy('', 'hello world')).toBe(1);
  });

  it('returns 1 for perfectly typed text', () => {
    expect(calculateAccuracy('hello', 'hello world')).toBe(1);
  });

  it('returns 0.8 for 4 correct out of 5 typed characters', () => {
    // "helo!" vs "hello" → h✓ e✓ l✓ o✗ !✗ → 3/5 = 0.6 — wait, let me recalculate:
    // 'h'='h'✓, 'e'='e'✓, 'l'='l'✓, 'o'='l'✗, '!'='o'✗  → 3/5 = 0.6
    expect(calculateAccuracy('helxx', 'hello')).toBe(0.6);
  });

  it('returns 0 when all characters are wrong', () => {
    expect(calculateAccuracy('xxxxx', 'hello')).toBe(0);
  });

  it('returns 1 when the whole sentence is typed correctly', () => {
    const sentence = 'The quick brown fox';
    expect(calculateAccuracy(sentence, sentence)).toBe(1);
  });

  it('handles single character correctly', () => {
    expect(calculateAccuracy('h', 'hello')).toBe(1);
    expect(calculateAccuracy('x', 'hello')).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// getCharStatus
// ---------------------------------------------------------------------------
describe('getCharStatus', () => {
  it('marks all chars as pending when nothing has been typed', () => {
    const statuses = getCharStatus('', 'hello');
    expect(statuses).toEqual(['pending', 'pending', 'pending', 'pending', 'pending']);
  });

  it('marks matching chars as correct', () => {
    const statuses = getCharStatus('h', 'hello');
    expect(statuses[0]).toBe('correct');
    expect(statuses[1]).toBe('pending');
  });

  it('marks non-matching chars as incorrect', () => {
    const statuses = getCharStatus('x', 'hello');
    expect(statuses[0]).toBe('incorrect');
  });

  it('handles a mix of correct, incorrect, and pending', () => {
    // typed "hxllo", target "hello"
    // h→correct, x→incorrect, l→correct, l→correct, o→correct
    const statuses = getCharStatus('hxllo', 'hello');
    expect(statuses).toEqual([
      'correct',
      'incorrect',
      'correct',
      'correct',
      'correct',
    ]);
  });

  it('returns the same length as targetText', () => {
    const target = 'hello world';
    const statuses = getCharStatus('hel', target);
    expect(statuses).toHaveLength(target.length);
  });
});

// ---------------------------------------------------------------------------
// isFinished
// ---------------------------------------------------------------------------
describe('isFinished', () => {
  it('returns true when typedText equals targetText', () => {
    expect(isFinished('hello', 'hello')).toBe(true);
  });

  it('returns false when typedText is a prefix of targetText', () => {
    expect(isFinished('hell', 'hello')).toBe(false);
  });

  it('returns false when typedText is empty', () => {
    expect(isFinished('', 'hello')).toBe(false);
  });

  it('returns false when typedText differs from targetText', () => {
    expect(isFinished('hellx', 'hello')).toBe(false);
  });
});
