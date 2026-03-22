# Online Bookstore System Microservice

This project is a cloud-ready, microservice-based online bookstore system. It is designed for the SE4010 Cloud Computing assignment and demonstrates secure, scalable, and DevOps-enabled architecture.

## Architecture Overview
## Architecture Overview
- **User Service**: Handles user registration, authentication, and profile management.
- **Book Service**: Manages the book catalog (CRUD operations for books).
- **Order Service**: Handles order creation, updates, and retrieval.
- **Payment Service**: Manages payment processing for orders.
- **Frontend**: React-based web application for users and admins.
- **API Contracts**: OpenAPI YAML files for each service in the project root.

**Deployment:**
- Backend microservices are hosted on **DigitalOcean**.
- Frontend is deployed on **Vercel**.

## Key Features
- Each microservice is independently deployable and containerized (Docker).
- CI/CD pipelines for automated build, test, and deployment (see `.github/workflows/`).
- Security best practices: JWT authentication, environment-based secrets, and DevSecOps tools (SonarCloud/Snyk).
- Cloud deployment ready (ECS, Azure Container Apps, or Kubernetes).
- API Gateway and shared infrastructure (database, optional message broker).

## Project Structure
```
user-service/         # User management microservice
book-service/         # Book catalog microservice
order-service/        # Order management microservice
payment-service/      # Payment processing microservice
frontend-react/       # React frontend
api_contract/         # OpenAPI YAML files for API contracts
*.openapi.yaml        # OpenAPI contracts for each service (in root)
README.md             # This file
```

## Getting Started
1. **Clone the repository:**
   ```sh
   git clone https://github.com/heshanjeewantha/online_bookstore_system_microservice.git
   cd online_bookstore_system_microservice
   ```
2. **Set up environment variables:**
   - Copy `.env.example` to `.env` in each service and fill in required values.
3. **Build and run with Docker Compose:**
   ```sh
   docker-compose up --build
   ```
4. **Access the frontend:**
   - Visit `http://localhost:3000` (or your deployed frontend URL).

## API Documentation
- See the `*-openapi.yaml` files in the root for each service's API contract.
- You can visualize these using [Swagger Editor](https://editor.swagger.io/).

## DevOps & Security
- CI/CD pipelines: See `.github/workflows/` for GitHub Actions workflows.
- Security: JWT authentication, secure environment variables, SAST tools (SonarCloud/Snyk), and Docker image scanning.

## Cloud Deployment
- Each service can be deployed to a managed container service (ECS, Azure, GCP, or Kubernetes).
- Use a container registry (Docker Hub, GitHub Container Registry, etc.) for images.

## Authors
- Group of 4 students for SE4010 Cloud Computing Assignment

## License
This project is for educational purposes.
