import { describe, it, expect } from 'vitest';
import {
  calculateCandidateFactors,
  calculateResultFactors,
  determineSpecialist,
  getDifficultyTypeLabel,
  getSpecialistLabel,
  STEP02_QUESTIONS,
  STEP03_QUESTIONS,
  FACTOR_NAMES,
} from './screening-context';

describe('STEP02 Questions', () => {
  it('should have 6 writing questions', () => {
    expect(STEP02_QUESTIONS.writing).toHaveLength(6);
  });

  it('should have 5 reading questions', () => {
    expect(STEP02_QUESTIONS.reading).toHaveLength(5);
  });
});

describe('STEP03 Questions', () => {
  it('should have 6 phonology questions', () => {
    expect(STEP03_QUESTIONS.phonology).toHaveLength(6);
  });

  it('should have 3 eye questions', () => {
    expect(STEP03_QUESTIONS.eye).toHaveLength(3);
  });

  it('should have 4 motor questions', () => {
    expect(STEP03_QUESTIONS.motor).toHaveLength(4);
  });

  it('should have 5 visualPerception questions', () => {
    expect(STEP03_QUESTIONS.visualPerception).toHaveLength(5);
  });

  it('should have 0 automation questions', () => {
    expect(STEP03_QUESTIONS.automation).toHaveLength(0);
  });
});

describe('calculateCandidateFactors', () => {
  describe('writing difficulty', () => {
    it('should return all factors when w1 (blackboard) is true', () => {
      const factors = calculateCandidateFactors('writing', { w1: true });
      expect(factors).toContain('phonology');
      expect(factors).toContain('eye');
      expect(factors).toContain('motor');
      expect(factors).toContain('visualPerception');
      expect(factors).toContain('automation');
    });

    it('should return all factors when w4 (50音表書けない) is true', () => {
      const factors = calculateCandidateFactors('writing', { w4: true });
      expect(factors).toContain('phonology');
      expect(factors).toContain('eye');
      expect(factors).toContain('motor');
      expect(factors).toContain('visualPerception');
      expect(factors).toContain('automation');
    });

    it('should return all factors when w5 (名前書けない) is true', () => {
      const factors = calculateCandidateFactors('writing', { w5: true });
      expect(factors).toContain('phonology');
      expect(factors).toContain('eye');
      expect(factors).toContain('motor');
      expect(factors).toContain('visualPerception');
      expect(factors).toContain('automation');
    });

    it('should return all factors when w6 (書くのを嫌がる) is true', () => {
      const factors = calculateCandidateFactors('writing', { w6: true });
      expect(factors).toContain('phonology');
      expect(factors).toContain('eye');
      expect(factors).toContain('motor');
      expect(factors).toContain('visualPerception');
      expect(factors).toContain('automation');
    });

    it('should return eye/motor/visualPerception when only w2 (図形模写) is true', () => {
      const factors = calculateCandidateFactors('writing', { w2: true });
      expect(factors).toContain('eye');
      expect(factors).toContain('motor');
      expect(factors).toContain('visualPerception');
      expect(factors).not.toContain('phonology');
      expect(factors).not.toContain('automation');
    });

    it('should return eye/motor/visualPerception when only w3 (枠からはみ出る) is true', () => {
      const factors = calculateCandidateFactors('writing', { w3: true });
      expect(factors).toContain('eye');
      expect(factors).toContain('motor');
      expect(factors).toContain('visualPerception');
      expect(factors).not.toContain('phonology');
      expect(factors).not.toContain('automation');
    });

    it('should return only automation when all answers are false', () => {
      const factors = calculateCandidateFactors('writing', {});
      expect(factors).toEqual(['automation']);
    });
  });

  describe('reading difficulty', () => {
    it('should return all factors when r2 (50音表読めない) is true', () => {
      const factors = calculateCandidateFactors('reading', { r2: true });
      expect(factors).toContain('phonology');
      expect(factors).toContain('eye');
      expect(factors).toContain('motor');
      expect(factors).toContain('visualPerception');
      expect(factors).toContain('automation');
    });

    it('should return all factors when r3 (読むのを嫌がる) is true', () => {
      const factors = calculateCandidateFactors('reading', { r3: true });
      expect(factors).toContain('phonology');
      expect(factors).toContain('eye');
      expect(factors).toContain('motor');
      expect(factors).toContain('visualPerception');
      expect(factors).toContain('automation');
    });

    it('should return all factors when r4 (逐次読み) is true', () => {
      const factors = calculateCandidateFactors('reading', { r4: true });
      expect(factors).toContain('phonology');
      expect(factors).toContain('eye');
      expect(factors).toContain('motor');
      expect(factors).toContain('visualPerception');
      expect(factors).toContain('automation');
    });

    it('should return all factors when r5 (助詞が苦手) is true', () => {
      const factors = calculateCandidateFactors('reading', { r5: true });
      expect(factors).toContain('phonology');
      expect(factors).toContain('eye');
      expect(factors).toContain('motor');
      expect(factors).toContain('visualPerception');
      expect(factors).toContain('automation');
    });

    it('should return phonology/eye/motor/automation when only r1 (指で追いながら読む) is true', () => {
      const factors = calculateCandidateFactors('reading', { r1: true });
      expect(factors).toContain('phonology');
      expect(factors).toContain('eye');
      expect(factors).toContain('motor');
      expect(factors).toContain('automation');
      expect(factors).not.toContain('visualPerception');
    });

    it('should return only automation when all answers are false', () => {
      const factors = calculateCandidateFactors('reading', {});
      expect(factors).toEqual(['automation']);
    });
  });

  describe('both difficulty', () => {
    it('should combine factors from both writing and reading', () => {
      const factors = calculateCandidateFactors('both', { w2: true, r1: true });
      expect(factors).toContain('eye');
      expect(factors).toContain('motor');
      expect(factors).toContain('visualPerception');
      expect(factors).toContain('phonology');
      expect(factors).toContain('automation');
    });
  });
});

describe('calculateResultFactors', () => {
  it('should return phonology when score >= 5', () => {
    // p1 has score 5
    const factors = calculateResultFactors(['phonology'], { p1: true });
    expect(factors).toContain('phonology');
  });

  it('should return automation when no factor reaches 5 points', () => {
    // p3 has score 2, not enough
    const factors = calculateResultFactors(['phonology'], { p3: true });
    expect(factors).toEqual(['automation']);
  });

  it('should return multiple factors when multiple reach 5 points', () => {
    // p1 (phonology) = 5, e1 (eye) = 5
    const factors = calculateResultFactors(['phonology', 'eye'], { p1: true, e1: true });
    expect(factors).toContain('phonology');
    expect(factors).toContain('eye');
  });

  it('should return automation when candidate only contains automation', () => {
    const factors = calculateResultFactors(['automation'], {});
    expect(factors).toEqual(['automation']);
  });
});

describe('determineSpecialist', () => {
  it('should return ST for phonology', () => {
    expect(determineSpecialist(['phonology'])).toBe('ST');
  });

  it('should return ST for automation', () => {
    expect(determineSpecialist(['automation'])).toBe('ST');
  });

  it('should return OT for eye', () => {
    expect(determineSpecialist(['eye'])).toBe('OT');
  });

  it('should return OT for motor', () => {
    expect(determineSpecialist(['motor'])).toBe('OT');
  });

  it('should return OT for visualPerception', () => {
    expect(determineSpecialist(['visualPerception'])).toBe('OT');
  });

  it('should return both for phonology and eye', () => {
    expect(determineSpecialist(['phonology', 'eye'])).toBe('both');
  });

  it('should return both for automation and motor', () => {
    expect(determineSpecialist(['automation', 'motor'])).toBe('both');
  });
});

describe('getDifficultyTypeLabel', () => {
  it('should return 書く for writing', () => {
    expect(getDifficultyTypeLabel('writing')).toBe('書く');
  });

  it('should return 読む for reading', () => {
    expect(getDifficultyTypeLabel('reading')).toBe('読む');
  });

  it('should return 書く・読む for both', () => {
    expect(getDifficultyTypeLabel('both')).toBe('書く・読む');
  });

  it('should return empty string for null', () => {
    expect(getDifficultyTypeLabel(null)).toBe('');
  });
});

describe('getSpecialistLabel', () => {
  it('should return 言語聴覚士（ST） for ST', () => {
    expect(getSpecialistLabel('ST')).toBe('言語聴覚士（ST）');
  });

  it('should return 作業療法士（OT） for OT', () => {
    expect(getSpecialistLabel('OT')).toBe('作業療法士（OT）');
  });

  it('should return 作業療法士（OT）・言語聴覚士（ST） for both', () => {
    expect(getSpecialistLabel('both')).toBe('作業療法士（OT）・言語聴覚士（ST）');
  });

  it('should return empty string for null', () => {
    expect(getSpecialistLabel(null)).toBe('');
  });
});

describe('FACTOR_NAMES', () => {
  it('should have correct Japanese names', () => {
    expect(FACTOR_NAMES.phonology).toBe('音韻');
    expect(FACTOR_NAMES.eye).toBe('眼球運動');
    expect(FACTOR_NAMES.motor).toBe('運動');
    expect(FACTOR_NAMES.visualPerception).toBe('視知覚');
    expect(FACTOR_NAMES.automation).toBe('自動化');
  });
});
