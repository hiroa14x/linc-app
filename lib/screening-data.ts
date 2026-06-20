export type GradeLevel =
  | 'kindergarten'
  | 'grade1'
  | 'grade2'
  | 'grade3'
  | 'grade4'
  | 'grade5'
  | 'grade6';

export type SchoolTerm = 'first' | 'second';

export type ScreeningDatasetKey =
  | 'kindergarten-second'
  | 'grade1-first'
  | 'grade1-second';

export type DifficultyType = 'writing' | 'reading' | 'both' | null;
export type DifficultyKey = Exclude<DifficultyType, null>;

export type FactorType =
  | 'phonology'
  | 'eye'
  | 'motor'
  | 'visualPerception'
  | 'automation'
  | 'rigidity'
  | 'attention';

export type CountWhen = 'yes' | 'no';

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
  factors: FactorType[];
  countsWhen?: CountWhen;
};

export type ScreeningDataset = {
  step02: Record<DifficultyKey, Step02Question[]>;
  step03: Record<DifficultyKey, Step03Question[]>;
};

type Step02Seed = Omit<Step02Question, 'id'> & { key: string };
type Step03Seed = Omit<Step03Question, 'id'> & { key: string };

export const GRADE_LEVELS: GradeLevel[] = [
  'kindergarten',
  'grade1',
  'grade2',
  'grade3',
  'grade4',
  'grade5',
  'grade6',
];

export const GRADE_LABELS: Record<GradeLevel, string> = {
  kindergarten: '年長',
  grade1: '小学1年生',
  grade2: '小学2年生',
  grade3: '小学3年生',
  grade4: '小学4年生',
  grade5: '小学5年生',
  grade6: '小学6年生',
};

export const TERM_LABELS: Record<SchoolTerm, string> = {
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

export const SCREENING_DATASETS: Record<ScreeningDatasetKey, ScreeningDataset> = {
  'kindergarten-second': KINDERGARTEN_SECOND,
  'grade1-first': GRADE1_FIRST,
  'grade1-second': GRADE1_SECOND,
};

export function getSchoolTerm(date = new Date()): SchoolTerm {
  const month = date.getMonth() + 1;
  return month >= 4 && month <= 9 ? 'first' : 'second';
}

export function getDatasetKey(
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
