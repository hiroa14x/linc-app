import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 苦手タイプ
export type DifficultyType = 'writing' | 'reading' | 'both' | null;

// 要因タイプ
export type FactorType = 'phonology' | 'eye' | 'motor' | 'visualPerception' | 'automation';

// 専門職タイプ
export type SpecialistType = 'ST' | 'OT' | 'both' | null;

// STEP02の設問
export const STEP02_QUESTIONS = {
  writing: [
    { id: 'w1', text: '黒板を書き写すのが苦手、または遅いですか？' },
    { id: 'w2', text: '図形や絵を見て、同じように書き写すのが苦手ですか？' },
    { id: 'w3', text: 'マス目や枠から、文字がはみ出すことがよくありますか？' },
    { id: 'w4', text: 'ひらがなの50音表を、何も見ずにすらすら書くことができますか？' },
    { id: 'w5', text: '自分の名前をひらがなで、何も見ずに正しく書けますか？' },
    { id: 'w6', text: '字を書くことを、嫌がりますか？' },
    { id: 'w7', text: 'ひらがな、カタカナを覚えるのに時間がかかりますか？' },
    { id: 'w8', text: '文字を書くのに、時間がかかりますか？' },
  ],
  reading: [
    { id: 'r1', text: '音読のとき、読む行を指で押さえながら読むことがよくありますか？' },
    { id: 'r2', text: 'ひらがなの50音表を、すらすら読むことができますか？' },
    { id: 'r3', text: '文字を読むことを、嫌がりますか？' },
    { id: 'r4', text: '読むときに、1文字ずつ区切るように読むことがよくありますか？' },
    { id: 'r5', text: '文末や助詞（は・が・を・に など）を正確に読むことが苦手ですか？' },
    { id: 'r6', text: '読み間違えや、勝手な推測で読んでしまうことが多いですか？' },
    { id: 'r7', text: '音読で、つっかえることがよくありますか？' },
  ],
};

// STEP03の設問（要因別）
export const STEP03_QUESTIONS: Record<FactorType, { id: string; text: string; score: number }[]> = {
  phonology: [
    { id: 'p1', text: 'しりとりができますか？', score: 5 },
    { id: 'p2', text: '「りんご」は3文字、「しんぶんし」は5文字等、『ん』が入った時に文字数の把握が苦手ですか？', score: 5 },
    { id: 'p3', text: '「か」から始まる言葉を、5個以上言えますか？', score: 2 },
    { id: 'p4', text: '「ぐりこ」などの、音の数だけ進む遊びで正しい音の数だけ進めますか？', score: 5 },
    { id: 'p5', text: '「がっこう」「まって」などの小さい「っ」を書き間違えたり、書かないとこがありますか？', score: 2 },
    { id: 'p6', text: 'ひらがなを「あ」から「ん」まで、順番に言うことが難しいですか？', score: 5 },
    { id: 'p7', text: '単語の途中と音を答えることができますか？例:「からおけ」の2つ目の音は？答え:「ら」', score: 5 },
    { id: 'p8', text: '「さかな」を逆から言えますか？', score: 5 },
    { id: 'p9', text: '「うれも」を逆から言うことが難しいですか？', score: 5 },
  ],
  eye: [
    { id: 'e1', text: '読むときに、行を飛ばしたり同じ行をまた読んだりしますか？', score: 5 },
    { id: 'e2', text: 'ボールを受けるのが苦手ですか？', score: 2 },
    { id: 'e3', text: '動くものを目で追うのが苦手ですか？', score: 2 },
  ],
  motor: [
    { id: 'm1', text: '字を書くとき、指先より手首や腕を大きく動かしますか？', score: 5 },
    { id: 'm2', text: 'はさみで線に沿って切ったり、線をなぞったりする作業が苦手ですか？', score: 5 },
    { id: 'm3', text: '座って書いていると、体が動いて姿勢が崩れやすいですか？', score: 5 },
    { id: 'm4', text: '字を書くとき、筆圧が強すぎたり弱すぎたりしますか？', score: 2 },
  ],
  visualPerception: [
    { id: 'v1', text: '枠がないと、文字の大きさや位置がバラバラになりやすいですか？', score: 1 },
    { id: 'v2', text: '似た形の文字（例：さ/き、ぬ/め）を読み間違えることがよくありますか？', score: 5 },
    { id: 'v3', text: '目の前の物でも、探すのに時間がかかりますか？', score: 2 },
    { id: 'v4', text: '文字を左右反対（鏡文字）に書くことがありますか？', score: 5 },
    { id: 'v5', text: '書き順が毎回バラバラになりやすいですか？', score: 2 },
  ],
  automation: [],
};

// 要因の日本語名
export const FACTOR_NAMES: Record<FactorType, string> = {
  phonology: '音韻',
  eye: '眼球運動',
  motor: '運動',
  visualPerception: '視知覚',
  automation: '自動化',
};

interface ScreeningState {
  difficultyType: DifficultyType;
  step02Answers: Record<string, boolean>;
  step03Answers: Record<string, boolean>;
  candidateFactors: FactorType[];
  resultFactors: FactorType[];
  specialist: SpecialistType;
  currentStep: 'onboarding' | 'step01' | 'step02' | 'step03' | 'result';
  step02Index: number;
  step03Index: number;
  isLoading: boolean;
}

type ScreeningAction =
  | { type: 'SET_DIFFICULTY_TYPE'; payload: DifficultyType }
  | { type: 'SET_STEP02_ANSWER'; payload: { id: string; value: boolean } }
  | { type: 'SET_STEP03_ANSWER'; payload: { id: string; value: boolean } }
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
    case 'SET_DIFFICULTY_TYPE':
      return { ...state, difficultyType: action.payload };
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

export function ScreeningProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(screeningReducer, initialState);

  // 起動時に保存された状態を復元
  useEffect(() => {
    const loadState = async () => {
      try {
        const savedState = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedState) {
          const parsed = JSON.parse(savedState);
          dispatch({ type: 'LOAD_STATE', payload: parsed });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    loadState();
  }, []);

  // 状態が変更されたら保存
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

// STEP02で「NO」のときにカウントする設問（肯定形「できますか？」など）
const STEP02_INVERTED_IDS = new Set(['w4', 'w5', 'r2']);
// STEP03で「NO」のときにカウントする設問（肯定形「できますか？」など）
const STEP03_INVERTED_IDS = new Set(['p1', 'p3', 'p4', 'p7', 'p8']);

function step02Counts(answers: Record<string, boolean>, id: string): boolean {
  const v = answers[id];
  return STEP02_INVERTED_IDS.has(id) ? !v : !!v;
}

// STEP02の要因候補分類ロジック
export function calculateCandidateFactors(
  difficultyType: DifficultyType,
  answers: Record<string, boolean>
): FactorType[] {
  const factors = new Set<FactorType>();

  if (difficultyType === 'writing' || difficultyType === 'both') {
    // 書くの判定（w4,w5はNOでカウント）
    const w1 = step02Counts(answers, 'w1'); // 黒板を写すのが苦手
    const w2 = step02Counts(answers, 'w2'); // 図形模写が苦手
    const w3 = step02Counts(answers, 'w3'); // 枠からはみ出る
    const w4 = step02Counts(answers, 'w4'); // 50音表が書けない（NOでカウント）
    const w5 = step02Counts(answers, 'w5'); // 名前が書けない（NOでカウント）
    const w6 = step02Counts(answers, 'w6'); // 書くのを嫌がる

    if (w1 || w4 || w5 || w6) {
      // ①のパターン
      factors.add('phonology');
      factors.add('eye');
      factors.add('motor');
      factors.add('visualPerception');
      factors.add('automation');
    } else if (w2 || w3) {
      // ②のパターン
      factors.add('eye');
      factors.add('motor');
      factors.add('visualPerception');
    } else {
      // ③のパターン
      factors.add('automation');
    }
  }

  if (difficultyType === 'reading' || difficultyType === 'both') {
    // 読むの判定（r2はNOでカウント）
    const r1 = step02Counts(answers, 'r1'); // 指で追いながら読む
    const r2 = step02Counts(answers, 'r2'); // 50音表が読めない（NOでカウント）
    const r3 = step02Counts(answers, 'r3'); // 読むのを嫌がる
    const r4 = step02Counts(answers, 'r4'); // 逐次読み
    const r5 = step02Counts(answers, 'r5'); // 助詞が苦手

    if (r2 || r3 || r4 || r5) {
      // ①のパターン
      factors.add('phonology');
      factors.add('eye');
      factors.add('motor');
      factors.add('visualPerception');
      factors.add('automation');
    } else if (r1) {
      // ②のパターン
      factors.add('phonology');
      factors.add('eye');
      factors.add('motor');
      factors.add('automation');
    } else {
      // ③のパターン
      factors.add('automation');
    }
  }

  return Array.from(factors);
}

// STEP03の結果判定ロジック
export function calculateResultFactors(
  candidateFactors: FactorType[],
  answers: Record<string, boolean>
): FactorType[] {
  const resultFactors: FactorType[] = [];

  for (const factor of candidateFactors) {
    if (factor === 'automation') continue; // 自動化は別処理

    const questions = STEP03_QUESTIONS[factor];
    let totalScore = 0;

    for (const q of questions) {
      const counts = STEP03_INVERTED_IDS.has(q.id) ? !answers[q.id] : answers[q.id];
      if (counts) {
        totalScore += q.score;
      }
    }

    if (totalScore >= 5) {
      resultFactors.push(factor);
    }
  }

  // 全て未満の場合は自動化
  if (resultFactors.length === 0) {
    resultFactors.push('automation');
  }

  return resultFactors;
}

// 専門職の判定
export function determineSpecialist(factors: FactorType[]): SpecialistType {
  const needsST = factors.includes('phonology') || factors.includes('automation');
  const needsOT = factors.includes('eye') || factors.includes('motor') || factors.includes('visualPerception');

  if (needsST && needsOT) {
    return 'both';
  } else if (needsST) {
    return 'ST';
  } else if (needsOT) {
    return 'OT';
  }
  return null;
}

// 苦手タイプの日本語表示
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

// 専門職の日本語表示
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
