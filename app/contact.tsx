import { Text, View, TouchableOpacity, ScrollView, Linking, Share , Platform, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { 
  useScreening,
  getDifficultyTypeLabel,
  getSpecialistLabel,
  FACTOR_NAMES
} from "@/lib/screening-context";

export default function ContactScreen() {
  const router = useRouter();
  const { state } = useScreening();

  const difficultyLabel = getDifficultyTypeLabel(state.difficultyType);
  const specialistLabel = getSpecialistLabel(state.specialist);
  const factorLabels = state.resultFactors.map(f => FACTOR_NAMES[f]).join('・');

  // 問い合わせ用のテキストを生成
  const generateContactText = () => {
    return `【Lincスクリーニング結果】

■ 困りの内容：${difficultyLabel}
■ 考えられる要因：${factorLabels}
■ おすすめの専門職：${specialistLabel}

※ これは診断ではなく、ひとつの目安です。
詳しい評価・支援についてご相談させていただければ幸いです。`;
  };

  const handleCopyText = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    try {
      await Share.share({
        message: generateContactText(),
      });
    } catch {
      // エラー時は何もしない
    }
  };

  const handleEmailContact = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    const subject = encodeURIComponent('Lincスクリーニング結果についてのご相談');
    const body = encodeURIComponent(generateContactText());
    const url = `mailto:?subject=${subject}&body=${body}`;
    
    Linking.openURL(url);
  };

  const handleBack = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  return (
    <ScreenContainer className="flex-1 bg-background" edges={["top", "bottom", "left", "right"]}>
      {/* ヘッダー */}
      <View className="px-6 pt-4 pb-2">
        <Text style={styles.title} className="text-primary text-center">
          この結果で問い合わせる
        </Text>
      </View>

      <ScrollView 
        className="flex-1 px-6"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 説明 */}
        <View className="mt-4 mb-6">
          <Text style={styles.body} className="text-muted text-center">
            以下の内容を専門機関への{"\n"}
            問い合わせにご活用ください。
          </Text>
        </View>

        {/* 結果カード */}
        <View className="bg-white rounded-2xl p-5 mb-6 border border-border">
          <View className="mb-4">
            <Text style={styles.label} className="text-muted mb-1">困りの内容</Text>
            <Text style={styles.value} className="text-foreground">{difficultyLabel}</Text>
          </View>
          
          <View className="mb-4">
            <Text style={styles.label} className="text-muted mb-1">考えられる要因</Text>
            <Text style={styles.value} className="text-foreground">{factorLabels}</Text>
          </View>
          
          <View>
            <Text style={styles.label} className="text-muted mb-1">おすすめの専門職</Text>
            <Text style={styles.value} className="text-foreground">{specialistLabel}</Text>
          </View>
        </View>

        {/* 共有ボタン */}
        <TouchableOpacity
          onPress={handleCopyText}
          className="w-full py-4 rounded-xl bg-primary mb-3"
          style={styles.button}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText} className="text-white text-center">
            📤 結果を共有する
          </Text>
        </TouchableOpacity>

        {/* メール送信ボタン */}
        <TouchableOpacity
          onPress={handleEmailContact}
          className="w-full py-4 rounded-xl border-2 border-primary mb-6"
          style={styles.button}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonTextOutline} className="text-primary text-center">
            ✉️ メールで問い合わせる
          </Text>
        </TouchableOpacity>

        {/* 注意事項 */}
        <View className="bg-surface rounded-xl p-4 mb-6">
          <Text style={styles.disclaimer} className="text-muted">
            この結果は診断ではなく、ひとつの目安です。{"\n"}
            専門家による詳しい評価をおすすめします。
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
  // Title: Heading md (20px)
  title: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
  },
  // Body: Body md (16px)
  body: {
    fontSize: 16,
    lineHeight: 27,
  },
  // Label: Body sm (14px)
  label: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
  },
  // Value: Body md (16px)
  value: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
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
  // Back button: Body md (16px)
  backButton: {
    fontSize: 16,
    lineHeight: 24,
  },
});
