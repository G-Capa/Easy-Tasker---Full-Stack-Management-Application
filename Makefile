DOCKER_COMPOSE=docker-compose
SETUP_SCRIPT=./setup.sh


up:
	@echo "Running setup script and starting Docker..."
	$(SETUP_SCRIPT)

re:
	@echo "Rebuilding Docker images and restarting containers..."
	$(DOCKER_COMPOSE) down
	$(DOCKER_COMPOSE) up --build -d

fclean:
	@echo "Stopping containers and removing images, volumes..."
	$(DOCKER_COMPOSE) down --volumes --rmi all
	@echo "Cleanup complete."

everything:
	@echo "Starting backend + frontend..."
	./setup.sh

.PHONY: up re fclean