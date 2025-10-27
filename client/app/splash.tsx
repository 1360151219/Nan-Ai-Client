import { SafeAreaContainer } from '@/components/SafeAreaContainer';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { Messages } from '@/constants/Messages';
import type { RootStackParamList } from '@/types/navigation';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type SplashScreenProps = NativeStackScreenProps<RootStackParamList, 'splash'>;

const SplashScreen: React.FC<SplashScreenProps> = () => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 启动动画序列
    const startAnimations = () => {
      // Logo淡入和缩放
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // 内容滑入
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        delay: 500,
        useNativeDriver: true,
      }).start();

      // 浮动动画
      const createFloatAnimation = () => {
        return Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -10,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]);
      };

      Animated.loop(createFloatAnimation()).start();
    };

    startAnimations();

    // 自动跳转到引导页面
    const timer = setTimeout(() => {
      console.info('[SplashScreen] 自动导航到引导页');
      router.navigate('/onboarding');
    }, 4000);

    return () => clearTimeout(timer);
  }, [fadeAnim, slideAnim, scaleAnim, floatAnim]);

  const handleStartPress = () => {
    console.info('[SplashScreen] 用户点击开始按钮，导航到引导页');
    router.navigate('/onboarding');
  };

  const navigateToOnboarding = () => {
    console.info('[SplashScreen] 导航到引导页');
    router.navigate('/onboarding');
  };

  return (
    <LinearGradient
      colors={[Colors.background, '#f3e8ff', Colors.background]}
      style={styles.container}
    >
      <SafeAreaContainer style={styles.content}>
        {/* 背景装饰元素 */}
        <Animated.View
          style={[
            styles.decorBubble1,
            { transform: [{ translateY: floatAnim }] },
          ]}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={styles.bubbleGradient}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.decorBubble2,
            { transform: [{ translateY: floatAnim }] },
          ]}
        >
          <LinearGradient
            colors={[Colors.tertiary, Colors.secondary]}
            style={styles.bubbleGradient}
          />
        </Animated.View>

        {/* Logo区域 */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.secondary, Colors.tertiary]}
            style={styles.logoBackground}
          >
            <Ionicons
              name="chatbubble-ellipses"
              size={48}
              color={Colors.white}
            />
          </LinearGradient>
        </Animated.View>

        {/* 应用名称和描述 */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.title}>{Messages.app.name}</Text>
          <Text style={styles.subtitle}>智能对话新体验</Text>
          <Text style={styles.description}>
            与AI智能助手开启对话之旅{'\n'}
            获得专业答案，激发无限创意
          </Text>
        </Animated.View>

        {/* 特性展示 */}
        <Animated.View
          style={[
            styles.featuresContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.featureItem}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              style={styles.featureIcon}
            >
              <Ionicons name="flash" size={16} color={Colors.white} />
            </LinearGradient>
            <Text style={styles.featureText}>智能快速</Text>
          </View>

          <View style={styles.featureItem}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              style={styles.featureIcon}
            >
              <Ionicons name="heart" size={16} color={Colors.white} />
            </LinearGradient>
            <Text style={styles.featureText}>贴心服务</Text>
          </View>

          <View style={styles.featureItem}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              style={styles.featureIcon}
            >
              <Ionicons
                name="shield-checkmark"
                size={16}
                color={Colors.white}
              />
            </LinearGradient>
            <Text style={styles.featureText}>安全可靠</Text>
          </View>
        </Animated.View>

        {/* 开始按钮 */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartPress}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.secondary, Colors.tertiary]}
              style={styles.startButtonGradient}
            >
              <Text style={styles.startButtonText}>开始对话</Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color={Colors.white}
                style={styles.startButtonIcon}
              />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* 版权信息 */}
        <Animated.View
          style={[
            styles.footer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.footerText}>© 2024 AI助手 · 让智能更懂你</Text>
        </Animated.View>
      </SafeAreaContainer>
    </LinearGradient>
  );
};
export default SplashScreen;

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Layout.spacing.lg,
  },

  // 背景装饰
  decorBubble1: {
    position: 'absolute',
    top: height * 0.1,
    right: -80,
    width: 160,
    height: 160,
    opacity: 0.2,
  },

  decorBubble2: {
    position: 'absolute',
    bottom: height * 0.15,
    left: -120,
    width: 240,
    height: 240,
    opacity: 0.15,
  },

  bubbleGradient: {
    width: '100%',
    height: '100%',
    borderRadius: Layout.borderRadius.full,
  },

  // Logo区域
  logoContainer: {
    marginBottom: Layout.spacing.xl,
  },

  logoBackground: {
    width: 96,
    height: 96,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...Layout.shadow.lg,
  },

  // 文字内容
  textContainer: {
    alignItems: 'center',
    marginBottom: Layout.spacing.xl,
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: Layout.spacing.lg,
    textAlign: 'center',
  },

  description: {
    fontSize: Layout.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Layout.lineHeight.lg,
  },

  // 特性展示
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: Layout.spacing.xl * 1.5,
    paddingHorizontal: Layout.spacing.md,
  },

  featureItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    flex: 1,
    marginHorizontal: Layout.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Layout.spacing.sm,
  },

  featureText: {
    fontSize: Layout.fontSize.xs,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },

  // 开始按钮
  buttonContainer: {
    width: '100%',
    marginBottom: Layout.spacing.xl,
  },

  startButton: {
    borderRadius: Layout.borderRadius.lg,
    overflow: 'hidden',
    ...Layout.shadow.md,
  },

  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.lg,
    paddingHorizontal: Layout.spacing.xl,
  },

  startButtonText: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.white,
  },

  startButtonIcon: {
    marginLeft: Layout.spacing.sm,
  },

  // 版权信息
  footer: {
    position: 'absolute',
    bottom: Layout.spacing.lg,
  },

  footerText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    opacity: 0.7,
  },
});
