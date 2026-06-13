import { describe, it, expect } from 'vitest';
import {
  calculateCandidateFactors,
  calculateResultFactors,
  determineSpecialist,
  getDifficultyTypeLabel,
  getSpecialistLabel,
  getDevelopmentalNote,
  getNextStep03Index,
  getStep03Questions,
  STEP02_QUESTIONS,
  STEP03_QUESTIONS,
  FACTOR_NAMES,
} from './screening-context';

describe('STEP02 questions', () => {
  it('uses the sheet-specific question counts', () => {
    expect(STEP02_QUESTIONS.reading).toHaveLength(6);
    expect(STEP02_QUESTIONS.writing).toHaveLength(8);
    expect(STEP02_QUESTIONS.both).toHaveLength(14);
  });
});

describe('STEP03 questions', () => {
  it('does not ask motor questions for reading', () => {
    expect(STEP03_QUESTIONS.reading.motor).toHaveLength(0);
  });

  it('uses reading-specific visual perception questions', () => {
    expect(STEP03_QUESTIONS.reading.visualPerception).toHaveLength(2);
  });

  it('uses writing/both cause question sets from the sheet', () => {
    expect(STEP03_QUESTIONS.writing.phonology).toHaveLength(10);
    expect(STEP03_QUESTIONS.writing.eye).toHaveLength(3);
    expect(STEP03_QUESTIONS.writing.motor).toHaveLength(4);
    expect(STEP03_QUESTIONS.writing.visualPerception).toHaveLength(5);
    expect(STEP03_QUESTIONS.both.phonology).toHaveLength(10);
  });

  it('always has ASD/ADHD questions under current app factor names', () => {
    expect(STEP03_QUESTIONS.reading.rigidity).toHaveLength(4);
    expect(STEP03_QUESTIONS.reading.attention).toHaveLength(5);
  });
});

describe('calculateCandidateFactors', () => {
  it('selects only the factors attached to the answered reading symptom', () => {
    const factors = calculateCandidateFactors('reading', { r1: true });
    expect(factors).toEqual(['phonology', 'eye', 'automation', 'rigidity', 'attention']);
    expect(factors).not.toContain('motor');
  });

  it('adds visual perception for reading symptoms that include it', () => {
    const factors = calculateCandidateFactors('reading', { r2: true });
    expect(factors).toEqual([
      'phonology',
      'eye',
      'visualPerception',
      'automation',
      'rigidity',
      'attention',
    ]);
  });

  it('uses the sheet factor mapping for writing copy symptoms', () => {
    const factors = calculateCandidateFactors('writing', { w2: true });
    expect(factors).toEqual(['eye', 'motor', 'visualPerception', 'rigidity', 'attention']);
  });

  it('counts positive wording as a concern when the answer is no', () => {
    const factors = calculateCandidateFactors('writing', { w4: false });
    expect(factors).toContain('phonology');
    expect(factors).toContain('eye');
    expect(factors).toContain('motor');
    expect(factors).toContain('visualPerception');
    expect(factors).toContain('automation');
  });

  it('uses the dedicated both block instead of concatenating reading and writing ids', () => {
    const factors = calculateCandidateFactors('both', { b8: true });
    expect(factors).toEqual(['eye', 'motor', 'visualPerception', 'rigidity', 'attention']);
  });

  it('always asks current-app ASD/ADHD factors even without symptom matches', () => {
    const factors = calculateCandidateFactors('reading', {});
    expect(factors).toEqual(['rigidity', 'attention']);
  });
});

describe('calculateResultFactors', () => {
  it('returns a factor once its score reaches 5', () => {
    const factors = calculateResultFactors('reading', ['phonology'], {
      'phonology-shiritori': false,
    });
    expect(factors).toEqual(['phonology']);
  });

  it('uses sheet scores and positive wording for writing phonology', () => {
    const factors = calculateResultFactors('writing', ['phonology'], {
      'phonology-kana-write': false,
    });
    expect(factors).toEqual(['phonology']);
  });

  it('returns automation only when no non-automation factor reaches 5', () => {
    const factors = calculateResultFactors('reading', ['phonology', 'rigidity', 'attention'], {});
    expect(factors).toEqual(['automation']);
  });

  it('returns multiple factors when multiple causes reach 5', () => {
    const factors = calculateResultFactors('reading', ['phonology', 'eye'], {
      'phonology-shiritori': false,
      'eye-line-skip': true,
    });
    expect(factors).toEqual(['phonology', 'eye']);
  });
});

describe('STEP03 early skip', () => {
  it('skips the remaining questions for a factor after it reaches 5', () => {
    const questions = getStep03Questions('reading', ['phonology', 'eye']);
    const nextIndex = getNextStep03Index(
      'reading',
      ['phonology', 'eye'],
      { 'phonology-shiritori': false },
      1,
    );

    expect(questions[nextIndex].factor).toBe('eye');
  });

  it('continues the same factor when the threshold has not been reached', () => {
    const questions = getStep03Questions('reading', ['phonology', 'eye']);
    const nextIndex = getNextStep03Index(
      'reading',
      ['phonology', 'eye'],
      { 'phonology-shiritori': true },
      1,
    );

    expect(questions[nextIndex].factor).toBe('phonology');
  });
});

describe('determineSpecialist', () => {
  it('returns ST for phonology', () => {
    expect(determineSpecialist(['phonology'])).toBe('ST');
  });

  it('returns ST for automation', () => {
    expect(determineSpecialist(['automation'])).toBe('ST');
  });

  it('returns OT for motor', () => {
    expect(determineSpecialist(['motor'])).toBe('OT');
  });

  it('returns both for eye', () => {
    expect(determineSpecialist(['eye'])).toBe('both');
  });

  it('returns both for visualPerception', () => {
    expect(determineSpecialist(['visualPerception'])).toBe('both');
  });
});

describe('getDifficultyTypeLabel', () => {
  it('returns labels for each difficulty type', () => {
    expect(getDifficultyTypeLabel('writing')).toBe('書く');
    expect(getDifficultyTypeLabel('reading')).toBe('読む');
    expect(getDifficultyTypeLabel('both')).toBe('書く・読む');
    expect(getDifficultyTypeLabel(null)).toBe('');
  });
});

describe('getSpecialistLabel', () => {
  it('returns labels for each specialist type', () => {
    expect(getSpecialistLabel('ST')).toBe('言語聴覚士（ST）');
    expect(getSpecialistLabel('OT')).toBe('作業療法士（OT）');
    expect(getSpecialistLabel('both')).toBe('作業療法士（OT）・言語聴覚士（ST）');
    expect(getSpecialistLabel(null)).toBe('');
  });
});

describe('FACTOR_NAMES', () => {
  it('keeps current app labels for ASD/ADHD factors', () => {
    expect(FACTOR_NAMES.phonology).toBe('音韻');
    expect(FACTOR_NAMES.eye).toBe('眼球運動');
    expect(FACTOR_NAMES.motor).toBe('運動');
    expect(FACTOR_NAMES.visualPerception).toBe('視知覚');
    expect(FACTOR_NAMES.rigidity).toBe('こだわり');
    expect(FACTOR_NAMES.attention).toBe('注意');
    expect(FACTOR_NAMES.automation).toBe('自動化');
  });
});

describe('getDevelopmentalNote', () => {
  it('returns note when resultFactors includes current-app ASD/ADHD factors', () => {
    expect(getDevelopmentalNote(['rigidity'])).toBe(
      'こだわり/注意力が読み書きに影響を与えている可能性があります。',
    );
    expect(getDevelopmentalNote(['attention'])).toBe(
      'こだわり/注意力が読み書きに影響を与えている可能性があります。',
    );
  });

  it('returns empty string when resultFactors has neither', () => {
    expect(getDevelopmentalNote(['phonology', 'eye'])).toBe('');
    expect(getDevelopmentalNote([])).toBe('');
  });
});
