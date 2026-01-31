import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Modal, TextInput, Linking, ActivityIndicator, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../../lib/api';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import {
  User,
  Mail,
  Phone,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  CreditCard,
  FileText,
  Moon,
  Camera,
  X,
  CheckCircle,
  Lock,
  Eye,
  EyeOff,
  DollarSign,
  Calendar,
  Bookmark,
  Home,
  Building2,
  Wallet,
} from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, logout, refreshUser } = useAuth();

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Notification preferences state
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  // Image upload state
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditPhone(user.phone || '');
    }
  }, [user]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name?: string; phone?: string; avatar?: string }) => {
      if (user?.role === 'owner') {
        return userApi.updateOwnerProfile({ fullName: data.name, phone: data.phone, avatar: data.avatar });
      }
      return userApi.updateStudentProfile({ fullName: data.name, phone: data.phone, avatar: data.avatar });
    },
    onSuccess: () => {
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setShowEditModal(false);
      Alert.alert('Success', 'Profile updated successfully!');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update profile');
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      userApi.changePassword(data.currentPassword, data.newPassword),
    onSuccess: () => {
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'Password changed successfully!');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to change password');
    },
  });

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  const handleSaveProfile = () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    updateProfileMutation.mutate({
      name: editName.trim(),
      phone: editPhone.trim() || undefined,
    });
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permission to change your photo');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setAvatarUri(asset.uri);
        setIsUploadingImage(true);

        try {
          const base64 = asset.base64;
          const mimeType = asset.mimeType || 'image/jpeg';

          if (!base64) {
            throw new Error('Failed to get image data');
          }

          const response = await userApi.uploadAvatarBase64(
            `data:${mimeType};base64,${base64}`,
            mimeType
          );

          if (response.data?.url) {
            if (user?.role === 'owner') {
              await userApi.updateOwnerProfile({ avatar: response.data.url });
            } else {
              await userApi.updateStudentProfile({ avatar: response.data.url });
            }
            refreshUser();
            Alert.alert('Success', 'Profile photo updated!');
          }
        } catch (uploadError: any) {
          console.error('Upload error:', uploadError);
          Alert.alert('Error', uploadError.response?.data?.error || 'Failed to upload image');
          setAvatarUri(null);
        } finally {
          setIsUploadingImage(false);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSupport = () => {
    Linking.openURL('mailto:support@studentnest.com?subject=App%20Support%20Request').catch(() => {
      Alert.alert('Contact Support', 'Email us at support@studentnest.com');
    });
  };

  const MenuItem = ({
    icon: Icon,
    title,
    subtitle,
    onPress,
    showChevron = true,
    danger = false,
    rightElement,
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showChevron?: boolean;
    danger?: boolean;
    rightElement?: React.ReactNode;
  }) => (
    <Pressable
      onPress={onPress}
      className="flex-row items-center py-4 border-b border-dark-border"
    >
      <View className={`w-10 h-10 rounded-full items-center justify-center ${danger ? 'bg-red-500/20' : 'bg-dark-surface'}  `}>
        <Icon size={20} color={danger ? '#EF4444' : '#F97316'} />
      </View>
      <View className="flex-1 ml-3">
        <Text className={`font-medium ${danger ? 'text-red-500' : 'text-white'}`}>{title}</Text>
        { subtitle && <Text className="text-dark-muted text-sm">{subtitle}</Text> }
      </View >
    { rightElement }
  { showChevron && !rightElement && <ChevronRight size={20} color="#71717A" /> }
    </Pressable >
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-dark-bg" edges={['top']}>
        <View className="flex-1 items-center justify-center px-6">
          <Animated.View entering={ZoomIn.duration(500)}>
            <View className="w-28 h-28 bg-primary-500/20 rounded-full items-center justify-center mb-6">
              <User size={56} color="#F97316" />
            </View>
          </Animated.View>
          <Animated.Text entering={FadeInUp.delay(200).duration(500)} className="text-white text-2xl font-bold">
            Welcome to StudentNest
          </Animated.Text>
          <Animated.Text entering={FadeInUp.delay(300).duration(500)} className="text-dark-text text-center mt-2 mb-8">
            Sign in to access your profile, bookings, and saved rooms
          </Animated.Text>
          <Animated.View entering={FadeInUp.delay(400).duration(500)} className="w-full">
            <Pressable
              onPress={() => router.push('/(auth)/login')}
              className="bg-primary-500 px-8 py-4 rounded-2xl w-full"
            >
              <Text className="text-white font-bold text-lg text-center">Sign In</Text>
            </Pressable>
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(500).duration(500)} className="w-full">
            <Pressable
              onPress={() => router.push('/(auth)/signup')}
              className="bg-dark-surface border border-dark-border px-8 py-4 rounded-2xl w-full mt-4"
            >
              <Text className="text-white font-bold text-lg text-center">Create Account</Text>
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  // Handle both avatar and profilePhoto field names from backend
  const displayAvatar = avatarUri || user?.avatar || user?.profilePhoto;
  const displayName = user?.name || user?.fullName || 'User';

  return (
    <SafeAreaView className="flex-1 bg-dark-bg" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(500)} className="px-6 pt-4 pb-6">
          <Text className="text-white text-2xl font-bold">Profile</Text>
        </Animated.View>

        {/* Profile Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} className="mx-6 bg-dark-surface rounded-2xl p-6 mb-6">
          <View className="flex-row items-center">
            <Pressable className="relative" onPress={handlePickImage} disabled={isUploadingImage}>
              {displayAvatar ? (
                <Image
                  source={{ uri: displayAvatar }}
                  style={{ width: 80, height: 80, borderRadius: 40 }}
                  contentFit="cover"
                />
              ) : (
                <View className="bg-primary-500/20 rounded-full items-center justify-center" style={{ width: 80, height: 80 }}>
                  <Text className="text-primary-500 text-3xl font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View className="absolute bottom-0 right-0 w-7 h-7 bg-primary-500 rounded-full items-center justify-center border-2 border-dark-surface">
                {isUploadingImage ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Camera size={14} color="#fff" />
                )}
              </View>
            </Pressable>
            <View className="flex-1 ml-4">
              <Text className="text-white text-xl font-bold">{displayName}</Text>
              <Text className="text-dark-text text-sm">{user?.email}</Text>
              <View className="flex-row items-center mt-2 flex-wrap">
                <View className="bg-primary-500/20 px-2 py-1 rounded-full mr-2 mb-1">
                  <Text className="text-primary-500 text-xs font-medium capitalize">{user?.role}</Text>
                </View>
                {user?.isEmailVerified && (
                  <View className="flex-row items-center bg-green-500/20 px-2 py-1 rounded-full mr-2 mb-1">
                    <Mail size={10} color="#22C55E" />
                    <Text className="text-green-500 text-xs ml-1">Email</Text>
                  </View>
                )}
                {user?.isPhoneVerified && (
                  <View className="flex-row items-center bg-green-500/20 px-2 py-1 rounded-full mr-2 mb-1">
                    <Phone size={10} color="#22C55E" />
                    <Text className="text-green-500 text-xs ml-1">Phone</Text>
                  </View>
                )}
                {user?.isIdentityVerified && (
                  <View className="flex-row items-center bg-blue-500/20 px-2 py-1 rounded-full mb-1">
                    <Shield size={10} color="#3B82F6" />
                    <Text className="text-blue-500 text-xs ml-1">ID Verified</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <Pressable
            className="bg-primary-500 py-3 rounded-xl mt-4 flex-row items-center justify-center"
            onPress={() => {
              setEditName(user?.name || '');
              setEditPhone(user?.phone || '');
              setShowEditModal(true);
            }}
          >
            <Text className="text-white text-center font-semibold">Edit Profile</Text>
          </Pressable>
        </Animated.View>

        {/* Menu Sections */}
        <View className="px-6">
          {/* Account */}
          <Text className="text-dark-muted text-sm font-semibold mb-2 uppercase">Account</Text>
          <View className="bg-dark-surface rounded-2xl px-4 mb-6">
            <MenuItem
              icon={User}
              title="Personal Information"
              subtitle="Name, email, phone"
              onPress={() => {
                setEditName(user?.name || '');
                setEditPhone(user?.phone || '');
                setShowEditModal(true);
              }}
            />
            <MenuItem
              icon={Lock}
              title="Change Password"
              subtitle="Update your password"
              onPress={() => {
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setShowPasswordModal(true);
              }}
            />
            <MenuItem
              icon={Shield}
              title="Verification"
              subtitle={user?.isIdentityVerified ? 'Verified' : 'Not verified'}
              onPress={() => Alert.alert('Verification', 'Identity verification coming soon!')}
            />
            <MenuItem
              icon={Bell}
              title="Notifications"
              subtitle="Manage notification preferences"
              onPress={() => setShowNotificationsModal(true)}
            />
            <MenuItem
              icon={CreditCard}
              title="Payment Methods"
              subtitle="Manage your payment options"
              onPress={() => Alert.alert('Payments', 'Payment methods coming soon!')}
              showChevron={false}
            />
          </View>

          {/* Activity */}
          <Text className="text-dark-muted text-sm font-semibold mb-2 uppercase">Activity</Text>
          <View className="bg-dark-surface rounded-2xl px-4 mb-6">
            {/* Owner Dashboard - only shown for owners */}
            {user?.role?.toLowerCase() === 'owner' && (
              <MenuItem
                icon={Building2}
                title="Owner Dashboard"
                subtitle="Manage your properties & bookings"
                onPress={() => router.push('/owner')}
              />
            )}
            <MenuItem
              icon={Wallet}
              title="Payment History"
              subtitle="View your payment transactions"
              onPress={() => router.push('/payments')}
            />
            <MenuItem
              icon={DollarSign}
              title="Negotiations"
              subtitle="View your price negotiations"
              onPress={() => router.push('/negotiations')}
            />
            <MenuItem
              icon={Calendar}
              title="Scheduled Visits"
              subtitle="Upcoming property visits"
              onPress={() => router.push('/visits')}
            />
            <MenuItem
              icon={Bookmark}
              title="Saved Rooms"
              subtitle="Your bookmarked properties"
              onPress={() => router.push('/(tabs)/saved')}
            />
            <MenuItem
              icon={Home}
              title="My Room Sharing"
              subtitle="Manage your room sharing listings"
              onPress={() => router.push('/room-sharing/my-shares')}
            />
          </View>

          {/* Preferences */}
          <Text className="text-dark-muted text-sm font-semibold mb-2 uppercase">Preferences</Text>
          <View className="bg-dark-surface rounded-2xl px-4 mb-6">
            <MenuItem
              icon={Moon}
              title="Appearance"
              subtitle="Dark mode"
              showChevron={false}
              rightElement={
                <View className="bg-primary-500/20 px-2 py-1 rounded-full">
                  <Text className="text-primary-500 text-xs">Always Dark</Text>
                </View>
              }
            />
            <MenuItem
              icon={Settings}
              title="Settings"
              onPress={() => Alert.alert('Settings', 'Settings coming soon!')}
              showChevron={false}
            />
          </View>

          {/* Support */}
          <Text className="text-dark-muted text-sm font-semibold mb-2 uppercase">Support</Text>
          <View className="bg-dark-surface rounded-2xl px-4 mb-6">
            <MenuItem
              icon={HelpCircle}
              title="Help Center"
              onPress={handleSupport}
            />
            <MenuItem
              icon={FileText}
              title="Terms & Privacy"
              onPress={() => Linking.openURL('https://studentnest.com/terms')}
              showChevron={false}
            />
          </View>

          {/* Logout */}
          <View className="bg-dark-surface rounded-2xl px-4 mb-8">
            <MenuItem
              icon={LogOut}
              title="Logout"
              onPress={handleLogout}
              showChevron={false}
              danger
            />
          </View>

          {/* App Version */}
          <Text className="text-dark-muted text-center text-sm mb-8">
            StudentNest v1.0.0
          </Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-dark-surface rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-white text-xl font-bold">Edit Profile</Text>
              <Pressable onPress={() => setShowEditModal(false)}>
                <X size={24} color="#9CA3AF" />
              </Pressable>
            </View>

            <View className="mb-4">
              <Text className="text-dark-text text-sm mb-2">Name</Text>
              <TextInput
                className="bg-dark-card text-white px-4 py-3 rounded-xl"
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter your name"
                placeholderTextColor="#6B7280"
              />
            </View>

            <View className="mb-4">
              <Text className="text-dark-text text-sm mb-2">Phone</Text>
              <TextInput
                className="bg-dark-card text-white px-4 py-3 rounded-xl"
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="Enter your phone number"
                placeholderTextColor="#6B7280"
                keyboardType="phone-pad"
              />
            </View>

            <View className="mb-6">
              <Text className="text-dark-text text-sm mb-2">Email</Text>
              <View className="bg-dark-card/50 px-4 py-3 rounded-xl flex-row items-center">
                <Text className="text-dark-muted flex-1">{user?.email}</Text>
                {user?.isEmailVerified && (
                  <View className="flex-row items-center">
                    <CheckCircle size={14} color="#22C55E" />
                    <Text className="text-green-500 text-xs ml-1">Verified</Text>
                  </View>
                )}
              </View>
            </View>

            <View className="flex-row gap-3">
              <Pressable
                className="flex-1 bg-dark-card py-3 rounded-xl"
                onPress={() => setShowEditModal(false)}
              >
                <Text className="text-white text-center font-semibold">Cancel</Text>
              </Pressable>
              <Pressable
                className="flex-1 bg-primary-500 py-3 rounded-xl flex-row items-center justify-center"
                onPress={handleSaveProfile}
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-white text-center font-semibold">Save Changes</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-dark-surface rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-white text-xl font-bold">Change Password</Text>
              <Pressable onPress={() => setShowPasswordModal(false)}>
                <X size={24} color="#9CA3AF" />
              </Pressable>
            </View>

            <View className="mb-4">
              <Text className="text-dark-text text-sm mb-2">Current Password</Text>
              <View className="flex-row items-center bg-dark-card rounded-xl">
                <TextInput
                  className="flex-1 text-white px-4 py-3"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                  placeholderTextColor="#6B7280"
                  secureTextEntry={!showCurrentPassword}
                />
                <Pressable className="px-4" onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                  {showCurrentPassword ? <EyeOff size={20} color="#6B7280" /> : <Eye size={20} color="#6B7280" />}
                </Pressable>
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-dark-text text-sm mb-2">New Password</Text>
              <View className="flex-row items-center bg-dark-card rounded-xl">
                <TextInput
                  className="flex-1 text-white px-4 py-3"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  placeholderTextColor="#6B7280"
                  secureTextEntry={!showNewPassword}
                />
                <Pressable className="px-4" onPress={() => setShowNewPassword(!showNewPassword)}>
                  {showNewPassword ? <EyeOff size={20} color="#6B7280" /> : <Eye size={20} color="#6B7280" />}
                </Pressable>
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-dark-text text-sm mb-2">Confirm New Password</Text>
              <TextInput
                className="bg-dark-card text-white px-4 py-3 rounded-xl"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor="#6B7280"
                secureTextEntry={true}
              />
            </View>

            <View className="flex-row gap-3">
              <Pressable
                className="flex-1 bg-dark-card py-3 rounded-xl"
                onPress={() => setShowPasswordModal(false)}
              >
                <Text className="text-white text-center font-semibold">Cancel</Text>
              </Pressable>
              <Pressable
                className="flex-1 bg-primary-500 py-3 rounded-xl flex-row items-center justify-center"
                onPress={handleChangePassword}
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-white text-center font-semibold">Update Password</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Notifications Settings Modal */}
      <Modal
        visible={showNotificationsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNotificationsModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-dark-surface rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-white text-xl font-bold">Notification Preferences</Text>
              <Pressable onPress={() => setShowNotificationsModal(false)}>
                <X size={24} color="#9CA3AF" />
              </Pressable>
            </View>

            <View className="flex-row items-center justify-between py-4 border-b border-dark-border">
              <View>
                <Text className="text-white font-medium">Push Notifications</Text>
                <Text className="text-dark-muted text-sm">Receive push notifications</Text>
              </View>
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{ false: '#3f3f46', true: '#F97316' }}
                thumbColor={pushNotifications ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View className="flex-row items-center justify-between py-4 border-b border-dark-border">
              <View>
                <Text className="text-white font-medium">Email Notifications</Text>
                <Text className="text-dark-muted text-sm">Receive updates via email</Text>
              </View>
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{ false: '#3f3f46', true: '#F97316' }}
                thumbColor={emailNotifications ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View className="flex-row items-center justify-between py-4 mb-6">
              <View>
                <Text className="text-white font-medium">SMS Notifications</Text>
                <Text className="text-dark-muted text-sm">Receive SMS updates</Text>
              </View>
              <Switch
                value={smsNotifications}
                onValueChange={setSmsNotifications}
                trackColor={{ false: '#3f3f46', true: '#F97316' }}
                thumbColor={smsNotifications ? '#fff' : '#f4f3f4'}
              />
            </View>

            <Pressable
              className="bg-primary-500 py-3 rounded-xl"
              onPress={() => {
                setShowNotificationsModal(false);
                Alert.alert('Success', 'Notification preferences saved!');
              }}
            >
              <Text className="text-white text-center font-semibold">Save Preferences</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}