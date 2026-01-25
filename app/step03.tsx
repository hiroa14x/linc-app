import { Text, View, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform, StyleSheet } from "react-native";
import { useMemo } from "react";

import { ScreenContainer } from "@/components/screen-container";
import { 
  useScreening, 
  STEP03_QUESTIONS,
  calculateResultFactors,
  determineSpecialist,
  FactorType
} from "@/lib/screening-context";

export default function Step03Screen() {
  const router = useRouter();
  const { state, dispatch } = useScreening();

  // 候補要因に基づいた質問リストを取得
  const questions = useMemo(() => {
    const allQuestions: { id: string; text: string; score: number; factor: FactorType }[] = [];
    
    for (const factor of state.candidateFactors) {
      if (factor === 'automation') continue; // 自動化は設問なし
      const factorQuestions = STEP03_QUESTIONS[factor];
      for (const q of factorQuestions) {
        allQuestions.push({ ...q, factor });
      }
    }
    
    return allQuestions;
  }, [state.candidateFactors]);

  // 質問がない場合は直接結果画面へ
  if (questions.length === 0) {
    // 自動化のみの場合
    dispatch({ type: 'SET_RESULT_FACTORS', payload: ['automation'] });
    dispatch({ type: 'SET_SPECIALIST', payload: determineSpecialist(['automation']) });
    dispatch({ type: 'SET_CURRENT_STEP', payload: 'result' });
    router.replace('/result');
    return null;
  }

  const currentQuestion = questions[state.step03Index];
  const isLastQuestion = state.step03Index === questions.length - 1;
  const progress = ((state.step03Index + 1) / questions.length) * 25 + 75; // 75-100%

  // ワンタップで回答して次へ進む
  const handleAnswer = (value: boolean) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // 回答を保存
    dispatch({ 
      type: 'SET_STEP03_ANSWER', 
      payload: { id: currentQuestion.id, value } 
    });

    if (isLastQuestion) {
      // 結果を計算（現在の回答も含める）
      const updatedAnswers = { ...state.step03Answers, [currentQuestion.id]: value };
      const resultFactors = calculateResultFactors(
        state.candidateFactors,
        updatedAnswers
      );
      const specialist = determineSpecialist(resultFactors);
      
      dispatch({ type: 'SET_RESULT_FACTORS', payload: resultFactors });
      dispatch({ type: 'SET_SPECIALIST', payload: specialist });
      dispatch({ type: 'SET_CURRENT_STEP', payload: 'result' });
      router.push('/result');
    } else {
      dispatch({ type: 'SET_STEP03_INDEX', payload: state.step03Index + 1 });
    }
  };

  const handleBack = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (state.step03Index > 0) {
      dispatch({ type: 'SET_STEP03_INDEX', payload: state.step03Index - 1 });
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
          STEP 3/4 ({state.step03Index + 1}/{questions.length})
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
