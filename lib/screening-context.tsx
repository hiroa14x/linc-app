import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 苦手タイプ
export type DifficultyType = 'writing' | 'reading' | 'both' | null;

// 要因タイプ
export type FactorType =
  | 'phonology'
  | 'eye'
  | 'motor'
  | 'visualPerception'
  | 'automation'
  | 'rigidity'
  | 'attention';

// 専門職タイプ
export type SpecialistType = 'ST' | 'OT' | 'both' | null;

type DifficultyKey = Exclude<DifficultyType, null>;
type CountWhen = 'yes' | 'no';

export type Step02Question = {
  id: string;
  text: string;
  factors: FactorType[];
  countsWhen?: CountWhen;
};

export type Step03Question = {
  id: string;
  text: string;
  score: number;
  countsWhen?: CountWhen;
};

export type Step03QuestionWithFactor = Step03Question & {
  factor: FactorType;
};

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

// STEP02の設問（小1後半シート由来）
export const STEP02_QUESTIONS: Record<DifficultyKey, Step02Question[]> = {
  reading: [
    {
      id: 'r1',
      text: '音読の際、読む行を指で押さえながら読むことがよくありますか？',
      factors: ['phonology', 'eye', 'automation'],
    },
    {
      id: 'r2',
      text: '字を読むことを嫌がりますか？',
      factors: ['phonology', 'eye', 'visualPerception', 'automation'],
    },
    {
      id: 'r3',
      text: '逐次読みをしますか？',
      factors: ['phonology', 'eye', 'visualPerception', 'automation'],
    },
    {
      id: 'r4',
      text: '文末や助詞を正確に読むことが苦手ですか？',
      factors: ['phonology', 'eye', 'visualPerception', 'automation'],
    },
    {
      id: 'r5',
      text: '読む時に読み間違えが多い、勝手読みをしますか？',
      factors: ['phonology', 'eye', 'visualPerception', 'automation'],
    },
    {
      id: 'r6',
      text: '音読でつっかえてしまいますか？',
      factors: ['phonology', 'eye', 'visualPerception', 'automation'],
    },
  ],
  writing: [
    {
      id: 'w1',
      text: '黒板を写すのが苦手、または遅いですか？',
      factors: ['phonology', 'eye', 'motor', 'visualPerception', 'automation'],
    },
    {
      id: 'w2',
      text: '図形や文字を見て同じように書き写すことが苦手ですか？',
      factors: ['eye', 'motor', 'visualPerception'],
    },
    {
      id: 'w3',
      text: 'マス目や枠から文字がはみ出ることがよくありますか？',
      factors: ['eye', 'motor', 'visualPerception'],
    },
    {
      id: 'w4',
      text: '自分の名前をひらがなで正しく書くことができますか？',
      factors: ['phonology', 'eye', 'motor', 'visualPerception', 'automation'],
      countsWhen: 'no',
    },
    {
      id: 'w5',
      text: '字を書くことを嫌がりますか？',
      factors: ['phonology', 'eye', 'motor', 'visualPerception', 'automation'],
    },
    {
      id: 'w6',
      text: 'ひらがな、カタカナを覚えられませんか？（読みも書きもできない）',
      factors: ['phonology', 'eye', 'motor', 'visualPerception', 'automation'],
    },
    {
      id: 'w7',
      text: 'ひらがな、カタカナを覚えられませんか？（読めるが書けない）',
      factors: ['phonology', 'eye', 'motor', 'visualPerception', 'automation'],
    },
    {
      id: 'w8',
      text: '文字を書くのに時間がかかりますか？',
      factors: ['phonology', 'eye', 'motor', 'visualPerception', 'automation'],
    },
  ],
  both: [
    {
      id: 'b1',
      text: '音読の際、読む行を指で押さえながら読むことがよくありますか？',
      factors: ['phonology', 'eye', 'automation'],
    },
    {
      id: 'b2',
      text: '字を読むことを嫌がりますか？',
      factors: ['phonology', 'eye', 'visualPerception', 'automation'],
    },
    {
      id: 'b3',
      text: '逐次読みをしますか？',
      factors: ['phonology', 'eye', 'visualPerception', 'automation'],
    },
    {
      id: 'b4',
      text: '文末や助詞を正確に読むことが苦手ですか？',
      factors: ['phonology', 'eye', 'visualPerception', 'automation'],
    },
    {
      id: 'b5',
      text: '読む時に読み間違えが多い、勝手読みをしますか？',
      factors: ['phonology', 'eye', 'visualPerception', 'automation'],
    },
    {
      id: 'b6',
      text: '音読でつっかえてしまいますか？',
      factors: ['phonology', 'eye', 'visualPerception', 'automation'],
    },
    {
      id: 'b7',
      text: '黒板を写すのが苦手、または遅いですか？',
      factors: ['phonology', 'eye', 'motor', 'visualPerception', 'automation'],
    },
    {
      id: 'b8',
      text: '図形や文字を見て同じように書き写すことが苦手ですか？',
      factors: ['eye', 'motor', 'visualPerception'],
    },
    {
      id: 'b9',
      text: 'マス目や枠から文字がはみ出ることがよくありますか？',
      factors: ['eye', 'motor', 'visualPerception'],
    },
    {
      id: 'b10',
      text: '自分の名前をひらがなで正しく書くことができますか？',
      factors: ['phonology', 'eye', 'motor', 'visualPerception', 'automation'],
      countsWhen: 'no',
    },
    {
      id: 'b11',
      text: '字を書くことを嫌がりますか？',
      factors: ['phonology', 'eye', 'motor', 'visualPerception', 'automation'],
    },
    {
      id: 'b12',
      text: 'ひらがな、カタカナを覚えられませんか？（読みも書きもできない）',
      factors: ['phonology', 'eye', 'motor', 'visualPerception', 'automation'],
    },
    {
      id: 'b13',
      text: 'ひらがな、カタカナを覚えられませんか？（読めるが書けない）',
      factors: ['phonology', 'eye', 'motor', 'visualPerception', 'automation'],
    },
    {
      id: 'b14',
      text: '文字を書くのに時間がかかりますか？',
      factors: ['phonology', 'eye', 'motor', 'visualPerception', 'automation'],
    },
  ],
};

const READING_PHONOLOGY_QUESTIONS: Step03Question[] = [
  { id: 'phonology-shiritori', text: 'しりとりができますか？', score: 5, countsWhen: 'no' },
  {
    id: 'phonology-n-count',
    text: '「りんご」は3文字、「しんぶんし」は5文字等、「ん」が入った時に文字数の把握が苦手ですか？',
    score: 5,
  },
  {
    id: 'phonology-sound-steps',
    text: '「ぐりこ」などの、音の数だけ進む遊びで正しい音の数だけ進めますか？',
    score: 5,
    countsWhen: 'no',
  },
  { id: 'phonology-kana-order', text: 'ひらがなを「あ」から「ん」まで、順番に言うことが難しいですか？', score: 5 },
  {
    id: 'phonology-middle-sound',
    text: '単語の途中の音を答えることができますか？例：「からおけ」の2つ目の音は？ 答え：「ら」',
    score: 5,
    countsWhen: 'no',
  },
  { id: 'phonology-reverse-sakana', text: '「さかな」を逆から言えますか？', score: 5, countsWhen: 'no' },
  { id: 'phonology-ka-words', text: '「か」から始まる言葉を、5個以上言えますか？', score: 2, countsWhen: 'no' },
  {
    id: 'phonology-small-tsu',
    text: '「がっこう」「まって」などの小さい「っ」を書き間違えたり、書かないことがありますか？',
    score: 2,
  },
  { id: 'phonology-reverse-uremo', text: '「うれも」を逆から言うことが難しいですか？', score: 3 },
];

const WRITING_PHONOLOGY_QUESTIONS: Step03Question[] = [
  ...READING_PHONOLOGY_QUESTIONS.slice(0, 6),
  {
    id: 'phonology-kana-write',
    text: 'ひらがな50音を「あ」から「ん」まで、すらすら書けますか？',
    score: 5,
    countsWhen: 'no',
  },
  ...READING_PHONOLOGY_QUESTIONS.slice(6),
];

const EYE_QUESTIONS: Step03Question[] = [
  { id: 'eye-line-skip', text: '読むときに、行を飛ばしたり同じ行をまた読んだりしますか？', score: 5 },
  { id: 'eye-ball-catch', text: 'ボールを受けるのが苦手ですか？', score: 3 },
  { id: 'eye-tracking', text: '動くものを目で追うのが苦手ですか？', score: 2 },
];

const MOTOR_QUESTIONS: Step03Question[] = [
  { id: 'motor-arm-movement', text: '字を書くときに手首や腕全体を大きく動かすことが多いですか？', score: 5 },
  {
    id: 'motor-cut-trace-draw',
    text: '利き手で、できるだけ正確に切る・なぞる・描くことができますか？',
    score: 5,
    countsWhen: 'no',
  },
  {
    id: 'motor-posture',
    text: '椅子に長く安定して座りにくく、書字中に身体がよく動いたり、姿勢が崩れやすかったりしますか？',
    score: 2,
  },
  { id: 'motor-pressure', text: '字を書くときに筆圧が強すぎる、または弱すぎる傾向がありますか？', score: 2 },
];

const READING_VISUAL_PERCEPTION_QUESTIONS: Step03Question[] = [
  { id: 'visual-similar-letters', text: '似た形の文字（例：さ/き、ぬ/め）を読み間違えることがよくありますか？', score: 5 },
  { id: 'visual-search', text: '目の前の物でも、探すのに時間がかかりますか？', score: 2 },
];

const WRITING_VISUAL_PERCEPTION_QUESTIONS: Step03Question[] = [
  READING_VISUAL_PERCEPTION_QUESTIONS[0],
  { id: 'visual-mirror-writing', text: '鏡文字をよく書きますか？', score: 5 },
  READING_VISUAL_PERCEPTION_QUESTIONS[1],
  { id: 'visual-stroke-order', text: '書き順がバラバラになりやすいですか？', score: 2 },
  {
    id: 'visual-free-space-balance',
    text: 'マスや枠がある時に比べて、フリースペースに書く場合は、バランスの悪い文字になりやすいですか？',
    score: 1,
  },
];

const RIGIDITY_QUESTIONS: Step03Question[] = [
  { id: 'rigidity-letter-shape', text: '文字の形にこだわり、書くことが進みにくいですか？', score: 5 },
  { id: 'rigidity-avoid-mistake', text: '間違いたくないというこだわりを強く持っていますか？', score: 2 },
  { id: 'rigidity-interest', text: '興味のない課題や授業は受けようとしないですか？', score: 2 },
  { id: 'rigidity-tracing', text: 'なぞり書きの時にはみ出さないように強くこだわりますか？', score: 2 },
];

const ATTENTION_QUESTIONS: Step03Question[] = [
  { id: 'attention-distracted', text: '注意は逸れやすいですか？', score: 5 },
  { id: 'attention-organizing', text: '整理整頓が苦手ですか？', score: 2 },
  { id: 'attention-forgetting', text: '忘れ物が多いですか？', score: 2 },
  { id: 'attention-careless', text: 'ケアレスミスが多いですか？', score: 2 },
  { id: 'attention-other-things', text: '文字を書いている時に他のことをし出すことが多いですか？', score: 2 },
];

// STEP03の設問（小1後半シート由来、苦手タイプ別）
export const STEP03_QUESTIONS: Record<DifficultyKey, Record<FactorType, Step03Question[]>> = {
  reading: {
    phonology: READING_PHONOLOGY_QUESTIONS,
    eye: EYE_QUESTIONS,
    motor: [],
    visualPerception: READING_VISUAL_PERCEPTION_QUESTIONS,
    automation: [],
    rigidity: RIGIDITY_QUESTIONS,
    attention: ATTENTION_QUESTIONS,
  },
  writing: {
    phonology: WRITING_PHONOLOGY_QUESTIONS,
    eye: EYE_QUESTIONS,
    motor: MOTOR_QUESTIONS,
    visualPerception: WRITING_VISUAL_PERCEPTION_QUESTIONS,
    automation: [],
    rigidity: RIGIDITY_QUESTIONS,
    attention: ATTENTION_QUESTIONS,
  },
  both: {
    phonology: WRITING_PHONOLOGY_QUESTIONS,
    eye: EYE_QUESTIONS,
    motor: MOTOR_QUESTIONS,
    visualPerception: WRITING_VISUAL_PERCEPTION_QUESTIONS,
    automation: [],
    rigidity: RIGIDITY_QUESTIONS,
    attention: ATTENTION_QUESTIONS,
  },
};

// 要因の日本語名
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

function isDifficultyKey(type: DifficultyType): type is DifficultyKey {
  return type === 'reading' || type === 'writing' || type === 'both';
}

function answerCounts(countsWhen: CountWhen | undefined, value: boolean | undefined): boolean {
  if (value === undefined) return false;
  return (countsWhen ?? 'yes') === 'yes' ? value : !value;
}

function step02Counts(question: Step02Question, answers: Record<string, boolean>): boolean {
  return answerCounts(question.countsWhen, answers[question.id]);
}

function step03Counts(question: Step03Question, answers: Record<string, boolean>): boolean {
  return answerCounts(question.countsWhen, answers[question.id]);
}

export function getStep02Questions(difficultyType: DifficultyType): Step02Question[] {
  if (!isDifficultyKey(difficultyType)) return [];
  return STEP02_QUESTIONS[difficultyType];
}

export function getStep03Questions(
  difficultyType: DifficultyType,
  candidateFactors: FactorType[],
): Step03QuestionWithFactor[] {
  if (!isDifficultyKey(difficultyType)) return [];

  const questionsByFactor = STEP03_QUESTIONS[difficultyType];
  return candidateFactors.flatMap((factor) => {
    if (factor === 'automation') return [];
    return questionsByFactor[factor].map((question) => ({ ...question, factor }));
  });
}

// STEP02の要因候補分類ロジック
export function calculateCandidateFactors(
  difficultyType: DifficultyType,
  answers: Record<string, boolean>,
): FactorType[] {
  if (!isDifficultyKey(difficultyType)) return [];

  const factors = new Set<FactorType>();

  for (const question of STEP02_QUESTIONS[difficultyType]) {
    if (!step02Counts(question, answers)) continue;
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
  difficultyType: DifficultyType,
  factor: FactorType,
  answers: Record<string, boolean>,
): number {
  if (!isDifficultyKey(difficultyType) || factor === 'automation') return 0;

  return STEP03_QUESTIONS[difficultyType][factor].reduce((total, question) => {
    return total + (step03Counts(question, answers) ? question.score : 0);
  }, 0);
}

export function factorReachedThreshold(
  difficultyType: DifficultyType,
  factor: FactorType,
  answers: Record<string, boolean>,
): boolean {
  return calculateFactorScore(difficultyType, factor, answers) >= SCORE_THRESHOLD;
}

export function getNextStep03Index(
  difficultyType: DifficultyType,
  candidateFactors: FactorType[],
  answers: Record<string, boolean>,
  fromIndex: number,
): number {
  const questions = getStep03Questions(difficultyType, candidateFactors);

  for (let index = fromIndex; index < questions.length; index += 1) {
    if (!factorReachedThreshold(difficultyType, questions[index].factor, answers)) {
      return index;
    }
  }

  return -1;
}

export function getPreviousAnsweredStep03Index(
  difficultyType: DifficultyType,
  candidateFactors: FactorType[],
  answers: Record<string, boolean>,
  fromIndex: number,
): number {
  const questions = getStep03Questions(difficultyType, candidateFactors);

  for (let index = fromIndex - 1; index >= 0; index -= 1) {
    if (answers[questions[index].id] !== undefined) {
      return index;
    }
  }

  return -1;
}

export function pruneStep03AnswersAfterIndex(
  difficultyType: DifficultyType,
  candidateFactors: FactorType[],
  answers: Record<string, boolean>,
  index: number,
): Record<string, boolean> {
  const keepIds = new Set(
    getStep03Questions(difficultyType, candidateFactors)
      .slice(0, index + 1)
      .map((question) => question.id),
  );

  return Object.fromEntries(
    Object.entries(answers).filter(([questionId]) => keepIds.has(questionId)),
  );
}

// STEP03の結果判定ロジック
export function calculateResultFactors(
  difficultyType: DifficultyType,
  candidateFactors: FactorType[],
  answers: Record<string, boolean>,
): FactorType[] {
  const resultFactors = candidateFactors.filter((factor) => {
    return factor !== 'automation' && factorReachedThreshold(difficultyType, factor, answers);
  });

  // 全て5点未満の場合のみ自動化
  if (resultFactors.length === 0) {
    resultFactors.push('automation');
  }

  return resultFactors;
}

// 専門職の判定
export function determineSpecialist(factors: FactorType[]): SpecialistType {
  const needsST =
    factors.includes('phonology') ||
    factors.includes('automation') ||
    factors.includes('eye') ||
    factors.includes('visualPerception');
  const needsOT =
    factors.includes('motor') || factors.includes('eye') || factors.includes('visualPerception');

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

// こだわり/注意が結果に含まれるときの補足文言（専門職には繋げない）
export function getDevelopmentalNote(resultFactors: FactorType[]): string {
  const hasRigidityOrAttention =
    resultFactors.includes('rigidity') || resultFactors.includes('attention');
  return hasRigidityOrAttention
    ? 'こだわり/注意力が読み書きに影響を与えている可能性があります。'
    : '';
}
