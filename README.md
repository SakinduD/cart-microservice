# Cart Microservice

Simple Node.js cart service for an e-commerce system.

## Tech Stack
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT authentication (`jsonwebtoken`)
- Axios (service-to-service calls)
- Swagger/OpenAPI (`swagger-ui-express`, `yamljs`)
- SonarCloud (code quality and security scanning)
- Docker

## Code Quality
- SonarCloud is used for static code analysis, maintainability checks, and security issue detection.
- SonarCloud project: https://sonarcloud.io/project/overview?id=SakinduD_cart-microservice

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=SakinduD_cart-microservice&metric=alert_status)](https://sonarcloud.io/project/overview?id=SakinduD_cart-microservice)

## Connected Services
- **MongoDB**: cart data is stored in MongoDB (configured with `MONGODB_URI`).
- **API Gateway**: outbound calls are made through `GATEWAY_URL`.
- **Inventory/Product service (via Gateway)**: product details (name, price, images) are fetched when adding cart items.
- **Auth/JWT issuer**: bearer token validation uses `JWT_SECRET`.

## Environment Variables
Create a `.env` file with:

- `PORT` (default: `8002`)
- `MONGODB_URI`
- `GATEWAY_URL`
- `JWT_SECRET`

## Run Locally
```bash
npm install
npm run dev
```

Server starts on `http://localhost:<PORT>` (based on your `.env` value).

## API Docs (Swagger)
- OpenAPI file: `swagger.yaml`
- Swagger UI: `http://localhost:<PORT>/api-docs`

## Main Endpoints
- `GET /health` — service health check
- `GET /cart/:userId` — get cart for user
- `POST /cart/add` — add/update item in cart
- `DELETE /cart/remove` — remove item from cart
- `DELETE /cart/clear/:userId` — clear cart

> Cart routes require `Authorization: Bearer <token>`.

## Docker
Build and run:

```bash
docker build -t cart-microservice .
docker run -p 8002:8002 --env-file .env cart-microservice
```
