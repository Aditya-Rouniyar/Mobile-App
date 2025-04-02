// 
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Alert,
    Dimensions,
    TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { Icon } from "react-native-eva-icons";
import BaseTabContent from "../components/BaseTabContent";
import Moonlet from "../components/Moonlet";
import theme from "../constants/theme";
import { getAge, getGenderIcon, hp, wp } from "../helpers/common";
import { useAuth } from "../context/authContext";
import { LinearGradient } from "expo-linear-gradient";
import Badge from "../components/Badge";
import { collection, getDoc, getDocs, doc, where, query, orderBy, limit, startAfter } from "firebase/firestore";
import { db } from "../firebaseConfig";
import Loading from "../components/Loading";
import ImageViewerModal from "../components/ImageViewerModal";
import UserListModal from "../components/UserListModal";
import { BlurView } from "expo-blur";
import TwoHearts from "./TwoHearts";

const { width, height } = Dimensions.get("window");
const ALBUM_PADDING = hp(2);

const ProfileDisplay = ({ userData }) => {
    const {
        logout,
        user,
        refreshUserFromCloud,
        updateUserCloud,
        deleteUserAccount,
        accountDeletionInProgress,
    } = useAuth();

    const [refreshing, setRefreshing] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const [userDataLocal, setUserDataLocal] = useState(() => ({
        userId: userData?.userId || "",
        name: userData?.name || "",
        email: userData?.email || "",
        gender: userData?.gender || "",
        dateOfBirth: userData?.dateOfBirth || null,
        profileImageUrl: userData?.profileImageUrl || "",
        images: userData?.images || [userData?.profileImageUrl].filter(Boolean),
        tags: userData?.tags || [],
        discourseCommunities: userData?.discourseCommunities || [],
        followers: userData?.followers || 0,
        following: userData?.following || 0,
        visitors: userData?.visitors || 0,
    }));

    const [posts, setPosts] = useState([]);

    const PAGE_SIZE = 5;
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [lastVisiblePost, setLastVisiblePost] = useState(null);

    const [selectedImageIndex, setSelectedImageIndex] = useState(null);
    const [showUserList, setShowUserList] = useState(false);
    const [userListType, setUserListType] = useState(null); // 'followers', 'following', or 'visitors'
    const [userList, setUserList] = useState([]);
    const [loadingUserList, setLoadingUserList] = useState(false);

    const handleStatPress = async (type) => {
        setUserListType(type);
        setLoadingUserList(true);
        setShowUserList(true);
        
        try {
            // Fetch the appropriate user list based on type
            let users = [];
            if (type === 'followers') {
                users = await fetchFollowers();
            } else if (type === 'following') {
                users = await fetchFollowing();
            } else if (type === 'visitors') {
                users = await fetchVisitors();
            }
            
            setUserList(users);
        } catch (error) {
            console.error(`Error fetching ${type}:`, error);
            Alert.alert('Error', `Failed to load ${type}. Please try again.`);
        } finally {
            setLoadingUserList(false);
        }
    };

    const fetchFollowers = async () => {
        try {
            const followersRef = collection(db, "users", userData.userId, "followers");
            const followersSnapshot = await getDocs(followersRef);
            
            if (followersSnapshot.empty) {
                return [];
            }
            
            // Get user details for each follower
            const followerPromises = followersSnapshot.docs.map(async (doc) => {
                const userId = doc.id;
                const userDoc = await getDoc(doc.ref.parent.parent.parent.doc(userId));
                
                if (userDoc.exists()) {
                    return {
                        userId: userId,
                        ...userDoc.data()
                    };
                }
                return null;
            });
            
            const followers = (await Promise.all(followerPromises)).filter(Boolean);
            return followers;
        } catch (error) {
            console.error("Error fetching followers:", error);
            throw error;
        }
    };

    const fetchFollowing = async () => {
        try {
            const followingRef = collection(db, "users", userData.userId, "following");
            const followingSnapshot = await getDocs(followingRef);
            
            if (followingSnapshot.empty) {
                return [];
            }
            
            // Get user details for each following
            const followingPromises = followingSnapshot.docs.map(async (doc) => {
                const userId = doc.id;
                const userDoc = await getDoc(doc.ref.parent.parent.parent.doc(userId));
                
                if (userDoc.exists()) {
                    return {
                        userId: userId,
                        ...userDoc.data()
                    };
                }
                return null;
            });
            
            const following = (await Promise.all(followingPromises)).filter(Boolean);
            return following;
        } catch (error) {
            console.error("Error fetching following:", error);
            throw error;
        }
    };

    const fetchVisitors = async () => {
        try {
            const visitorsRef = collection(db, "users", userData.userId, "visitors");
            const visitorsSnapshot = await getDocs(visitorsRef);
            
            if (visitorsSnapshot.empty) {
                return [];
            }
            
            // Get user details for each visitor
            const visitorPromises = visitorsSnapshot.docs.map(async (doc) => {
                const userId = doc.id;
                const userDoc = await getDoc(doc.ref.parent.parent.parent.doc(userId));
                
                if (userDoc.exists()) {
                    return {
                        userId: userId,
                        ...userDoc.data()
                    };
                }
                return null;
            });
            
            const visitors = (await Promise.all(visitorPromises)).filter(Boolean);
            return visitors;
        } catch (error) {
            console.error("Error fetching visitors:", error);
            throw error;
        }
    };

    const fetchUserPosts = async (reset = false) => {
        if ((loadingMore && !reset) || !hasMore) return;
        setLoadingMore(true);

        try {
            const userPostsRef = collection(db, "users", userData.userId, "userPosts");
            const userPostsSnapshot = await getDocs(userPostsRef);
            const postIds = userPostsSnapshot.docs.map((doc) => doc.id);

            if (postIds.length === 0) {
                setHasMore(false);
                setLoadingMore(false);
                return;
            }

            let postsQuery = query(
                collection(db, "posts"),
                where("__name__", "in", postIds), // Fetch posts by their document IDs
                orderBy("createdAt", "desc"), // Sort by createdAt
                limit(PAGE_SIZE)
            );

            if (!reset && lastVisiblePost) {
                postsQuery = query(
                    collection(db, "posts"),
                    where("__name__", "in", postIds),
                    orderBy("createdAt", "desc"),
                    startAfter(lastVisiblePost),
                    limit(PAGE_SIZE)
                );
            }

            const postsSnapshot = await getDocs(postsQuery);

            if (postsSnapshot.empty) {
                setHasMore(false);
                setLoadingMore(false);
                return;
            }

            const postList = postsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            if (reset) {
                setPosts(postList);
            } else {
                setPosts((prev) => [...prev, ...postList]);
            }

            setLastVisiblePost(postsSnapshot.docs[postsSnapshot.docs.length - 1]);

            if (postList.length < PAGE_SIZE) {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Error fetching userData posts:", error);
        } finally {
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        if (userData) {
            fetchUserPosts(true);
        }
    }, [userData]);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await refreshProfile();
            await fetchUserPosts(true);
        } catch (error) {
            // handle error if needed
        } finally {
            setRefreshing(false);
        }
    };

    // Refresh the userData profile from the cloud
    const refreshProfile = async () => {
        await refreshUserFromCloud(userData.userId);
    };

    // Sync local state when the cloud userData object changes
    useEffect(() => {
        if (userData) {
            setUserDataLocal({
                userId: userData.userId || "",
                name: userData.name || "",
                email: userData.email || "",
                gender: userData.gender || "",
                dateOfBirth: userData.dateOfBirth || "",
                profileImageUrl: userData.profileImageUrl || "",
                images: userData.images || [userData.profileImageUrl],
                tags: userData.tags || [],
                discourseCommunities: userData.discourseCommunities || [],
                followers: userData.followers || 0,
                following: userData.following || 0,
                visitors: userData.visitors || 0,
            });
        }
    }, [userData]);

    const handleLogOut = async () => {
        await logout();
    };

    const handleSubmitLocalUserDataToCloudDB = async () => {
        updateUserCloud(userDataLocal);
    };

    const deleteAccount = async () => {
        Alert.alert(
            "Confirm Deletion",
            "Are you sure you want to delete your account? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: deleteUserAccount },
            ],
            { cancelable: true }
        );
    };

    const handleFollow = async () => {
    };

    const handleLeap = async () => {
    };

    const BottomOptionsBar = () => (
        <BlurView
            intensity={50} // Adjust for stronger/milder blur effect
            tint="dark" // Choose between "light", "dark", or "default"
            style={{
                position: "absolute",
                bottom: hp(3.6), // Positioned above the bottom edge
                height: hp(7),
                width: wp(42),
                borderRadius: 30,
                alignSelf: 'center',
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: wp(3),
                backgroundColor: "rgba(79, 69, 77, 0.1)",
                borderWidth: 0.2,
                borderColor: theme.dark.colors.primary,
                overflow: "hidden",
            }}
        >
            <TouchableOpacity onPress={handleFollow} activeOpacity={0.8}>
                <LinearGradient
                    colors={[theme.dark.colors.primary, theme.dark.colors.primary10]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                        padding: 8,
                        width: 40,
                        height: 40,
                        borderRadius: 100,
                        alignItems: "center",
                        justifyContent: "center",
                        shadowOpacity: 0.8,
                        shadowRadius: 6,
                        shadowColor: "black",
                        shadowOffset: { width: 0, height: 2 },
                    }}
                >
                    <Icon name="person-add-outline" fill="rgba(255, 255, 255, 0.8)" />
                </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLeap}   >
                <LinearGradient
                    colors={[theme.dark.colors.primary, theme.dark.colors.primary10]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                        padding: 8,
                        width: 80,
                        gap: 3,
                        height: 40,
                        borderRadius: 100,
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection:'row',
                        shadowOpacity: 0.8,
                        shadowRadius: 6,
                        shadowColor: "black",
                        shadowOffset: { width: 0, height: 2 },
                    }}
                >
                    <TwoHearts/>
                    <Text style={{shadowColor: theme.dark.colors.accent, shadowRadius: 6, shadowOffset: {width: 0, height: 0}, shadowOpacity: 1, color: 'white', fontWeight: 'bold',}}>Leap</Text>
                </LinearGradient>
            </TouchableOpacity>
        </BlurView>
    );

    // Function to handle scroll end and update current image index
    const handleScrollEnd = (e) => {
        const contentOffset = e.nativeEvent.contentOffset;
        const viewSize = e.nativeEvent.layoutMeasurement;
        const pageNum = Math.floor(contentOffset.x / viewSize.width);
        setCurrentImageIndex(pageNum);
    };

    // Render the image album with pagination dots
    const renderImageAlbum = () => (
        <View>
            <FlatList
                horizontal
                pagingEnabled
                data={userDataLocal.images}
                snapToInterval={width + ALBUM_PADDING}
                onMomentumScrollEnd={handleScrollEnd}
                keyExtractor={(index) => index.toString()}
                renderItem={({ item, index }) => (
                    <View style={styles.imageContainer}>
                        <TouchableOpacity onPress={() => setSelectedImageIndex(index)} style={styles.imageMask}>
                            <Image
                                source={{ uri: item }}
                                style={styles.albumImage}
                                contentFit="cover"
                            />
                            {/* Gradient Overlay */}
                            <LinearGradient
                                colors={["transparent", "rgba(0, 0, 0, 0.8)"]}
                                style={StyleSheet.absoluteFillObject} // Ensures it stays within the mask
                            />
                        </TouchableOpacity>
                    </View>
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 2,
                    alignItems: "center",
                    justifyContent: "center",
                }}
            />
            <View style={styles.dotContainer}>
                {userDataLocal.images.map((_, index) => (
                    <View
                        key={index}
                        style={[styles.dot, currentImageIndex === index && styles.activeDot]}
                    />
                ))}
            </View>
        </View>
    );

    // Semi-transparent overlay showing the profile details
    const ProfileInfoOverlay = () => (
        <View style={styles.profileOverlay}>
            <View style={styles.profilePicContainer}>
                <Image
                    source={{ uri: userDataLocal.profileImageUrl }}
                    style={styles.profilePic}
                    contentFit="cover"
                />
            </View>
            <View style={styles.profileDetails}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                    <Text style={styles.profileName}>{userDataLocal.name}</Text>
                    <View style={{ alignSelf: "center" }}>
                        <Badge image={getGenderIcon(userDataLocal?.gender)} text={getAge(userDataLocal?.dateOfBirth)} />
                    </View>
                </View>

                <View style={styles.tagsContainer}>
                    {userDataLocal.tags.map((tag, index) => (
                        <Text key={index} style={styles.tag}>
                            {tag}
                        </Text>
                    ))}
                </View>
                <View style={styles.discourseContainer}>
                    {userDataLocal.discourseCommunities.map((comm, index) => (
                        <Text key={index} style={styles.community}>
                            {comm}
                        </Text>
                    ))}
                </View>
                <View style={styles.statsContainer}>
                    <TouchableOpacity style={styles.stat} onPress={() => handleStatPress('followers')}>
                        <Text style={styles.statNumber}>{userDataLocal.followers}</Text>
                        <Text style={styles.statLabel}>Followers</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.stat} onPress={() => handleStatPress('following')}>
                        <Text style={styles.statNumber}>{userDataLocal.following}</Text>
                        <Text style={styles.statLabel}>Following</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.stat} onPress={() => handleStatPress('visitors')}>
                        <Text style={styles.statNumber}>{userDataLocal.visitors}</Text>
                        <Text style={styles.statLabel}>Visitors</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    // Header for the BaseTabContent – it includes the album and the overlay info
    const ProfileHeader = () => (
        <View>
            <View>{renderImageAlbum()}</View>
            <View style={styles.overlayContainer}>
                <ProfileInfoOverlay />
            </View>
        </View>
    );

    // Render a single moonlet item
    const renderMoonlet = ({ item }) => (
        <Moonlet item={item} postUser={userData} currentUser={userData} />
    );

    return (
        <View style={{ flex: 1, backgroundColor: theme.dark.colors.surface }}>
            <BaseTabContent
                refreshing={refreshing}
                onRefresh={onRefresh}
                ListHeaderComponent={<ProfileHeader />}
                data={posts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderMoonlet}
                onEndReachedThreshold={0.3}
                onEndReached={() => fetchUserPosts()}
                ListFooterComponent={loadingMore ? <Loading /> : null}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={10}
            />
            <BottomOptionsBar />

            <ImageViewerModal
                visible={selectedImageIndex !== null}
                images={userDataLocal.images}
                initialIndex={selectedImageIndex}
                onClose={() => setSelectedImageIndex(null)}
                uriOnly={true}
            />
            
            <UserListModal
                visible={showUserList}
                onClose={() => setShowUserList(false)}
                users={userList}
                loading={loadingUserList}
                type={userListType}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    imageWrapper: {
        overflow: "hidden", // Ensures child elements stay within bounds
        borderRadius: 20,   // Ensure gradient stays rounded
    },
    imageContainer: {
        width: width,
        paddingHorizontal: 2,
        justifyContent: "center",
        alignItems: "center",
    },
    imageMask: {
        overflow: "hidden", // Prevents the gradient from overflowing
        borderRadius: 20,   // Matches the image's rounded corners
        position: "relative",
    },
    albumImage: {
        width: width - ALBUM_PADDING,
        height: hp(70),
        borderRadius: 20,
    },
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 200,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    dotContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginVertical: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "gray",
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: "white",
    },
    overlayContainer: {
        position: "absolute",
        bottom: hp(4),
        left: wp(2),
        right: wp(2),
    },
    profileOverlay: {
        borderRadius: 20,
        flexDirection: "column",
        padding: 18,
        alignItems: "flex-start",
        justifyContent: 'center',
    },
    profilePicContainer: {
        width: 60,
        height: 60,
        borderRadius: 30, // Adjust to make it circular
        backgroundColor: "#fff", // Required for Android shadows
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 4, // Android shadow
        overflow: "visible",
    },
    profilePic: {
        width: "100%",
        height: "100%",
        borderRadius: 30,
        borderWidth: 0.1,
    },
    profileDetails: {
        marginLeft: 2,
    },
    profileName: {
        color: "white",
        fontSize: hp(2.5),
        fontWeight: "bold",
        shadowOpacity: 0.86,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 0 },
        shadowColor: 'black',
    },
    tagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginVertical: 4,
    },
    tag: {
        color: "white",
        backgroundColor: "rgba(255,255,255,0.3)",
        padding: 4,
        borderRadius: 10,
        marginRight: 4,
        marginBottom: 4,
        fontSize: 12,
    },
    discourseContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginVertical: 4,
    },
    community: {
        color: "white",
        backgroundColor: "rgba(255,255,255,0.3)",
        padding: 4,
        borderRadius: 10,
        marginRight: 4,
        marginBottom: 4,
        fontSize: 12,
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 8,
        gap: 10,
    },
    stat: {
        flexDirection: 'row',
        gap: 6,
        alignItems: "center",
    },
    statNumber: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    statLabel: {
        color: "white",
        fontSize: 12,
    },
});

export default ProfileDisplay;
