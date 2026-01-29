import { Text, View, TouchableOpacity, ScrollView , Platform, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { useScreening, DifficultyType } from "@/lib/screening-context";

export default function Step01Screen() {
  const router = useRouter();
  const { dispatch } = useScreening();

  // ワンタップで選択して次へ進む
  const handleSelect = (type: DifficultyType) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    dispatch({ type: 'SET_DIFFICULTY_TYPE', payload: type });
    dispatch({ type: 'SET_CURRENT_STEP', payload: 'step02' });
    dispatch({ type: 'SET_STEP02_INDEX', payload: 0 });
    router.push('/step02');
  };

  const handleBack = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  return (
    <ScreenContainer className="flex-1 bg-background" edges={["top", "bottom", "left", "right"]}>
      {/* 進捗バー */}
      <View className="px-6 pt-4">
        <View className="h-2 bg-border rounded-full overflow-hidden">
          <View className="h-full bg-primary rounded-full" style={{ width: '25%' }} />
        </View>
        <Text style={styles.progress} className="text-muted mt-2 text-right">STEP 1/4</Text>
      </View>

      <ScrollView 
        className="flex-1 px-6"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 質問 - Heading md (20px) */}
        <View className="mt-12 mb-8">
          <Text style={styles.heading} className="text-foreground text-center">
            お子さんが苦手なのは{"\n"}どちらですか？
          </Text>
        </View>

        {/* ワンタップ選択肢 */}
        <View className="gap-4">
          <TouchableOpacity
            onPress={() => handleSelect('writing')}
            className="w-full py-5 px-6 rounded-2xl bg-surface border-2 border-transparent"
            style={styles.card}
            activeOpacity={0.7}
          >
            <Text style={styles.cardTitle} className="text-foreground text-center">
              書く
            </Text>
            <Text style={styles.cardDesc} className="text-muted text-center mt-1">
              文字を書くことが苦手
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleSelect('reading')}
            className="w-full py-5 px-6 rounded-2xl bg-surface border-2 border-transparent"
            style={styles.card}
            activeOpacity={0.7}
          >
            <Text style={styles.cardTitle} className="text-foreground text-center">
              読む
            </Text>
            <Text style={styles.cardDesc} className="text-muted text-center mt-1">
              文字を読むことが苦手
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleSelect('both')}
            className="w-full py-5 px-6 rounded-2xl bg-surface border-2 border-transparent"
            style={styles.card}
            activeOpacity={0.7}
          >
            <Text style={styles.cardTitle} className="text-foreground text-center">
              書く・読む
            </Text>
            <Text style={styles.cardDesc} className="text-muted text-center mt-1">
              どちらも苦手
            </Text>
          </TouchableOpacity>
        </View>

        {/* 補助文 */}
        <View className="mt-6">
          <Text style={styles.helper} className="text-muted text-center">
            タップすると次へ進みます
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
  // Progress: Body xs (12px)
  progress: {
    fontSize: 12,
    lineHeight: 20,
  },
  // Heading md: 20px, line-height 1.4
  heading: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
  },
  // Card title: Heading sm (18px)
  cardTitle: {
    fontSize: 18,
    lineHeight: 27,
    fontWeight: '600',
  },
  // Card description: Body sm (14px)
  cardDesc: {
    fontSize: 14,
    lineHeight: 21,
  },
  card: {
    minHeight: 80,
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
