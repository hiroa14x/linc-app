import { Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useScreening } from "@/lib/screening-context";

export default function OnboardingScreen() {
  const router = useRouter();
  const { state, dispatch } = useScreening();

  const handleStart = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    dispatch({ type: 'RESET' });
    dispatch({ type: 'SET_CURRENT_STEP', payload: 'step01' });
    router.push('/step01');
  };

  const handleContinue = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // 保存された状態に応じて適切な画面に遷移
    switch (state.currentStep) {
      case 'step01':
        router.push('/step01');
        break;
      case 'step02':
        router.push('/step02');
        break;
      case 'step03':
        router.push('/step03');
        break;
      case 'result':
        router.push('/result');
        break;
      default:
        router.push('/step01');
    }
  };

  if (state.isLoading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#1D448D" />
      </ScreenContainer>
    );
  }

  const hasProgress = state.currentStep !== 'onboarding' && state.difficultyType !== null;

  return (
    <ScreenContainer className="flex-1 px-6 bg-background" edges={["top", "bottom", "left", "right"]}>
      <View className="flex-1 justify-center items-center">
        {/* タイトル */}
        <View className="mb-8">
          <Text className="text-2xl font-bold text-primary text-center leading-9">
            お子さんの{"\n"}「読む・書く」の困りを{"\n"}整理します
          </Text>
        </View>

        {/* 説明文 */}
        <View className="mb-8 px-4">
          <Text className="text-base text-muted text-center leading-7">
            いくつかの質問に答えることで、{"\n"}
            考えられる要因と相談先の目安を{"\n"}
            お伝えします。
          </Text>
        </View>

        {/* 免責事項 */}
        <View className="mb-8 px-4">
          <Text className="text-sm text-muted text-center leading-6">
            これは診断ではなく、{"\n"}
            ひとつのスクリーニングです。
          </Text>
        </View>

        {/* 所要時間 */}
        <View className="mb-12">
          <Text className="text-sm text-muted text-center">
            所要時間：約5分
          </Text>
        </View>
      </View>

      {/* CTAボタン */}
      <View className="pb-8">
        {hasProgress && (
          <TouchableOpacity
            onPress={handleContinue}
            className="w-full py-4 rounded-xl mb-3 border-2 border-primary"
            style={{ minHeight: 56 }}
            activeOpacity={0.8}
          >
            <Text className="text-primary text-lg font-semibold text-center">
              続きから再開する
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handleStart}
          className="w-full py-4 rounded-xl bg-primary"
          style={{ minHeight: 56 }}
          activeOpacity={0.8}
        >
          <Text className="text-white text-lg font-semibold text-center">
            はじめる
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
