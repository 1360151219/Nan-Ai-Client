import { SafeAreaContainer } from '@/components/SafeAreaContainer';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface OnboardingStep {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    icon: 'chatbubble-ellipses',
    title: '智能对话',
    description: '基于先进的AI技术，理解你的需求，提供准确、贴心的回答和建议',
  },
  {
    icon: 'flash',
    title: '快速响应',
    description: '毫秒级响应速度，无论何时何地，都能第一时间为你解答疑问',
  },
  {
    icon: 'shield-checkmark',
    title: '安全可靠',
    description: '严格保护用户隐私，所有对话内容都经过加密处理，安全有保障',
  },
];

const OnboardingScreen: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateStep = (forward: boolean = true) => {
    // 创建滑出动画
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: forward ? -30 : 30,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 重置位置并滑入
      slideAnim.setValue(forward ? 30 : -30);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      animateStep(true);
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      animateStep(false);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    console.info('[OnboardingScreen] 用户跳过引导，导航到主应用');
    router.replace('/');
  };

  const handleComplete = () => {
    console.info('[OnboardingScreen] 引导完成，导航到主应用');
    router.replace('/');
  };

  const renderStepIndicators = () => {
    return (
      <View style={styles.stepIndicatorsContainer}>
        {onboardingSteps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.stepIndicator,
              index <= currentStep ? styles.stepActive : styles.stepInactive,
            ]}
          />
        ))}
      </View>
    );
  };

  const currentStepData = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;

  return (
    <LinearGradient
      colors={[Colors.background, '#f3e8ff', Colors.background]}
      style={styles.container}
    >
      <SafeAreaContainer style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.placeholder} />
          {renderStepIndicators()}
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>跳过</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Logo */}
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={styles.logoContainer}
          >
            <Ionicons
              name="chatbubble-ellipses"
              size={48}
              color={Colors.white}
            />
          </LinearGradient>

          {/* Welcome Text */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>欢迎来到AI助手</Text>
            <Text style={styles.welcomeDescription}>
              你的智能对话伙伴，随时为你提供专业的帮助和陪伴
            </Text>
          </View>

          {/* Feature Card */}
          <Animated.View
            style={[
              styles.featureCard,
              {
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={[Colors.accent, Colors.secondary]}
              style={styles.featureIcon}
            >
              <Ionicons
                name={currentStepData.icon}
                size={32}
                color={Colors.white}
              />
            </LinearGradient>
            <Text style={styles.featureTitle}>{currentStepData.title}</Text>
            <Text style={styles.featureDescription}>
              {currentStepData.description}
            </Text>
          </Animated.View>
        </View>

        {/* Bottom Navigation */}
        <View style={styles.bottomNavigation}>
          <View style={styles.navigationButtons}>
            <TouchableOpacity
              onPress={handleBack}
              style={[
                styles.navButton,
                currentStep === 0 && styles.navButtonDisabled,
              ]}
              disabled={currentStep === 0}
            >
              <Ionicons
                name="arrow-back"
                size={20}
                color={
                  currentStep === 0
                    ? Colors.textSecondary
                    : Colors.textSecondary
                }
              />
            </TouchableOpacity>

            {isLastStep ? (
              <TouchableOpacity
                onPress={handleComplete}
                style={styles.startButton}
              >
                <LinearGradient
                  colors={[Colors.primary, Colors.secondary]}
                  style={styles.startButtonGradient}
                >
                  <Text style={styles.startButtonText}>开始使用</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
                <LinearGradient
                  colors={[Colors.primary, Colors.secondary]}
                  style={styles.nextButtonGradient}
                >
                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color={Colors.white}
                  />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaContainer>
    </LinearGradient>
  );
};
export default OnboardingScreen;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.lg,
    paddingTop: Layout.spacing.lg,
  },

  placeholder: {
    width: 24,
  },

  stepIndicatorsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  stepIndicator: {
    width: 32,
    height: 8,
    borderRadius: Layout.borderRadius.full,
    marginHorizontal: Layout.spacing.xs,
  },

  stepActive: {
    backgroundColor: Colors.primary,
  },

  stepInactive: {
    backgroundColor: Colors.border,
  },

  skipButton: {
    paddingVertical: Layout.spacing.xs,
  },

  skipText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
  },

  // Main Content
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Layout.spacing.lg,
  },

  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Layout.spacing.xl,
  },

  welcomeContainer: {
    alignItems: 'center',
    marginBottom: Layout.spacing.xl * 1.5,
  },

  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
    textAlign: 'center',
  },

  welcomeDescription: {
    fontSize: Layout.fontSize.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Layout.lineHeight.lg,
    maxWidth: width * 0.8,
  },

  // Feature Card
  featureCard: {
    width: '100%',
    maxWidth: width * 0.85,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: Layout.borderRadius.xl,
    padding: Layout.spacing.lg,
    alignItems: 'center',
    ...Layout.shadow.lg,
  },

  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: Layout.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Layout.spacing.md,
  },

  featureTitle: {
    fontSize: Layout.fontSize.xl,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
    textAlign: 'center',
  },

  featureDescription: {
    fontSize: Layout.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Layout.lineHeight.lg,
  },

  // Bottom Navigation
  bottomNavigation: {
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Layout.spacing.lg,
  },

  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  navButton: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: Layout.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },

  navButtonDisabled: {
    opacity: 0.3,
  },

  nextButton: {
    width: 48,
    height: 48,
    borderRadius: Layout.borderRadius.full,
    overflow: 'hidden',
  },

  nextButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  startButton: {
    flex: 1,
    marginLeft: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    overflow: 'hidden',
    ...Layout.shadow.md,
  },

  startButtonGradient: {
    paddingVertical: Layout.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  startButtonText: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.white,
  },
});
