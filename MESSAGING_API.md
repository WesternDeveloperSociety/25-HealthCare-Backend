# Real-Time Messaging API Documentation

## Overview

This healthcare application includes a complete real-time messaging system for patient-doctor communication using **REST API** for data operations and **Socket.IO** for real-time updates.

---

## 🚀 Setup

### 1. Install Dependencies

```bash
npm install socket.io @clerk/express cors
npm install --save-dev @types/cors
```

### 2. Environment Variables

Add to your `.env`:

```bash
CLERK_SECRET_KEY=your_clerk_secret_key_here
CLIENT_URL=http://localhost:3000
PORT=3000
DATABASE_URL=your_database_url
```

### 3. Get Your Clerk Secret Key

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application
3. Go to "API Keys"
4. Copy your "Secret Key"

---

## 📡 REST API Endpoints

Base URL: `http://localhost:3000/api/messages`

All endpoints require Clerk authentication token in Authorization header:

```
Authorization: Bearer YOUR_CLERK_TOKEN
```

### 1. Get All Messages

**GET** `/api/messages`

Get all messages for the authenticated user (sent and received).

**Response:**

```json
[
  {
    "id": "uuid",
    "senderId": "uuid",
    "recipientId": "uuid",
    "subject": "Question about medication",
    "body": "Can I take this with food?",
    "isRead": false,
    "readAt": null,
    "attachments": [],
    "createdAt": "2024-01-20T10:30:00Z",
    "updatedAt": "2024-01-20T10:30:00Z",
    "sender": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "role": "PATIENT",
      "specialty": null,
      "profileImage": null
    },
    "recipient": {
      "id": "uuid",
      "firstName": "Dr. Jane",
      "lastName": "Smith",
      "role": "DOCTOR",
      "specialty": "CARDIOLOGY",
      "profileImage": null
    }
  }
]
```

### 2. Get Conversation

**GET** `/api/messages/conversation/:otherUserId`

Get all messages between you and another user.

**Response:** Same as above, sorted chronologically

### 3. Send Message

**POST** `/api/messages`

Send a new message.

**Request Body:**

```json
{
  "recipientId": "uuid",
  "subject": "Follow-up question",
  "body": "When should I schedule my next appointment?",
  "attachments": ["https://s3.../file1.pdf"] // optional
}
```

**Response:** Created message object

### 4. Mark as Read

**PATCH** `/api/messages/:messageId/read`

Mark a message as read.

**Response:**

```json
{
  "id": "uuid",
  "isRead": true,
  "readAt": "2024-01-20T10:35:00Z",
  ...
}
```

### 5. Get Unread Count

**GET** `/api/messages/unread-count`

Get count of unread messages.

**Response:**

```json
{
  "unreadCount": 5
}
```

---

## 🔌 WebSocket (Socket.IO) Real-Time Events

### Client Connection

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  withCredentials: true,
});

// Join your user room (call this after getting user ID from your database)
socket.emit('join', userId);

// Confirmation
socket.on('joined', (data) => {
  console.log('Joined room:', data);
});
```

### Events You Can Emit (Client → Server)

#### 1. Join User Room

```typescript
socket.emit('join', userId);
```

#### 2. Typing Indicator

```typescript
socket.emit('typing', {
  senderId: yourUserId,
  recipientId: otherUserId,
});
```

#### 3. Stop Typing

```typescript
socket.emit('stopTyping', {
  senderId: yourUserId,
  recipientId: otherUserId,
});
```

#### 4. Message Read Receipt

```typescript
socket.emit('messageRead', {
  messageId: 'message-uuid',
  userId: yourUserId,
});
```

### Events You Listen To (Server → Client)

#### 1. New Message Received

```typescript
socket.on('newMessage', (message) => {
  console.log('New message:', message);
  // Add message to your UI
});
```

#### 2. User Typing

```typescript
socket.on('userTyping', ({ userId }) => {
  console.log(`User ${userId} is typing...`);
  // Show typing indicator in UI
});
```

#### 3. User Stopped Typing

```typescript
socket.on('userStoppedTyping', ({ userId }) => {
  console.log(`User ${userId} stopped typing`);
  // Hide typing indicator
});
```

#### 4. Message Read Receipt

```typescript
socket.on('messageReadReceipt', ({ messageId, userId }) => {
  console.log(`Message ${messageId} was read by ${userId}`);
  // Update message status in UI
});
```

---

## 💻 Frontend Implementation Examples

### React/Next.js Example

```typescript
'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUser } from '@clerk/nextjs';

export default function MessagingPage() {
  const { user } = useUser();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipientId, setRecipientId] = useState('');

  useEffect(() => {
    // Get user from database using Clerk ID
    const fetchUser = async () => {
      const res = await fetch('/api/users/me', {
        headers: {
          Authorization: `Bearer ${await user?.getToken()}`,
        },
      });
      const userData = await res.json();

      // Initialize socket
      const newSocket = io('http://localhost:3000', {
        withCredentials: true,
      });

      newSocket.emit('join', userData.id);

      // Listen for new messages
      newSocket.on('newMessage', (message) => {
        setMessages((prev) => [...prev, message]);
      });

      setSocket(newSocket);
    };

    if (user) {
      fetchUser();
    }

    return () => {
      socket?.disconnect();
    };
  }, [user]);

  const sendMessage = async () => {
    const token = await user?.getToken();

    const res = await fetch('http://localhost:3000/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        recipientId,
        subject: 'Message',
        body: newMessage,
      }),
    });

    const message = await res.json();
    setMessages((prev) => [...prev, message]);
    setNewMessage('');
  };

  const handleTyping = () => {
    socket?.emit('typing', {
      senderId: user?.id,
      recipientId,
    });
  };

  return (
    <div>
      <h1>Messages</h1>
      <div>
        {messages.map((msg) => (
          <div key={msg.id}>
            <p><strong>{msg.sender.firstName}:</strong> {msg.body}</p>
          </div>
        ))}
      </div>
      <input
        value={newMessage}
        onChange={(e) => {
          setNewMessage(e.target.value);
          handleTyping();
        }}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
```

---

## 🔐 Security Features

1. **Clerk Authentication** - All endpoints protected
2. **User Verification** - Messages can only be read/sent by authorized users
3. **CORS Protection** - Only allowed origins can connect
4. **Data Validation** - All inputs validated before database operations

---

## 🧪 Testing the API

### 1. Using cURL

```bash
# Get messages
curl -X GET http://localhost:3000/api/messages \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"

# Send message
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "recipientId": "recipient-uuid",
    "subject": "Test",
    "body": "Hello!"
  }'
```

### 2. Using Postman

1. Set Authorization header: `Bearer YOUR_CLERK_TOKEN`
2. Use the endpoints listed above
3. For Socket.IO, use Postman's WebSocket feature

---

## 📊 Database Schema

The `Message` model:

```prisma
model Message {
  id          String   @id @default(uuid())
  senderId    String
  recipientId String
  subject     String
  body        String   @db.Text
  isRead      Boolean  @default(false)
  readAt      DateTime?
  attachments String[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  sender    User @relation("SentMessages")
  recipient User @relation("ReceivedMessages")
}
```

---

## 🚀 Running the Server

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

Server will start on `http://localhost:3000` with WebSocket support.

---

## 🎯 Key Features

✅ **Real-time messaging** with Socket.IO
✅ **REST API** for message CRUD operations
✅ **Typing indicators**
✅ **Read receipts**
✅ **File attachments** support
✅ **Unread message count**
✅ **Conversation threading**
✅ **Clerk authentication** integration
✅ **Patient-Doctor** direct messaging

---

## 🐛 Troubleshooting

### Socket not connecting?

- Check CLIENT_URL in .env matches your frontend URL
- Ensure CORS is properly configured
- Verify WebSocket port is not blocked by firewall

### Messages not sending?

- Verify Clerk token is valid
- Check user exists in database with matching clerkId
- Verify recipient ID is valid

### Typing indicators not working?

- Ensure both users are connected to socket
- Check userId is being passed correctly
- Verify socket rooms are joined properly
