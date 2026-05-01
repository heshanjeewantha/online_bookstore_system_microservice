#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Online Bookstore Frontend Deployment Setup ===${NC}\n"

# Check if running from root directory
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory${NC}"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker is installed${NC}\n"

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}GitHub CLI (gh) is not installed.${NC}"
    echo "Would you like to install it? (y/n)"
    read -r install_gh
    if [ "$install_gh" = "y" ]; then
        if [ "$(uname)" = "Darwin" ]; then
            brew install gh
        elif [ "$(uname)" = "Linux" ]; then
            sudo apt-get install gh
        else
            echo "Please install GitHub CLI from https://github.com/cli/cli"
        fi
    fi
fi

echo -e "\n${YELLOW}=== Configure GitHub Secrets ===${NC}\n"

read -p "Enter your Docker Hub username: " docker_username
read -sp "Enter your Docker Hub Personal Access Token: " docker_token
echo ""

read -p "Enter server public IP (default: 20.193.137.95): " server_ip
server_ip=${server_ip:-20.193.137.95}

read -p "Enter server username (default: azureuser): " server_user
server_user=${server_user:-azureuser}

echo -e "\n${YELLOW}Paste your SSH private key content (press Ctrl+D twice when done):${NC}"
ssh_key=$(cat)

# Check if gh CLI is available
if command -v gh &> /dev/null; then
    echo -e "\n${YELLOW}Setting GitHub secrets using CLI...${NC}\n"
    
    # Check if authenticated
    if ! gh auth status &> /dev/null; then
        echo "Please authenticate with GitHub:"
        gh auth login
    fi
    
    # Set secrets
    echo "$docker_username" | gh secret set DOCKER_HUB_USERNAME
    echo "$docker_token" | gh secret set DOCKER_HUB_PASSWORD
    echo "$server_ip" | gh secret set SERVER_HOST
    echo "$server_user" | gh secret set SERVER_USER
    echo "$ssh_key" | gh secret set SSH_PRIVATE_KEY
    
    echo -e "\n${GREEN}✓ All secrets set successfully!${NC}"
else
    echo -e "\n${YELLOW}GitHub CLI not available. Please set these secrets manually:${NC}"
    echo ""
    echo "Go to: GitHub Repository → Settings → Secrets and variables → Actions"
    echo ""
    echo "Add these secrets:"
    echo "  - DOCKER_HUB_USERNAME: $docker_username"
    echo "  - DOCKER_HUB_PASSWORD: (your token)"
    echo "  - SERVER_HOST: $server_ip"
    echo "  - SERVER_USER: $server_user"
    echo "  - SSH_PRIVATE_KEY: (your SSH key)"
fi

echo -e "\n${YELLOW}=== Build Frontend Docker Image Locally ===${NC}\n"

read -p "Do you want to build the Docker image locally? (y/n) " build_local

if [ "$build_local" = "y" ]; then
    echo -e "\n${YELLOW}Building Docker image...${NC}\n"
    docker build -t bookstore-frontend:latest ./frontend-react
    
    if [ $? -eq 0 ]; then
        echo -e "\n${GREEN}✓ Docker image built successfully!${NC}"
        echo ""
        echo "You can test it locally with:"
        echo "  docker run -d -p 3000:80 --name frontend bookstore-frontend:latest"
        echo "  open http://localhost:3000"
        echo ""
        echo "Then clean up with:"
        echo "  docker stop frontend && docker rm frontend"
    else
        echo -e "\n${RED}✗ Docker build failed${NC}"
        exit 1
    fi
fi

echo -e "\n${YELLOW}=== Server Configuration ===${NC}\n"

read -p "Do you want to configure the server now? (y/n) " configure_server

if [ "$configure_server" = "y" ]; then
    echo -e "\n${YELLOW}Connecting to server...${NC}\n"
    
    # Try to connect using SSH key
    ssh_key_path="$HOME/.ssh/myResourceGroup_key.pem"
    if [ ! -f "$ssh_key_path" ]; then
        read -p "Enter path to SSH private key: " ssh_key_path
    fi
    
    if [ -f "$ssh_key_path" ]; then
        ssh -i "$ssh_key_path" "$server_user@$server_ip" << 'EOF'
        
echo "=== Installing Docker on server ==="

# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $(whoami)

# Create deployment directory
mkdir -p /home/$(whoami)/bookstore-frontend

# Verify installation
echo ""
echo "✓ Docker installation completed!"
docker --version

EOF
    else
        echo -e "${RED}SSH key not found at $ssh_key_path${NC}"
    fi
fi

echo -e "\n${GREEN}=== Setup Complete! ===${NC}\n"
echo "Next steps:"
echo "1. Push your code to GitHub"
echo "2. GitHub Actions will automatically build and deploy"
echo "3. Monitor the workflow at: GitHub → Actions → Frontend CI/CD"
echo ""
echo "For more information, see FRONTEND_DEPLOYMENT_GUIDE.md"
