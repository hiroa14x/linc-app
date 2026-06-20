import { describe, expect, it } from 'vitest';

import {
  calculateCandidateFactors,
  calculateFactorScore,
  calculateResultFactors,
  determineSpecialist,
  FACTOR_NAMES,
  getDatasetKey,
  getDevelopmentalNote,
  getDifficultyTypeLabel,
  getGradeLevelLabel,
  getNextStep03Index,
  getSchoolTerm,
  getSchoolTermLabel,
  getSpecialistLabel,
  getStep02Questions,
  getStep03Questions,
  SCREENING_DATASETS,
  ScreeningDatasetKey,
} from './screening-context';

const ALL_FACTORS = [
  'phonology',
  'eye',
  'motor',
  'visualPerception',
  'rigidity',
  'attention',
] as const;

describe('school term and dataset selection', () => {
  it('uses April through September as the first term', () => {
    expect(getSchoolTerm(new Date(2026, 3, 1))).toBe('first');
    expect(getSchoolTerm(new Date(2026, 8, 30))).toBe('first');
  });

  it('uses October through March as the second term', () => {
    expect(getSchoolTerm(new Date(2026, 9, 1))).toBe('second');
    expect(getSchoolTerm(new Date(2027, 2, 31))).toBe('second');
  });

  it('only exposes datasets that exist in the sheet', () => {
    expect(getDatasetKey('kindergarten', 'first')).toBeNull();
    expect(getDatasetKey('kindergarten', 'second')).toBe('kindergarten-second');
    expect(getDatasetKey('grade1', 'first')).toBe('grade1-first');
    expect(getDatasetKey('grade1', 'second')).toBe('grade1-second');
    expect(getDatasetKey('grade2', 'first')).toBeNull();
    expect(getDatasetKey('grade6', 'second')).toBeNull();
  });
});

describe('STEP02 questions by dataset', () => {
  it.each([
    ['kindergarten-second', 3, 3, 6],
    ['grade1-first', 7, 8, 15],
    ['grade1-second', 6, 8, 14],
  ] as const)('%s uses the sheet-specific symptom counts', (datasetKey, reading, writing, both) => {
    expect(getStep02Questions(datasetKey, 'reading')).toHaveLength(reading);
    expect(getStep02Questions(datasetKey, 'writing')).toHaveLength(writing);
    expect(getStep02Questions(datasetKey, 'both')).toHaveLength(both);
  });

  it('counts a positive kindergarten ability question when the answer is no', () => {
    const datasetKey = 'kindergarten-second';
    const question = getStep02Questions(datasetKey, 'reading')[0];
    const factors = calculateCandidateFactors(datasetKey, 'reading', {
      [question.id]: false,
    });

    expect(factors).toEqual([
      'phonology',
      'eye',
      'visualPerception',
      'automation',
      'rigidity',
      'attention',
    ]);
  });

  it('always asks current-app ASD/ADHD factors without symptom matches', () => {
    expect(calculateCandidateFactors('grade1-first', 'reading', {})).toEqual([
      'rigidity',
      'attention',
    ]);
  });
});

describe('STEP03 questions by dataset', () => {
  it.each([
    'kindergarten-second',
    'grade1-first',
    'grade1-second',
  ] as ScreeningDatasetKey[])('%s does not ask motor questions for reading', (datasetKey) => {
    const questions = getStep03Questions(datasetKey, 'reading', ['motor']);
    expect(questions).toHaveLength(0);
  });

  it('uses the 小1前半 cause rows and scores', () => {
    const dataset = SCREENING_DATASETS['grade1-first'];
    const writingQuestions = dataset.step03.writing;

    expect(writingQuestions.filter((question) => question.factors.includes('phonology'))).toHaveLength(8);
    expect(writingQuestions.filter((question) => question.factors.includes('visualPerception'))).toHaveLength(6);

    const eyeQuestions = getStep03Questions('grade1-first', 'reading', ['eye']);
    expect(eyeQuestions.map((question) => question.score)).toEqual([3, 3, 2]);
  });

  it('uses three ADHD questions for 年長後半 and five for 小1', () => {
    expect(getStep03Questions('kindergarten-second', 'reading', ['attention'])).toHaveLength(3);
    expect(getStep03Questions('grade1-first', 'reading', ['attention'])).toHaveLength(5);
    expect(getStep03Questions('grade1-second', 'reading', ['attention'])).toHaveLength(5);
  });
});

describe('visual perception and eye shared scoring', () => {
  it('asks shared 年長後半 questions once', () => {
    const questions = getStep03Questions(
      'kindergarten-second',
      'reading',
      ['eye', 'visualPerception'],
    );
    const shared = questions.filter(
      (question) =>
        question.factors.includes('eye') && question.factors.includes('visualPerception'),
    );

    expect(shared).toHaveLength(2);
    expect(new Set(questions.map((question) => question.id)).size).toBe(questions.length);
  });

  it('adds shared question scores to both factors', () => {
    const shared = getStep03Questions(
      'kindergarten-second',
      'reading',
      ['eye', 'visualPerception'],
    ).filter(
      (question) =>
        question.factors.includes('eye') && question.factors.includes('visualPerception'),
    );
    const answers = Object.fromEntries(shared.map((question) => [question.id, true]));

    expect(calculateFactorScore('kindergarten-second', 'reading', 'eye', answers)).toBe(5);
    expect(
      calculateFactorScore('kindergarten-second', 'reading', 'visualPerception', answers),
    ).toBe(5);
    expect(
      calculateResultFactors(
        'kindergarten-second',
        'reading',
        ['eye', 'visualPerception'],
        answers,
      ),
    ).toEqual(['eye', 'visualPerception']);
  });
});

describe('scores and early skip', () => {
  it('requires the 小1前半 eye scores to total at least 5', () => {
    const eyeQuestions = getStep03Questions('grade1-first', 'reading', ['eye']);
    const oneAnswer = { [eyeQuestions[0].id]: true };
    const twoAnswers = { ...oneAnswer, [eyeQuestions[1].id]: true };

    expect(calculateResultFactors('grade1-first', 'reading', ['eye'], oneAnswer)).toEqual([
      'automation',
    ]);
    expect(calculateResultFactors('grade1-first', 'reading', ['eye'], twoAnswers)).toEqual([
      'eye',
    ]);
  });

  it('skips remaining questions for a factor after it reaches 5', () => {
    const questions = getStep03Questions('grade1-second', 'reading', ['phonology', 'eye']);
    const firstQuestion = questions[0];
    const nextIndex = getNextStep03Index(
      'grade1-second',
      'reading',
      ['phonology', 'eye'],
      { [firstQuestion.id]: false },
      1,
    );

    expect(questions[nextIndex].factors).toContain('eye');
    expect(questions[nextIndex].factors).not.toContain('phonology');
  });

  it('returns automation only when no non-automation factor reaches 5', () => {
    expect(
      calculateResultFactors(
        'grade1-second',
        'reading',
        ['phonology', 'rigidity', 'attention'],
        {},
      ),
    ).toEqual(['automation']);
  });
});

describe('determineSpecialist', () => {
  it('maps the sheet factors to the requested specialists', () => {
    expect(determineSpecialist(['phonology'])).toBe('ST');
    expect(determineSpecialist(['automation'])).toBe('ST');
    expect(determineSpecialist(['motor'])).toBe('OT');
    expect(determineSpecialist(['eye'])).toBe('both');
    expect(determineSpecialist(['visualPerception'])).toBe('both');
  });
});

describe('labels', () => {
  it('returns labels for each difficulty and specialist type', () => {
    expect(getDifficultyTypeLabel('writing')).toBe('書く');
    expect(getDifficultyTypeLabel('reading')).toBe('読む');
    expect(getDifficultyTypeLabel('both')).toBe('書く・読む');
    expect(getSpecialistLabel('ST')).toBe('言語聴覚士（ST）');
    expect(getSpecialistLabel('OT')).toBe('作業療法士（OT）');
    expect(getSpecialistLabel('both')).toBe('作業療法士（OT）・言語聴覚士（ST）');
  });

  it('returns labels for the selected grade and school term', () => {
    expect(getGradeLevelLabel('kindergarten')).toBe('年長');
    expect(getGradeLevelLabel('grade1')).toBe('小学1年生');
    expect(getSchoolTermLabel('first')).toBe('前半');
    expect(getSchoolTermLabel('second')).toBe('後半');
  });

  it('keeps current app factor labels', () => {
    expect(ALL_FACTORS.map((factor) => FACTOR_NAMES[factor])).toEqual([
      '音韻',
      '眼球運動',
      '運動',
      '視知覚',
      'こだわり',
      '注意',
    ]);
    expect(FACTOR_NAMES.automation).toBe('自動化');
  });
});

describe('getDevelopmentalNote', () => {
  it('returns a note only for current-app ASD/ADHD factors', () => {
    expect(getDevelopmentalNote(['rigidity'])).toBe(
      'こだわり/注意力が読み書きに影響を与えている可能性があります。',
    );
    expect(getDevelopmentalNote(['attention'])).not.toBe('');
    expect(getDevelopmentalNote(['phonology', 'eye'])).toBe('');
  });
});
