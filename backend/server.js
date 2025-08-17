const express = require('express');
const cors = require('cors');
const { Kafka } = require('kafkajs');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const kafka = new Kafka({
  clientId: 'kafka-app',
  brokers: [process.env.KAFKA_BROKERS || 'localhost:9092']
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'message-consumer-group' });


const TOPIC_NAME = 'messages';

async function initializeProducer() {
  try {
    await producer.connect();
    console.log('Kafka producer connected');
  } catch (error) {
    console.error('Error connecting producer:', error);
  }
}

async function initializeConsumer() {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: TOPIC_NAME, fromBeginning: false });
    
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const messageData = JSON.parse(message.value.toString());
        console.log('Received message:', messageData);
        
        io.emit('newMessage', messageData);
      },
    });
    
    console.log('Kafka consumer connected');
  } catch (error) {
    console.error('Error connecting consumer:', error);
  }
}

app.post('/api/messages', async (req, res) => {
  try {
    const { message, sender } = req.body;
    
    if (!message || !sender) {
      return res.status(400).json({ error: 'Message and sender are required' });
    }
    
    const messageData = {
      id: Date.now().toString(),
      message,
      sender,
      timestamp: new Date().toISOString()
    };

    await producer.send({
      topic: TOPIC_NAME,
      messages: [
        { value: JSON.stringify(messageData) }
      ],
    });
    
    res.json({ success: true, message: 'Message sent to Kafka' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

async function initializeKafka() {
  await initializeProducer();
  await initializeConsumer();
}

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await initializeKafka();
    
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('Kafka integration ready');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await producer.disconnect();
  await consumer.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await producer.disconnect();
  await consumer.disconnect();
  process.exit(0);
});

startServer(); 