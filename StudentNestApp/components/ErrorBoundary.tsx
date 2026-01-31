import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    
    // Log to crash reporting service in production
    if (!__DEV__ && process.env.EXPO_PUBLIC_CRASH_REPORTING_ENABLED === 'true') {
      // TODO: Add crash reporting service (Sentry, Bugsnag, etc.)
      console.error('Production error:', {
        error: error.message,
        stack: error.stack,
        errorInfo,
      });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 bg-dark-bg items-center justify-center px-6">
          <View className="w-20 h-20 bg-red-500/20 rounded-full items-center justify-center mb-6">
            <AlertTriangle size={48} color="#EF4444" />
          </View>
          
          <Text className="text-white text-xl font-bold text-center mb-2">
            Oops! Something went wrong
          </Text>
          
          <Text className="text-dark-text text-center mb-8 leading-6">
            We're sorry, but something unexpected happened. Please try again.
          </Text>

          {__DEV__ && this.state.error && (
            <View className="bg-dark-surface rounded-xl p-4 mb-6 w-full">
              <Text className="text-red-400 text-sm font-mono">
                {this.state.error.message}
              </Text>
              {this.state.error.stack && (
                <Text className="text-dark-text text-xs font-mono mt-2" numberOfLines={5}>
                  {this.state.error.stack}
                </Text>
              )}
            </View>
          )}

          <View className="flex-row gap-3">
            <Pressable
              onPress={this.handleReset}
              className="bg-primary-500 px-6 py-3 rounded-xl flex-row items-center"
            >
              <RefreshCw size={20} color="#fff" />
              <Text className="text-white font-bold ml-2">Try Again</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;