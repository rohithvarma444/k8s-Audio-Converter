# Kubernetes Audio Converter

A microservices-based application for converting video files to MP3 audio format, deployed on Kubernetes.

## System Architecture

This project implements a distributed system with the following components:

1. **Gateway Service**: Frontend API that handles user authentication and file uploads
2. **Auth Service**: Manages user authentication and JWT token validation
3. **Converter Service**: Processes video files and converts them to MP3 format
4. **RabbitMQ**: Message broker for communication between services
5. **MongoDB**: Database for storing video and audio files using GridFS
6. **MySQL**: Database for user authentication data

## Services Overview

### Gateway Service

The Gateway service provides the main API endpoints:
- `/login`: Authenticates users and returns JWT tokens
- `/upload`: Accepts video file uploads, validates user authentication, and queues files for conversion

The service uses MongoDB with GridFS to store the uploaded video files and communicates with the Auth service for user validation.

### Auth Service

The Auth service manages user authentication and provides:
- `/login`: Validates user credentials against MySQL database
- `/validate`: Validates JWT tokens for authenticated requests

### Converter Service

The Converter service:
- Consumes messages from RabbitMQ queue
- Retrieves video files from MongoDB
- Converts videos to MP3 format using FFmpeg
- Stores the resulting MP3 files in MongoDB
- Publishes completion messages to another RabbitMQ queue

## Technology Stack

- **Backend**: Python with Flask
- **Databases**: MongoDB (for file storage) and MySQL (for user data)
- **Message Broker**: RabbitMQ
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **Video Processing**: FFmpeg via MoviePy

## Deployment

The application is deployed on Kubernetes with the following resources:

- Deployments for stateless services (Gateway, Auth, Converter)
- StatefulSet for RabbitMQ
- Services for internal communication
- ConfigMaps and Secrets for configuration
- Persistent Volume Claims for data persistence
- Ingress for external access

## Getting Started

### Prerequisites

- Kubernetes cluster (Minikube for local development)
- Docker
- kubectl

### Deployment Steps

1. Build the Docker images for each service:

```bash
# Auth Service
cd src/auth
docker build -t your-registry/auth:latest .

# Gateway Service
cd src/gateway
docker build -t your-registry/gateway:latest .

# Converter Service
cd src/converter
docker build -t your-registry/converter:latest .
```

2. Push the images to your container registry:

```bash
docker push your-registry/auth:latest
docker push your-registry/gateway:latest
docker push your-registry/converter:latest
```

3. Deploy the infrastructure components:

```bash
# Deploy RabbitMQ
kubectl apply -f src/rabbit/manifests/

# Deploy MySQL (not included in this repo)
# kubectl apply -f path/to/mysql/manifests/

# Deploy MongoDB (not included in this repo)
# kubectl apply -f path/to/mongodb/manifests/
```

4. Deploy the application services:

```bash
# Deploy Auth Service
kubectl apply -f src/auth/manifest/

# Deploy Gateway Service
kubectl apply -f src/gateway/manifest/

# Deploy Converter Service
kubectl apply -f src/converter/manifests/
```

## Configuration

Each service has its own ConfigMap and Secret resources for configuration:

- **Auth Service**: Database connection details and JWT secret
- **Gateway Service**: MongoDB connection and RabbitMQ configuration
- **Converter Service**: MongoDB connection and RabbitMQ configuration
- **RabbitMQ**: Admin credentials and configuration

## Usage

Once deployed, you can:

1. Authenticate with the system via the Gateway's `/login` endpoint
2. Upload video files via the Gateway's `/upload` endpoint
3. The system will automatically convert videos to MP3 format

## Development

### Local Setup

For local development, you can run each service individually:

```bash
# Auth Service
cd src/auth
pip install -r requirements.txt
python server.py

# Gateway Service
cd src/gateway
pip install -r requirements.txt
python server.py

# Converter Service
cd src/converter
pip install -r requirements.txt
python consumer.py
```

You'll need to set up the appropriate environment variables or modify the code to connect to your local instances of MySQL, MongoDB, and RabbitMQ.

## License

[Add your license information here]