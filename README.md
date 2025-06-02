# Microservices Project

A modern ride-sharing platform built using microservices architecture. This system enables seamless coordination between users, drivers (captains), and ride management through distributed services. The platform features real-time ride tracking, instant notifications, and efficient service communication using both synchronous and asynchronous patterns.

## Architecture Overview

The system is built using a microservices architecture with the following key components:

1. **API Gateway**: Single entry point for all client requests
2. **Service Mesh**: Inter-service communication layer
3. **Message Broker**: Event-driven communication backbone
4. **Data Stores**: Independent databases per service

## Services

### 1. Gateway Service (Port: 3000)
- API Gateway for the entire system
- Request routing and load balancing
- Authentication and authorization
- Rate limiting and request validation
- Routes:
  - `/user/*` → User Service (3001)
  - `/captain/*` → Captain Service (3002)
  - `/ride/*` → Ride Service (3003)

### 2. User Service (Port: 3001)
- User management and authentication
- Profile handling and preferences
- User data storage and retrieval
- Features:
  - User registration and authentication
  - Profile management
  - User preferences
  - Session management

### 3. Captain Service (Port: 3002)
- Driver management and verification
- Availability tracking
- Location updates
- Features:
  - Driver registration and verification
  - Real-time location tracking
  - Availability management
  - Performance metrics

### 4. Ride Service (Port: 3003)
- Ride booking and management
- Real-time ride tracking
- Ride history and analytics
- Features:
  - Ride creation and management
  - Real-time tracking
  - Ride history
  - Payment integration

## Technology Stack

- **Backend**: Node.js & Express.js
- **Database**: MongoDB
- **Message Broker**: RabbitMQ
- **Containerization**: Docker
- **Authentication**: JWT
- **API Documentation**: Swagger
- **Testing**: Jest
- **Monitoring**: Prometheus & Grafana

## Service Communication

### 1. Asynchronous Communication (RabbitMQ)

The system uses RabbitMQ for event-driven operations and real-time updates:

```javascript
// Publishing events
async function publishToQueue(queueName, data) {
    try {
        if(!channel) await connect();
        await channel.assertQueue(queueName, {
            durable: true,
            deadLetterExchange: 'dlx'
        });
        
        channel.sendToQueue(
            queueName,
            Buffer.from(JSON.stringify(data)),
            { persistent: true }
        );
    } catch (error) {
        console.error('Failed to publish message:', error);
    }
}

// Consuming events with long polling
class LongPollingConsumer {
    async poll() {
        while (this.isPolling) {
            const message = await this.channel.get(this.queueName, {
                noAck: false,
                timeout: 30000 // 30 seconds
            });
            
            if (message) {
                await this.processMessage(message);
            }
        }
    }
}
```

### 2. Synchronous Communication

For immediate response requirements:

```javascript
// Service-to-service HTTP calls
const httpClient = axios.create({
    timeout: 5000,
    headers: { 'Content-Type': 'application/json' }
});

// Example service call with retry
async function callService(endpoint, data) {
    try {
        const response = await httpClient.post(endpoint, data);
        return response.data;
    } catch (error) {
        if (error.response?.status === 503) {
            // Implement retry logic
            return retryOperation(() => callService(endpoint, data));
        }
        throw error;
    }
}
```

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB
- RabbitMQ
- Docker (optional)

### Installation

1. Clone and install dependencies:
```bash
git clone https://github.com/yourusername/microservices.git
cd microservices

# Install dependencies for each service
cd gateway && npm install
cd ../user && npm install
cd ../captain && npm install
cd ../ride && npm install
```

2. Configure environment variables:
```bash
# Example .env for each service
PORT=3001
MONGODB_URI=mongodb://localhost:27017/service-name
RABBITMQ_URL=amqp://localhost
JWT_SECRET=your_secret
```

3. Start services:
```bash
# Start each service
cd gateway && npm start
cd ../user && npm start
cd ../captain && npm start
cd ../ride && npm start
```

## Docker Deployment

```bash
# Build and run
docker-compose build
docker-compose up -d

# View logs
docker-compose logs -f
```

## Error Handling

### Circuit Breaker Pattern
```javascript
const breaker = new CircuitBreaker(async (token) => {
    const response = await httpClient.post(
        `${SERVICE_ENDPOINTS.USER_SERVICE}/auth/verify`,
        { token }
    );
    return response.data;
}, {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000
});
```

### Retry Mechanism
```javascript
async function retryOperation(operation, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => 
                setTimeout(resolve, Math.pow(2, i) * 1000)
            );
        }
    }
}
```

## Monitoring

### Health Checks
```javascript
app.get('/health', (req, res) => {
    res.json({
        status: 'UP',
        timestamp: new Date(),
        service: 'user-service',
        version: '1.0.0'
    });
});
```

### Metrics Collection
```javascript
const prometheus = require('prom-client');
const httpRequestDuration = new prometheus.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code']
});
```

## Testing

### Unit Tests
```javascript
describe('User Service', () => {
    it('should create a new user', async () => {
        const user = await userService.create({
            email: 'test@example.com',
            password: 'password123'
        });
        expect(user).toHaveProperty('id');
    });
});
```

### Integration Tests
```javascript
describe('Ride Booking Flow', () => {
    it('should create and track a ride', async () => {
        const ride = await rideService.create({
            userId: 'user123',
            pickup: { lat: 0, lng: 0 },
            destination: { lat: 1, lng: 1 }
        });
        expect(ride.status).toBe('PENDING');
    });
});
```

## Development Workflow

1. Create feature branch:
```bash
git checkout -b feature/new-feature
```

2. Make changes and commit:
```bash
git add .
git commit -m "Add new feature"
```

3. Push and create PR:
```bash
git push origin feature/new-feature
```

## API Documentation

### Gateway Service (Port 3000)
The gateway service acts as a reverse proxy, routing requests to appropriate microservices:

- `/user/*` → User Service (Port 3001)
- `/captain/*` → Captain Service (Port 3002)
- `/ride/*` → Ride Service (Port 3003)

### User Service (Port 3001)

#### Authentication Endpoints
- `POST /user/register`
  - Register a new user
  - Body: `{ name, email, password, phone }`
  - Response: `{ user, token }`

- `POST /user/login`
  - User login
  - Body: `{ email, password }`
  - Response: `{ user, token }`

- `POST /user/logout`
  - User logout
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ message: "Logged out successfully" }`

#### Profile Endpoints
- `GET /user/profile`
  - Get user profile
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ user }`

- `GET /user/accepted-rides`
  - Get user's accepted rides
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ rides }`

### Captain Service (Port 3002)

#### Authentication Endpoints
- `POST /captain/register`
  - Register a new captain
  - Body: `{ name, email, password, phone, vehicleDetails }`
  - Response: `{ captain, token }`

- `POST /captain/login`
  - Captain login
  - Body: `{ email, password }`
  - Response: `{ captain, token }`

- `POST /captain/logout`
  - Captain logout
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ message: "Logged out successfully" }`

#### Profile & Status Endpoints
- `GET /captain/profile`
  - Get captain profile
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ captain }`

- `PUT /captain/availability`
  - Update captain availability
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ isAvailable: boolean }`
  - Response: `{ captain }`

- `GET /captain/wait-for-ride`
  - Wait for new ride requests
  - Headers: `Authorization: Bearer <token>`
  - Response: Long-polling connection for ride notifications

### Ride Service (Port 3003)

#### Ride Management Endpoints
- `POST /ride/create-ride`
  - Create a new ride request
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ pickup, destination, fare }`
  - Response: `{ ride }`

- `PUT /ride/accept-ride`
  - Accept a ride request
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ rideId }`
  - Response: `{ ride }`

### Authentication
All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Error Responses
All endpoints return standardized error responses:
```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

Common error codes:
- `INVALID_CREDENTIALS`: Authentication failed
- `UNAUTHORIZED`: Missing or invalid token
- `VALIDATION_ERROR`: Invalid request data
- `NOT_FOUND`: Resource not found
- `SERVICE_ERROR`: Internal service error