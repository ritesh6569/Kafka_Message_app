# 🚀 Kafka Message Application

A real-time messaging application that demonstrates Apache Kafka and Zookeeper integration with a modern web frontend and Node.js backend.

## 🏗️ Architecture

This project consists of four main components:

- **Zookeeper**: Manages Kafka cluster coordination
- **Kafka**: Message broker for handling real-time message streaming
- **Backend**: Node.js server with Kafka producer/consumer and WebSocket support
- **Frontend**: React application for real-time message interaction

## 📁 Project Structure

```
.
├── docker-compose.yml          # Docker services configuration
├── backend/                    # Node.js backend service
│   ├── Dockerfile
│   ├── package.json
│   └── server.js              # Main server with Kafka integration
├── frontend/                   # React frontend application
│   ├── Dockerfile
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js             # Main React component
│       ├── index.js           # React entry point
│       └── index.css          # Styling
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development)

### Running with Docker (Recommended)

1. **Clone and navigate to the project directory:**
   ```bash
   cd System_Design
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Kafka: localhost:9092
   - Zookeeper: localhost:2181

### Local Development

1. **Start Kafka and Zookeeper:**
   ```bash
   docker-compose up -d zookeeper kafka
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## 🔧 How It Works

### Message Flow

1. **User Input**: User enters their name and message in the frontend
2. **API Request**: Frontend sends POST request to backend `/api/messages`
3. **Kafka Producer**: Backend produces message to Kafka topic `messages`
4. **Kafka Consumer**: Backend consumer reads messages from the topic
5. **Real-time Broadcast**: Messages are broadcast to all connected clients via WebSocket
6. **Frontend Update**: Frontend receives messages and updates the UI in real-time

### Kafka Topics

- **Topic**: `messages`
- **Partitions**: 1 (default)
- **Replication Factor**: 1 (single broker setup)

### WebSocket Events

- `connect`: Client connects to server
- `disconnect`: Client disconnects from server
- `newMessage`: New message received from Kafka

## 🛠️ API Endpoints

### Backend API

- `GET /api/health` - Health check endpoint
- `POST /api/messages` - Send message to Kafka
  - Body: `{ "sender": "string", "message": "string" }`

### WebSocket Events

- `newMessage` - Receives new messages from Kafka

## 🐳 Docker Services

### Zookeeper
- **Port**: 2181
- **Purpose**: Cluster coordination for Kafka
- **Image**: `confluentinc/cp-zookeeper:7.4.0`

### Kafka
- **Port**: 9092 (external), 29092 (internal)
- **Purpose**: Message broker
- **Image**: `confluentinc/cp-kafka:7.4.0`
- **Dependencies**: Zookeeper

### Backend
- **Port**: 3001
- **Purpose**: Node.js server with Kafka integration
- **Dependencies**: Kafka
- **Features**: Express server, KafkaJS, Socket.IO

### Frontend
- **Port**: 3000
- **Purpose**: React application
- **Dependencies**: Backend
- **Features**: Real-time messaging, modern UI

## 🔍 Monitoring and Debugging

### Kafka Topics
```bash
# List topics
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list

# Describe topic
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --describe --topic messages

# Consume messages
docker exec kafka kafka-console-consumer --bootstrap-server localhost:9092 --topic messages --from-beginning
```

### Logs
```bash
# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f kafka
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 🧪 Testing the Application

1. **Open multiple browser tabs** to http://localhost:3000
2. **Send messages** from different "senders"
3. **Observe real-time updates** across all tabs
4. **Check Kafka logs** to see message flow

## 🚨 Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000, 3001, 9092, 2181 are available
2. **Kafka connection**: Wait for Zookeeper to fully start before Kafka
3. **Frontend connection**: Ensure backend is running before frontend

### Reset Everything
```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Start fresh
docker-compose up -d
```
