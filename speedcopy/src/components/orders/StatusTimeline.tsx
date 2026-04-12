import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';

export interface TimelineStep {
  title: string;
  description: string;
  time?: string;
  status: 'completed' | 'current' | 'upcoming';
  icon: keyof typeof Ionicons.prototype.props.name;
}

interface StatusTimelineProps {
  steps: TimelineStep[];
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ steps }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const color = step.status === 'upcoming' ? theme.colors.fg.muted : theme.colors.fg.default;
        const iconColor = step.status === 'upcoming' ? '#9ca3af' : '#fff';
        const iconBg = step.status === 'upcoming' ? '#e5e7eb' : theme.colors.fg.default;
        const lineColor = step.status === 'completed' ? theme.colors.fg.default : '#e5e7eb';

        return (
          <View key={index} style={styles.stepContainer}>
            <View style={styles.leftColumn}>
              <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
                <Ionicons name={step.icon as any} size={20} color={iconColor} />
              </View>
              {!isLast && <View style={[styles.line, { backgroundColor: lineColor }]} />}
            </View>
            
            <View style={styles.rightColumn}>
              <View style={styles.textRow}>
                <Text style={[styles.stepTitle, { color: step.status === 'upcoming' ? theme.colors.fg.muted : theme.colors.fg.default }]}>
                  {step.title}
                </Text>
                {step.time && (
                  <>
                    <Text style={styles.dot}> • </Text>
                    <Text style={[styles.timeText, { color: theme.colors.fg.muted }]}>{step.time}</Text>
                  </>
                )}
              </View>
              <Text style={[styles.description, { color: theme.colors.fg.muted }]}>
                {step.description}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  stepContainer: {
    flexDirection: 'row',
    minHeight: 80,
  },
  leftColumn: {
    alignItems: 'center',
    marginRight: 15,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  line: {
    width: 4,
    flex: 1,
    marginTop: -5,
    marginBottom: -5,
  },
  rightColumn: {
    flex: 1,
    paddingTop: 8,
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  dot: {
    fontSize: 18,
    color: '#9ca3af',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    marginTop: 4,
  },
});
