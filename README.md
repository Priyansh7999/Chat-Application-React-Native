# Chatter 💬

A modern, real-time chat application built with React Native and Firebase, featuring seamless communication and social connectivity.

## 🚀 Features

### Core Functionality
- **Real-time Messaging**: Instant messaging with live updates using Firebase Firestore
- **Email Authentication**: Secure user registration and login with email/password
- **Email Verification**: First-time users must verify their email before accessing the app
- **Unique Username System**: Each user gets a unique username for easy discovery
- **User Discovery**: Search and find other users by their unique username in explore tab
- **Friend Invitations**: Send and receive friend requests for one-on-one communication
- **Stories Feature**: Share 24-hour temporary image stories visible to your friends
- **Profile Management**: Comprehensive user profiles with bio, location, and profile images

### Advanced Features
- **Read Receipts**: Track message delivery and read status
- **Real-time Chat Previews**: Live updates of latest messages and timestamps
- **Typing Indicators**: See when friends are typing
- **Online Status**: Track user's last seen and online presence
- **Story Interactions**: Like friends' stories
- **Profile Customization**: Update bio, location (city/state), and profile pictures
- **Friend Management**: Organized friend lists and invitation system

### Security & Privacy
- Secure authentication with Firebase Auth
- Email verification for enhanced security
- Private messaging between connected users only
- Controlled friend connections through invitation system
- User blocking functionality
- Data validation and error handling

## 🛠️ Tech Stack

- **Frontend**: React Native with Expo Router
- **Backend**: Firebase
- **Database**: Cloud Firestore (NoSQL)
- **Authentication**: Firebase Auth (Email/Password)
- **Real-time Updates**: Firestore real-time listeners
- **Development**: Expo CLI
- **State Management**: React Context API (AuthContext)
- **Navigation**: Expo Router with tab-based navigation

## 📱 Screenshots


## 🔧 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Firebase project setup

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Priyansh7999/Chat-Application-React-Native.git
   cd Chat-Application-React-Native
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Firebase Configuration**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password provider)
   - Enable Firestore Database
   - Create a `firebaseConfig.js` file in your project root:
   ```javascript
   import { initializeApp } from 'firebase/app';
   import { getAuth } from 'firebase/auth';
   import { getFirestore } from 'firebase/firestore';

   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-auth-domain",
     projectId: "your-project-id",
     storageBucket: "your-storage-bucket",
     messagingSenderId: "your-messaging-sender-id",
     appId: "your-app-id"
   };

   const app = initializeApp(firebaseConfig);
   export const auth = getAuth(app);
   export const db = getFirestore(app);
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on device/simulator**
   - Install Expo Go app on your mobile device
   - Scan the QR code from the terminal
   - Or press 'i' for iOS simulator, 'a' for Android emulator

## 📋 Firebase Setup

### Firestore Database Structure
```
users/
├── {userId}/
│   ├── uid: string
│   ├── email: string
│   ├── name: string
│   ├── username: string (unique)
│   ├── phone: string
│   ├── bio: string
│   ├── location: object
│   │   ├── city: string
│   │   └── state: string
│   ├── profileImage: string (URL)
│   ├── emailVerified: boolean
│   ├── createdAt: string (ISO)
│   ├── lastSeen: string (ISO)
│   ├── isOnline: boolean
│   ├── friends: array
│   ├── invitesSend: array
│   ├── invitesReceived: array
│   └── blockedUsers: array

chats/
├── {chatId}/
│   ├── participants: array [userId1, userId2]
│   ├── createdAt: timestamp
│   ├── lastMessage: object
│   │   ├── text: string
│   │   ├── senderId: string
│   │   ├── createdAt: timestamp
│   │   ├── imageUrl: string (optional)
│   │   └── readBy: array
│   ├── lastUpdated: timestamp
│   ├── messagesCount: number
│   └── typingStatus: object
│       ├── {userId1}: boolean
│       └── {userId2}: boolean

chats/{chatId}/messages/
├── {messageId}/
│   ├── senderId: string
│   ├── text: string
│   ├── imageUrl: string (optional)
│   ├── createdAt: timestamp
│   └── readBy: array

stories/
├── {storyId}/
│   ├── userId: string
│   ├── username: string
│   ├── image: string (base64 or URL)
│   ├── profileImage: string
│   ├── createdAt: timestamp
│   ├── expireAt: date (24 hours from creation)
│   └── likes: array (optional)
```

### Security Rules
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data and read others' basic info
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Chat documents readable by participants
    match /chats/{chatId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants;
    }
    
    // Messages readable by chat participants
    match /chats/{chatId}/messages/{messageId} {
      allow read, write: if request.auth != null;
    }
    
    // Stories readable by authenticated users (friends only logic in app)
    match /stories/{storyId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

## 🏗️ Project Structure

```
chatter/
├── app/
│   ├── (tabs)/                       # HOME SCREENS TAB NAVIGATION
│   │   ├── Chats.jsx                 # Chat previews screen
│   │   ├── explore.jsx               # User search & discovery
│   │   └── profile.jsx               # User profile management
│   ├── (others)/                     # SCREENS for chat between users and profile of other users
│   │   ├── friendprofile.jsx         # Friend's profile view
│   │   ├── notfriendprofile.jsx      # Non-friend user profile
│   │   └── ChatsBetweenFriends.jsx   # One-to-one chat screen
│   ├── _layout.jsx                   # App layout configuration
│   ├── layout.jsx                    # Main app layout
│   ├── index.jsx                     # Onboarding screen
│   ├── signup.jsx                    # User registration
│   └── signin.jsx                    # User login
├── components/
│   └── [Reusable UI Components]
├── context/ 
│   └── AuthContext.jsx               # Authentication & Firebase logic
├── assets/
├── firebaseConfig.js
├── app.json
└── package.json
```

## 🎯 Usage

### Getting Started
1. **Register**: Sign up using your email and password
2. **Verify Email**: Check your email and click the verification link
3. **Complete Profile**: Set your unique username, bio, and location details
4. **Explore Users**: Use the explore tab to search for other users by username
5. **Send Friend Requests**: Send invites to connect with other users
6. **Start Chatting**: Begin real-time conversations with accepted friends
7. **Share Stories**: Post images as stories visible to friends for 24 hours
8. **View Stories**: Browse through friends' stories and like them

### Key Features Usage
- **Real-time Chat**: Messages appear instantly with read receipts
- **User Search**: Find users by their unique username in the explore tab
- **Friend Management**: Manage friend requests through invites system
- **Story Sharing**: Share moments that automatically expire after 24 hours
- **Profile Customization**: Update bio, location, and profile image
- **Online Status**: See when friends were last active

### Core Functionality Flow

**Authentication Flow:**
- Email/Password registration → Email verification → Profile setup → Username selection

**Chat Flow:**
- Chat previews list → Select friend → Real-time messaging → Read receipts

**Social Flow:**
- Explore users → Send friend request → Accept invite → Start communication

**Stories Flow:**
- Capture/Select image → Post story → View friends' stories → Like stories

## 🔄 App Flow

1. **Authentication Flow**
   - Email/Password registration → Email verification → Profile completion (username, bio, location)

2. **Main App Navigation**
   - **Chats Tab**: View chat previews → Select conversation → Real-time messaging
   - **Explore Tab**: Search users by username → View profiles → Send friend requests
   - **Profile Tab**: Manage personal profile → Update details → View/manage stories

3. **Social Interaction Flow**
   - Search users → View profile → Send invite → Accept/Decline → Start chatting
   - Post story → Friends view stories → Like stories → Auto-expire after 24h

4. **Chat Features**
   - Real-time messaging with read receipts
   - Message timestamps and delivery status
   - Sorted chat previews by latest activity

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📦 Building for Production

### Android (APK/AAB)
```bash
# Build APK
npx eas build --platform android --profile production --local

# Build AAB for Play Store
npx eas build --platform android --profile production
```

### iOS (IPA)
```bash
# Build for App Store
npx eas build --platform ios --profile production

# Build for TestFlight
npx eas build --platform ios --profile preview
```

### Web
```bash
# Build for web deployment
npx expo export --platform web
```

**Note**: You'll need to set up EAS (Expo Application Services) for production builds. Run `npx eas build:configure` to set up build profiles.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Priyansh Saxena** - *Initial work* - [YourGitHub](https://github.com/Priyansh7999)

## 🙏 Acknowledgments

- Firebase for backend services
- Expo team for the amazing development platform
- React Native community for continuous support

## 📞 Support

If you have any questions or run into issues, please open an issue on GitHub or contact [priyanshsaxena7999@gmail.com](mailto:priyanshsaxena7999@gmail.com).



⭐ **Star this repo if you find it helpful!**

*Built with ❤️ by Priyansh Saxena using React Native Expo and Firebase*
