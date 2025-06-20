import { router } from "expo-router";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, doc, getDoc, getDocs, increment, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, where, writeBatch, deleteDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
export const AuthContext = createContext();
export const AuthContextProvider = ({ children }) => {

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userNeedsUsername, setUserNeedsUsername] = useState(false);

    const login = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const currentUser = userCredential.user;
            if (!currentUser.emailVerified) {
                await auth.signOut();
                return {
                    success: false,
                    message: "Please verify your email first. Check your inbox for the verification link.",
                    needsVerification: true
                };
            }
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                lastSeen: new Date().toISOString(),
                emailVerified: true
            });
            setIsAuthenticated(true);
            return { success: true, message: "Login successful" };
        } catch (error) {
            let message = error.message || "Login failed";
            switch (error.code) {
                case 'auth/user-not-found':
                    message = "User not found. Please check your email and password.";
                    break;
                case 'auth/invalid-email':
                    message = "Invalid email format. Please enter a valid email.";
                    break;
                case 'auth/wrong-password':
                    message = "Incorrect password. Please try again.";
                    break;
                case 'auth/user-disabled':
                    message = "User account is disabled. Please contact support.";
                    break;
                case 'auth/too-many-requests':
                    message = "Too many login attempts. Please try again later.";
                    break;
                case 'auth/network-request-failed':
                    message = "Network error. Please check your internet connection.";
                    break;
                case 'auth/operation-not-allowed':
                    message = "Email/password sign-in is not enabled. Please contact support.";
                    break;
                case 'auth/invalid-credential':
                    message = "Invalid credentials. Please check your email and password.";
                    break;
                default:
                    message = error.message || message;
            }
            return { success: false, message: message };
        }
    };

    const resendVerificationEmail = async () => {
        try {
            const currentUser = auth.currentUser;
            if (currentUser) {
                await sendEmailVerification(currentUser);
                return {
                    success: true,
                    message: "Verification email sent! Please check your inbox."
                };
            } else {
                return {
                    success: false,
                    message: "No user found. Please try logging in again."
                };
            }
        } catch (error) {
            console.error("Resend verification error:", error);
            return {
                success: false,
                message: "Failed to send verification email. Please try again."
            };
        }
    };

    const register = async (email, password, username, phone) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            await sendEmailVerification(firebaseUser);

            await setDoc(doc(db, 'users', firebaseUser.uid), {
                uid: firebaseUser.uid,
                email: email,
                name: username,
                username: "",
                phone: phone,
                bio: '',
                location: {
                    city: '',
                    state: ''
                },
                createdAt: new Date().toISOString(),
                blockedUsers: [],
                invitesSend: [],
                invitesReceived: [],
                friends: [],
                lastSeen: new Date().toISOString(),
                profileImage: "https://images.rawpixel.com/image_800/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvdjkzNy1hZXctMTExXzMuanBn.jpg",
                emailVerified: false,
            });

            await auth.signOut();
            await new Promise(resolve => setTimeout(resolve, 1000));
            return {
                success: true,
                message: "Registration successful! Please check your email for verification before signing in.",
                user: firebaseUser
            };
        } catch (error) {
            console.error("Registration error:", error);
            try {
                await auth.signOut();
            } catch (signOutError) {
                console.error("Error signing out after registration failure:", signOutError);
            }
            let message = "Registration failed. Please try again.";
            switch (error.code) {
                case 'auth/email-already-in-use':
                    message = "This email is already registered. Please use a different email or try signing in.";
                    break;
                case 'auth/invalid-email':
                    message = "Invalid email format. Please enter a valid email address.";
                    break;
                case 'auth/weak-password':
                    message = "Password is too weak. Please use at least 6 characters with a mix of letters and numbers.";
                    break;
                case 'auth/operation-not-allowed':
                    message = "Email/password accounts are not enabled. Please contact support.";
                    break;
                case 'auth/network-request-failed':
                    message = "Network error. Please check your internet connection and try again.";
                    break;
                default:
                    message = error.message || message;
            }
            return { success: false, message: message };
        }
    };
    const logout = async () => {
        return signOut(auth).then(() => {
            setIsAuthenticated(false);
            router.replace('/');
        });
    };
    const hasUsername = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) return false;
        const uid = currentUser.uid;
        const userRef = doc(db, "users", uid);
        const userData = await getDoc(userRef);
        if (!userData.exists()) return false;
        const data = userData.data();
        return !!(data.username && data.username.trim());
    };
    // Check details if there or not
    const checkDetails = async () => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                return { success: false, message: "User not authenticated" };
            }
            const uid = currentUser.uid;
            const userRef = doc(db, "users", uid);
            const userData = await getDoc(userRef);
            if (!userData.exists()) {
                return { success: false, message: `User data not found` };
            }
            const data = userData.data();
            if (!data.username || data.username.trim() === "") {
                return { success: false, message: `Please Enter Your Details` };
            }
            return { success: true, message: `Welcome ${data.username}` };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };
    // Deatils Check Unique Username
    const checkUniqueUsername = async (username, bio, city, state) => {
        try {
            const currentUser = auth.currentUser;
            const uid = currentUser.uid;
            const userRef = doc(db, "users", uid);
            const usersRef = collection(db, 'users');

            const q = query(usersRef, where('username', '==', username));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty || querySnapshot.docs[0].id === uid) {
                await updateDoc(userRef, {
                    username: username,
                    bio: bio,
                    location: {
                        city: city,
                        state: state
                    }
                });
                return { success: true, message: `Details Updated. Congratulations ${username}!` };
            } else {
                return { success: false, message: "Username already exists. Please choose another one." };
            }
        } catch (error) {
            console.error('Error checking username:', error);
            return { success: false, message: error.message || "An error occurred while checking username" };
        }
    }


    // Real time updates
    const fetchUserProfile = async (userId = null) => {
        try {
            const currentUser = auth.currentUser;
            const uid = userId || currentUser?.uid;

            if (!uid) {
                return { success: false, message: "No user found" };
            }

            const docRef = doc(db, 'users', uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { success: true, data: docSnap.data() };
            } else {
                return { success: false, message: "User profile not found" };
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            return { success: false, message: error.message || "Failed to load profile" };
        }
    };

    const updateUserProfile = async (updateData) => {
        try {
            const uid = auth.currentUser?.uid;
            if (!uid) {
                return { success: false, message: "No authenticated user found" };
            }

            const userRef = doc(db, 'users', uid);
            await updateDoc(userRef, updateData);

            return { success: true, message: "Profile updated successfully" };
        } catch (error) {
            console.error("Error updating user profile:", error);
            return { success: false, message: error.message || "Failed to update profile" };
        }
    };

    // Delete user profile and account
    const deleteUserProfile = async () => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                return { success: false, message: "No authenticated user found" };
            }

            const uid = currentUser.uid;

            await deleteDoc(doc(db, 'users', uid));

            await currentUser.delete();

            setIsAuthenticated(false);

            return { success: true, message: "Profile deleted successfully" };
        } catch (error) {
            console.error("Error deleting user profile:", error);
            return { success: false, message: error.message || "Failed to delete profile" };
        }
    };

    // Update profile image
    const updateProfileImage = async (imageData, isURL = false) => {
        try {
            const currentUser = auth.currentUser;
            const uid = currentUser?.uid;
            const userRef = doc(db, 'users', uid);

            const imageUri = isURL ? imageData : `data:image/jpeg;base64,${imageData}`;

            await updateDoc(userRef, {
                profileImage: imageUri
            });

            return { success: true, message: "Profile image updated successfully", imageUrl: imageUri };
        } catch (error) {
            console.error("Error updating profile image:", error);
            return { success: false, message: error.message || "Failed to update profile image" };
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setIsAuthenticated(!!user);
            if (user) {
                const needsUsername = !(await hasUsername());
                setUserNeedsUsername(needsUsername);
            } else {
                setUserNeedsUsername(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const startChat = async (userId, friendId) => {
        try {
            const chatRef = collection(db, 'chats');
            const q = query(chatRef, where("participants", "array-contains", userId));
            const existingChats = await getDocs(q);
            let chatDoc = null;
            existingChats.forEach(docSnap => {
                const participants = docSnap.data().participants;
                if (
                    participants.length === 2 &&
                    participants.includes(userId) &&
                    participants.includes(friendId)
                ) {
                    chatDoc = docSnap;
                }
            });
            if (chatDoc) {
                return { success: true, chatId: chatDoc.id };
            }
            const newChat = {
                participants: [userId, friendId],
                createdAt: serverTimestamp(),
                lastMessage: null,
                lastUpdated: serverTimestamp(),
                typingStatus: {
                    [userId]: false,
                    [friendId]: false,
                },
                messagesCount: 0,
            };
            const chatDocRef = await addDoc(chatRef, newChat);
            return { success: true, chatId: chatDocRef.id };
        } catch (error) {
            console.error("Error starting chat:", error);
            return { success: false, message: error.message || "An error occurred while starting the chat." };
        }
    };

    // Send a message in a chat
    const sendMessage = async (chatId, senderId, text, imageUrl = null) => {
        try {
            const chatRef = doc(db, "chats", chatId);
            const messagesRef = collection(chatRef, "messages");
            const newMessage = {
                senderId,
                text,
                imageUrl,
                createdAt: serverTimestamp(),
                readBy: [senderId],
            };
            await addDoc(messagesRef, newMessage);
            await updateDoc(chatRef, {
                lastMessage: {
                    text,
                    senderId,
                    createdAt: serverTimestamp(),
                    imageUrl,
                    readBy: [senderId],
                },
                lastUpdated: serverTimestamp(),
                messagesCount: increment(1),
            });
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const markMessagesAsRead = async (chatId, userId) => {
        try {
            const messagesRef = collection(db, "chats", chatId, "messages");
            const q = query(messagesRef, where("readBy", "not-in", [[userId], [userId, "dummy"]]));
            const unreadMessages = await getDocs(q);

            if (unreadMessages.empty) return;

            const batch = writeBatch(db);

            unreadMessages.forEach((messageDoc) => {
                const messageData = messageDoc.data();
                if (!messageData.readBy.includes(userId)) {
                    batch.update(messageDoc.ref, {
                        readBy: [...messageData.readBy, userId]
                    });
                }
            });

            const chatRef = doc(db, "chats", chatId);
            const chatDoc = await getDoc(chatRef);
            if (chatDoc.exists()) {
                const chatData = chatDoc.data();
                if (chatData.lastMessage && !chatData.lastMessage.readBy?.includes(userId)) {
                    batch.update(chatRef, {
                        "lastMessage.readBy": [...(chatData.lastMessage.readBy || []), userId]
                    });
                }
            }

            await batch.commit();
        } catch (error) {
            console.error("Error marking messages as read:", error);
        }
    };

    const listenForMessages = (chatId, callback) => {
        const messagesRef = collection(db, "chats", chatId, "messages");
        const q = query(messagesRef, orderBy("createdAt"));
        return onSnapshot(q, (snapshot) => {
            callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
    };

    const getChatPreviews = async (userId) => {
        try {
            const userRef = doc(db, "users", userId);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) return [];
            const friends = userSnap.data().friends || [];

            const chatsRef = collection(db, 'chats');
            const q = query(chatsRef, where("participants", "array-contains", userId));
            const chatsSnapshot = await getDocs(q);
            const chats = chatsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const previews = await Promise.all(friends.map(async (friendId) => {

                const friendSnap = await getDoc(doc(db, "users", friendId));
                if (!friendSnap.exists()) return null;
                const friend = friendSnap.data();

                const chat = chats.find(
                    c => c.participants.length === 2 && c.participants.includes(friendId)
                );

                let lastMessage = "Say hi!";
                let lastMessageTime = "";
                let chatId = null;
                let isUnread = false;

                if (chat && chat.lastMessage) {
                    lastMessage = chat.lastMessage.text || "Say hi!";
                    lastMessageTime = chat.lastMessage.createdAt?.toDate
                        ? chat.lastMessage.createdAt.toDate().toLocaleTimeString()
                        : (typeof chat.lastMessage.createdAt === "string"
                            ? new Date(chat.lastMessage.createdAt).toLocaleTimeString()
                            : "");
                    chatId = chat.id;
                    isUnread = chat.lastMessage.senderId !== userId &&
                        !chat.lastMessage.readBy?.includes(userId);
                }

                return {
                    id: friendId,
                    chatId,
                    profileImage: { uri: friend.profileImage },
                    name: friend.name || friend.username,
                    lastMessage,
                    time: lastMessageTime,
                    isOnline: friend.isOnline || false,
                    lastSeen: friend.lastSeen || "",
                    isUnread,
                };
            }));

            return previews.filter(Boolean);
        } catch (error) {
            console.error("Error fetching chat previews:", error);
            return [];
        }
    };

    const listenToUserFriends = (userId, callback) => {
        if (!userId) return () => { };
        const unsubscribe = onSnapshot(doc(db, 'users', userId), (userSnap) => {
            if (!userSnap.exists()) return;
            const userData = userSnap.data();
            callback(userData.friends || []);
        });
        return unsubscribe;
    };

    const listenToChatPreviews = (friends, userId, callback) => {
        if (!friends.length) {
            callback([]);
            return () => { };
        }

        const chatsRef = collection(db, 'chats');
        const q = query(chatsRef, where('participants', 'array-contains', userId));

        const unsubscribe = onSnapshot(q, async (chatsSnapshot) => {
            const chats = chatsSnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));

            const previews = await Promise.all(friends.map(async (friendId) => {
                const friendSnap = await getDoc(doc(db, "users", friendId));
                if (!friendSnap.exists()) return null;
                const friend = friendSnap.data();

                const chat = chats.find(
                    c => c.participants.length === 2 && c.participants.includes(friendId)
                );

                let lastMessage = "Say hi!";
                let lastMessageTime = "";
                let chatId = null;
                let sortTimestamp = 0;
                let isUnread = false;

                if (chat && chat.lastMessage) {
                    lastMessage = chat.lastMessage.text || "Say hi!";
                    if (chat.lastMessage.createdAt?.toDate) {
                        const date = chat.lastMessage.createdAt.toDate();
                        lastMessageTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        sortTimestamp = date.getTime();
                    } else if (typeof chat.lastMessage.createdAt === "string") {
                        const date = new Date(chat.lastMessage.createdAt);
                        lastMessageTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        sortTimestamp = date.getTime();
                    } else if (chat.lastMessage.createdAt?.seconds) {
                        const date = new Date(chat.lastMessage.createdAt.seconds * 1000);
                        lastMessageTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        sortTimestamp = date.getTime();
                    }
                    chatId = chat.id;
                    isUnread = chat.lastMessage.senderId !== userId &&
                        !chat.lastMessage.readBy?.includes(userId);
                }

                return {
                    id: friendId,
                    chatId,
                    profileImage: friend?.profileImage,
                    name: friend?.name || friend?.username,
                    username: friend?.username,
                    lastMessage,
                    time: lastMessageTime,
                    isOnline: friend?.isOnline || false,
                    lastSeen: friend?.lastSeen || "",
                    sortTimestamp,
                    isUnread,
                };
            }));
            const validPreviews = previews.filter(Boolean);
            const sortedPreviews = validPreviews.sort((a, b) => {
                if (a.sortTimestamp === 0 && b.sortTimestamp === 0) return 0;
                if (a.sortTimestamp === 0) return 1;
                if (b.sortTimestamp === 0) return -1;
                return b.sortTimestamp - a.sortTimestamp;
            });

            callback(sortedPreviews);
        });

        return unsubscribe;
    };
    const addupdateStory = async (imageData) => {
        try {
            const currentUser = auth.currentUser;
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            const userData = userDoc.data();
            const newStory = {
                userId: currentUser.uid,
                username: userData.username || userData.name || 'User',
                image: imageData,
                createdAt: serverTimestamp(),
                profileImage: userData.profileImage
            };
            await addDoc(collection(db, 'stories'), newStory);
            return { success: true, message: "Story posted!" };
        } catch (error) {
            console.error('Error:', error);
            return { success: false, message: "Something went wrong" };
        }
    };

    const removeStory = async () => {
        try {
            const currentUser = auth.currentUser;
            const userStories = await getDocs(
                query(collection(db, 'stories'), where('userId', '==', currentUser.uid))
            );
            userStories.forEach(async (storyDoc) => {
                await deleteDoc(doc(db, 'stories', storyDoc.id));
            });
            return { success: true, message: "Story removed!" };
        } catch (error) {
            console.error('Error:', error);
            return { success: false, message: "Something went wrong" };
        }
    };

    const getStories = async () => {
        try {
            const currentUser = auth.currentUser;
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            const userData = userDoc.data();
            const friends = userData.friends || [];
            const allUserIds = [currentUser.uid, ...friends];
            const storiesSnapshot = await getDocs(
                query(collection(db, 'stories'), where('userId', 'in', allUserIds))
            );
            const stories = [];
            storiesSnapshot.forEach((doc) => {
                const storyData = doc.data();
                stories.push({
                    id: doc.id,
                    userId: storyData.userId,
                    username: storyData.username,
                    image: storyData.image,
                    createdAt: storyData.createdAt,
                    isCurrentUser: storyData.userId === currentUser.uid,
                    profileImage: storyData.profileImage
                });
            });
            stories.sort((a, b) => {
                const timeA = a.createdAt?.toDate() || new Date(0);
                const timeB = b.createdAt?.toDate() || new Date(0);
                return timeB - timeA;
            });
            return { success: true, data: stories };
        } catch (error) {
            console.error('Error:', error);
            return { success: false, message: "Failed to load stories" };
        }
    };

    return (
        <AuthContext.Provider value={{
            register,
            login,
            resendVerificationEmail,
            logout,
            isAuthenticated,
            userNeedsUsername,
            hasUsername,
            checkDetails,
            checkUniqueUsername,
            setIsAuthenticated,
            startChat,
            sendMessage,
            listenForMessages,
            getChatPreviews,
            listenToUserFriends,
            listenToChatPreviews,
            fetchUserProfile,
            updateUserProfile,
            deleteUserProfile,
            updateProfileImage,
            markMessagesAsRead,
            addupdateStory,
            removeStory,
            getStories,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const value = useContext(AuthContext);
    if (!value) {
        throw new Error("useAuth must be used within a AuthContextProvider");
    }
    return value;
}