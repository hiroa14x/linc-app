import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';

import { ScreenContainer } from '@/components/screen-container';
import {
  getDatasetKey,
  getSchoolTerm,
  GRADE_LABELS,
  GRADE_LEVELS,
  GradeLevel,
  TERM_LABELS,
  useScreening,
} from '@/lib/screening-context';

export default function GradeScreen() {
  const router = useRouter();
  const { dispatch } = useScreening();
  const schoolTerm = useMemo(() => getSchoolTerm(), []);

  const handleSelect = (gradeLevel: GradeLevel) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const datasetKey = getDatasetKey(gradeLevel, schoolTerm);
    if (!datasetKey) {
      Alert.alert(
        '現在準備中です',
        `${GRADE_LABELS[gradeLevel]}・${TERM_LABELS[schoolTerm]}の設問は現在準備中です。`,
      );
      return;
    }

    dispatch({
      type: 'SET_GRADE_SELECTION',
      payload: { gradeLevel, schoolTerm, datasetKey },
    });
    dispatch({ type: 'SET_CURRENT_STEP', payload: 'step01' });
    router.push('/step01');
  };

  const handleBack = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  return (
    <ScreenContainer className="flex-1 bg-background" edges={['top', 'bottom', 'left', 'right']}>
      <View className="px-6 pt-4">
        <View className="h-2 bg-border rounded-full overflow-hidden">
          <View className="h-full bg-primary rounded-full" style={{ width: '20%' }} />
        </View>
        <Text style={styles.progress} className="text-muted mt-2 text-right">
          STEP 1/5
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-8 mb-6">
          <Text style={styles.heading} className="text-foreground text-center">
            お子さんの学年を教えてください
          </Text>
          <Text style={styles.term} className="text-muted text-center mt-2">
            現在は{TERM_LABELS[schoolTerm]}の設問です
          </Text>
        </View>

        <View className="gap-3">
          {GRADE_LEVELS.map((gradeLevel) => {
            const isAvailable = getDatasetKey(gradeLevel, schoolTerm) !== null;
            return (
              <TouchableOpacity
                key={gradeLevel}
                onPress={() => handleSelect(gradeLevel)}
                className="w-full px-5 rounded-xl bg-surface border-2 border-transparent"
                style={styles.gradeButton}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`${GRADE_LABELS[gradeLevel]}${isAvailable ? '' : '、現在準備中'}`}
              >
                <Text style={styles.gradeLabel} className="text-foreground">
                  {GRADE_LABELS[gradeLevel]}
                </Text>
                {!isAvailable && (
                  <Text style={styles.preparingLabel} className="text-muted">
                    準備中
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View className="px-6 pb-8 pt-4">
        <TouchableOpacity
          onPress={handleBack}
          className="w-full py-3"
          activeOpacity={0.6}
          accessibilityRole="button"
          accessibilityLabel="戻る"
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
  progress: {
    fontSize: 12,
    lineHeight: 20,
  },
  heading: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
  },
  term: {
    fontSize: 14,
    lineHeight: 21,
  },
  gradeButton: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gradeLabel: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  preparingLabel: {
    fontSize: 12,
    lineHeight: 20,
  },
  backButton: {
    fontSize: 16,
    lineHeight: 24,
  },
});
