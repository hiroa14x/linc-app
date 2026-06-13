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

type DifficultyType = "writing" | "reading" | "both" | null;
type FactorType =
  | "phonology"
  | "eye"
  | "motor"
  | "visualPerception"
  | "automation"
  | "rigidity"
  | "attention";
type SpecialistType = "ST" | "OT" | "both" | null;
type RouteName = "onboarding" | "step01" | "step02" | "step03" | "result" | "map" | "contact";
type DifficultyKey = Exclude<DifficultyType, null>;
type CountWhen = "yes" | "no";

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
  countsWhen?: CountWhen;
};

type Step03QuestionWithFactor = Step03Question & {
  factor: FactorType;
};

const FACTOR_ORDER: FactorType[] = [
  "phonology",
  "eye",
  "motor",
  "visualPerception",
  "automation",
  "rigidity",
  "attention",
];

const ALWAYS_ASK_FACTORS: FactorType[] = ["rigidity", "attention"];
const SCORE_THRESHOLD = 5;

const STEP02_QUESTIONS: Record<DifficultyKey, Step02Question[]> = {
  reading: [
    {
      id: "r1",
      text: "音読の際、読む行を指で押さえながら読むことがよくありますか？",
      factors: ["phonology", "eye", "automation"],
    },
    {
      id: "r2",
      text: "字を読むことを嫌がりますか？",
      factors: ["phonology", "eye", "visualPerception", "automation"],
    },
    {
      id: "r3",
      text: "逐次読みをしますか？",
      factors: ["phonology", "eye", "visualPerception", "automation"],
    },
    {
      id: "r4",
      text: "文末や助詞を正確に読むことが苦手ですか？",
      factors: ["phonology", "eye", "visualPerception", "automation"],
    },
    {
      id: "r5",
      text: "読む時に読み間違えが多い、勝手読みをしますか？",
      factors: ["phonology", "eye", "visualPerception", "automation"],
    },
    {
      id: "r6",
      text: "音読でつっかえてしまいますか？",
      factors: ["phonology", "eye", "visualPerception", "automation"],
    },
  ],
  writing: [
    {
      id: "w1",
      text: "黒板を写すのが苦手、または遅いですか？",
      factors: ["phonology", "eye", "motor", "visualPerception", "automation"],
    },
    {
      id: "w2",
      text: "図形や文字を見て同じように書き写すことが苦手ですか？",
      factors: ["eye", "motor", "visualPerception"],
    },
    {
      id: "w3",
      text: "マス目や枠から文字がはみ出ることがよくありますか？",
      factors: ["eye", "motor", "visualPerception"],
    },
    {
      id: "w4",
      text: "自分の名前をひらがなで正しく書くことができますか？",
      factors: ["phonology", "eye", "motor", "visualPerception", "automation"],
      countsWhen: "no",
    },
    {
      id: "w5",
      text: "字を書くことを嫌がりますか？",
      factors: ["phonology", "eye", "motor", "visualPerception", "automation"],
    },
    {
      id: "w6",
      text: "ひらがな、カタカナを覚えられませんか？（読みも書きもできない）",
      factors: ["phonology", "eye", "motor", "visualPerception", "automation"],
    },
    {
      id: "w7",
      text: "ひらがな、カタカナを覚えられませんか？（読めるが書けない）",
      factors: ["phonology", "eye", "motor", "visualPerception", "automation"],
    },
    {
      id: "w8",
      text: "文字を書くのに時間がかかりますか？",
      factors: ["phonology", "eye", "motor", "visualPerception", "automation"],
    },
  ],
  both: [
    {
      id: "b1",
      text: "音読の際、読む行を指で押さえながら読むことがよくありますか？",
      factors: ["phonology", "eye", "automation"],
    },
    {
      id: "b2",
      text: "字を読むことを嫌がりますか？",
      factors: ["phonology", "eye", "visualPerception", "automation"],
    },
    {
      id: "b3",
      text: "逐次読みをしますか？",
      factors: ["phonology", "eye", "visualPerception", "automation"],
    },
    {
      id: "b4",
      text: "文末や助詞を正確に読むことが苦手ですか？",
      factors: ["phonology", "eye", "visualPerception", "automation"],
    },
    {
      id: "b5",
      text: "読む時に読み間違えが多い、勝手読みをしますか？",
      factors: ["phonology", "eye", "visualPerception", "automation"],
    },
    {
      id: "b6",
      text: "音読でつっかえてしまいますか？",
      factors: ["phonology", "eye", "visualPerception", "automation"],
    },
    {
      id: "b7",
      text: "黒板を写すのが苦手、または遅いですか？",
      factors: ["phonology", "eye", "motor", "visualPerception", "automation"],
    },
    {
      id: "b8",
      text: "図形や文字を見て同じように書き写すことが苦手ですか？",
      factors: ["eye", "motor", "visualPerception"],
    },
    {
      id: "b9",
      text: "マス目や枠から文字がはみ出ることがよくありますか？",
      factors: ["eye", "motor", "visualPerception"],
    },
    {
      id: "b10",
      text: "自分の名前をひらがなで正しく書くことができますか？",
      factors: ["phonology", "eye", "motor", "visualPerception", "automation"],
      countsWhen: "no",
    },
    {
      id: "b11",
      text: "字を書くことを嫌がりますか？",
      factors: ["phonology", "eye", "motor", "visualPerception", "automation"],
    },
    {
      id: "b12",
      text: "ひらがな、カタカナを覚えられませんか？（読みも書きもできない）",
      factors: ["phonology", "eye", "motor", "visualPerception", "automation"],
    },
    {
      id: "b13",
      text: "ひらがな、カタカナを覚えられませんか？（読めるが書けない）",
      factors: ["phonology", "eye", "motor", "visualPerception", "automation"],
    },
    {
      id: "b14",
      text: "文字を書くのに時間がかかりますか？",
      factors: ["phonology", "eye", "motor", "visualPerception", "automation"],
    },
  ],
};

const READING_PHONOLOGY_QUESTIONS: Step03Question[] = [
  { id: "phonology-shiritori", text: "しりとりができますか？", score: 5, countsWhen: "no" },
  {
    id: "phonology-n-count",
    text: "「りんご」は3文字、「しんぶんし」は5文字等、「ん」が入った時に文字数の把握が苦手ですか？",
    score: 5,
  },
  {
    id: "phonology-sound-steps",
    text: "「ぐりこ」などの、音の数だけ進む遊びで正しい音の数だけ進めますか？",
    score: 5,
    countsWhen: "no",
  },
  { id: "phonology-kana-order", text: "ひらがなを「あ」から「ん」まで、順番に言うことが難しいですか？", score: 5 },
  {
    id: "phonology-middle-sound",
    text: "単語の途中の音を答えることができますか？例：「からおけ」の2つ目の音は？ 答え：「ら」",
    score: 5,
    countsWhen: "no",
  },
  { id: "phonology-reverse-sakana", text: "「さかな」を逆から言えますか？", score: 5, countsWhen: "no" },
  { id: "phonology-ka-words", text: "「か」から始まる言葉を、5個以上言えますか？", score: 2, countsWhen: "no" },
  {
    id: "phonology-small-tsu",
    text: "「がっこう」「まって」などの小さい「っ」を書き間違えたり、書かないことがありますか？",
    score: 2,
  },
  { id: "phonology-reverse-uremo", text: "「うれも」を逆から言うことが難しいですか？", score: 3 },
];

const WRITING_PHONOLOGY_QUESTIONS: Step03Question[] = [
  ...READING_PHONOLOGY_QUESTIONS.slice(0, 6),
  {
    id: "phonology-kana-write",
    text: "ひらがな50音を「あ」から「ん」まで、すらすら書けますか？",
    score: 5,
    countsWhen: "no",
  },
  ...READING_PHONOLOGY_QUESTIONS.slice(6),
];

const EYE_QUESTIONS: Step03Question[] = [
  { id: "eye-line-skip", text: "読むときに、行を飛ばしたり同じ行をまた読んだりしますか？", score: 5 },
  { id: "eye-ball-catch", text: "ボールを受けるのが苦手ですか？", score: 3 },
  { id: "eye-tracking", text: "動くものを目で追うのが苦手ですか？", score: 2 },
];

const MOTOR_QUESTIONS: Step03Question[] = [
  { id: "motor-arm-movement", text: "字を書くときに手首や腕全体を大きく動かすことが多いですか？", score: 5 },
  {
    id: "motor-cut-trace-draw",
    text: "利き手で、できるだけ正確に切る・なぞる・描くことができますか？",
    score: 5,
    countsWhen: "no",
  },
  {
    id: "motor-posture",
    text: "椅子に長く安定して座りにくく、書字中に身体がよく動いたり、姿勢が崩れやすかったりしますか？",
    score: 2,
  },
  { id: "motor-pressure", text: "字を書くときに筆圧が強すぎる、または弱すぎる傾向がありますか？", score: 2 },
];

const READING_VISUAL_PERCEPTION_QUESTIONS: Step03Question[] = [
  { id: "visual-similar-letters", text: "似た形の文字（例：さ/き、ぬ/め）を読み間違えることがよくありますか？", score: 5 },
  { id: "visual-search", text: "目の前の物でも、探すのに時間がかかりますか？", score: 2 },
];

const WRITING_VISUAL_PERCEPTION_QUESTIONS: Step03Question[] = [
  READING_VISUAL_PERCEPTION_QUESTIONS[0],
  { id: "visual-mirror-writing", text: "鏡文字をよく書きますか？", score: 5 },
  READING_VISUAL_PERCEPTION_QUESTIONS[1],
  { id: "visual-stroke-order", text: "書き順がバラバラになりやすいですか？", score: 2 },
  {
    id: "visual-free-space-balance",
    text: "マスや枠がある時に比べて、フリースペースに書く場合は、バランスの悪い文字になりやすいですか？",
    score: 1,
  },
];

const RIGIDITY_QUESTIONS: Step03Question[] = [
  { id: "rigidity-letter-shape", text: "文字の形にこだわり、書くことが進みにくいですか？", score: 5 },
  { id: "rigidity-avoid-mistake", text: "間違いたくないというこだわりを強く持っていますか？", score: 2 },
  { id: "rigidity-interest", text: "興味のない課題や授業は受けようとしないですか？", score: 2 },
  { id: "rigidity-tracing", text: "なぞり書きの時にはみ出さないように強くこだわりますか？", score: 2 },
];

const ATTENTION_QUESTIONS: Step03Question[] = [
  { id: "attention-distracted", text: "注意は逸れやすいですか？", score: 5 },
  { id: "attention-organizing", text: "整理整頓が苦手ですか？", score: 2 },
  { id: "attention-forgetting", text: "忘れ物が多いですか？", score: 2 },
  { id: "attention-careless", text: "ケアレスミスが多いですか？", score: 2 },
  { id: "attention-other-things", text: "文字を書いている時に他のことをし出すことが多いですか？", score: 2 },
];

const STEP03_QUESTIONS: Record<DifficultyKey, Record<FactorType, Step03Question[]>> = {
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

const FACTOR_NAMES: Record<FactorType, string> = {
  phonology: "音韻",
  eye: "眼球運動",
  motor: "運動",
  visualPerception: "視知覚",
  rigidity: "こだわり",
  attention: "注意",
  automation: "自動化",
};

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

function calculateCandidateFactors(
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

function calculateResultFactors(
  difficultyType: DifficultyType,
  candidateFactors: FactorType[],
  answers: Record<string, boolean>,
): FactorType[] {
  const resultFactors = candidateFactors.filter((factor) => {
    return factor !== "automation" && factorReachedThreshold(difficultyType, factor, answers);
  });

  if (resultFactors.length === 0) resultFactors.push("automation");
  return resultFactors;
}

function determineSpecialist(factors: FactorType[]): SpecialistType {
  const needsST =
    factors.includes("phonology") ||
    factors.includes("automation") ||
    factors.includes("eye") ||
    factors.includes("visualPerception");
  const needsOT =
    factors.includes("eye") || factors.includes("motor") || factors.includes("visualPerception");
  if (needsST && needsOT) return "both";
  if (needsST) return "ST";
  if (needsOT) return "OT";
  return null;
}

function getDifficultyTypeLabel(type: DifficultyType): string {
  if (type === "writing") return "書く";
  if (type === "reading") return "読む";
  if (type === "both") return "書く・読む";
  return "";
}

function isDifficultyKey(type: DifficultyType): type is DifficultyKey {
  return type === "reading" || type === "writing" || type === "both";
}

function answerCounts(countsWhen: CountWhen | undefined, value: boolean | undefined): boolean {
  if (value === undefined) return false;
  return (countsWhen ?? "yes") === "yes" ? value : !value;
}

function step02Counts(question: Step02Question, answers: Record<string, boolean>): boolean {
  return answerCounts(question.countsWhen, answers[question.id]);
}

function step03Counts(question: Step03Question, answers: Record<string, boolean>): boolean {
  return answerCounts(question.countsWhen, answers[question.id]);
}

function getStep02Questions(difficultyType: DifficultyType): Step02Question[] {
  if (!isDifficultyKey(difficultyType)) return [];
  return STEP02_QUESTIONS[difficultyType];
}

function getStep03Questions(
  difficultyType: DifficultyType,
  candidateFactors: FactorType[],
): Step03QuestionWithFactor[] {
  if (!isDifficultyKey(difficultyType)) return [];

  const questionsByFactor = STEP03_QUESTIONS[difficultyType];
  return candidateFactors.flatMap((factor) => {
    if (factor === "automation") return [];
    return questionsByFactor[factor].map((question) => ({ ...question, factor }));
  });
}

function calculateFactorScore(
  difficultyType: DifficultyType,
  factor: FactorType,
  answers: Record<string, boolean>,
): number {
  if (!isDifficultyKey(difficultyType) || factor === "automation") return 0;

  return STEP03_QUESTIONS[difficultyType][factor].reduce((total, question) => {
    return total + (step03Counts(question, answers) ? question.score : 0);
  }, 0);
}

function factorReachedThreshold(
  difficultyType: DifficultyType,
  factor: FactorType,
  answers: Record<string, boolean>,
): boolean {
  return calculateFactorScore(difficultyType, factor, answers) >= SCORE_THRESHOLD;
}

function getNextStep03Index(
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

function getPreviousAnsweredStep03Index(
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

function pruneStep03AnswersAfterIndex(
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

function getSpecialistLabel(specialist: SpecialistType): string {
  if (specialist === "ST") return "言語聴覚士（ST）";
  if (specialist === "OT") return "作業療法士（OT）";
  if (specialist === "both") return "作業療法士（OT）・言語聴覚士（ST）";
  return "";
}

export default function App() {
  const [route, setRoute] = useState<RouteName>("onboarding");
  const [difficultyType, setDifficultyType] = useState<DifficultyType>(null);
  const [step02Answers, setStep02Answers] = useState<Record<string, boolean>>({});
  const [step03Answers, setStep03Answers] = useState<Record<string, boolean>>({});
  const [candidateFactors, setCandidateFactors] = useState<FactorType[]>([]);
  const [resultFactors, setResultFactors] = useState<FactorType[]>([]);
  const [specialist, setSpecialist] = useState<SpecialistType>(null);
  const [step02Index, setStep02Index] = useState(0);
  const [step03Index, setStep03Index] = useState(0);
  const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(null);

  const step02Questions = useMemo(() => {
    return getStep02Questions(difficultyType);
  }, [difficultyType]);

  const step03Questions = useMemo(() => {
    return getStep03Questions(difficultyType, candidateFactors);
  }, [candidateFactors, difficultyType]);

  useEffect(() => {
    if (route !== "step03" || step03Questions.length !== 0) return;
    const autoFactors: FactorType[] = ["automation"];
    setResultFactors(autoFactors);
    setSpecialist(determineSpecialist(autoFactors));
    setRoute("result");
  }, [route, step03Questions.length]);

  const resetAll = () => {
    setRoute("onboarding");
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
              setRoute("step01");
            }}
          >
            <Text style={styles.primaryButtonText}>はじめる</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (route === "step01") {
    return (
      <SafeAreaView style={styles.container}>
        <Progress value={25} label="STEP 1/4" />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.stepTitle}>お子さんが苦手なのは{"\n"}どちらですか？</Text>
          <AnswerCard
            title="書く"
            description="文字を書くことが苦手"
            onPress={() => {
              setDifficultyType("writing");
              setStep02Index(0);
              setRoute("step02");
            }}
          />
          <AnswerCard
            title="読む"
            description="文字を読むことが苦手"
            onPress={() => {
              setDifficultyType("reading");
              setStep02Index(0);
              setRoute("step02");
            }}
          />
          <AnswerCard
            title="書く・読む"
            description="どちらも苦手"
            onPress={() => {
              setDifficultyType("both");
              setStep02Index(0);
              setRoute("step02");
            }}
          />
        </ScrollView>
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => setRoute("onboarding")}>
            <Text style={styles.backText}>戻る</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (route === "step02") {
    const question = step02Questions[step02Index];
    if (!question) return null;
    const progress = ((step02Index + 1) / step02Questions.length) * 50 + 25;
    return (
      <SafeAreaView style={styles.container}>
        <Progress
          value={progress}
          label={`STEP 2/4 (${step02Index + 1}/${step02Questions.length})`}
        />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.question}>{question.text}</Text>
          <YesNoButtons
            onYes={() => {
              const next = { ...step02Answers, [question.id]: true };
              setStep02Answers(next);
              if (step02Index === step02Questions.length - 1) {
                setCandidateFactors(calculateCandidateFactors(difficultyType, next));
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
                setCandidateFactors(calculateCandidateFactors(difficultyType, next));
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
    const progress = ((step03Index + 1) / step03Questions.length) * 25 + 75;
    const answerStep03 = (value: boolean) => {
      const prunedAnswers = pruneStep03AnswersAfterIndex(
        difficultyType,
        candidateFactors,
        step03Answers,
        step03Index,
      );
      const next = { ...prunedAnswers, [question.id]: value };
      const nextIndex = getNextStep03Index(difficultyType, candidateFactors, next, step03Index + 1);

      setStep03Answers(next);
      if (nextIndex === -1) {
        const factors = calculateResultFactors(difficultyType, candidateFactors, next);
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
          label={`STEP 3/4 (${step03Index + 1}/${step03Questions.length})`}
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
        <Progress value={100} label="STEP 4/4 完了" />
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
