# Online Bookstore Frontend Deployment Setup
# Run this script from the project root directory

param(
    [switch]$BuildLocal = $false,
    [switch]$ConfigureServer = $false,
    [switch]$SetupSecretsOnly = $false
)

# Colors
$Green = "`e[32m"
$Red = "`e[31m"
$Yellow = "`e[33m"
$Reset = "`e[0m"

Write-Host "${Yellow}=== Online Bookstore Frontend Deployment Setup ===${Reset}`n" -ForegroundColor Yellow

# Check if running from root directory
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "${Red}Error: Please run this script from the project root directory${Reset}" -ForegroundColor Red
    exit 1
}

# Check if Docker is installed
try {
    $dockerVersion = docker --version
    Write-Host "${Green}✓ Docker is installed: $dockerVersion${Reset}" -ForegroundColor Green
}
catch {
    Write-Host "${Red}Error: Docker is not installed. Please install Docker Desktop first.${Reset}" -ForegroundColor Red
    exit 1
}

Write-Host "`n${Yellow}=== Configure GitHub Secrets ===${Reset}`n" -ForegroundColor Yellow

$dockerUsername = Read-Host "Enter your Docker Hub username"
$dockerToken = Read-Host "Enter your Docker Hub Personal Access Token (input hidden)" -AsSecureString
$dockerTokenPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUnicode($dockerToken))

$serverIp = Read-Host "Enter server public IP (default: 20.193.137.95)"
if ([string]::IsNullOrWhiteSpace($serverIp)) {
    $serverIp = "20.193.137.95"
}

$serverUser = Read-Host "Enter server username (default: azureuser)"
if ([string]::IsNullOrWhiteSpace($serverUser)) {
    $serverUser = "azureuser"
}

$sshKeyPath = Read-Host "Enter path to SSH private key (C:\Users\sanda\Downloads\myResourceGroup_key.pem)"
if ([string]::IsNullOrWhiteSpace($sshKeyPath)) {
    $sshKeyPath = "C:\Users\sanda\Downloads\myResourceGroup_key.pem"
}

if (-not (Test-Path $sshKeyPath)) {
    Write-Host "${Red}Error: SSH key not found at $sshKeyPath${Reset}" -ForegroundColor Red
    exit 1
}

$sshKeyContent = Get-Content -Path $sshKeyPath -Raw

# Check if GitHub CLI is installed
$ghInstalled = $false
try {
    gh auth status > $null 2>&1
    $ghInstalled = $true
}
catch {
    $ghInstalled = $false
}

if ($ghInstalled) {
    Write-Host "${Yellow}Setting GitHub secrets using GitHub CLI...${Reset}`n" -ForegroundColor Yellow
    
    # Set secrets
    $dockerUsername | gh secret set DOCKER_HUB_USERNAME
    $dockerTokenPlain | gh secret set DOCKER_HUB_PASSWORD
    $serverIp | gh secret set SERVER_HOST
    $serverUser | gh secret set SERVER_USER
    $sshKeyContent | gh secret set SSH_PRIVATE_KEY
    
    Write-Host "${Green}✓ All GitHub secrets set successfully!${Reset}`n" -ForegroundColor Green
}
else {
    Write-Host "${Yellow}GitHub CLI not available. Please set these secrets manually:${Reset}`n" -ForegroundColor Yellow
    Write-Host "Go to: GitHub Repository → Settings → Secrets and variables → Actions`n"
    Write-Host "Add these secrets:"
    Write-Host "  - DOCKER_HUB_USERNAME: $dockerUsername"
    Write-Host "  - DOCKER_HUB_PASSWORD: (your token)"
    Write-Host "  - SERVER_HOST: $serverIp"
    Write-Host "  - SERVER_USER: $serverUser"
    Write-Host "  - SSH_PRIVATE_KEY: (your SSH key from $sshKeyPath)`n"
}

if (-not $SetupSecretsOnly) {
    Write-Host "${Yellow}=== Build Frontend Docker Image Locally ===${Reset}`n" -ForegroundColor Yellow
    
    $buildChoice = Read-Host "Do you want to build the Docker image locally? (y/n)"
    
    if ($buildChoice -eq "y") {
        Write-Host "${Yellow}Building Docker image...${Reset}`n" -ForegroundColor Yellow
        docker build -t bookstore-frontend:latest ./frontend-react
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n${Green}✓ Docker image built successfully!${Reset}`n" -ForegroundColor Green
            Write-Host "You can test it locally with:"
            Write-Host "  docker run -d -p 3000:80 --name frontend bookstore-frontend:latest"
            Write-Host "  start http://localhost:3000`n"
            Write-Host "Then clean up with:"
            Write-Host "  docker stop frontend && docker rm frontend`n"
        }
        else {
            Write-Host "`n${Red}✗ Docker build failed${Reset}" -ForegroundColor Red
            exit 1
        }
    }
}

if ($ConfigureServer) {
    Write-Host "${Yellow}=== Server Configuration ===${Reset}`n" -ForegroundColor Yellow
    
    Write-Host "${Yellow}Connecting to server and installing Docker...${Reset}`n" -ForegroundColor Yellow
    
    # Create temporary script for server setup
    $setupScript = @"
echo "=== Installing Docker on server ==="

# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker azureuser

# Create deployment directory
mkdir -p /home/azureuser/bookstore-frontend

# Verify installation
echo ""
echo "✓ Docker installation completed!"
docker --version
"@
    
    # Use SSH to connect and run setup
    ssh -i $sshKeyPath "$serverUser@$serverIp" $setupScript
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n${Green}✓ Server configuration completed!${Reset}" -ForegroundColor Green
    }
    else {
        Write-Host "`n${Red}✗ Server configuration failed${Reset}" -ForegroundColor Red
    }
}

Write-Host "`n${Green}=== Setup Complete! ===${Reset}`n" -ForegroundColor Green
Write-Host "Next steps:"
Write-Host "1. Push your code to GitHub"
Write-Host "2. GitHub Actions will automatically build and deploy"
Write-Host "3. Monitor the workflow at: GitHub → Actions → Frontend CI/CD"
Write-Host ""
Write-Host "For more information, see FRONTEND_DEPLOYMENT_GUIDE.md"
Write-Host ""
Write-Host "To configure server on next run, use: .\setup-deployment.ps1 -ConfigureServer"
