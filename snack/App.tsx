import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// GENERATED_SCREENING_START
type GradeLevel =
  | 'kindergarten'
  | 'grade1'
  | 'grade2'
  | 'grade3'
  | 'grade4'
  | 'grade5'
  | 'grade6';

type SchoolTerm = 'first' | 'second';

type ScreeningDatasetKey =
  | 'kindergarten-second'
  | 'grade1-first'
  | 'grade1-second';

type DifficultyType = 'writing' | 'reading' | 'both' | null;
type DifficultyKey = Exclude<DifficultyType, null>;

type FactorType =
  | 'phonology'
  | 'eye'
  | 'motor'
  | 'visualPerception'
  | 'automation'
  | 'rigidity'
  | 'attention';

type CountWhen = 'yes' | 'no';

type Step02Question = {
  id: string;
  text: string;
  factors: FactorType[];
  countsWhen?: CountWhen;
};

type Step03Question = {
  id: string;
  text: string;
  score: number;
  factors: FactorType[];
  countsWhen?: CountWhen;
};

type ScreeningDataset = {
  step02: Record<DifficultyKey, Step02Question[]>;
  step03: Record<DifficultyKey, Step03Question[]>;
};

type Step02Seed = Omit<Step02Question, 'id'> & { key: string };
type Step03Seed = Omit<Step03Question, 'id'> & { key: string };

const GRADE_LEVELS: GradeLevel[] = [
  'kindergarten',
  'grade1',
  'grade2',
  'grade3',
  'grade4',
  'grade5',
  'grade6',
];

const GRADE_LABELS: Record<GradeLevel, string> = {
  kindergarten: '年長',
  grade1: '小学1年生',
  grade2: '小学2年生',
  grade3: '小学3年生',
  grade4: '小学4年生',
  grade5: '小学5年生',
  grade6: '小学6年生',
};

const TERM_LABELS: Record<SchoolTerm, string> = {
  first: '前半',
  second: '後半',
};

const symptom = (
  key: string,
  text: string,
  factors: FactorType[],
  countsWhen?: CountWhen,
): Step02Seed => ({ key, text, factors, countsWhen });

const cause = (
  key: string,
  text: string,
  score: number,
  factors: FactorType | FactorType[],
  countsWhen?: CountWhen,
): Step03Seed => ({
  key,
  text,
  score,
  factors: Array.isArray(factors) ? factors : [factors],
  countsWhen,
});

function buildDataset(
  datasetKey: ScreeningDatasetKey,
  step02Seeds: Record<DifficultyKey, Step02Seed[]>,
  step03Seeds: Record<DifficultyKey, Step03Seed[]>,
): ScreeningDataset {
  const compileStep02 = (difficulty: DifficultyKey) =>
    step02Seeds[difficulty].map(({ key, ...question }) => ({
      ...question,
      id: `${datasetKey}-${difficulty}-${key}`,
    }));
  const compileStep03 = (difficulty: DifficultyKey) =>
    step03Seeds[difficulty].map(({ key, ...question }) => ({
      ...question,
      id: `${datasetKey}-${difficulty}-${key}`,
    }));

  return {
    step02: {
      reading: compileStep02('reading'),
      writing: compileStep02('writing'),
      both: compileStep02('both'),
    },
    step03: {
      reading: compileStep03('reading'),
      writing: compileStep03('writing'),
      both: compileStep03('both'),
    },
  };
}

const RIGIDITY_QUESTIONS: Step03Seed[] = [
  cause('rigidity-letter-shape', '文字の形にこだわり、書くことが進みにくいですか？', 5, 'rigidity'),
  cause('rigidity-avoid-mistake', '間違いたくないというこだわりを強く持っていますか？', 2, 'rigidity'),
  cause('rigidity-interest', '興味のない課題や授業は受けようとしないですか？', 2, 'rigidity'),
  cause('rigidity-tracing', 'なぞり書きの時にはみ出さないように強くこだわりますか？', 2, 'rigidity'),
];

const ATTENTION_QUESTIONS: Step03Seed[] = [
  cause('attention-distracted', '注意は逸れやすいですか？', 5, 'attention'),
  cause('attention-organizing', '整理整頓が苦手ですか？', 2, 'attention'),
  cause('attention-forgetting', '忘れ物が多いですか？', 2, 'attention'),
  cause('attention-careless', 'ケアレスミスが多いですか？', 2, 'attention'),
  cause('attention-other-things', '文字を書いている時に他のことをし出すことが多いですか？', 2, 'attention'),
];

const ALL_LITERACY_FACTORS: FactorType[] = [
  'phonology',
  'eye',
  'motor',
  'visualPerception',
  'automation',
];

const READING_FACTORS: FactorType[] = [
  'phonology',
  'eye',
  'visualPerception',
  'automation',
];

const KINDERGARTEN_READING_SYMPTOMS: Step02Seed[] = [
  symptom('read-other-characters', '名前以外の文字をいくつか読むことができますか？', READING_FACTORS, 'no'),
  symptom(
    'select-heard-kana',
    '聞いたひらがなを選択できないことがありますか？（例：「あ・し・に」の中から「し」を選べない）',
    READING_FACTORS,
  ),
  symptom('read-own-name', '自分の名前をすらすら読めますか？', READING_FACTORS, 'no'),
];

const KINDERGARTEN_WRITING_SYMPTOMS: Step02Seed[] = [
  symptom(
    'write-own-name',
    '手本を見ずに自分の名前を書くことが難しいですか？（鏡文字や大きさの整わない文字でも可）',
    ALL_LITERACY_FACTORS,
  ),
  symptom('dislike-drawing-writing', '筆記用具で絵や文字を書くことを嫌がりますか？', ALL_LITERACY_FACTORS),
  symptom('copy-kana', '見本のひらがなを真似して書くことが難しいですか？', ALL_LITERACY_FACTORS),
];

const KINDERGARTEN_PHONOLOGY: Step03Seed[] = [
  cause('phonology-shiritori', 'しりとりができますか？', 5, 'phonology', 'no'),
  cause(
    'phonology-word-length',
    '「さかな」「くま」などの言葉が何文字かわかりますか？（例：「さかな」は3文字）',
    5,
    'phonology',
    'no',
  ),
  cause('phonology-ka-words', '「か」から始まる言葉を2個以上言えますか？', 5, 'phonology', 'no'),
];

const KINDERGARTEN_EYE: Step03Seed[] = [
  cause('eye-balloon', '風船で遊ぶ際に、風船を見失うことがよくありますか？', 5, 'eye'),
];

const KINDERGARTEN_READING_VISUAL: Step03Seed[] = [
  cause('visual-copy-blocks', '積み木5〜6個で作った家を真似して作ることができますか？', 5, 'visualPerception', 'no'),
  cause('visual-puzzle', '30ピースのパズルができないことがありますか？', 5, 'visualPerception'),
];

const KINDERGARTEN_WRITING_VISUAL: Step03Seed[] = [
  cause('visual-square', '四角形の形をうまく書けないことがありますか？', 5, 'visualPerception'),
  ...KINDERGARTEN_READING_VISUAL,
];

const KINDERGARTEN_SHARED_VISUAL_EYE: Step03Seed[] = [
  cause(
    'visual-eye-spot-difference',
    '間違い探しが嫌い、または苦手ですか？',
    3,
    ['visualPerception', 'eye'],
  ),
  cause(
    'visual-eye-find-object',
    '目の前にあるものをなかなか見つけられないことがありますか？',
    2,
    ['visualPerception', 'eye'],
  ),
];

const KINDERGARTEN_MOTOR: Step03Seed[] = [
  cause('motor-fist-grip', '字を書くときに握り持ちで書きますか？', 5, 'motor'),
  cause('motor-tracing', '利き手でできるだけ正確になぞり描きができますか？', 5, 'motor', 'no'),
  cause(
    'motor-posture',
    '椅子に長く安定して座りにくく、書字中に身体がよく動いたり、姿勢が崩れやすかったりしますか？',
    2,
    'motor',
  ),
  cause('motor-pressure', '字を書くときに筆圧が強すぎる、または弱すぎる傾向がありますか？', 2, 'motor'),
];

const KINDERGARTEN_READING_CAUSES: Step03Seed[] = [
  ...KINDERGARTEN_PHONOLOGY,
  ...KINDERGARTEN_EYE,
  ...KINDERGARTEN_READING_VISUAL,
  ...KINDERGARTEN_SHARED_VISUAL_EYE,
  ...RIGIDITY_QUESTIONS,
  ...ATTENTION_QUESTIONS.slice(0, 3),
];

const KINDERGARTEN_WRITING_CAUSES: Step03Seed[] = [
  ...KINDERGARTEN_PHONOLOGY,
  ...KINDERGARTEN_EYE,
  ...KINDERGARTEN_WRITING_VISUAL,
  ...KINDERGARTEN_SHARED_VISUAL_EYE,
  ...KINDERGARTEN_MOTOR,
  ...RIGIDITY_QUESTIONS,
  ...ATTENTION_QUESTIONS.slice(0, 3),
];

const KINDERGARTEN_SECOND = buildDataset(
  'kindergarten-second',
  {
    reading: KINDERGARTEN_READING_SYMPTOMS,
    writing: KINDERGARTEN_WRITING_SYMPTOMS,
    both: [...KINDERGARTEN_READING_SYMPTOMS, ...KINDERGARTEN_WRITING_SYMPTOMS],
  },
  {
    reading: KINDERGARTEN_READING_CAUSES,
    writing: KINDERGARTEN_WRITING_CAUSES,
    both: KINDERGARTEN_WRITING_CAUSES,
  },
);

const GRADE1_WRITING_SYMPTOMS: Step02Seed[] = [
  symptom('copy-blackboard', '黒板を写すのが苦手、または遅いですか？', ALL_LITERACY_FACTORS),
  symptom('copy-shapes', '図形や文字を見て同じように書き写すことが苦手ですか？', ['eye', 'motor', 'visualPerception']),
  symptom('write-outside-grid', 'マス目や枠から文字がはみ出ることがよくありますか？', ['eye', 'motor', 'visualPerception']),
  symptom('write-own-name', '自分の名前をひらがなで正しく書くことができますか？', ALL_LITERACY_FACTORS, 'no'),
  symptom('dislike-writing', '字を書くことを嫌がりますか？', ALL_LITERACY_FACTORS),
  symptom('cannot-read-write-kana', 'ひらがな、カタカナを覚えられませんか？（読みも書きもできない）', ALL_LITERACY_FACTORS),
  symptom('cannot-write-kana', 'ひらがな、カタカナを覚えられませんか？（読めるが書けない）', ALL_LITERACY_FACTORS),
  symptom('slow-writing', '文字を書くのに時間がかかりますか？', ALL_LITERACY_FACTORS),
];

const GRADE1_BASE_READING_SYMPTOMS: Step02Seed[] = [
  symptom('finger-tracking', '音読の際、読む行を指で押さえながら読むことがよくありますか？', ['phonology', 'eye', 'automation']),
  symptom('dislike-reading', '字を読むことを嫌がりますか？', READING_FACTORS),
  symptom('letter-by-letter-reading', '逐次読みをしますか？', READING_FACTORS),
  symptom('ending-particles', '文末や助詞を正確に読むことが苦手ですか？', READING_FACTORS),
  symptom('reading-mistakes', '読む時に読み間違いが多い、または勝手読みをしますか？', READING_FACTORS),
  symptom('stumble-reading', '音読でつっかえてしまいますか？', READING_FACTORS),
];

const GRADE1_FIRST_READING_SYMPTOMS: Step02Seed[] = [
  GRADE1_BASE_READING_SYMPTOMS[0],
  symptom('kana-chart', 'ひらがなの50音表をすらすら読むことができますか？', READING_FACTORS, 'no'),
  ...GRADE1_BASE_READING_SYMPTOMS.slice(1),
];

const GRADE1_FIRST_READING_PHONOLOGY: Step03Seed[] = [
  cause('phonology-shiritori', 'しりとりができますか？', 5, 'phonology', 'no'),
  cause(
    'phonology-n-count',
    '「りんご」は3文字、「しんぶんし」は5文字など、「ん」が入った時に文字数の把握が苦手ですか？',
    5,
    'phonology',
  ),
  cause(
    'phonology-sound-steps',
    '「ぐりこ」など、音の数だけ進む遊びで正しい音の数だけ進めますか？',
    5,
    'phonology',
    'no',
  ),
  cause('phonology-ka-words', '「か」から始まる言葉を5個以上言えますか？', 2, 'phonology', 'no'),
  cause('phonology-kana-order', '50音を何も見ずに「あ」から「ん」まで言えますか？', 2, 'phonology', 'no'),
  cause(
    'phonology-middle-sound',
    '単語の途中の音を答えることができますか？（例：「せなか」の2つ目の音は「な」）',
    2,
    'phonology',
    'no',
  ),
  cause('phonology-reverse-uma', '「うま」を逆から言うことが難しいですか？', 2, 'phonology'),
];

const GRADE1_FIRST_WRITING_PHONOLOGY: Step03Seed[] = [
  ...GRADE1_FIRST_READING_PHONOLOGY,
  cause(
    'phonology-kana-write',
    'ひらがな50音を「あ」から「ん」まで何も見ずにすらすら書けますか？',
    2,
    'phonology',
    'no',
  ),
];

const GRADE1_FIRST_EYE: Step03Seed[] = [
  cause('eye-line-skip', '読むときに、行を飛ばしたり同じ行をまた読んだりしますか？', 3, 'eye'),
  cause('eye-ball-catch', 'ボールを受けるのが苦手ですか？', 3, 'eye'),
  cause('eye-tracking', '動くものを目で追うのが苦手ですか？', 2, 'eye'),
];

const GRADE1_MOTOR: Step03Seed[] = [
  cause('motor-arm-movement', '字を書くときに手首や腕全体を大きく動かすことが多いですか？', 5, 'motor'),
  cause(
    'motor-cut-trace-draw',
    '利き手で、できるだけ正確に切る・なぞる・描くことができますか？',
    5,
    'motor',
    'no',
  ),
  cause(
    'motor-posture',
    '椅子に長く安定して座りにくく、書字中に身体がよく動いたり、姿勢が崩れやすかったりしますか？',
    2,
    'motor',
  ),
  cause('motor-pressure', '字を書くときに筆圧が強すぎる、または弱すぎる傾向がありますか？', 2, 'motor'),
];

const GRADE1_FIRST_READING_VISUAL: Step03Seed[] = [
  cause('visual-similar-letters', '似た形の文字（例：さ/き、ぬ/め）を読み間違えることがよくありますか？', 5, 'visualPerception'),
  cause('visual-search', '目の前の物でも、探すのに時間がかかりますか？', 2, 'visualPerception'),
];

const GRADE1_FIRST_WRITING_VISUAL: Step03Seed[] = [
  cause('visual-triangle', '三角形の形をうまく書けますか？', 5, 'visualPerception', 'no'),
  GRADE1_FIRST_READING_VISUAL[0],
  cause('visual-mirror-writing', '鏡文字をよく書きますか？', 2, 'visualPerception'),
  GRADE1_FIRST_READING_VISUAL[1],
  cause('visual-stroke-order', '書き順がバラバラになりやすいですか？', 2, 'visualPerception'),
  cause(
    'visual-free-space-balance',
    'マスや枠がある時に比べて、フリースペースに書く場合はバランスの悪い文字になりやすいですか？',
    1,
    'visualPerception',
  ),
];

const GRADE1_FIRST_READING_CAUSES: Step03Seed[] = [
  ...GRADE1_FIRST_READING_PHONOLOGY,
  ...GRADE1_FIRST_EYE,
  ...GRADE1_FIRST_READING_VISUAL,
  ...RIGIDITY_QUESTIONS,
  ...ATTENTION_QUESTIONS,
];

const GRADE1_FIRST_WRITING_CAUSES: Step03Seed[] = [
  ...GRADE1_FIRST_WRITING_PHONOLOGY,
  ...GRADE1_FIRST_EYE,
  ...GRADE1_MOTOR,
  ...GRADE1_FIRST_WRITING_VISUAL,
  ...RIGIDITY_QUESTIONS,
  ...ATTENTION_QUESTIONS,
];

const GRADE1_FIRST = buildDataset(
  'grade1-first',
  {
    reading: GRADE1_FIRST_READING_SYMPTOMS,
    writing: GRADE1_WRITING_SYMPTOMS,
    both: [...GRADE1_FIRST_READING_SYMPTOMS, ...GRADE1_WRITING_SYMPTOMS],
  },
  {
    reading: GRADE1_FIRST_READING_CAUSES,
    writing: GRADE1_FIRST_WRITING_CAUSES,
    both: GRADE1_FIRST_WRITING_CAUSES,
  },
);

const GRADE1_SECOND_READING_PHONOLOGY: Step03Seed[] = [
  cause('phonology-shiritori', 'しりとりができますか？', 5, 'phonology', 'no'),
  cause(
    'phonology-n-count',
    '「りんご」は3文字、「しんぶんし」は5文字など、「ん」が入った時に文字数の把握が苦手ですか？',
    5,
    'phonology',
  ),
  cause(
    'phonology-sound-steps',
    '「ぐりこ」など、音の数だけ進む遊びで正しい音の数だけ進めますか？',
    5,
    'phonology',
    'no',
  ),
  cause('phonology-kana-order', 'ひらがなを「あ」から「ん」まで順番に言うことが難しいですか？', 5, 'phonology'),
  cause(
    'phonology-middle-sound',
    '単語の途中の音を答えることができますか？（例：「からおけ」の2つ目の音は「ら」）',
    5,
    'phonology',
    'no',
  ),
  cause('phonology-reverse-sakana', '「さかな」を逆から言えますか？', 5, 'phonology', 'no'),
  cause('phonology-ka-words', '「か」から始まる言葉を5個以上言えますか？', 2, 'phonology', 'no'),
  cause(
    'phonology-small-tsu',
    '「がっこう」「まって」などの小さい「っ」を書き間違えたり、書かないことがありますか？',
    2,
    'phonology',
  ),
  cause('phonology-reverse-uremo', '「うれも」を逆から言うことが難しいですか？', 3, 'phonology'),
];

const GRADE1_SECOND_WRITING_PHONOLOGY: Step03Seed[] = [
  ...GRADE1_SECOND_READING_PHONOLOGY.slice(0, 6),
  cause('phonology-kana-write', 'ひらがな50音を「あ」から「ん」まですらすら書けますか？', 5, 'phonology', 'no'),
  ...GRADE1_SECOND_READING_PHONOLOGY.slice(6),
];

const GRADE1_SECOND_EYE: Step03Seed[] = [
  cause('eye-line-skip', '読むときに、行を飛ばしたり同じ行をまた読んだりしますか？', 5, 'eye'),
  cause('eye-ball-catch', 'ボールを受けるのが苦手ですか？', 3, 'eye'),
  cause('eye-tracking', '動くものを目で追うのが苦手ですか？', 2, 'eye'),
];

const GRADE1_SECOND_READING_VISUAL: Step03Seed[] = [
  cause('visual-similar-letters', '似た形の文字（例：さ/き、ぬ/め）を読み間違えることがよくありますか？', 5, 'visualPerception'),
  cause('visual-search', '目の前の物でも、探すのに時間がかかりますか？', 2, 'visualPerception'),
];

const GRADE1_SECOND_WRITING_VISUAL: Step03Seed[] = [
  GRADE1_SECOND_READING_VISUAL[0],
  cause('visual-mirror-writing', '鏡文字をよく書きますか？', 5, 'visualPerception'),
  GRADE1_SECOND_READING_VISUAL[1],
  cause('visual-stroke-order', '書き順がバラバラになりやすいですか？', 2, 'visualPerception'),
  cause(
    'visual-free-space-balance',
    'マスや枠がある時に比べて、フリースペースに書く場合はバランスの悪い文字になりやすいですか？',
    1,
    'visualPerception',
  ),
];

const GRADE1_SECOND_READING_CAUSES: Step03Seed[] = [
  ...GRADE1_SECOND_READING_PHONOLOGY,
  ...GRADE1_SECOND_EYE,
  ...GRADE1_SECOND_READING_VISUAL,
  ...RIGIDITY_QUESTIONS,
  ...ATTENTION_QUESTIONS,
];

const GRADE1_SECOND_WRITING_CAUSES: Step03Seed[] = [
  ...GRADE1_SECOND_WRITING_PHONOLOGY,
  ...GRADE1_SECOND_EYE,
  ...GRADE1_MOTOR,
  ...GRADE1_SECOND_WRITING_VISUAL,
  ...RIGIDITY_QUESTIONS,
  ...ATTENTION_QUESTIONS,
];

const GRADE1_SECOND = buildDataset(
  'grade1-second',
  {
    reading: GRADE1_BASE_READING_SYMPTOMS,
    writing: GRADE1_WRITING_SYMPTOMS,
    both: [...GRADE1_BASE_READING_SYMPTOMS, ...GRADE1_WRITING_SYMPTOMS],
  },
  {
    reading: GRADE1_SECOND_READING_CAUSES,
    writing: GRADE1_SECOND_WRITING_CAUSES,
    both: GRADE1_SECOND_WRITING_CAUSES,
  },
);

const SCREENING_DATASETS: Record<ScreeningDatasetKey, ScreeningDataset> = {
  'kindergarten-second': KINDERGARTEN_SECOND,
  'grade1-first': GRADE1_FIRST,
  'grade1-second': GRADE1_SECOND,
};

function getSchoolTerm(date = new Date()): SchoolTerm {
  const month = date.getMonth() + 1;
  return month >= 4 && month <= 9 ? 'first' : 'second';
}

function getDatasetKey(
  gradeLevel: GradeLevel,
  schoolTerm: SchoolTerm,
): ScreeningDatasetKey | null {
  if (gradeLevel === 'kindergarten' && schoolTerm === 'second') {
    return 'kindergarten-second';
  }
  if (gradeLevel === 'grade1') {
    return schoolTerm === 'first' ? 'grade1-first' : 'grade1-second';
  }
  return null;
}

type SpecialistType = 'ST' | 'OT' | 'both' | null;
type RouteName = 'onboarding' | 'grade' | 'step01' | 'step02' | 'step03' | 'result' | 'map' | 'contact';

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

const FACTOR_NAMES: Record<FactorType, string> = {
  phonology: '音韻',
  eye: '眼球運動',
  motor: '運動',
  visualPerception: '視知覚',
  rigidity: 'こだわり',
  attention: '注意',
  automation: '自動化',
};

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

function getStep02Questions(
  datasetKey: ScreeningDatasetKey | null,
  difficultyType: DifficultyType,
): Step02Question[] {
  const dataset = getDataset(datasetKey);
  if (!dataset || !isDifficultyKey(difficultyType)) return [];
  return dataset.step02[difficultyType];
}

function getStep03Questions(
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

function calculateCandidateFactors(
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

function calculateFactorScore(
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

function factorReachedThreshold(
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

function getNextStep03Index(
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

function getPreviousAnsweredStep03Index(
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

function pruneStep03AnswersAfterIndex(
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

function calculateResultFactors(
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

function determineSpecialist(factors: FactorType[]): SpecialistType {
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

function getDifficultyTypeLabel(type: DifficultyType): string {
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

function getGradeLevelLabel(gradeLevel: GradeLevel | null): string {
  return gradeLevel ? GRADE_LABELS[gradeLevel] : '';
}

function getSchoolTermLabel(schoolTerm: SchoolTerm | null): string {
  return schoolTerm ? TERM_LABELS[schoolTerm] : '';
}

function getSpecialistLabel(specialist: SpecialistType): string {
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

function getDevelopmentalNote(resultFactors: FactorType[]): string {
  const hasRigidityOrAttention =
    resultFactors.includes('rigidity') || resultFactors.includes('attention');
  return hasRigidityOrAttention
    ? 'こだわり/注意力が読み書きに影響を与えている可能性があります。'
    : '';
}
// GENERATED_SCREENING_END

const PREFECTURES = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
];

export default function App() {
  const [route, setRoute] = useState<RouteName>("onboarding");
  const [gradeLevel, setGradeLevel] = useState<GradeLevel | null>(null);
  const [schoolTerm, setSchoolTerm] = useState<SchoolTerm | null>(null);
  const [datasetKey, setDatasetKey] = useState<ScreeningDatasetKey | null>(null);
  const [difficultyType, setDifficultyType] = useState<DifficultyType>(null);
  const [step02Answers, setStep02Answers] = useState<Record<string, boolean>>({});
  const [step03Answers, setStep03Answers] = useState<Record<string, boolean>>({});
  const [candidateFactors, setCandidateFactors] = useState<FactorType[]>([]);
  const [resultFactors, setResultFactors] = useState<FactorType[]>([]);
  const [specialist, setSpecialist] = useState<SpecialistType>(null);
  const [step02Index, setStep02Index] = useState(0);
  const [step03Index, setStep03Index] = useState(0);
  const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(null);
  const currentSchoolTerm = useMemo(() => getSchoolTerm(), []);

  const step02Questions = useMemo(() => {
    return getStep02Questions(datasetKey, difficultyType);
  }, [datasetKey, difficultyType]);

  const step03Questions = useMemo(() => {
    return getStep03Questions(datasetKey, difficultyType, candidateFactors);
  }, [candidateFactors, datasetKey, difficultyType]);

  useEffect(() => {
    if (route !== "step03" || step03Questions.length !== 0) return;
    const autoFactors: FactorType[] = ["automation"];
    setResultFactors(autoFactors);
    setSpecialist(determineSpecialist(autoFactors));
    setRoute("result");
  }, [route, step03Questions.length]);

  const resetAll = () => {
    setRoute("onboarding");
    setGradeLevel(null);
    setSchoolTerm(null);
    setDatasetKey(null);
    setDifficultyType(null);
    setStep02Answers({});
    setStep03Answers({});
    setCandidateFactors([]);
    setResultFactors([]);
    setSpecialist(null);
    setStep02Index(0);
    setStep03Index(0);
    setSelectedPrefecture(null);
  };

  const openMapSearch = async () => {
    if (!selectedPrefecture) return;
    const keyword =
      specialist === "ST"
        ? "言語聴覚士 小児"
        : specialist === "OT"
          ? "作業療法士 小児"
          : "言語聴覚士 作業療法士 小児";
    const query = encodeURIComponent(`${selectedPrefecture} ${keyword}`);
    const url = `https://www.google.com/maps/search/${query}`;
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert("エラー", "Google マップを開けませんでした。");
      return;
    }
    await Linking.openURL(url);
  };

  const contactText = `【Lincスクリーニング結果】

■ 学年：${gradeLevel ? GRADE_LABELS[gradeLevel] : ""}${schoolTerm ? `（${TERM_LABELS[schoolTerm]}）` : ""}
■ 困りの内容：${getDifficultyTypeLabel(difficultyType)}
■ 考えられる要因：${resultFactors.map((f) => FACTOR_NAMES[f]).join("・")}
■ おすすめの専門職：${getSpecialistLabel(specialist)}

※ これは診断ではなく、ひとつの目安です。
詳しい評価・支援についてご相談させていただければ幸いです。`;

  if (route === "onboarding") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.bodyWrap}>
          <Text style={styles.title}>お子さんの{"\n"}「読む・書く」の困りを{"\n"}整理します</Text>
          <Text style={styles.body}>
            いくつかの質問に答えることで、{"\n"}考えられる要因と相談先の目安を{"\n"}お伝えします。
          </Text>
          <Text style={styles.note}>これは診断ではなく、ひとつのスクリーニングです。</Text>
          <Text style={styles.note}>所要時間：約5分</Text>
        </View>
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              resetAll();
              setRoute("grade");
            }}
          >
            <Text style={styles.primaryButtonText}>はじめる</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (route === "grade") {
    return (
      <SafeAreaView style={styles.container}>
        <Progress value={20} label="STEP 1/5" />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.stepTitle}>お子さんの学年を教えてください</Text>
          <Text style={styles.bodyText}>現在は{TERM_LABELS[currentSchoolTerm]}の設問です</Text>
          <View style={styles.gradeList}>
            {GRADE_LEVELS.map((grade) => {
              const availableDataset = getDatasetKey(grade, currentSchoolTerm);
              return (
                <TouchableOpacity
                  key={grade}
                  style={styles.gradeButton}
                  onPress={() => {
                    if (!availableDataset) {
                      Alert.alert(
                        "現在準備中です",
                        `${GRADE_LABELS[grade]}・${TERM_LABELS[currentSchoolTerm]}の設問は現在準備中です。`,
                      );
                      return;
                    }
                    setGradeLevel(grade);
                    setSchoolTerm(currentSchoolTerm);
                    setDatasetKey(availableDataset);
                    setDifficultyType(null);
                    setStep02Answers({});
                    setStep03Answers({});
                    setCandidateFactors([]);
                    setResultFactors([]);
                    setSpecialist(null);
                    setStep02Index(0);
                    setStep03Index(0);
                    setRoute("step01");
                  }}
                >
                  <Text style={styles.gradeText}>{GRADE_LABELS[grade]}</Text>
                  {!availableDataset && <Text style={styles.preparingText}>準備中</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => setRoute("onboarding")}>
            <Text style={styles.backText}>戻る</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (route === "step01") {
    return (
      <SafeAreaView style={styles.container}>
        <Progress value={40} label="STEP 2/5" />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.stepTitle}>お子さんが苦手なのは{"\n"}どちらですか？</Text>
          <AnswerCard
            title="書く"
            description="文字を書くことが苦手"
            onPress={() => {
              setDifficultyType("writing");
              setStep02Answers({});
              setStep03Answers({});
              setCandidateFactors([]);
              setStep02Index(0);
              setRoute("step02");
            }}
          />
          <AnswerCard
            title="読む"
            description="文字を読むことが苦手"
            onPress={() => {
              setDifficultyType("reading");
              setStep02Answers({});
              setStep03Answers({});
              setCandidateFactors([]);
              setStep02Index(0);
              setRoute("step02");
            }}
          />
          <AnswerCard
            title="書く・読む"
            description="どちらも苦手"
            onPress={() => {
              setDifficultyType("both");
              setStep02Answers({});
              setStep03Answers({});
              setCandidateFactors([]);
              setStep02Index(0);
              setRoute("step02");
            }}
          />
        </ScrollView>
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => setRoute("grade")}>
            <Text style={styles.backText}>戻る</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (route === "step02") {
    const question = step02Questions[step02Index];
    if (!question) return null;
    const progress = ((step02Index + 1) / step02Questions.length) * 30 + 40;
    return (
      <SafeAreaView style={styles.container}>
        <Progress
          value={progress}
          label={`STEP 3/5 (${step02Index + 1}/${step02Questions.length})`}
        />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.question}>{question.text}</Text>
          <YesNoButtons
            onYes={() => {
              const next = { ...step02Answers, [question.id]: true };
              setStep02Answers(next);
              if (step02Index === step02Questions.length - 1) {
                setCandidateFactors(calculateCandidateFactors(datasetKey, difficultyType, next));
                setStep03Index(0);
                setRoute("step03");
              } else {
                setStep02Index((v) => v + 1);
              }
            }}
            onNo={() => {
              const next = { ...step02Answers, [question.id]: false };
              setStep02Answers(next);
              if (step02Index === step02Questions.length - 1) {
                setCandidateFactors(calculateCandidateFactors(datasetKey, difficultyType, next));
                setStep03Index(0);
                setRoute("step03");
              } else {
                setStep02Index((v) => v + 1);
              }
            }}
          />
        </ScrollView>
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => {
              if (step02Index > 0) setStep02Index((v) => v - 1);
              else setRoute("step01");
            }}
          >
            <Text style={styles.backText}>戻る</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (route === "step03") {
    if (step03Questions.length === 0) {
      return null;
    }

    const question = step03Questions[step03Index];
    if (!question) return null;
    const progress = ((step03Index + 1) / step03Questions.length) * 30 + 70;
    const answerStep03 = (value: boolean) => {
      const prunedAnswers = pruneStep03AnswersAfterIndex(
        datasetKey,
        difficultyType,
        candidateFactors,
        step03Answers,
        step03Index,
      );
      const next = { ...prunedAnswers, [question.id]: value };
      const nextIndex = getNextStep03Index(
        datasetKey,
        difficultyType,
        candidateFactors,
        next,
        step03Index + 1,
      );

      setStep03Answers(next);
      if (nextIndex === -1) {
        const factors = calculateResultFactors(datasetKey, difficultyType, candidateFactors, next);
        setResultFactors(factors);
        setSpecialist(determineSpecialist(factors));
        setRoute("result");
      } else {
        setStep03Index(nextIndex);
      }
    };

    return (
      <SafeAreaView style={styles.container}>
        <Progress
          value={progress}
          label={`STEP 4/5 (${step03Index + 1}/${step03Questions.length})`}
        />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.question}>{question.text}</Text>
          <YesNoButtons
            onYes={() => answerStep03(true)}
            onNo={() => answerStep03(false)}
          />
        </ScrollView>
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => {
              const previousIndex = getPreviousAnsweredStep03Index(
                datasetKey,
                difficultyType,
                candidateFactors,
                step03Answers,
                step03Index,
              );
              if (previousIndex >= 0) setStep03Index(previousIndex);
              else setRoute("step02");
            }}
          >
            <Text style={styles.backText}>戻る</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (route === "result") {
    const factorLabels = resultFactors.map((f) => FACTOR_NAMES[f]).join("・");    
    return (
      <SafeAreaView style={styles.container}>
        <Progress value={100} label="STEP 5/5 完了" />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.stepTitle}>スクリーニング結果</Text>
          <View style={styles.card}>
            <Text style={styles.cardBody}>
              あなたが「
              <Text style={styles.highlight}>{getDifficultyTypeLabel(difficultyType)}</Text>
              」で困りを感じる背景には「<Text style={styles.highlight}>{factorLabels}</Text>
              」が関係している可能性があります。
            </Text>
          </View>
          <View style={[styles.card, styles.cardSub]}>
            <Text style={styles.cardBody}>
              <Text style={styles.highlight}>{getSpecialistLabel(specialist)}</Text>
              による支援をおすすめします。
            </Text>
          </View>
          <TouchableOpacity style={styles.primaryButton} onPress={() => setRoute("map")}>
            <Text style={styles.primaryButtonText}>近隣の支援機関を探す</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => setRoute("contact")}>
            <Text style={styles.secondaryButtonText}>この結果で問い合わせる</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={resetAll}>
            <Text style={styles.backText}>最初からやり直す</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (route === "map") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.stepTitle}>支援機関を探す</Text>
          <Text style={styles.bodyText}>都道府県を選択してください</Text>
        </View>
        <ScrollView contentContainerStyle={styles.prefList}>
          {PREFECTURES.map((pref) => {
            const selected = selectedPrefecture === pref;
            return (
              <TouchableOpacity
                key={pref}
                style={[styles.prefButton, selected && styles.prefButtonSelected]}
                onPress={() => setSelectedPrefecture(pref)}
              >
                <Text style={[styles.prefText, selected && styles.prefTextSelected]}>{pref}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.primaryButton, !selectedPrefecture && styles.disabledButton]}
            onPress={openMapSearch}
            disabled={!selectedPrefecture}
          >
            <Text style={styles.primaryButtonText}>Google マップで検索</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setRoute("result")}>
            <Text style={styles.backText}>戻る</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (route === "contact") {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.stepTitle}>この結果で問い合わせる</Text>
          <View style={styles.card}>
            <Text style={styles.cardBody}>{contactText}</Text>
          </View>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={async () => {
              try {
                await Share.share({ message: contactText });
              } catch {
                Alert.alert("エラー", "共有に失敗しました。");
              }
            }}
          >
            <Text style={styles.primaryButtonText}>結果を共有する</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={async () => {
              const subject = encodeURIComponent("Lincスクリーニング結果についてのご相談");
              const body = encodeURIComponent(contactText);
              const url = `mailto:?subject=${subject}&body=${body}`;
              const canOpen = await Linking.canOpenURL(url);
              if (!canOpen) {
                Alert.alert("エラー", "メールアプリを開けませんでした。");
                return;
              }
              await Linking.openURL(url);
            }}
          >
            <Text style={styles.secondaryButtonText}>メールで問い合わせる</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setRoute("result")}>
            <Text style={styles.backText}>戻る</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}

function Progress({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.progressWrap}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(100, value))}%` }]} />
      </View>
      <Text style={styles.progressLabel}>{label}</Text>
    </View>
  );
}

function AnswerCard({
  title,
  description,
  onPress,
}: {
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.answerCard} onPress={onPress}>
      <Text style={styles.answerTitle}>{title}</Text>
      <Text style={styles.answerDesc}>{description}</Text>
    </TouchableOpacity>
  );
}

function YesNoButtons({ onYes, onNo }: { onYes: () => void; onNo: () => void }) {
  return (
    <View style={styles.yesNoWrap}>
      <TouchableOpacity style={styles.yesButton} onPress={onYes}>
        <Text style={styles.yesButtonText}>当てはまる</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.noButton} onPress={onNo}>
        <Text style={styles.noButtonText}>当てはまらない</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  bodyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 16,
  },
  title: {
    fontSize: 28,
    lineHeight: 40,
    fontWeight: "700",
    color: "#1e3a8a",
    textAlign: "center",
  },
  body: {
    fontSize: 16,
    lineHeight: 26,
    color: "#334155",
    textAlign: "center",
  },
  note: {
    fontSize: 14,
    lineHeight: 22,
    color: "#64748b",
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    minHeight: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  secondaryButton: {
    borderColor: "#2563eb",
    borderWidth: 2,
    backgroundColor: "#f8fafc",
    minHeight: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 8,
  },
  secondaryButtonText: {
    color: "#2563eb",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  backText: {
    color: "#64748b",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  stepTitle: {
    fontSize: 22,
    lineHeight: 32,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
    marginVertical: 16,
  },
  question: {
    fontSize: 20,
    lineHeight: 32,
    fontWeight: "600",
    color: "#0f172a",
    textAlign: "center",
    marginVertical: 24,
  },
  answerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  answerTitle: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: "600",
    color: "#0f172a",
    textAlign: "center",
  },
  answerDesc: {
    fontSize: 14,
    lineHeight: 22,
    color: "#64748b",
    textAlign: "center",
    marginTop: 4,
  },
  yesNoWrap: {
    gap: 12,
  },
  yesButton: {
    backgroundColor: "#dbeafe",
    borderColor: "#2563eb",
    borderWidth: 2,
    borderRadius: 12,
    minHeight: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  yesButtonText: {
    color: "#1d4ed8",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  noButton: {
    backgroundColor: "#ffffff",
    borderColor: "#cbd5e1",
    borderWidth: 2,
    borderRadius: 12,
    minHeight: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  noButtonText: {
    color: "#475569",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  progressWrap: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  progressTrack: {
    backgroundColor: "#e2e8f0",
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: "#2563eb",
    height: "100%",
    borderRadius: 999,
  },
  progressLabel: {
    textAlign: "right",
    color: "#64748b",
    marginTop: 6,
    fontSize: 12,
  },
  card: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    padding: 14,
  },
  cardSub: {
    backgroundColor: "#eef2ff",
  },
  cardBody: {
    fontSize: 15,
    lineHeight: 24,
    color: "#1e293b",
  },
  highlight: {
    color: "#1d4ed8",
    fontWeight: "700",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  bodyText: {
    textAlign: "center",
    color: "#64748b",
    fontSize: 14,
    marginTop: 4,
  },
  gradeList: {
    gap: 10,
    marginTop: 12,
  },
  gradeButton: {
    minHeight: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#ffffff",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  gradeText: {
    color: "#0f172a",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  preparingText: {
    color: "#64748b",
    fontSize: 12,
    lineHeight: 20,
  },
  prefList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  prefButton: {
    width: "48%",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  prefButtonSelected: {
    borderColor: "#2563eb",
    backgroundColor: "#dbeafe",
  },
  prefText: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "500",
  },
  prefTextSelected: {
    color: "#1d4ed8",
    fontWeight: "700",
  },
  disabledButton: {
    backgroundColor: "#94a3b8",
  },
});
