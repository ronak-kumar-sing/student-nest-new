import { useEffect, useRef } from 'react';
import { Animated, ViewStyle, Easing } from 'react-native';

interface FadeInProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  style?: ViewStyle;
}

interface SlideInProps extends FadeInProps {
  from?: 'left' | 'right' | 'top' | 'bottom';
  distance?: number;
}

interface ScaleInProps extends FadeInProps {
  initialScale?: number;
}

// Fade In Animation
export function FadeIn({ children, duration = 300, delay = 0, style }: FadeInProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, []);

  return (
    <Animated.View style={[{ opacity }, style]}>
      {children}
    </Animated.View>
  );
}

// Slide In Animation
export function SlideIn({ 
  children, 
  duration = 400, 
  delay = 0, 
  from = 'bottom', 
  distance = 50,
  style 
}: SlideInProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(
    from === 'left' || from === 'top' ? -distance : distance
  )).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(translate, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, []);

  const transform = from === 'left' || from === 'right'
    ? [{ translateX: translate }]
    : [{ translateY: translate }];

  return (
    <Animated.View style={[{ opacity, transform }, style]}>
      {children}
    </Animated.View>
  );
}

// Scale In Animation
export function ScaleIn({ 
  children, 
  duration = 300, 
  delay = 0, 
  initialScale = 0.8,
  style 
}: ScaleInProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(initialScale)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity, transform: [{ scale }] }, style]}>
      {children}
    </Animated.View>
  );
}

// Staggered Animation for lists
export function StaggeredList({ 
  children, 
  staggerDelay = 50,
  startDelay = 0,
}: { 
  children: React.ReactNode[];
  staggerDelay?: number;
  startDelay?: number;
}) {
  return (
    <>
      {children.map((child, index) => (
        <SlideIn 
          key={index} 
          delay={startDelay + (index * staggerDelay)} 
          from="bottom" 
          distance={30}
        >
          {child}
        </SlideIn>
      ))}
    </>
  );
}

// Pulse Animation
export function Pulse({ 
  children, 
  style 
}: { 
  children: React.ReactNode; 
  style?: ViewStyle;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      {children}
    </Animated.View>
  );
}

// Bounce Animation
export function BounceIn({ 
  children, 
  delay = 0,
  style 
}: FadeInProps) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        tension: 100,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity, transform: [{ scale }] }, style]}>
      {children}
    </Animated.View>
  );
}

// Shimmer/Skeleton Loading Animation
export function Shimmer({ 
  width, 
  height, 
  borderRadius = 8 
}: { 
  width: number | `${number}%`; 
  height: number; 
  borderRadius?: number;
}) {
  const shimmerTranslate = useRef(new Animated.Value(-200)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerTranslate, {
        toValue: 200,
        duration: 1500,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: '#2A2A2B',
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={{
          width: '100%',
          height: '100%',
          transform: [{ translateX: shimmerTranslate }],
          backgroundColor: 'rgba(255,255,255,0.05)',
        }}
      />
    </Animated.View>
  );
}

// Room Card Skeleton
export function RoomCardSkeleton() {
  return (
    <FadeIn style={{ marginBottom: 16 }}>
      <Shimmer width="100%" height={200} borderRadius={16} />
      <Shimmer width="70%" height={20} borderRadius={4} />
      <Shimmer width="50%" height={16} borderRadius={4} />
      <Shimmer width="30%" height={24} borderRadius={4} />
    </FadeIn>
  );
}
