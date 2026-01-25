import { Text, View, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform, StyleSheet } from "react-native";
import { useMemo } from "react";

import { ScreenContainer } from "@/components/screen-container";
import { 
  useScreening, 
  STEP02_QUESTIONS, 
  calculateCandidateFactors 
} from "@/lib/screening-context";

export default function Step02Screen() {
  const router = useRouter();
  const { state, dispatch } = useScreening();

  // 現在の苦手タイプに応じた質問リストを取得
  const questions = useMemo(() => {
    if (state.difficultyType === 'writing') {
      return STEP02_QUESTIONS.writing;
    } else if (state.difficultyType === 'reading') {
      return STEP02_QUESTIONS.reading;
    } else if (state.difficultyType === 'both') {
      return [...STEP02_QUESTIONS.writing, ...STEP02_QUESTIONS.reading];
    }
    return [];
  }, [state.difficultyType]);

  const currentQuestion = questions[state.step02Index];
  const isLastQuestion = state.step02Index === questions.length - 1;
  const progress = ((state.step02Index + 1) / questions.length) * 50 + 25; // 25-75%

  // ワンタップで回答して次へ進む
  const handleAnswer = (value: boolean) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // 回答を保存
    dispatch({ 
      type: 'SET_STEP02_ANSWER', 
      payload: { id: currentQuestion.id, value } 
    });

    // 次へ進む
    if (isLastQuestion) {
      // 要因候補を計算（現在の回答も含める）
      const updatedAnswers = { ...state.step02Answers, [currentQuestion.id]: value };
      const candidateFactors = calculateCandidateFactors(
        state.difficultyType,
        updatedAnswers
      );
      dispatch({ type: 'SET_CANDIDATE_FACTORS', payload: candidateFactors });
      dispatch({ type: 'SET_CURRENT_STEP', payload: 'step03' });
      dispatch({ type: 'SET_STEP03_INDEX', payload: 0 });
      router.push('/step03');
    } else {
      dispatch({ type: 'SET_STEP02_INDEX', payload: state.step02Index + 1 });
    }
  };

  const handleBack = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (state.step02Index > 0) {
      dispatch({ type: 'SET_STEP02_INDEX', payload: state.step02Index - 1 });
    } else {
      router.back();
    }
  };

  if (!currentQuestion) {
    return null;
  }

  return (
    <ScreenContainer className="flex-1 bg-background" edges={["top", "bottom", "left", "right"]}>
      {/* 進捗バー */}
      <View className="px-6 pt-4">
        <View className="h-2 bg-border rounded-full overflow-hidden">
          <View className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
        </View>
        <Text className="text-xs text-muted mt-2 text-right">
          STEP 2/4 ({state.step02Index + 1}/{questions.length})
        </Text>
      </View>

      <ScrollView 
        className="flex-1 px-6"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 設問 */}
        <View className="mt-12 mb-8">
          <Text className="text-lg font-semibold text-foreground text-center leading-8">
            {currentQuestion.text}
          </Text>
        </View>

        {/* ワンタップ選択肢 */}
        <View className="gap-4">
          <TouchableOpacity
            onPress={() => handleAnswer(true)}
            className="w-full py-5 px-6 rounded-2xl border-2 border-primary bg-white"
            style={styles.answerCard}
            activeOpacity={0.7}
          >
            <Text className="text-lg font-semibold text-primary text-center">
              当てはまる
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleAnswer(false)}
            className="w-full py-5 px-6 rounded-2xl border-2 border-border bg-surface"
            style={styles.answerCard}
            activeOpacity={0.7}
          >
            <Text className="text-lg font-semibold text-muted text-center">
              当てはまらない
            </Text>
          </TouchableOpacity>
        </View>

        {/* 補助文 */}
        <View className="mt-6">
          <Text className="text-sm text-muted text-center">
            迷った場合は、より近いものを選んでください
          </Text>
        </View>
      </ScrollView>

      {/* 戻るボタン */}
      <View className="px-6 pb-8 pt-4">
        <TouchableOpacity
          onPress={handleBack}
          className="w-full py-3"
          activeOpacity={0.6}
        >
          <Text className="text-muted text-base text-center">
            戻る
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  answerCard: {
    minHeight: 64,
  },
});
