import { Text, View, TouchableOpacity, ScrollView, Linking } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform, StyleSheet } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { 
  useScreening,
  getDifficultyTypeLabel,
  getSpecialistLabel,
  FACTOR_NAMES
} from "@/lib/screening-context";

export default function ResultScreen() {
  const router = useRouter();
  const { state, dispatch } = useScreening();

  const difficultyLabel = getDifficultyTypeLabel(state.difficultyType);
  const specialistLabel = getSpecialistLabel(state.specialist);
  const factorLabels = state.resultFactors.map(f => FACTOR_NAMES[f]).join('・');

  const handleMapSearch = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/map');
  };

  const handleContact = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/contact');
  };

  const handleRestart = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    dispatch({ type: 'RESET' });
    router.replace('/');
  };

  return (
    <ScreenContainer className="flex-1 bg-background" edges={["top", "bottom", "left", "right"]}>
      {/* 進捗バー */}
      <View className="px-6 pt-4">
        <View className="h-2 bg-border rounded-full overflow-hidden">
          <View className="h-full bg-primary rounded-full" style={{ width: '100%' }} />
        </View>
        <Text className="text-xs text-muted mt-2 text-right">STEP 4/4 完了</Text>
      </View>

      <ScrollView 
        className="flex-1 px-6"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 結果タイトル */}
        <View className="mt-6 mb-4">
          <Text className="text-xl font-bold text-primary text-center">
            スクリーニング結果
          </Text>
        </View>

        {/* 要約カード */}
        <View className="bg-white rounded-2xl p-5 mb-4 border border-border">
          <Text className="text-base text-foreground leading-7">
            あなたが「<Text className="font-bold text-primary">{difficultyLabel}</Text>」で困りを感じる背景には「<Text className="font-bold text-primary">{factorLabels}</Text>」が関係している可能性があります。
          </Text>
        </View>

        {/* 支援職カード */}
        <View className="bg-sub/10 rounded-2xl p-5 mb-6 border border-sub/30">
          <Text className="text-base text-foreground leading-7">
            <Text className="font-bold text-primary">{specialistLabel}</Text>による支援をおすすめします。
          </Text>
        </View>

        {/* Primary CTA */}
        <TouchableOpacity
          onPress={handleMapSearch}
          className="w-full py-4 rounded-xl bg-primary mb-3"
          style={styles.button}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center justify-center">
            <Text className="text-white text-lg font-semibold">
              📍 近隣の支援機関を探す
            </Text>
          </View>
        </TouchableOpacity>

        {/* Secondary CTA */}
        <TouchableOpacity
          onPress={handleContact}
          className="w-full py-4 rounded-xl border-2 border-primary mb-6"
          style={styles.button}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center justify-center">
            <Text className="text-primary text-lg font-semibold">
              ✉️ この結果で問い合わせる
            </Text>
          </View>
        </TouchableOpacity>

        {/* 免責事項 */}
        <View className="bg-surface rounded-xl p-4 mb-6">
          <Text className="text-sm text-muted text-center leading-6">
            これは診断ではなく、ひとつの目安です。{"\n"}
            専門家への相談をおすすめします。
          </Text>
        </View>

        {/* やり直しボタン */}
        <TouchableOpacity
          onPress={handleRestart}
          className="w-full py-3"
          activeOpacity={0.6}
        >
          <Text className="text-muted text-base text-center">
            最初からやり直す
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  button: {
    minHeight: 56,
  },
});
