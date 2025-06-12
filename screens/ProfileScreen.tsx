// GaraadApp/screens/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Modal,
  Pressable, SafeAreaView, ActivityIndicator, Alert, Dimensions, Platform
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../navigation/AuthStack';
import colors from '../constants/colors';
import { User, UserProfileData } from '../types/auth'; // Using the refined types
import { FontAwesome5, MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';
import { removeTokens } from '../utils/storage';
// Import your API service if you were to fetch fresh data
// import { fetchMyProfile } from '../services/userApi';

const { width } = Dimensions.get('window');

type ProfileScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Profile'>;
type ProfileScreenRouteProp = RouteProp<AuthStackParamList, 'Profile'>;

interface Props {
  navigation: ProfileScreenNavigationProp;
  route: ProfileScreenRouteProp;
}

interface LeaderboardUser { rank: number; avatarInitial: string; name: string; score: number; }
const MOCK_LEADERBOARD_DATA: LeaderboardUser[] = [
    { rank: 1, avatarInitial: 'RO', name: 'Rooble Cali', score: 330 },
    { rank: 2, avatarInitial: 'AB', name: 'abdullahikawte2019@', score: 315 },
    // Add more mock data or implement fetching
];

const ProfileScreen: React.FC<Props> = ({ navigation, route }) => {
  // User data is passed as a required route parameter
  const { user } = route.params;

  const [activeTab, setActiveTab] = useState<'progress' | 'settings'>('progress');
  const [menuVisible, setMenuVisible] = useState(false);

  // useEffect hook to potentially refresh profile data from API if needed,
  // or if user wasn't passed via route.params (though our current setup requires it).
  // For now, we rely on the 'user' from route.params.
  // Example for fetching:
  // const [currentUser, setCurrentUser] = useState<User | null>(route.params.user);
  // const [isLoading, setIsLoading] = useState(!route.params.user); // Load if not passed
  // useEffect(() => {
  //   if (!currentUser) { // Only fetch if not passed via route
  //     const loadProfile = async () => {
  //       setIsLoading(true);
  //       try {
  //         const fetchedUser = await fetchMyProfile();
  //         setCurrentUser(fetchedUser);
  //       } catch (error) {
  //         Alert.alert("Error", "Could not load profile details.");
  //         // navigation.goBack(); // Or handle error appropriately
  //       } finally {
  //         setIsLoading(false);
  //       }
  //     };
  //     loadProfile();
  //   }
  // }, [currentUser]); // Re-fetch if currentUser becomes null somehow (e.g., after an edit action)

  const handleLogout = async () => {
    setMenuVisible(false);
    await removeTokens();
    navigation.replace('Login'); // Or 'Splash'
  };

  // If 'user' prop wasn't passed correctly (should be caught by TypeScript earlier)
  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Critical Error: User data missing.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Safely access profile data. Use a fallback empty object if user.profile might be undefined.
  const profileData: UserProfileData = user.profile || {};

  const displayName = user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;
  const displayUsername = user.username;
  const displayEmail = user.email;

  let avatarInitial = 'G';
  if (displayName) avatarInitial = displayName.charAt(0).toUpperCase();
  else if (displayUsername) avatarInitial = displayUsername.charAt(0).toUpperCase();

  // Access fields from profileData, providing defaults
  const progressPercentage = profileData.progress_percentage ?? 0;
  const lessonsCompleted = profileData.lessons_completed ?? 0;
  const points = profileData.points ?? 0;
  const streakDays = profileData.streak_days ?? 0;
  const currentLeague = profileData.current_league ?? 'N/A';
  const leagueRank = profileData.league_rank; // Can be number or undefined/null
  const pointsToNextLeague = profileData.points_to_next_league ?? 0;
  const isVerified = profileData.is_verified ?? false;
  const avatarUrl = profileData.avatar;

  // --- RENDER FUNCTIONS (renderProfileHeader, renderTabs, etc.) ---
  // These functions will use the safely destructured variables above.
  // Their internal JSX structure remains as you designed them.

  const renderProfileHeader = () => (
    <View style={styles.headerContainer}>
        <View style={styles.avatarContainer}>
            {avatarUrl && avatarUrl !== '' ? ( // Check if avatarUrl is a non-empty string
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitial}>{avatarInitial}</Text>
                </View>
            )}
        </View>
        <View style={styles.nameVerifiedContainer}>
            <Text style={styles.nameText}>{displayName}</Text>
            {isVerified && <MaterialCommunityIcons name="check-decagram" size={20} color={colors.profileVerifiedBadge} style={styles.verifiedBadge}/>}
        </View>
        <View style={styles.handleEmailContainer}>
            <View style={styles.handleContainer}>
                <Text style={styles.handleText}>@{displayUsername}</Text>
            </View>
            {displayEmail && // Conditionally render email part if available
                <>
                    <MaterialCommunityIcons name="email-outline" size={16} color={colors.profileEmailText} style={{marginHorizontal: 5}} />
                    <Text style={styles.emailText}>{displayEmail}</Text>
                </>
            }
        </View>
        <View style={styles.statsRow}>
            <View style={[styles.statCard, {backgroundColor: colors.profileStatCardPurpleTint}]}>
                <FontAwesome5 name="trophy" size={18} color={colors.profileStatIconPurple} />
                <Text style={styles.statValue}>{progressPercentage}%</Text>
                <Text style={styles.statLabel}>Horumar</Text>
            </View>
            <View style={[styles.statCard, {backgroundColor: colors.profileStatCardGreenTint}]}>
                <Ionicons name="book-outline" size={20} color={colors.profileStatIconGreen} />
                <Text style={styles.statValue}>{lessonsCompleted}</Text>
                <Text style={styles.statLabel}>Casharrada</Text>
            </View>
        </View>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabContainer}>
        <TouchableOpacity
            style={[styles.tabButton, activeTab === 'progress' && styles.activeTabButton]}
            onPress={() => setActiveTab('progress')}>
            <FontAwesome5 name="trophy" size={16} color={activeTab === 'progress' ? colors.profileTabActiveText : colors.profileTabInactiveText} style={styles.tabIcon} />
            <Text style={[styles.tabText, activeTab === 'progress' && styles.activeTabText]}>Horumarka</Text>
        </TouchableOpacity>
        <TouchableOpacity
            style={[styles.tabButton, activeTab === 'settings' && styles.activeTabButton]}
            onPress={() => setActiveTab('settings')}>
            <Ionicons name="settings-outline" size={18} color={activeTab === 'settings' ? colors.profileTabActiveText : colors.profileTabInactiveText} style={styles.tabIcon}/>
            <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>Dejinta</Text>
        </TouchableOpacity>
    </View>
  );

  const renderProgressContent = () => (
    <View style={styles.tabContentContainer}>
        <View style={styles.sectionCardPurple}>
            <FontAwesome5 name="trophy" size={20} color={colors.profileSectionTitleText} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Horumarkaaga</Text>
        </View>
        <View style={styles.leagueCard}>
            <View style={styles.leagueHeader}>
                <View style={styles.leagueIconContainer}>
                    <MaterialCommunityIcons name="crown-outline" size={24} color={colors.profileStatIconPurple} />
                </View>
                <View>
                    <Text style={styles.leagueName}>{currentLeague}</Text>
                    <Text style={styles.leagueSubtitle}>booskaaga liigaha hadda</Text>
                </View>
                <View style={styles.leagueRankTag}>
                    <Text style={styles.leagueRankTagText}>#{leagueRank || 'N/A'}</Text>
                </View>
            </View>
            <View style={styles.pointsStreakRow}>
                <View style={styles.pointsBox}>
                    <Ionicons name="sparkles-outline" size={18} color={colors.white} />
                    <Text style={styles.pointsBoxValue}>{points}</Text>
                    <Text style={styles.pointsBoxLabel}>Dhibco</Text>
                </View>
                <View style={styles.streakBox}>
                     <MaterialCommunityIcons name="fire" size={18} color={colors.leaderboardStreakIcon} />
                    <Text style={styles.streakBoxValue}>{streakDays} Maalin isu xigxiga</Text>
                </View>
            </View>
            <Text style={styles.pointsToNextLeagueText}>
                {pointsToNextLeague} dhibco baa loo baahan yahay inta kaaga dhimman liiga xiga
            </Text>
            <Progress.Bar
                progress={(points) / ((points) + (pointsToNextLeague || 1))} // Avoid division by zero or NaN
                width={null}
                height={8}
                color={colors.leaderboardProgressBar}
                unfilledColor={colors.leaderboardProgressBarBackground}
                borderColor={colors.leaderboardProgressBarBackground}
                borderRadius={4}
                style={{ marginTop: 10 }} />
        </View>
        <View style={styles.leaderboardSection}>
            <Text style={styles.leaderboardTitle}>{currentLeague} Shaxda tartanka</Text>
            <View style={styles.leaderboardTimeToggle}>
                <TouchableOpacity style={styles.leaderboardTimeButtonActive}><Text style={styles.leaderboardTimeButtonTextActive}>Asbuucle</Text></TouchableOpacity>
                <TouchableOpacity style={styles.leaderboardTimeButton}><Text style={styles.leaderboardTimeButtonText}>Bille</Text></TouchableOpacity>
            </View>
            {MOCK_LEADERBOARD_DATA.map(item => (
                <View key={item.rank} style={styles.leaderboardItem}>
                    <View style={styles.leaderboardRankContainer}><Text style={styles.leaderboardRank}>{item.rank}</Text></View>
                    <View style={styles.leaderboardAvatarPlaceholder}><Text style={styles.leaderboardAvatarInitial}>{item.avatarInitial}</Text></View>
                    <Text style={styles.leaderboardName}>{item.name}</Text>
                    <View style={styles.leaderboardScoreContainer}>
                        <MaterialCommunityIcons name="star-four-points-outline" size={16} color={colors.leaderboardScoreIcon} />
                        <Text style={styles.leaderboardScore}>{item.score}</Text>
                    </View>
                </View>
            ))}
        </View>
    </View>
  );

  const renderSettingsContent = () => (
    <View style={styles.tabContentContainer}>
        <View style={styles.sectionCardPurple}>
            <Ionicons name="settings-outline" size={20} color={colors.profileSectionTitleText} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Dejinta Profile-ka</Text>
            <TouchableOpacity style={styles.editButton} onPress={() => { /* TODO: navigation.navigate('EditProfile', { user }) */ }}>
                <Feather name="edit-2" size={16} color={colors.profileEditButtonText} />
                <Text style={styles.editButtonText}>Wax ka badal</Text>
            </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.settingItem}><Ionicons name="person-circle-outline" size={24} color={colors.profileSettingIcon} style={styles.settingIcon}/><Text style={styles.settingText}>Akoonkaaga</Text><Ionicons name="chevron-forward-outline" size={20} color={colors.profileSettingIcon} /></TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}><Ionicons name="notifications-outline" size={24} color={colors.profileSettingIcon} style={styles.settingIcon}/><Text style={styles.settingText}>Ogeysiisyada</Text><Ionicons name="chevron-forward-outline" size={20} color={colors.profileSettingIcon} /></TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}><Ionicons name="lock-closed-outline" size={24} color={colors.profileSettingIcon} style={styles.settingIcon}/><Text style={styles.settingText}>Asturnaanta & Amniga</Text><Ionicons name="chevron-forward-outline" size={20} color={colors.profileSettingIcon} /></TouchableOpacity>
        <TouchableOpacity style={styles.settingItem} onPress={handleLogout}><Ionicons name="log-out-outline" size={24} color={colors.profileLogoutText} style={styles.settingIcon}/><Text style={[styles.settingText, {color: colors.profileLogoutText}]}>Ka bax</Text></TouchableOpacity>
    </View>
  );

  const renderPopupMenu = () => (
    <Modal
        animationType="fade"
        transparent={true}
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
            <View style={styles.popupMenu} onStartShouldSetResponder={() => true}>
                <Text style={styles.popupMenuTitle}>Maaree akoonkaaga</Text>
                <TouchableOpacity style={styles.popupMenuItem} onPress={() => {setMenuVisible(false); /* navigation.navigate('EditProfile', { user }) */}}><Ionicons name="person-outline" size={20} color={colors.profileMenuIcon} style={styles.popupMenuIcon}/><Text style={styles.popupMenuText}>Profile-kaaga</Text></TouchableOpacity>
                <TouchableOpacity style={styles.popupMenuItem} onPress={() => {setMenuVisible(false); setActiveTab('settings')}}><Ionicons name="settings-outline" size={20} color={colors.profileMenuIcon} style={styles.popupMenuIcon}/><Text style={styles.popupMenuText}>Dejinta</Text></TouchableOpacity>
                <TouchableOpacity style={styles.popupMenuItem} onPress={handleLogout}><Ionicons name="exit-outline" size={20} color={colors.profileLogoutText} style={styles.popupMenuIcon}/><Text style={[styles.popupMenuText, {color: colors.profileLogoutText}]}>Ka bax</Text></TouchableOpacity>
            </View>
        </Pressable>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
            <Text style={styles.topBarTitle}>Garaad</Text>
            <View style={styles.topBarIcons}>
                <TouchableOpacity style={styles.topBarIconButton}><Ionicons name="home-outline" size={24} color={colors.profileMenuIcon} /></TouchableOpacity>
                <TouchableOpacity style={styles.topBarIconButton}><Ionicons name="folder-open-outline" size={24} color={colors.profileMenuIcon} /></TouchableOpacity>
                <TouchableOpacity style={styles.topBarIconButton}>
                    <View style={styles.pointsChip}>
                        <Text style={styles.pointsChipText}>{points}</Text>
                        <MaterialCommunityIcons name="lightning-bolt" size={16} color={colors.white} />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.topBarIconButton}><Ionicons name="notifications-outline" size={24} color={colors.profileMenuIcon} /></TouchableOpacity>
                <TouchableOpacity style={styles.topBarIconButton} onPress={() => setMenuVisible(true)}>
                    <Ionicons name="menu-outline" size={28} color={colors.profileMenuIcon} />
                </TouchableOpacity>
            </View>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContentContainer}>
            {renderProfileHeader()}
            {renderTabs()}
            {activeTab === 'progress' ? renderProgressContent() : renderSettingsContent()}
        </ScrollView>
        {renderPopupMenu()}
    </SafeAreaView>
  );
};

// Ensure all styles are defined below
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  errorText: { color: colors.error, fontSize: 16, textAlign: 'center' },
  topBar: {
    marginTop: Platform.OS === 'android' ? 25 : 0, // Basic status bar handling for Android
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: colors.profileHeaderBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey,
  },
  topBarTitle: { fontSize: 22, fontWeight: 'bold', color: colors.primary },
  topBarIcons: { flexDirection: 'row', alignItems: 'center' },
  topBarIconButton: { padding: 8 },
  pointsChip: { flexDirection: 'row', backgroundColor: colors.primary, borderRadius: 15, paddingHorizontal: 8, paddingVertical: 4, alignItems: 'center' },
  pointsChipText: { color: colors.white, fontWeight: 'bold', marginRight: 4, fontSize: 12 },
  scrollContentContainer: { paddingBottom: 20 },
  headerContainer: { alignItems: 'center', paddingVertical: 20, backgroundColor: colors.profileHeaderBackground, paddingHorizontal: 20 },
  avatarContainer: { marginBottom: 10 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.profileStatIconPurple, justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { fontSize: 40, fontWeight: 'bold', color: colors.white },
  nameVerifiedContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  nameText: { fontSize: 24, fontWeight: 'bold', color: colors.profileUsernameText },
  verifiedBadge: { marginLeft: 8 },
  handleEmailContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  handleContainer: { backgroundColor: colors.profileHandleBackground, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  handleText: { color: colors.profileHandleText, fontSize: 14, fontWeight: '500' },
  emailText: { fontSize: 14, color: colors.profileEmailText },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 10 },
  statCard: { alignItems: 'center', paddingVertical: 15, paddingHorizontal: 10, borderRadius: 12, width: '45%', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  statValue: { fontSize: 20, fontWeight: 'bold', color: colors.profileStatValue, marginTop: 5 },
  statLabel: { fontSize: 13, color: colors.profileStatLabel, marginTop: 3 },
  tabContainer: { flexDirection: 'row', marginTop: 10, marginBottom: 20, marginHorizontal: 20, backgroundColor: colors.profileTabInactiveBackground, borderRadius: 10, borderWidth: 1, borderColor: colors.profileTabBorder, overflow: 'hidden' },
  tabButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  activeTabButton: { backgroundColor: colors.profileTabActiveBackground },
  tabIcon: { marginRight: 8 },
  tabText: { fontSize: 15, fontWeight: '600', color: colors.profileTabInactiveText },
  activeTabText: { color: colors.profileTabActiveText },
  tabContentContainer: { paddingHorizontal: 20 },
  sectionCardPurple: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.profileSectionTitleBackground, paddingVertical: 12, paddingHorizontal: 15, borderRadius: 10, marginBottom: 15 },
  sectionIcon: { marginRight: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.profileSectionTitleText, flex: 1 },
  editButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.profileEditButtonBackground, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: colors.profileEditButtonBorder },
  editButtonText: { color: colors.profileEditButtonText, marginLeft: 5, fontWeight: '600', fontSize: 13 },
  settingItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.profileSettingBackground, paddingVertical: 15, paddingHorizontal: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: colors.grey },
  settingIcon: { marginRight: 15 },
  settingText: { flex: 1, fontSize: 16, color: colors.profileSettingText },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  popupMenu: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : 50, right: 10, backgroundColor: colors.profileMenuBackground, borderRadius: 8, paddingVertical: 5, width: 200, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
  popupMenuTitle: { fontSize: 14, fontWeight: '600', color: colors.lightText, paddingHorizontal: 15, paddingTop: 10, paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: colors.profileMenuBorder, marginBottom: 5 },
  popupMenuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 15 },
  popupMenuIcon: { marginRight: 10 },
  popupMenuText: { fontSize: 15, color: colors.profileMenuText },
  leagueCard: { backgroundColor: colors.white, padding: 15, borderRadius: 12, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  leagueHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  leagueIconContainer: { backgroundColor: colors.profileStatCardPurpleTint, padding: 8, borderRadius: 8, marginRight: 10 },
  leagueName: { fontSize: 18, fontWeight: 'bold', color: colors.profileUsernameText },
  leagueSubtitle: { fontSize: 13, color: colors.lightText },
  leagueRankTag: { marginLeft: 'auto', backgroundColor: colors.leaderboardLeagueTagBackground, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  leagueRankTagText: { color: colors.leaderboardLeagueTagText, fontSize: 12, fontWeight: 'bold' },
  pointsStreakRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  pointsBox: { backgroundColor: colors.leaderboardPointsBackground, padding: 10, borderRadius: 8, alignItems: 'center', width: '48%', flexDirection: 'row', justifyContent: 'center' },
  pointsBoxValue: { color: colors.leaderboardPointsText, fontSize: 16, fontWeight: 'bold', marginLeft: 5 },
  pointsBoxLabel: { color: colors.leaderboardPointsText, fontSize: 12, marginLeft: 5 },
  streakBox: { backgroundColor: colors.leaderboardStreakBackground, borderWidth: 1, borderColor: colors.grey, padding: 10, borderRadius: 8, alignItems: 'center', width: '48%', flexDirection: 'row', justifyContent: 'center' },
  streakBoxValue: { color: colors.leaderboardStreakText, fontSize: 13, fontWeight: '500', marginLeft: 5 },
  pointsToNextLeagueText: { fontSize: 13, color: colors.lightText, textAlign: 'center', marginTop: 5 },
  leaderboardSection: { marginTop: 10 },
  leaderboardTitle: { fontSize: 17, fontWeight: 'bold', color: colors.profileUsernameText, marginBottom: 10 },
  leaderboardTimeToggle: { flexDirection: 'row', marginBottom: 15, backgroundColor: colors.lightGrey, borderRadius: 8, padding: 3 },
  leaderboardTimeButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  leaderboardTimeButtonActive: { flex: 1, paddingVertical: 8, alignItems: 'center', backgroundColor: colors.white, borderRadius: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  leaderboardTimeButtonText: { color: colors.lightText, fontWeight: '500' },
  leaderboardTimeButtonTextActive: { color: colors.primary, fontWeight: 'bold' },
  leaderboardItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.leaderboardItemBackground, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: colors.grey },
  leaderboardRankContainer: { backgroundColor: colors.leaderboardRankCircle, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  leaderboardRank: { color: colors.leaderboardRankText, fontWeight: 'bold' },
  leaderboardAvatarPlaceholder: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.profileStatIconPurple, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  leaderboardAvatarInitial: { color: colors.white, fontWeight: 'bold' },
  leaderboardName: { flex: 1, fontSize: 15, color: colors.leaderboardNameText, fontWeight: '500' },
  leaderboardScoreContainer: { flexDirection: 'row', alignItems: 'center' },
  leaderboardScore: { color: colors.leaderboardScoreText, fontWeight: 'bold', marginLeft: 4 },
});

export default ProfileScreen;