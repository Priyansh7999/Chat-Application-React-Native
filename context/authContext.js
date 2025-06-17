import { router } from "expo-router";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { addDoc, collection, doc, getDoc, getDocs, increment, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, where, writeBatch } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebaseConfig";

export const AuthContext = createContext();
export const AuthContextProvider = ({ children }) => {

    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // REGISTER NEW USER
    const register = async (email, password, username, phone) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;
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
            });
            return { success: true, message: "Registration successful", user: firebaseUser };
        } catch (error) {
            console.error(error);
            let message = error.message || "Registration failed";
            if (error.code === 'auth/email-already-in-use') {
                message = "Email already in use. Please use a different email.";
            } else if (error.code === 'auth/invalid-email') {
                message = "Invalid email format. Please enter a valid email.";
            } else if (error.code === 'auth/weak-password') {
                message = "Password is too weak. Please choose a stronger password.";
            }
            return { success: false, message: message };
        }
    };

    // Login existing user
    const login = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            const currentUser = auth.currentUser;
            if (currentUser) {
                const userRef = doc(db, 'users', currentUser.uid);
                await updateDoc(userRef, {
                    lastSeen: new Date().toISOString(),
                });
            }
            setIsAuthenticated(true);
            return { success: true, message: "Login successful" };
        } catch (error) {
            let message = error.message || "Login failed";
            if (error.code === 'auth/user-not-found') {
                message = "User not found. Please check your email and password.";
            } else if (error.code === 'auth/invalid-email') {
                message = "Invalid email format. Please enter a valid email.";
            } else if (error.code === 'auth/wrong-password') {
                message = "Incorrect password. Please try again.";
            } else if (error.code === 'auth/user-disabled') {
                message = "User account is disabled. Please contact support.";
            } else if (error.code === 'auth/too-many-requests') {
                message = "Too many login attempts. Please try again later.";
            } else if (error.code === 'auth/network-request-failed') {
                message = "Network error. Please check your internet connection.";
            } else if (error.code === 'auth/operation-not-allowed') {
                message = "Email/password sign-in is not enabled. Please contact support.";
            } else if (error.code === 'auth/invalid-credential') {
                message = "Invalid credentials. Please check your email and password.";
            }
            return { success: false, message: message };
        };
    };

    // Logout user
    const logout = async () => {
        return signOut(auth).then(() => {
            setIsAuthenticated(false);
            router.replace('/');
        });
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
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
    const updateProfileImage = async (imageUri) => {
        try {
            const currentUser = auth.currentUser;
            const uid = currentUser?.uid;
            if (!uid) {
                return { success: false, message: "No authenticated user found" };
            }

            // Convert image URI to blob
            const response = await fetch(imageUri);
            const blob = await response.blob();

            // Create a reference to the user's profile image
            const imageRef = ref(storage, `profileImages/${uid}/${Date.now()}.jpg`);

            // Upload the image
            await uploadBytes(imageRef, blob);

            // Get the download URL
            const downloadURL = await getDownloadURL(imageRef);

            // Update user profile with new image URL
            const userRef = doc(db, 'users', uid);
            await updateDoc(userRef, {
                profileImage: downloadURL
            });

            return { success: true, message: "Profile image updated successfully", imageUrl: downloadURL };
        } catch (error) {
            console.error("Error updating profile image:", error);
            return { success: false, message: error.message || "Failed to update profile image" };
        }
    };

    return (
        <AuthContext.Provider value={{
            register,
            login,
            logout,
            isAuthenticated,
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
            markMessagesAsRead
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