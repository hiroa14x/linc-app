import { Text, View, TouchableOpacity, ScrollView , Platform, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useMemo, useEffect, useState } from "react";

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
  const [isRedirecting, setIsRedirecting] = useState(false);

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

  // 質問がない場合は直接結果画面へ（useEffectで副作用を処理）
  useEffect(() => {
    if (questions.length === 0 && !isRedirecting) {
      setIsRedirecting(true);
      // 自動化のみの場合
      dispatch({ type: 'SET_RESULT_FACTORS', payload: ['automation'] });
      dispatch({ type: 'SET_SPECIALIST', payload: determineSpecialist(['automation']) });
      dispatch({ type: 'SET_CURRENT_STEP', payload: 'result' });
      router.replace('/result');
    }
  }, [questions.length, isRedirecting, dispatch, router]);

  // リダイレクト中または質問がない場合はnullを返す
  if (questions.length === 0 || isRedirecting) {
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
        <Text style={styles.progress} className="text-muted mt-2 text-right">
          STEP 3/4 ({state.step03Index + 1}/{questions.length})
        </Text>
      </View>

      <ScrollView 
        className="flex-1 px-6"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 設問 - Heading sm (18px) */}
        <View className="mt-12 mb-8">
          <Text style={styles.question} className="text-foreground text-center">
            {currentQuestion.text}
          </Text>
        </View>

        {/* ワンタップ選択肢 */}
        <View className="gap-4">
          <TouchableOpacity
            onPress={() => handleAnswer(true)}
            className="w-full py-5 px-6 rounded-2xl border-2 border-primary bg-background"
            style={styles.answerCard}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="当てはまる"
            accessibilityHint="この質問に当てはまると回答して次に進みます"
          >
            <Text style={styles.answerText} className="text-primary text-center">
              当てはまる
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleAnswer(false)}
            className="w-full py-5 px-6 rounded-2xl border-2 border-border bg-surface"
            style={styles.answerCard}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="当てはまらない"
            accessibilityHint="この質問に当てはまらないと回答して次に進みます"
          >
            <Text style={styles.answerText} className="text-muted text-center">
              当てはまらない
            </Text>
          </TouchableOpacity>
        </View>

        {/* 補助文 */}
        <View className="mt-6">
          <Text style={styles.helper} className="text-muted text-center">
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
          accessibilityRole="button"
          accessibilityLabel="戻る"
          accessibilityHint="前の質問に戻ります"
        >
          <Text style={styles.backButton} className="text-muted text-center">
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
  // Progress: Body xs (12px)
  progress: {
    fontSize: 12,
    lineHeight: 20,
  },
  // Question: Heading sm (18px), line-height 1.5
  question: {
    fontSize: 18,
    lineHeight: 30,
    fontWeight: '600',
  },
  // Answer text: Button lg (16px)
  answerText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  answerCard: {
    minHeight: 64,
  },
  // Helper text: Body sm (14px)
  helper: {
    fontSize: 14,
    lineHeight: 21,
  },
  // Back button: Body md (16px)
  backButton: {
    fontSize: 16,
    lineHeight: 24,
  },
});
