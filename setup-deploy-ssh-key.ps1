#!/usr/bin/env powershell
<#
.SYNOPSIS
    Generates SSH ed25519 key pair for GitHub Actions deployment and displays it in the correct format
    for storing in GitHub secrets.

.DESCRIPTION
    This script:
    1. Generates a fresh ed25519 SSH key pair
    2. Displays the private key in the correct format for GitHub secret
    3. Displays the public key in the correct format for server
    4. Provides instructions for completing the setup

.EXAMPLE
    .\setup-deploy-ssh-key.ps1

.NOTES
    Requires: PowerShell 5.0+, ssh-keygen (native OpenSSH on Windows 10/11)
    
    If ssh-keygen is not found:
    - Use WSL: wsl ssh-keygen -t ed25519 ...
    - Use Git Bash: git-bash ssh-keygen -t ed25519 ...
#>

param(
    [string]$KeyName = "deploy_user_service",
    [string]$KeyComment = "github-actions-deploy-user-service",
    [switch]$ShowInstructions = $true
)

$ErrorActionPreference = "Stop"

# Check if ssh-keygen is available
if (-not (Get-Command ssh-keygen -ErrorAction SilentlyContinue)) {
    Write-Host "`n❌ ERROR: ssh-keygen not found" -ForegroundColor Red
    Write-Host "`nOpenSSH is not installed or not in PATH.`n" -ForegroundColor Yellow
    Write-Host "Install OpenSSH (Windows 10/11):" -ForegroundColor Cyan
    Write-Host "  Settings → Apps → Apps & features → Optional features" -ForegroundColor Cyan
    Write-Host "  Search for 'OpenSSH Client' and install`n" -ForegroundColor Cyan
    Write-Host "Or use WSL/Git Bash:`n" -ForegroundColor Cyan
    Write-Host "  wsl ssh-keygen -t ed25519 -C `"$KeyComment`" -f ~/.ssh/$KeyName -N `"`"`n" -ForegroundColor Cyan
    exit 1
}

# Set key path
$KeyDir = "$env:USERPROFILE\.ssh"
$PrivateKeyPath = "$KeyDir\$KeyName"
$PublicKeyPath = "$PrivateKeyPath.pub"

# Create .ssh directory if it doesn't exist
if (-not (Test-Path $KeyDir)) {
    New-Item -ItemType Directory -Path $KeyDir -Force | Out-Null
    Write-Host "✓ Created ~/.ssh directory" -ForegroundColor Green
}

# Backup existing key if it exists
if (Test-Path $PrivateKeyPath) {
    $BackupPath = "$PrivateKeyPath.backup.$(Get-Date -Format 'yyyyMMddHHmmss')"
    Copy-Item -Path $PrivateKeyPath -Destination $BackupPath
    Write-Host "✓ Backed up existing key to: $BackupPath" -ForegroundColor Green
}

# Generate key
Write-Host "`n🔑 Generating ed25519 SSH key pair..." -ForegroundColor Cyan
ssh-keygen -t ed25519 -C "$KeyComment" -f $PrivateKeyPath -N "" -q
Write-Host "✓ Key pair generated" -ForegroundColor Green

# Verify files exist
if (-not (Test-Path $PrivateKeyPath) -or -not (Test-Path $PublicKeyPath)) {
    Write-Host "❌ ERROR: Key generation failed" -ForegroundColor Red
    exit 1
}

# Read keys
$PrivateKey = Get-Content $PrivateKeyPath -Raw
$PublicKey = Get-Content $PublicKeyPath -Raw

# Display private key (for GitHub secret)
Write-Host "`n" + ("=" * 80) -ForegroundColor Yellow
Write-Host "PRIVATE KEY (for GitHub Secret DEPLOY_SSH_KEY)" -ForegroundColor Yellow
Write-Host ("=" * 80) -ForegroundColor Yellow
Write-Host "
👇 COPY THIS ENTIRE BLOCK (including -----BEGIN and -----END):
" -ForegroundColor Cyan

# Set color for the private key display
Write-Host $PrivateKey -ForegroundColor White -BackgroundColor Black

Write-Host "
✅ To add to GitHub:
1. Go to your repository on GitHub
2. Settings → Secrets and variables → Actions
3. Click 'New repository secret'
4. Name: DEPLOY_SSH_KEY
5. Secret: Paste the entire key above (from -----BEGIN to -----END)
6. Click 'Add secret'
" -ForegroundColor Green

# Display public key (for server)
Write-Host "`n" + ("=" * 80) -ForegroundColor Yellow
Write-Host "PUBLIC KEY (for Server ~/.ssh/authorized_keys)" -ForegroundColor Yellow
Write-Host ("=" * 80) -ForegroundColor Yellow
Write-Host "
👇 COPY THIS LINE:
" -ForegroundColor Cyan

Write-Host $PublicKey.Trim() -ForegroundColor White -BackgroundColor Black

Write-Host "
✅ To add to server:
1. SSH into your server:
   ssh <DEPLOY_USERNAME>@<DEPLOY_HOST>

2. On the server, run these commands:
   mkdir -p ~/.ssh
   echo '$($PublicKey.Trim())' >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   chmod 700 ~/.ssh

3. Exit and test:
   ssh -i $PrivateKeyPath <DEPLOY_USERNAME>@<DEPLOY_HOST> 'echo Success!'
" -ForegroundColor Green

# Offer to copy to clipboard (if available)
if (Get-Command Add-Clipboard -ErrorAction SilentlyContinue) {
    Write-Host "`n" + ("-" * 80) -ForegroundColor Gray
    Write-Host "💡 TIP: You can use PowerShell to copy keys to clipboard:" -ForegroundColor Cyan
    Write-Host "
Private key to clipboard:
  Get-Content $PrivateKeyPath | Set-Clipboard

Public key to clipboard:
  Get-Content $PublicKeyPath | Set-Clipboard
" -ForegroundColor Gray
}

# Summary
Write-Host "`n" + ("=" * 80) -ForegroundColor Yellow
Write-Host "SUMMARY" -ForegroundColor Yellow
Write-Host ("=" * 80) -ForegroundColor Yellow
Write-Host "
Key Name:        $KeyName
Private Key:     $PrivateKeyPath
Public Key:      $PublicKeyPath

Size:            $(((Get-Item $PrivateKeyPath).Length) / 1KB) KB
Type:            ed25519
Created:         $(Get-Item $PrivateKeyPath | Select-Object -ExpandProperty CreationTime)

Next Steps:
  1. ✓ Copy PRIVATE key above to GitHub secret DEPLOY_SSH_KEY
  2. ✓ Copy PUBLIC key above to server ~/.ssh/authorized_keys
  3. ✓ Test SSH connection (see instructions above)
  4. ✓ Run GitHub Actions deployment workflow
" -ForegroundColor Green

Write-Host "🚀 For more details, see: SSH_DEPLOYMENT_SETUP.md`n" -ForegroundColor Cyan
