.PHONY: help install dev build test clean docker-up docker-down migrate

help:
	@echo "SlotSwapper - Available Commands:"
	@echo ""
	@echo "  make install      - Install all dependencies (backend + frontend)"
	@echo "  make dev          - Run development servers (requires 2 terminals)"
	@echo "  make build        - Build both backend and frontend"
	@echo "  make test         - Run all tests"
	@echo "  make docker-up    - Start all services with Docker Compose"
	@echo "  make docker-down  - Stop all Docker services"
	@echo "  make migrate      - Run database migrations"
	@echo "  make clean        - Clean build artifacts and dependencies"
	@echo ""

install:
	@echo "Installing backend dependencies..."
	cd backend && npm install
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "Done!"

dev-backend:
	cd backend && npm run dev

dev-frontend:
	cd frontend && npm run dev

build:
	@echo "Building backend..."
	cd backend && npm run build
	@echo "Building frontend..."
	cd frontend && npm run build
	@echo "Done!"

test:
	@echo "Running backend tests..."
	cd backend && npm test
	@echo "Done!"

docker-up:
	docker-compose up --build

docker-down:
	docker-compose down

migrate:
	cd backend && npm run migrate

clean:
	@echo "Cleaning backend..."
	rm -rf backend/node_modules backend/dist
	@echo "Cleaning frontend..."
	rm -rf frontend/node_modules frontend/dist
	@echo "Done!"
