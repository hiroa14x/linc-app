import { Text, View, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform, StyleSheet } from "react-native";
import { useState } from "react";

import { ScreenContainer } from "@/components/screen-container";
import { useScreening, DifficultyType } from "@/lib/screening-context";

export default function Step01Screen() {
  const router = useRouter();
  const { state, dispatch } = useScreening();
  const [selected, setSelected] = useState<DifficultyType>(state.difficultyType);
  const [showWarning, setShowWarning] = useState(false);

  const handleSelect = (type: DifficultyType) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelected(type);
    setShowWarning(false);
  };

  const handleNext = () => {
    if (!selected) {
      setShowWarning(true);
      return;
    }
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    dispatch({ type: 'SET_DIFFICULTY_TYPE', payload: selected });
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

  const cards = [
    { type: 'writing' as DifficultyType, label: '書く' },
    { type: 'reading' as DifficultyType, label: '読む' },
    { type: 'both' as DifficultyType, label: '書く・読む' },
  ];

  return (
    <ScreenContainer className="flex-1 bg-background" edges={["top", "bottom", "left", "right"]}>
      {/* 進捗バー */}
      <View className="px-6 pt-4">
        <View className="h-2 bg-border rounded-full overflow-hidden">
          <View className="h-full bg-primary rounded-full" style={{ width: '25%' }} />
        </View>
        <Text className="text-xs text-muted mt-2 text-right">STEP 1/4</Text>
      </View>

      <ScrollView 
        className="flex-1 px-6"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 質問 */}
        <View className="mt-8 mb-6">
          <Text className="text-xl font-bold text-primary text-center">
            なにが苦手ですか？
          </Text>
        </View>

        {/* カード選択 */}
        <View className="gap-4">
          {cards.map((card) => (
            <TouchableOpacity
              key={card.type}
              onPress={() => handleSelect(card.type)}
              className={`w-full py-5 px-6 rounded-2xl border-2 ${
                selected === card.type
                  ? 'border-primary bg-white'
                  : 'border-border bg-surface'
              }`}
              style={styles.card}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center justify-between">
                <Text className={`text-lg font-semibold ${
                  selected === card.type ? 'text-primary' : 'text-foreground'
                }`}>
                  {card.label}
                </Text>
                <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                  selected === card.type ? 'border-primary bg-primary' : 'border-border'
                }`}>
                  {selected === card.type && (
                    <View className="w-2 h-2 rounded-full bg-white" />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* 警告メッセージ */}
        {showWarning && (
          <View className="mt-4 p-3 bg-warning/10 rounded-lg">
            <Text className="text-warning text-sm text-center">
              いずれかを選択してください
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ボタン */}
      <View className="px-6 pb-8 pt-4">
        <TouchableOpacity
          onPress={handleNext}
          className={`w-full py-4 rounded-xl ${selected ? 'bg-primary' : 'bg-muted'}`}
          style={styles.button}
          activeOpacity={0.8}
        >
          <Text className="text-white text-lg font-semibold text-center">
            次へ
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
  card: {
    minHeight: 64,
  },
  button: {
    minHeight: 56,
  },
});
