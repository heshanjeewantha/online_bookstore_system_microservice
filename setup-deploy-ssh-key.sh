#!/bin/bash
#
# SSH Key Generation and Setup Script for GitHub Actions Deployment
#
# Usage: bash setup-deploy-ssh-key.sh
#
# This script:
#   1. Generates a fresh ed25519 SSH key pair
#   2. Displays the private key for GitHub secret
#   3. Displays the public key for server
#   4. Provides instructions for completing setup
#

set -e

# Configuration
KEY_NAME="${1:-deploy_user_service}"
KEY_COMMENT="github-actions-deploy-user-service"
KEY_DIR="$HOME/.ssh"
PRIVATE_KEY="$KEY_DIR/$KEY_NAME"
PUBLIC_KEY="$PRIVATE_KEY.pub"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Functions
print_section() {
    echo ""
    echo -e "${YELLOW}$(printf '=%.0s' {1..80})${NC}"
    echo -e "${YELLOW}$1${NC}"
    echo -e "${YELLOW}$(printf '=%.0s' {1..80})${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if ssh-keygen exists
if ! command -v ssh-keygen &> /dev/null; then
    print_error "ssh-keygen not found"
    echo ""
    echo "Install OpenSSH:"
    echo "  Ubuntu/Debian: sudo apt-get install openssh-client"
    echo "  macOS: brew install openssh"
    exit 1
fi

# Create .ssh directory if needed
mkdir -p "$KEY_DIR"
chmod 700 "$KEY_DIR"

# Backup existing key if present
if [ -f "$PRIVATE_KEY" ]; then
    BACKUP="$PRIVATE_KEY.backup.$(date +%s)"
    cp "$PRIVATE_KEY" "$BACKUP"
    print_success "Backed up existing key to: $BACKUP"
fi

# Generate key
print_section "Generating ed25519 SSH Key Pair"
ssh-keygen -t ed25519 -C "$KEY_COMMENT" -f "$PRIVATE_KEY" -N "" -q
chmod 600 "$PRIVATE_KEY"
chmod 644 "$PUBLIC_KEY"
print_success "SSH key pair generated"

# Read keys
PRIVATE=$(cat "$PRIVATE_KEY")
PUBLIC=$(cat "$PUBLIC_KEY")

# Display private key
print_section "PRIVATE KEY (for GitHub Secret DEPLOY_SSH_KEY)"
echo ""
echo -e "${CYAN}👇 COPY THIS ENTIRE BLOCK (including -----BEGIN and -----END):${NC}"
echo ""
echo "$PRIVATE"
echo ""
echo -e "${GREEN}✅ To add to GitHub:${NC}"
echo "  1. Go to your repository on GitHub"
echo "  2. Settings → Secrets and variables → Actions"
echo "  3. Click 'New repository secret'"
echo "  4. Name: DEPLOY_SSH_KEY"
echo "  5. Secret: Paste the entire key above"
echo "  6. Click 'Add secret'"

# Display public key
print_section "PUBLIC KEY (for Server ~/.ssh/authorized_keys)"
echo ""
echo -e "${CYAN}👇 COPY THIS LINE:${NC}"
echo ""
echo "$PUBLIC"
echo ""
echo -e "${GREEN}✅ To add to server:${NC}"
echo "  1. SSH into your server:"
echo "     ssh <DEPLOY_USERNAME>@<DEPLOY_HOST>"
echo ""
echo "  2. On the server, run these commands:"
echo "     mkdir -p ~/.ssh"
echo "     echo '$PUBLIC' >> ~/.ssh/authorized_keys"
echo "     chmod 600 ~/.ssh/authorized_keys"
echo "     chmod 700 ~/.ssh"
echo ""
echo "  3. Exit and test:"
echo "     ssh -i $PRIVATE_KEY <DEPLOY_USERNAME>@<DEPLOY_HOST> 'echo Success!'"

# Summary
print_section "SUMMARY"
echo ""
echo -e "${GREEN}Key Name:${NC}        $KEY_NAME"
echo -e "${GREEN}Private Key:${NC}     $PRIVATE_KEY"
echo -e "${GREEN}Public Key:${NC}      $PUBLIC_KEY"
echo ""
echo -e "${GREEN}Size:${NC}            $(du -h "$PRIVATE_KEY" | cut -f1)"
echo -e "${GREEN}Type:${NC}            ed25519"
echo -e "${GREEN}Created:${NC}         $(date)"
echo ""
echo -e "${GREEN}Next Steps:${NC}"
echo "  1. ✓ Copy PRIVATE key above to GitHub secret DEPLOY_SSH_KEY"
echo "  2. ✓ Copy PUBLIC key above to server ~/.ssh/authorized_keys"
echo "  3. ✓ Test SSH connection (see instructions above)"
echo "  4. ✓ Run GitHub Actions deployment workflow"
echo ""
echo -e "${CYAN}🚀 For more details, see: SSH_DEPLOYMENT_SETUP.md${NC}"
echo ""

# Offer to display key again
echo -e "${YELLOW}💡 TIP: View keys again with:${NC}"
echo "  cat $PRIVATE_KEY          # View private key"
echo "  cat $PUBLIC_KEY           # View public key"
echo ""
