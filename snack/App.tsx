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
type FactorType = "phonology" | "eye" | "motor" | "visualPerception" | "automation";
type SpecialistType = "ST" | "OT" | "both" | null;
type RouteName = "onboarding" | "step01" | "step02" | "step03" | "result" | "map" | "contact";

const STEP02_QUESTIONS = {
  writing: [
    { id: "w1", text: "黒板を書き写すのが苦手、または遅いですか？" },
    { id: "w2", text: "図形や絵を見て、同じように書き写すのが苦手ですか？" },
    { id: "w3", text: "マス目や枠から、文字がはみ出すことがよくありますか？" },
    { id: "w4", text: "ひらがなの50音表を、何も見ずにすらすら書くことができますか？" },
    { id: "w5", text: "自分の名前をひらがなで、何も見ずに正しく書けますか？" },
    { id: "w6", text: "字を書くことを、嫌がりますか？" },
    { id: "w7", text: "ひらがな、カタカナを覚えるのに時間がかかりますか？" },
    { id: "w8", text: "文字を書くのに、時間がかかりますか？" },
  ],
  reading: [
    { id: "r1", text: "音読のとき、読む行を指で押さえながら読むことがよくありますか？" },
    { id: "r2", text: "ひらがなの50音表を、すらすら読むことができますか？" },
    { id: "r3", text: "文字を読むことを、嫌がりますか？" },
    { id: "r4", text: "読むときに、1文字ずつ区切るように読むことがよくありますか？" },
    { id: "r5", text: "文末や助詞（は・が・を・に など）を正確に読むことが苦手ですか？" },
    { id: "r6", text: "読み間違えや、勝手な推測で読んでしまうことが多いですか？" },
    { id: "r7", text: "音読で、つっかえることがよくありますか？" },
  ],
};

const STEP03_QUESTIONS: Record<FactorType, { id: string; text: string; score: number }[]> = {
  phonology: [
    { id: "p1", text: "しりとりができますか？", score: 5 },
    {
      id: "p2",
      text: "「りんご」は3文字、「しんぶんし」は5文字等、『ん』が入った時に文字数の把握が苦手ですか？",
      score: 5,
    },
    { id: "p3", text: "「か」から始まる言葉を、5個以上言えますか？", score: 2 },
    { id: "p4", text: "「ぐりこ」などの、音の数だけ進む遊びで正しい音の数だけ進めますか？", score: 5 },
    { id: "p5", text: "「がっこう」「まって」などの小さい「っ」を書き間違えたり、書かないとこがありますか？", score: 2 },
    { id: "p6", text: "ひらがなを「あ」から「ん」まで、順番に言うことが難しいですか？", score: 5 },
    { id: "p7", text: "単語の途中と音を答えることができますか？例:「からおけ」の2つ目の音は？答え:「ら」", score: 5 },
    { id: "p8", text: "「さかな」を逆から言えますか？", score: 5 },
    { id: "p9", text: "「うれも」を逆から言うことが難しいですか？", score: 5 },
  ],
  eye: [
    { id: "e1", text: "読むときに、行を飛ばしたり同じ行をまた読んだりしますか？", score: 5 },
    { id: "e2", text: "ボールを受けるのが苦手ですか？", score: 2 },
    { id: "e3", text: "動くものを目で追うのが苦手ですか？", score: 2 },
  ],
  motor: [
    { id: "m1", text: "字を書くとき、指先より手首や腕を大きく動かしますか？", score: 5 },
    { id: "m2", text: "はさみで線に沿って切ったり、線をなぞったりする作業が苦手ですか？", score: 5 },
    { id: "m3", text: "座って書いていると、体が動いて姿勢が崩れやすいですか？", score: 5 },
    { id: "m4", text: "字を書くとき、筆圧が強すぎたり弱すぎたりしますか？", score: 2 },
  ],
  visualPerception: [
    { id: "v1", text: "枠がないと、文字の大きさや位置がバラバラになりやすいですか？", score: 1 },
    { id: "v2", text: "似た形の文字（例：さ/き、ぬ/め）を読み間違えることがよくありますか？", score: 5 },
    { id: "v3", text: "目の前の物でも、探すのに時間がかかりますか？", score: 2 },
    { id: "v4", text: "文字を左右反対（鏡文字）に書くことがありますか？", score: 5 },
    { id: "v5", text: "書き順が毎回バラバラになりやすいですか？", score: 2 },
  ],
  automation: [],
};

const FACTOR_NAMES: Record<FactorType, string> = {
  phonology: "音韻",
  eye: "眼球運動",
  motor: "運動",
  visualPerception: "視知覚",
  automation: "自動化",
};

// STEP02で「NO」のときにカウントする設問（肯定形「できますか？」など）
const STEP02_INVERTED_IDS = new Set(["w4", "w5", "r2"]);
// STEP03で「NO」のときにカウントする設問（肯定形「できますか？」など）
const STEP03_INVERTED_IDS = new Set(["p1", "p3", "p4", "p7", "p8"]);

function step02Counts(answers: Record<string, boolean>, id: string): boolean {
  const v = answers[id];
  return STEP02_INVERTED_IDS.has(id) ? !v : !!v;
}

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
  const factors = new Set<FactorType>();

  if (difficultyType === "writing" || difficultyType === "both") {
    const w1 = step02Counts(answers, "w1");
    const w2 = step02Counts(answers, "w2");
    const w3 = step02Counts(answers, "w3");
    const w4 = step02Counts(answers, "w4");
    const w5 = step02Counts(answers, "w5");
    const w6 = step02Counts(answers, "w6");

    if (w1 || w4 || w5 || w6) {
      factors.add("phonology");
      factors.add("eye");
      factors.add("motor");
      factors.add("visualPerception");
      factors.add("automation");
    } else if (w2 || w3) {
      factors.add("eye");
      factors.add("motor");
      factors.add("visualPerception");
    } else {
      factors.add("automation");
    }
  }

  if (difficultyType === "reading" || difficultyType === "both") {
    const r1 = step02Counts(answers, "r1");
    const r2 = step02Counts(answers, "r2");
    const r3 = step02Counts(answers, "r3");
    const r4 = step02Counts(answers, "r4");
    const r5 = step02Counts(answers, "r5");

    if (r2 || r3 || r4 || r5) {
      factors.add("phonology");
      factors.add("eye");
      factors.add("motor");
      factors.add("visualPerception");
      factors.add("automation");
    } else if (r1) {
      factors.add("phonology");
      factors.add("eye");
      factors.add("motor");
      factors.add("automation");
    } else {
      factors.add("automation");
    }
  }

  return Array.from(factors);
}

function calculateResultFactors(
  candidateFactors: FactorType[],
  answers: Record<string, boolean>,
): FactorType[] {
  const resultFactors: FactorType[] = [];

  for (const factor of candidateFactors) {
    if (factor === "automation") continue;
    let totalScore = 0;
    for (const q of STEP03_QUESTIONS[factor]) {
      const counts = STEP03_INVERTED_IDS.has(q.id) ? !answers[q.id] : answers[q.id];
      if (counts) totalScore += q.score;
    }
    if (totalScore >= 5) resultFactors.push(factor);
  }

  if (resultFactors.length === 0) resultFactors.push("automation");
  return resultFactors;
}

function determineSpecialist(factors: FactorType[]): SpecialistType {
  const needsST = factors.includes("phonology") || factors.includes("automation");
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
    if (difficultyType === "writing") return STEP02_QUESTIONS.writing;
    if (difficultyType === "reading") return STEP02_QUESTIONS.reading;
    if (difficultyType === "both") return [...STEP02_QUESTIONS.writing, ...STEP02_QUESTIONS.reading];
    return [];
  }, [difficultyType]);

  const step03Questions = useMemo(() => {
    const all: { id: string; text: string; score: number; factor: FactorType }[] = [];
    for (const factor of candidateFactors) {
      if (factor === "automation") continue;
      for (const q of STEP03_QUESTIONS[factor]) {
        all.push({ ...q, factor });
      }
    }
    return all;
  }, [candidateFactors]);

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

    return (
      <SafeAreaView style={styles.container}>
        <Progress
          value={progress}
          label={`STEP 3/4 (${step03Index + 1}/${step03Questions.length})`}
        />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.question}>{question.text}</Text>
          <YesNoButtons
            onYes={() => {
              const next = { ...step03Answers, [question.id]: true };
              setStep03Answers(next);
              if (step03Index === step03Questions.length - 1) {
                const factors = calculateResultFactors(candidateFactors, next);
                setResultFactors(factors);
                setSpecialist(determineSpecialist(factors));
                setRoute("result");
              } else {
                setStep03Index((v) => v + 1);
              }
            }}
            onNo={() => {
              const next = { ...step03Answers, [question.id]: false };
              setStep03Answers(next);
              if (step03Index === step03Questions.length - 1) {
                const factors = calculateResultFactors(candidateFactors, next);
                setResultFactors(factors);
                setSpecialist(determineSpecialist(factors));
                setRoute("result");
              } else {
                setStep03Index((v) => v + 1);
              }
            }}
          />
        </ScrollView>
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => {
              if (step03Index > 0) setStep03Index((v) => v - 1);
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
