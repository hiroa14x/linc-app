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

  const handleToggle = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const currentValue = state.step03Answers[currentQuestion.id] ?? false;
    dispatch({ 
      type: 'SET_STEP03_ANSWER', 
      payload: { id: currentQuestion.id, value: !currentValue } 
    });
  };

  const handleNext = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (isLastQuestion) {
      // 結果を計算
      const resultFactors = calculateResultFactors(
        state.candidateFactors,
        state.step03Answers
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

  const isChecked = state.step03Answers[currentQuestion.id] ?? false;

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

        {/* チェックボックス */}
        <TouchableOpacity
          onPress={handleToggle}
          className={`w-full py-5 px-6 rounded-2xl border-2 ${
            isChecked ? 'border-primary bg-white' : 'border-border bg-surface'
          }`}
          style={styles.checkCard}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center justify-between">
            <Text className={`text-base font-medium ${
              isChecked ? 'text-primary' : 'text-foreground'
            }`}>
              当てはまる
            </Text>
            <View className={`w-6 h-6 rounded border-2 items-center justify-center ${
              isChecked ? 'border-primary bg-primary' : 'border-border'
            }`}>
              {isChecked && (
                <Text className="text-white text-xs font-bold">✓</Text>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* 補助文 */}
        <View className="mt-6">
          <Text className="text-sm text-muted text-center">
            迷った場合は、より近いものを選んでください
          </Text>
        </View>
      </ScrollView>

      {/* ボタン */}
      <View className="px-6 pb-8 pt-4">
        <TouchableOpacity
          onPress={handleNext}
          className="w-full py-4 rounded-xl bg-primary"
          style={styles.button}
          activeOpacity={0.8}
        >
          <Text className="text-white text-lg font-semibold text-center">
            {isLastQuestion ? '結果を見る' : '次へ'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleBack}
          className="w-full py-3 mt-2"
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
  checkCard: {
    minHeight: 64,
  },
  button: {
    minHeight: 56,
  },
});
