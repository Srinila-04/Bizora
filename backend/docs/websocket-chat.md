# Bizora WebSocket Chat Documentation

## 1. Overview

Bizora features real-time, peer-to-peer customer-seller communication built on **Socket.IO**. The service guarantees message authorization, conversation room isolation, and database-first persistence prior to message emission.

## 2. Connection & Authentication

Clients establish a connection to the WebSocket server providing a valid JWT Bearer access token:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: '<ACCESS_TOKEN>'
  }
});

socket.on('connect', () => {
  console.log('Connected to Bizora Chat Socket:', socket.id);
});

socket.on('connect_error', (err) => {
  console.error('Socket authentication failed:', err.message);
});
```

## 3. Protocol Events

### A. Client-to-Server Events

#### 1. `conversation:join`
Joins a specific conversation room after server verifies the client is either the customer or the business owner.

```javascript
socket.emit('conversation:join', { conversationId: 'c13dce8b-6e27-4b42-8362-e1830e9f9503' }, (response) => {
  if (response.success) {
    console.log('Successfully joined conversation room');
  } else {
    console.error('Failed to join:', response.error);
  }
});
```

#### 2. `message:send`
Sends a message to the room. The server verifies sender identity, validates message body, saves to MySQL `messages` table, updates `conversations.lastMessageAt`, and broadcasts to the room.

```javascript
socket.emit('message:send', {
  conversationId: 'c13dce8b-6e27-4b42-8362-e1830e9f9503',
  content: 'Is this item available in bulk quantity?'
}, (ack) => {
  console.log('Message delivered and persisted:', ack.message);
});
```

#### 3. `message:read`
Marks incoming unread messages in the conversation as read.

```javascript
socket.emit('message:read', {
  conversationId: 'c13dce8b-6e27-4b42-8362-e1830e9f9503'
});
```

### B. Server-to-Client Events

#### 1. `message:new`
Emitted to all participants in the conversation room when a new message is posted.

```javascript
socket.on('message:new', ({ conversationId, message }) => {
  console.log('New message received in conversation', conversationId, message);
});
```

#### 2. `message:read`
Emitted to the conversation room when a recipient marks messages as read.

```javascript
socket.on('message:read', ({ conversationId, readBy, readAt }) => {
  console.log('Messages read by', readBy, 'at', readAt);
});
```

#### 3. `chat:error`
Emitted if any room join or message dispatch fails validation or authorization.

```javascript
socket.on('chat:error', ({ message, code }) => {
  console.error('Chat error received:', code, message);
});
```

