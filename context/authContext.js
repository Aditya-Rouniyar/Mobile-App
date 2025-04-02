import { createContext, useContext, useEffect, useState } from "react";
import {
    onAuthStateChanged,
    signInWithCustomToken,
    getAuth,
    signOut
} from 'firebase/auth';
import { auth, db, app } from '../firebaseConfig';
import { collection, doc, getDoc, setDoc, updateDoc, arrayUnion, addDoc, writeBatch, query, orderBy, limit, getDocs, startAfter, where, documentId } from 'firebase/firestore';
import { serverTimestamp, onSnapshot } from 'firebase/firestore';
import { Alert } from "react-native";
import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getRandomProfilePic } from "@/helpers/common";
import { useRouter } from "expo-router";
import { getFunctions, httpsCallable } from "firebase/functions";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(undefined);
    const functions = getFunctions(app);
    const [accountDeletionInProgress, setIsAccountDeletionInProgress] = useState(false);

    const [chatRooms, setChatRooms] = useState([]);
    const [invalidChatRooms, setInvalidChatRooms] = useState([]);
    const auth = getAuth();

    useEffect(() => {
        if (user?.userId && isAuthenticated) {
            const unsubscribe = listenToChatRooms(user.userId, setChatRooms);
            return () => unsubscribe && unsubscribe();
        }
    }, [user?.userId]);

    const getChatRooms = async () => {
        return chatRooms;  // Return the stored state instead of fetching
    };

    useEffect(() => {
        // OnAuthStateChanged
        const unsub = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                // user is authenticated
                setIsAuthenticated(true);
                setUser(currentUser);
                refreshUserFromCloud(currentUser.uid);
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }
        });

        return unsub;
    }, []);

    // Call when user is null but should not be, kick to welcome screen
    const onUserNeedResignIn = () => {
        router.replace('/welcome');
    }

    const refreshUserFromCloud = async (userId) => {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            let data = docSnap.data();
            setUser({
                ...user,
                name: data.name,
                email: data.email,
                gender: data.gender,
                dateOfBirth: data.dateOfBirth,
                userId: data.userId,
                profileImageUrl: data.profileImageUrl
            });
            return true;
        }

        router.replace('/signUpMoreInfo');
        return false;
    };

    const requestOtp = async (email) => {
        try {
            const sendOtpFunction = httpsCallable(functions, "sendOtp");
            const result = await sendOtpFunction({ email });

            if (result.data.success) {
                return { success: true };
            } else {
                return { success: false, msg: "Failed to send OTP." };
            }
        } catch (error) {
            console.error("Error requesting OTP:", error.message);
            return { success: false, msg: error.message };
        }
    };

    const uploadProfileImage = async (userId, profileImageUrl) => {
        const storage = getStorage();
        const imageRef = ref(storage, `profile_images/${userId}.jpg`);  // Optional: customize filename

        try {
            // Fetch the image and convert it to a blob
            const response = await fetch(profileImageUrl);
            if (!response.ok) {
                Alert.alert("Error", "Failed to fetch image.")
                throw new Error('Failed to fetch image');
            }
            const blob = await response.blob();

            // Upload the image to Firebase Storage with an appropriate content type
            await uploadBytes(imageRef, blob, { contentType: 'image/jpeg' });

            // Get the download URL for the uploaded image
            const imageUrl = await getDownloadURL(imageRef);
            return imageUrl;

        } catch (error) {
            Alert.alert("Error uploading image", error)
            console.error('Error uploading image: ', error);
            throw error;  // Rethrow or handle the error as appropriate
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            return { success: true };
        } catch (e) {
            return { success: false, msg: e.message, error: e };
        }
        finally {
            onUserNeedResignIn();
        }
    };

    /**
      * Updates the authenticated user's data in Firestore.
      * If a new profileImageUrl is provided and differs from the current one,
      * it uploads the image to Firebase Storage and updates the profileImageUrl.
      *
      * @param {Object} userData - An object containing the fields to update.
      *                           May include `profileImageUrl` for the profile image.
      * @returns {Object} - An object with success status and optional message.
      */
    const updateUserCloud = async (userData) => {
        if (!user?.userId || user.userId != userData.userId) {
            onUserNeedResignIn();
            return { success: false, msg: "User not authenticated." };
        }

        try {
            let updatedData = { ...userData };

            // Check if profileImageUrl is provided and different from current
            if (userData.profileImageUrl && userData.profileImageUrl !== user.profileImageUrl) {
                const imageUrl = await uploadProfileImage(user.userId, userData.profileImageUrl);

                // Add the new image URL to the updated data
                updatedData.profileImageUrl = imageUrl;
            }

            // Update Firestore with the updated data
            const docRef = doc(db, 'users', user.userId);
            await setDoc(docRef, updatedData, { merge: true });

            // Update the local user state
            setUser((user) => ({
                ...user,
                ...updatedData
            }));

            return { success: true };
        } catch (error) {
            console.error("Error updating user data:", error);
            return { success: false, msg: error.message };
        }
    };

    const deleteUserAccount = async () => {
        try {
            setIsAccountDeletionInProgress(true);
            if (!user) {
                // Keep this here since kicking to welcome screen may mislead user into thinking it has been deleted already
                Alert.alert('Failed to delete account', 'No user is currently signed in.');
                return;
            }

            // Use Firebase Functions to call the deleteUserAccount function
            const deleteUser = httpsCallable(functions, 'deleteUserAccount');

            // Invoke the cloud function without passing uid
            const result = await deleteUser({});

            // The result object returned by the function will contain the success message
            Alert.alert('Success', result.data.message || 'Account deleted successfully.');

            // Sign out the user locally after successful account deletion
            await signOut(auth);
            router.replace('welcome');
        } catch (error) {
            console.error('Error deleting account:', error.message);
            Alert.alert('Error', error.message || 'An error occurred while deleting your account.');
        }
        finally {
            setIsAccountDeletionInProgress(false);
        }
    };

    const markLastMessageAsRead = async (chatRoomId) => {
        if (!user) return;

        try {
            const chatRoomRef = doc(db, 'chatRooms', chatRoomId);
            await updateDoc(chatRoomRef, {
                readBy: arrayUnion(user.userId),
            });
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    };

    const listenToChatRooms = (userId, setChatRooms) => {
        if (!userId) return;

        const userChatRoomsRef = collection(db, 'users', userId, 'userChatRooms');

        return onSnapshot(userChatRoomsRef, async (snapshot) => {
            const chatRoomIds = snapshot.docs.map(docSnap => docSnap.data().chatRoomId);
            if (chatRoomIds.length === 0) {
                setChatRooms([]);
                return;
            }

            // Track multiple listeners for each chat room
            const unsubscribers = chatRoomIds.map(chatRoomId => {
                const chatRoomRef = doc(db, 'chatRooms', chatRoomId);

                return onSnapshot(chatRoomRef, async (chatRoomSnap) => {
                    if (!chatRoomSnap.exists()) {

                        // Accumulate invalid chat rooms persistently
                        if (!invalidChatRooms.includes(chatRoomId)) {
                            setInvalidChatRooms(prevRooms => [...prevRooms, chatRoomId]);
                        }
                        return;
                    }

                    const chatRoomData = chatRoomSnap.data();
                    const participants = chatRoomData.participants || [];
                    const otherUserId = participants.find(id => id !== userId);

                    if (!otherUserId) return;

                    const otherUserRef = doc(db, 'users', otherUserId);
                    const otherUserSnap = await getDoc(otherUserRef);
                    const otherUserData = otherUserSnap.exists() ? otherUserSnap.data() : {};

                    setChatRooms(prevChatRooms => {
                        const updatedChatRooms = [...prevChatRooms];
                        const index = updatedChatRooms.findIndex(room => room.id === chatRoomId);

                        const updatedChatRoom = {
                            id: chatRoomId,
                            otherUser: {
                                id: otherUserId,
                                name: otherUserData.name || 'User Deleted',
                                profileImageUrl: otherUserData.profileImageUrl || '',
                                gender: otherUserData.gender || 'other',
                                ...otherUserData,
                            },
                            lastMessage: chatRoomData.lastMessage,
                            lastMessageTimestamp: chatRoomData.lastMessage?.timestamp || null,
                            hasReadByThem: Array.isArray(chatRoomData.readBy) && chatRoomData.readBy.includes(otherUserId),
                            hasReadByMe: Array.isArray(chatRoomData.readBy) && chatRoomData.readBy.includes(userId),
                        };

                        if (index !== -1) {
                            // Update existing chat room
                            updatedChatRooms[index] = updatedChatRoom;
                        } else {
                            // Add new chat room
                            updatedChatRooms.push(updatedChatRoom);
                        }

                        return updatedChatRooms;
                    });
                });
            });

            // Cleanup function to remove old listeners
            return () => unsubscribers.forEach(unsub => unsub());
        }, (error) => {
            console.error("Error listening to chat rooms:", error);
        });
    };

    const cleanupInvalidChatRooms = async () => {
        if (!user || invalidChatRooms.length === 0) return;
        try {
            const batch = writeBatch(db);
            invalidChatRooms.forEach(chatRoomId => {
                const userChatRoomRef = doc(db, 'users', user.userId, 'userChatRooms', chatRoomId);
                batch.delete(userChatRoomRef);
            });

            await batch.commit();
            console.log(`Cleaned up ${invalidChatRooms.length} invalid chat rooms for user ${user.userId}`);
        } catch (error) {
            console.error("Error cleaning up invalid chat rooms:", error);
        }
        finally {
            setInvalidChatRooms([]);
        }
    };

    const createChatRoom = async (otherUserId) => {
        try {
            if (!user) {
                onUserNeedResignIn();
                return;
            }

            // Use Firebase Functions to call the createChatRoom function
            const createChatRoom = httpsCallable(functions, 'createChatRoom');

            // Invoke the cloud function without passing uid
            const result = await createChatRoom({ currentUserId: user.userId, otherUserId: otherUserId });

            return result.data.chatRoomId;

        } catch (error) {
            console.error('Failed to create chat room:', error.message);
        }
    };

    const uploadImageToChat = async (localImageUri, chatRoomId) => {
        try {
            const storage = getStorage();
            const imageName = `chat_${chatRoomId}_${Date.now()}.jpg`;
            const imageRef = ref(storage, `chat_images/${chatRoomId}/${imageName}`);

            // Fetch the image as a blob
            const response = await fetch(localImageUri);
            const blob = await response.blob();

            // Upload the image to Firebase Storage
            await uploadBytes(imageRef, blob, { contentType: 'image/jpeg' });

            // Get the download URL
            const downloadURL = await getDownloadURL(imageRef);
            return downloadURL;
        } catch (error) {
            console.error('Error uploading image to Firebase:', error);
            throw error;
        }
    };

    /**
   * Sends a message to a specified chat room.
   *
   * @param {string} chatRoomId - The ID of the chat room.
   * @param {string} content - The content of the message.
   * @param {string} [mediaUrl] - Optional URL to media content.
   * @returns {Promise<Object>} - An object indicating success or failure.
   */
    const sendMessage = async (chatRoomId, content, mediaUrl = null) => {
        if (!user) {
            onUserNeedResignIn();
            return { success: false, msg: 'User not authenticated.' };
        }

        if (!chatRoomId || typeof chatRoomId !== 'string') {
            Alert.alert('Error', 'Invalid chat room ID.');
            return { success: false, msg: 'Invalid chat room ID.' };
        }

        if (!content.trim() && !mediaUrl) {
            Alert.alert('Error', 'Message content cannot be empty.');
            return { success: false, msg: 'Message content is required.' };
        }

        try {
            // Reference to the chat room document
            const chatRoomRef = doc(db, 'chatRooms', chatRoomId);

            // Fetch the chat room data to verify participants
            const chatRoomSnap = await getDoc(chatRoomRef);
            if (!chatRoomSnap.exists()) {
                Alert.alert('Error', 'This DM has been closed.');
                return { success: false, msg: 'Chat room does not exist.' };
            }

            const chatRoomData = chatRoomSnap.data();
            if (!chatRoomData.participants.includes(user.userId)) {
                Alert.alert('Error', 'You are not a participant of this chat room.');
                return { success: false, msg: 'Not a participant of this chat room.' };
            }

            // Reference to the messages subcollection
            const messagesRef = collection(chatRoomRef, 'messages');

            let uploadedMediaUrl = mediaUrl;
            // If an image is selected but not yet uploaded, upload it first
            if (mediaUrl && mediaUrl.startsWith('file://')) {
                uploadedMediaUrl = await uploadImageToChat(mediaUrl, chatRoomId);
            }
            // Add the new message
            const newMessageRef = await addDoc(messagesRef, {
                senderId: user.userId,
                content: content.trim(),
                timestamp: serverTimestamp(),
                mediaUrl: uploadedMediaUrl || null, // Include image URL if present
            });

            // Prepare lastMessage update
            const lastMessage = {
                senderId: user.userId,
                content: content.trim(),
                timestamp: serverTimestamp(),
                mediaUrl: uploadedMediaUrl || null,
            };

            // Update chatRooms document with lastMessage
            await updateDoc(chatRoomRef, {
                lastMessage: lastMessage,
                lastUpdated: serverTimestamp(),
                readBy: [user.userId], // Clear array and only include sender
            });

            return { success: true };
        } catch (error) {
            console.error('Error sending message:', error);
            Alert.alert('Error', 'Failed to send message.');
            return { success: false, msg: error.message };
        }
    };

    const uploadImageToPath = (localImageUri, storagePath, onProgress) => {
        const storage = getStorage();
        const imageRef = ref(storage, storagePath);

        return new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(localImageUri);
                const blob = await response.blob();

                // Use the resumable upload for progress reporting
                const uploadTask = uploadBytesResumable(imageRef, blob, { contentType: 'image/jpeg' });

                uploadTask.on(
                    'state_changed',
                    (snapshot) => {
                        const progress = snapshot.bytesTransferred / snapshot.totalBytes;
                        // Report progress for this image
                        onProgress && onProgress(progress);
                    },
                    (error) => {
                        reject(error);
                    },
                    async () => {
                        const downloadURL = await getDownloadURL(imageRef);
                        resolve(downloadURL);
                    }
                );
            } catch (error) {
                console.error('Error uploading image:', error);
                reject(error);
            }
        });
    };

    /**
 * Firebase Cloud Function to handle uploading a user's post.
 */
    const createPost = async (content, images, selectedTags, selectedLocation, onProgress) => {
        if (!user) {
            onUserNeedResignIn();
            return;
        }

        try {
            const createPostFunction = httpsCallable(functions, 'createPost');

            const postData = {
                numDiscovered: 0,
                content: content,
                numImages: images.length,
                tags: selectedTags,
                location: selectedLocation
                    ? {
                        name: selectedLocation.name,
                        latitude: selectedLocation.latitude,
                        longitude: selectedLocation.longitude,
                        address: selectedLocation.address,
                    }
                    : null,
            };

            // Call the Firebase function to create the post
            const result = await createPostFunction(postData);

            if (!result.data.success) {
                Alert.alert('Error', 'Post creation failed.');
                return;
            }

            const { postId, imagePaths } = result.data;

            if (imagePaths.length !== images.length) {
                throw new Error("Mismatch between image count and image paths provided by the server.");
            }

            // Upload images sequentially to track progress
            const imageUrls = [];
            for (let i = 0; i < images.length; i++) {
                const imageUrl = await uploadImageToPath(images[i], imagePaths[i], (progress) => {
                    // Calculate overall progress:
                    // For example, if there are 3 images, each image contributes 1/3 of total progress.
                    const overallProgress = (i + progress) / images.length;
                    onProgress && onProgress(overallProgress);
                });
                imageUrls.push(imageUrl);
            }

            // Update the post document with the array of image URLs
            const postRef = doc(db, 'posts', postId);
            await updateDoc(postRef, {
                images: imageUrls,
            });

            console.log('Success', 'Post created successfully.');
        } catch (error) {
            console.error('Error creating post:', error);
            Alert.alert('Error', 'Failed to create post.');
        }
    };

    const verifyOtp = async (email, otp) => {
        try {
            const verifyOtpFunction = httpsCallable(functions, "verifyOtp");
            const result = await verifyOtpFunction({ email, otp });

            if (result.data.success) {
                // Sign in user using Firebase Custom Token
                await signInWithCustomToken(auth, result.data.token);
                return { success: true, isNewUser: result.data.isNewUser };
            } else {
                return { success: false, msg: "Failed to verify OTP." };
            }
        } catch (error) {
            console.error("Error verifying OTP:", error.message);
            return { success: false, msg: error.message };
        }
    };

    const setupProfile = async (email, name, dateOfBirth, gender) => {
        if (!user) {
            console.error("No user signed in!");
            onUserNeedResignIn();
            return { success: false };
        }

        try {
            const randomProfilePicUrl = await getRandomProfilePic(gender);
            if (!randomProfilePicUrl) {
                throw new Error("Invalid profile picture URL.");
            }
            // Use user.uid (make sure your user object is consistent across your code)
            const profileUrl = await uploadProfileImage(user.uid, randomProfilePicUrl);

            await setDoc(doc(db, 'users', user.uid), {
                email,
                userId: user.uid,
                name,
                dateOfBirth,
                gender,
                creationDate: serverTimestamp(),
                profileImageUrl: profileUrl,
            });

            await refreshUserFromCloud(user.uid);

            // Return the updated user data or any relevant information
            return {
                success: true,
                data: {
                    uid: user.uid,
                    email,
                    name,
                    dateOfBirth,
                    gender,
                    profileImageUrl: profileUrl
                }
            };
        } catch (error) {
            console.error("Setup profile error:", error.message);
            return { success: false, message: error.message };
        }
    };

    const getMoonlet = async () => {
        try {
            if (!user) {
                onUserNeedResignIn();
                return;
            }

            const getMoonlet = httpsCallable(functions, 'getMoonlet');
            const result = await getMoonlet({});
            return result.data.moonlet;

        } catch (error) {
            console.error('Failed to get moonlet:', error.message);
        }
    };

    const fetchPosts = async (lastPost = null, limitSize = 10) => {
        try {
            // Build the posts query
            let postsQuery = query(
                collection(db, "posts"),
                orderBy("createdAt", "desc"),
                limit(limitSize)
            );

            // If a lastPost is provided, paginate using startAfter
            if (lastPost) {
                postsQuery = query(
                    collection(db, "posts"),
                    orderBy("createdAt", "desc"),
                    startAfter(lastPost),
                    limit(limitSize)
                );
            }

            // Execute the query to fetch posts
            const querySnapshot = await getDocs(postsQuery);
            if (querySnapshot.empty) {
                return { posts: [], lastVisible: null };
            }

            // Map the posts and extract the userId from each post
            const posts = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
            const userIds = Array.from(new Set(posts.map(post => post.userId)));

            // Use an "in" query to fetch all user documents whose IDs are in the userIds array
            const usersQuery = query(
                collection(db, "users"),
                where(documentId(), "in", userIds)
            );
            const usersSnapshot = await getDocs(usersQuery);

            // Build a map of userId to user data
            const usersMap = {};
            usersSnapshot.docs.forEach(userDoc => {
                usersMap[userDoc.id] = userDoc.data();
            });

            // Combine each post with its corresponding user data
            const postsWithUserData = posts.map(post => ({
                ...post,
                user: usersMap[post.userId] || null,
            }));

            const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

            return { posts: postsWithUserData, lastVisible };
        } catch (error) {
            console.error("Error fetching posts:", error);
            return { posts: [], lastVisible: null };
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                accountDeletionInProgress,
                requestOtp,
                verifyOtp,
                setupProfile,
                logout,
                updateUserCloud,
                refreshUserFromCloud,
                deleteUserAccount,
                createChatRoom,
                getChatRooms,
                chatRooms,
                sendMessage,
                markLastMessageAsRead,
                cleanupInvalidChatRooms,
                createPost,
                fetchPosts,
                getMoonlet,
                getAuth,
                signInWithCustomToken
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const value = useContext(AuthContext);
    if (!value) {
        throw new Error("useAuth must be wrapped inside AuthContextProvider");
    }
    return value;
};
