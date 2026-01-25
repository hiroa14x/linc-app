import { Text, View, TouchableOpacity, ScrollView, Linking, TextInput } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform, StyleSheet } from "react-native";
import { useState } from "react";

import { ScreenContainer } from "@/components/screen-container";
import { useScreening, getSpecialistLabel } from "@/lib/screening-context";

// 都道府県リスト
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
  const [selectedPrefecture, setSelectedPrefecture] = useState<string>('');
  const [showPrefectureList, setShowPrefectureList] = useState(false);

  const specialistLabel = getSpecialistLabel(state.specialist);

  // 検索キーワードを生成
  const getSearchKeyword = () => {
    const keywords: string[] = [];
    if (state.specialist === 'ST' || state.specialist === 'both') {
      keywords.push('言語聴覚士');
    }
    if (state.specialist === 'OT' || state.specialist === 'both') {
      keywords.push('作業療法士');
    }
    return keywords.join(' ');
  };

  const handleSearch = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    const keyword = getSearchKeyword();
    const location = selectedPrefecture || '現在地';
    const query = encodeURIComponent(`${location} ${keyword} 小児 リハビリ`);
    const url = `https://www.google.com/maps/search/${query}`;
    
    Linking.openURL(url);
  };

  const handleBack = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  const handleSelectPrefecture = (prefecture: string) => {
    setSelectedPrefecture(prefecture);
    setShowPrefectureList(false);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <ScreenContainer className="flex-1 bg-background" edges={["top", "bottom", "left", "right"]}>
      {/* ヘッダー */}
      <View className="px-6 pt-4 pb-2">
        <Text className="text-xl font-bold text-primary text-center">
          近隣の支援機関を探す
        </Text>
      </View>

      <ScrollView 
        className="flex-1 px-6"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 説明 */}
        <View className="mt-4 mb-6">
          <Text className="text-base text-muted text-center leading-7">
            お住まいの地域で{"\n"}
            <Text className="font-semibold text-primary">{specialistLabel}</Text>
            {"\n"}がいる施設を検索できます。
          </Text>
        </View>

        {/* 都道府県選択 */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-foreground mb-2">
            都道府県を選択
          </Text>
          <TouchableOpacity
            onPress={() => setShowPrefectureList(!showPrefectureList)}
            className="w-full py-4 px-4 rounded-xl bg-white border border-border"
            activeOpacity={0.8}
          >
            <Text className={selectedPrefecture ? 'text-foreground' : 'text-muted'}>
              {selectedPrefecture || '選択してください'}
            </Text>
          </TouchableOpacity>

          {showPrefectureList && (
            <View className="mt-2 bg-white rounded-xl border border-border max-h-60">
              <ScrollView nestedScrollEnabled>
                {PREFECTURES.map((pref) => (
                  <TouchableOpacity
                    key={pref}
                    onPress={() => handleSelectPrefecture(pref)}
                    className={`py-3 px-4 border-b border-border ${
                      selectedPrefecture === pref ? 'bg-sub/10' : ''
                    }`}
                    activeOpacity={0.6}
                  >
                    <Text className={selectedPrefecture === pref ? 'text-primary font-medium' : 'text-foreground'}>
                      {pref}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* 検索ボタン */}
        <TouchableOpacity
          onPress={handleSearch}
          className="w-full py-4 rounded-xl bg-primary mb-4"
          style={styles.button}
          activeOpacity={0.8}
        >
          <Text className="text-white text-lg font-semibold text-center">
            Google マップで検索
          </Text>
        </TouchableOpacity>

        {/* 注意事項 */}
        <View className="bg-surface rounded-xl p-4 mb-6">
          <Text className="text-sm text-muted leading-6">
            検索結果は参考情報です。{"\n"}
            施設への連絡前に、対応可能かどうかをご確認ください。
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
  button: {
    minHeight: 56,
  },
});
