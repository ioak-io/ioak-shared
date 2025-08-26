# iOAK Gateway

This is a microservice gateway

## Prerequisites

- Docker
- Docker Compose

## Getting Started

1. **Build and run the gateway and services:**

   ```bash
   docker-compose up -d
   ```

2. **Access the services through the gateway:**

   - **Express.js service:**

     ```bash
     curl http://localhost:8000/express
     ```

3. **Access the Kong Admin API:**

   ```bash
   curl http://localhost:8001
   ```

## Configuration

The gateway is configured using the `kong.yml` file. This file defines the services and routes.

- **Services:** A service is a backend API that the gateway will proxy requests to.
- **Routes:** A route defines how requests are sent to a service.

## Deployment

To deploy the gateway to a cloud VM, you can build the Docker image and run it on the VM.

1. **Build the Docker image:**

   ```bash
   docker build -t ioak-gateway .
   ```

2. **Run the Docker image on the VM:**

   ```bash
   docker run -d --name ioak-gateway -p 8000:8000 -p 8443:8443 -p 8001:8001 -p 8444:8444 ioak-gateway
   ```
