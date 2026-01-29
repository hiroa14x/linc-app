import { Text, View, TouchableOpacity, ScrollView, Linking, Alert, Platform, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useState } from "react";

import { ScreenContainer } from "@/components/screen-container";
import { useScreening, getSpecialistLabel } from "@/lib/screening-context";

const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

export default function MapScreen() {
  const router = useRouter();
  const { state } = useScreening();
  const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(null);

  const specialistLabel = getSpecialistLabel(state.specialist);

  const handlePrefectureSelect = (prefecture: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedPrefecture(prefecture);
  };

  const handleSearch = async () => {
    if (!selectedPrefecture) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // 専門職に応じた検索キーワード
    let searchKeyword = '';
    if (state.specialist === 'ST') {
      searchKeyword = '言語聴覚士 小児';
    } else if (state.specialist === 'OT') {
      searchKeyword = '作業療法士 小児';
    } else {
      searchKeyword = '言語聴覚士 作業療法士 小児';
    }

    const query = encodeURIComponent(`${selectedPrefecture} ${searchKeyword}`);
    const url = `https://www.google.com/maps/search/${query}`;

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'エラー',
          'Google マップを開けませんでした。ブラウザで検索してください。'
        );
      }
    } catch {
      Alert.alert(
        'エラー',
        'URLを開く際にエラーが発生しました。'
      );
    }
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
          支援機関を探す
        </Text>
      </View>

      {/* 説明 */}
      <View className="px-6 mb-4">
        <Text style={styles.body} className="text-muted text-center">
          お住まいの都道府県を選択してください
        </Text>
        <Text style={styles.bodySmall} className="text-muted text-center mt-2">
          検索対象：{specialistLabel}
        </Text>
      </View>

      {/* 都道府県リスト */}
      <ScrollView 
        className="flex-1 px-6"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row flex-wrap justify-between">
          {PREFECTURES.map((pref) => (
            <TouchableOpacity
              key={pref}
              onPress={() => handlePrefectureSelect(pref)}
              className={`w-[48%] py-3 px-4 rounded-xl mb-3 border-2 ${
                selectedPrefecture === pref
                  ? 'border-primary bg-surface'
                  : 'border-border bg-background'
              }`}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={pref}
              accessibilityState={{ selected: selectedPrefecture === pref }}
              accessibilityHint="タップして都道府県を選択します"
            >
              <Text style={styles.prefText} className={`text-center ${
                selectedPrefecture === pref ? 'text-primary' : 'text-foreground'
              }`}>
                {pref}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* ボタン */}
      <View className="px-6 pb-8 pt-4">
        <TouchableOpacity
          onPress={handleSearch}
          className={`w-full py-4 rounded-xl ${selectedPrefecture ? 'bg-primary' : 'bg-muted'}`}
          style={styles.button}
          activeOpacity={0.8}
          disabled={!selectedPrefecture}
          accessibilityRole="button"
          accessibilityLabel="Googleマップで検索"
          accessibilityHint={selectedPrefecture ? `${selectedPrefecture}の支援機関をGoogleマップで検索します` : '都道府県を選択してください'}
          accessibilityState={{ disabled: !selectedPrefecture }}
        >
          <Text style={styles.buttonText} className="text-white text-center">
            Google マップで検索
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleBack}
          className="w-full py-3 mt-2"
          activeOpacity={0.6}
          accessibilityRole="button"
          accessibilityLabel="戻る"
          accessibilityHint="結果画面に戻ります"
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
    paddingBottom: 16,
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
  // Body small: Body sm (14px)
  bodySmall: {
    fontSize: 14,
    lineHeight: 21,
  },
  // Prefecture text: Body md (16px)
  prefText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  // Button text: Button lg (16px)
  buttonText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  button: {
    minHeight: 56,
  },
  // Back button: Body md (16px)
  backButton: {
    fontSize: 16,
    lineHeight: 24,
  },
});
