import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  DifficultyKey,
  DifficultyType,
  FactorType,
  GradeLevel,
  GRADE_LABELS,
  SCREENING_DATASETS,
  SchoolTerm,
  ScreeningDatasetKey,
  Step02Question,
  Step03Question,
  TERM_LABELS,
} from './screening-data';

export {
  GRADE_LEVELS,
  GRADE_LABELS,
  SCREENING_DATASETS,
  TERM_LABELS,
  getDatasetKey,
  getSchoolTerm,
} from './screening-data';
export type {
  CountWhen,
  DifficultyKey,
  DifficultyType,
  FactorType,
  GradeLevel,
  SchoolTerm,
  ScreeningDatasetKey,
  Step02Question,
  Step03Question,
} from './screening-data';

export type SpecialistType = 'ST' | 'OT' | 'both' | null;

const FACTOR_ORDER: FactorType[] = [
  'phonology',
  'eye',
  'motor',
  'visualPerception',
  'automation',
  'rigidity',
  'attention',
];

const ALWAYS_ASK_FACTORS: FactorType[] = ['rigidity', 'attention'];
const SCORE_THRESHOLD = 5;

export const FACTOR_NAMES: Record<FactorType, string> = {
  phonology: '音韻',
  eye: '眼球運動',
  motor: '運動',
  visualPerception: '視知覚',
  rigidity: 'こだわり',
  attention: '注意',
  automation: '自動化',
};

interface ScreeningState {
  gradeLevel: GradeLevel | null;
  schoolTerm: SchoolTerm | null;
  datasetKey: ScreeningDatasetKey | null;
  difficultyType: DifficultyType;
  step02Answers: Record<string, boolean>;
  step03Answers: Record<string, boolean>;
  candidateFactors: FactorType[];
  resultFactors: FactorType[];
  specialist: SpecialistType;
  currentStep: 'onboarding' | 'grade' | 'step01' | 'step02' | 'step03' | 'result';
  step02Index: number;
  step03Index: number;
  isLoading: boolean;
}

type ScreeningAction =
  | {
      type: 'SET_GRADE_SELECTION';
      payload: {
        gradeLevel: GradeLevel;
        schoolTerm: SchoolTerm;
        datasetKey: ScreeningDatasetKey;
      };
    }
  | { type: 'SET_DIFFICULTY_TYPE'; payload: DifficultyType }
  | { type: 'SET_STEP02_ANSWER'; payload: { id: string; value: boolean } }
  | { type: 'SET_STEP03_ANSWER'; payload: { id: string; value: boolean } }
  | { type: 'SET_STEP03_ANSWERS'; payload: Record<string, boolean> }
  | { type: 'SET_CANDIDATE_FACTORS'; payload: FactorType[] }
  | { type: 'SET_RESULT_FACTORS'; payload: FactorType[] }
  | { type: 'SET_SPECIALIST'; payload: SpecialistType }
  | { type: 'SET_CURRENT_STEP'; payload: ScreeningState['currentStep'] }
  | { type: 'SET_STEP02_INDEX'; payload: number }
  | { type: 'SET_STEP03_INDEX'; payload: number }
  | { type: 'RESET' }
  | { type: 'LOAD_STATE'; payload: Partial<ScreeningState> }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: ScreeningState = {
  gradeLevel: null,
  schoolTerm: null,
  datasetKey: null,
  difficultyType: null,
  step02Answers: {},
  step03Answers: {},
  candidateFactors: [],
  resultFactors: [],
  specialist: null,
  currentStep: 'onboarding',
  step02Index: 0,
  step03Index: 0,
  isLoading: true,
};

function screeningReducer(state: ScreeningState, action: ScreeningAction): ScreeningState {
  switch (action.type) {
    case 'SET_GRADE_SELECTION':
      return {
        ...state,
        ...action.payload,
        difficultyType: null,
        step02Answers: {},
        step03Answers: {},
        candidateFactors: [],
        resultFactors: [],
        specialist: null,
        step02Index: 0,
        step03Index: 0,
      };
    case 'SET_DIFFICULTY_TYPE':
      return {
        ...state,
        difficultyType: action.payload,
        step02Answers: {},
        step03Answers: {},
        candidateFactors: [],
        resultFactors: [],
        specialist: null,
        step02Index: 0,
        step03Index: 0,
      };
    case 'SET_STEP02_ANSWER':
      return {
        ...state,
        step02Answers: { ...state.step02Answers, [action.payload.id]: action.payload.value },
      };
    case 'SET_STEP03_ANSWER':
      return {
        ...state,
        step03Answers: { ...state.step03Answers, [action.payload.id]: action.payload.value },
      };
    case 'SET_STEP03_ANSWERS':
      return { ...state, step03Answers: action.payload };
    case 'SET_CANDIDATE_FACTORS':
      return { ...state, candidateFactors: action.payload };
    case 'SET_RESULT_FACTORS':
      return { ...state, resultFactors: action.payload };
    case 'SET_SPECIALIST':
      return { ...state, specialist: action.payload };
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_STEP02_INDEX':
      return { ...state, step02Index: action.payload };
    case 'SET_STEP03_INDEX':
      return { ...state, step03Index: action.payload };
    case 'RESET':
      return { ...initialState, isLoading: false };
    case 'LOAD_STATE':
      return { ...state, ...action.payload, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

const ScreeningContext = createContext<{
  state: ScreeningState;
  dispatch: React.Dispatch<ScreeningAction>;
} | null>(null);

const STORAGE_KEY = 'linc_screening_state';

function normalizeSavedState(savedState: Partial<ScreeningState>): Partial<ScreeningState> {
  if (savedState.datasetKey && savedState.gradeLevel && savedState.schoolTerm) {
    return savedState;
  }

  // 旧版とは質問IDが異なるため、保存済み回答を混在させず学年選択から再開する。
  return {
    gradeLevel: null,
    schoolTerm: null,
    datasetKey: null,
    difficultyType: null,
    step02Answers: {},
    step03Answers: {},
    candidateFactors: [],
    resultFactors: [],
    specialist: null,
    step02Index: 0,
    step03Index: 0,
    currentStep: savedState.currentStep === 'onboarding' ? 'onboarding' : 'grade',
  };
}

export function ScreeningProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(screeningReducer, initialState);

  useEffect(() => {
    const loadState = async () => {
      try {
        const savedState = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedState) {
          const parsed = JSON.parse(savedState) as Partial<ScreeningState>;
          dispatch({ type: 'LOAD_STATE', payload: normalizeSavedState(parsed) });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    loadState();
  }, []);

  useEffect(() => {
    if (!state.isLoading) {
      const saveState = async () => {
        try {
          const { isLoading, ...stateToSave } = state;
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        } catch {
          // 保存エラーは無視
        }
      };
      saveState();
    }
  }, [state]);

  return (
    <ScreeningContext.Provider value={{ state, dispatch }}>
      {children}
    </ScreeningContext.Provider>
  );
}

export function useScreening() {
  const context = useContext(ScreeningContext);
  if (!context) {
    throw new Error('useScreening must be used within a ScreeningProvider');
  }
  return context;
}

function isDifficultyKey(type: DifficultyType): type is DifficultyKey {
  return type === 'reading' || type === 'writing' || type === 'both';
}

function answerCounts(
  countsWhen: Step02Question['countsWhen'] | Step03Question['countsWhen'],
  value: boolean | undefined,
): boolean {
  if (value === undefined) return false;
  return (countsWhen ?? 'yes') === 'yes' ? value : !value;
}

function getDataset(datasetKey: ScreeningDatasetKey | null) {
  return datasetKey ? SCREENING_DATASETS[datasetKey] : null;
}

export function getStep02Questions(
  datasetKey: ScreeningDatasetKey | null,
  difficultyType: DifficultyType,
): Step02Question[] {
  const dataset = getDataset(datasetKey);
  if (!dataset || !isDifficultyKey(difficultyType)) return [];
  return dataset.step02[difficultyType];
}

export function getStep03Questions(
  datasetKey: ScreeningDatasetKey | null,
  difficultyType: DifficultyType,
  candidateFactors: FactorType[],
): Step03Question[] {
  const dataset = getDataset(datasetKey);
  if (!dataset || !isDifficultyKey(difficultyType)) return [];

  const candidateSet = new Set<FactorType>(
    candidateFactors.filter((factor) => factor !== 'automation'),
  );
  return dataset.step03[difficultyType].filter((question) =>
    question.factors.some((factor) => candidateSet.has(factor)),
  );
}

export function calculateCandidateFactors(
  datasetKey: ScreeningDatasetKey | null,
  difficultyType: DifficultyType,
  answers: Record<string, boolean>,
): FactorType[] {
  const questions = getStep02Questions(datasetKey, difficultyType);
  const factors = new Set<FactorType>();

  for (const question of questions) {
    if (!answerCounts(question.countsWhen, answers[question.id])) continue;
    for (const factor of question.factors) {
      factors.add(factor);
    }
  }

  for (const factor of ALWAYS_ASK_FACTORS) {
    factors.add(factor);
  }

  return FACTOR_ORDER.filter((factor) => factors.has(factor));
}

export function calculateFactorScore(
  datasetKey: ScreeningDatasetKey | null,
  difficultyType: DifficultyType,
  factor: FactorType,
  answers: Record<string, boolean>,
): number {
  const dataset = getDataset(datasetKey);
  if (!dataset || !isDifficultyKey(difficultyType) || factor === 'automation') return 0;

  return dataset.step03[difficultyType].reduce((total, question) => {
    if (!question.factors.includes(factor)) return total;
    return total + (answerCounts(question.countsWhen, answers[question.id]) ? question.score : 0);
  }, 0);
}

export function factorReachedThreshold(
  datasetKey: ScreeningDatasetKey | null,
  difficultyType: DifficultyType,
  factor: FactorType,
  answers: Record<string, boolean>,
): boolean {
  return calculateFactorScore(datasetKey, difficultyType, factor, answers) >= SCORE_THRESHOLD;
}

function questionHasUnresolvedFactor(
  datasetKey: ScreeningDatasetKey | null,
  difficultyType: DifficultyType,
  question: Step03Question,
  candidateFactors: FactorType[],
  answers: Record<string, boolean>,
): boolean {
  return question.factors.some(
    (factor) =>
      factor !== 'automation' &&
      candidateFactors.includes(factor) &&
      !factorReachedThreshold(datasetKey, difficultyType, factor, answers),
  );
}

export function getNextStep03Index(
  datasetKey: ScreeningDatasetKey | null,
  difficultyType: DifficultyType,
  candidateFactors: FactorType[],
  answers: Record<string, boolean>,
  fromIndex: number,
): number {
  const questions = getStep03Questions(datasetKey, difficultyType, candidateFactors);

  for (let index = fromIndex; index < questions.length; index += 1) {
    if (
      questionHasUnresolvedFactor(
        datasetKey,
        difficultyType,
        questions[index],
        candidateFactors,
        answers,
      )
    ) {
      return index;
    }
  }

  return -1;
}

export function getPreviousAnsweredStep03Index(
  datasetKey: ScreeningDatasetKey | null,
  difficultyType: DifficultyType,
  candidateFactors: FactorType[],
  answers: Record<string, boolean>,
  fromIndex: number,
): number {
  const questions = getStep03Questions(datasetKey, difficultyType, candidateFactors);

  for (let index = fromIndex - 1; index >= 0; index -= 1) {
    if (answers[questions[index].id] !== undefined) {
      return index;
    }
  }

  return -1;
}

export function pruneStep03AnswersAfterIndex(
  datasetKey: ScreeningDatasetKey | null,
  difficultyType: DifficultyType,
  candidateFactors: FactorType[],
  answers: Record<string, boolean>,
  index: number,
): Record<string, boolean> {
  const keepIds = new Set(
    getStep03Questions(datasetKey, difficultyType, candidateFactors)
      .slice(0, index + 1)
      .map((question) => question.id),
  );

  return Object.fromEntries(
    Object.entries(answers).filter(([questionId]) => keepIds.has(questionId)),
  );
}

export function calculateResultFactors(
  datasetKey: ScreeningDatasetKey | null,
  difficultyType: DifficultyType,
  candidateFactors: FactorType[],
  answers: Record<string, boolean>,
): FactorType[] {
  const resultFactors = candidateFactors.filter(
    (factor) =>
      factor !== 'automation' &&
      factorReachedThreshold(datasetKey, difficultyType, factor, answers),
  );

  if (resultFactors.length === 0) {
    resultFactors.push('automation');
  }

  return resultFactors;
}

export function determineSpecialist(factors: FactorType[]): SpecialistType {
  const needsST =
    factors.includes('phonology') ||
    factors.includes('automation') ||
    factors.includes('eye') ||
    factors.includes('visualPerception');
  const needsOT =
    factors.includes('motor') || factors.includes('eye') || factors.includes('visualPerception');

  if (needsST && needsOT) return 'both';
  if (needsST) return 'ST';
  if (needsOT) return 'OT';
  return null;
}

export function getDifficultyTypeLabel(type: DifficultyType): string {
  switch (type) {
    case 'writing':
      return '書く';
    case 'reading':
      return '読む';
    case 'both':
      return '書く・読む';
    default:
      return '';
  }
}

export function getGradeLevelLabel(gradeLevel: GradeLevel | null): string {
  return gradeLevel ? GRADE_LABELS[gradeLevel] : '';
}

export function getSchoolTermLabel(schoolTerm: SchoolTerm | null): string {
  return schoolTerm ? TERM_LABELS[schoolTerm] : '';
}

export function getSpecialistLabel(specialist: SpecialistType): string {
  switch (specialist) {
    case 'ST':
      return '言語聴覚士（ST）';
    case 'OT':
      return '作業療法士（OT）';
    case 'both':
      return '作業療法士（OT）・言語聴覚士（ST）';
    default:
      return '';
  }
}

export function getDevelopmentalNote(resultFactors: FactorType[]): string {
  const hasRigidityOrAttention =
    resultFactors.includes('rigidity') || resultFactors.includes('attention');
  return hasRigidityOrAttention
    ? 'こだわり/注意力が読み書きに影響を与えている可能性があります。'
    : '';
}
