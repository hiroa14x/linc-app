import { Text, View, TouchableOpacity, ScrollView , Platform, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ScreenContainer } from "@/components/screen-container";
import { 
  useScreening,
  getDifficultyTypeLabel,
  getSpecialistLabel,
  FACTOR_NAMES
} from "@/lib/screening-context";

const STORAGE_KEY = 'linc_screening_state';

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
    // 状態をリセット
    dispatch({ type: 'RESET' });
    // AsyncStorageをクリア（非同期で実行、待たない）
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    // トップ画面に戻る
    router.replace('/');
  };

  return (
    <ScreenContainer className="flex-1 bg-background" edges={["top", "bottom", "left", "right"]}>
      {/* 進捗バー */}
      <View className="px-6 pt-4">
        <View className="h-2 bg-border rounded-full overflow-hidden">
          <View className="h-full bg-primary rounded-full" style={{ width: '100%' }} />
        </View>
        <Text style={styles.progress} className="text-muted mt-2 text-right">STEP 4/4 完了</Text>
      </View>

      <ScrollView 
        className="flex-1 px-6"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 結果タイトル - Heading md (20px) */}
        <View className="mt-6 mb-4">
          <Text style={styles.title} className="text-primary text-center">
            スクリーニング結果
          </Text>
        </View>

        {/* 要約カード - Body md (16px) */}
        <View className="bg-white rounded-2xl p-5 mb-4 border border-border">
          <Text style={styles.body} className="text-foreground">
            あなたが「<Text style={styles.highlight} className="text-primary">{difficultyLabel}</Text>」で困りを感じる背景には「<Text style={styles.highlight} className="text-primary">{factorLabels}</Text>」が関係している可能性があります。
          </Text>
        </View>

        {/* 支援職カード - Body md (16px) */}
        <View className="bg-surface rounded-2xl p-5 mb-6 border border-sub">
          <Text style={styles.body} className="text-foreground">
            <Text style={styles.highlight} className="text-primary">{specialistLabel}</Text>による支援をおすすめします。
          </Text>
        </View>

        {/* Primary CTA - Button lg (16px) */}
        <TouchableOpacity
          onPress={handleMapSearch}
          className="w-full py-4 rounded-xl bg-primary mb-3"
          style={styles.button}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center justify-center">
            <Text style={styles.buttonText} className="text-white">
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
            <Text style={styles.buttonTextOutline} className="text-primary">
              ✉️ この結果で問い合わせる
            </Text>
          </View>
        </TouchableOpacity>

        {/* 免責事項 - Body sm (14px) */}
        <View className="bg-surface rounded-xl p-4 mb-6">
          <Text style={styles.disclaimer} className="text-muted text-center">
            これは診断ではなく、ひとつの目安です。{"\n"}
            専門家への相談をおすすめします。
          </Text>
        </View>

        {/* やり直しボタン - Body md (16px) */}
        <TouchableOpacity
          onPress={handleRestart}
          className="w-full py-3"
          activeOpacity={0.6}
        >
          <Text style={styles.restartButton} className="text-muted text-center">
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
  // Progress: Body xs (12px)
  progress: {
    fontSize: 12,
    lineHeight: 20,
  },
  // Title: Heading md (20px)
  title: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
  },
  // Body: Body md (16px)
  body: {
    fontSize: 16,
    lineHeight: 28,
  },
  // Highlight text
  highlight: {
    fontWeight: '700',
  },
  // Button text: Button lg (16px)
  buttonText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  buttonTextOutline: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  button: {
    minHeight: 56,
  },
  // Disclaimer: Body sm (14px)
  disclaimer: {
    fontSize: 14,
    lineHeight: 24,
  },
  // Restart button: Body md (16px)
  restartButton: {
    fontSize: 16,
    lineHeight: 24,
  },
});
