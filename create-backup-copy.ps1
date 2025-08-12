# Backup by copying files to temp folder then zipping
$timestamp = Get-Date -Format 'yyyyMMdd-HHmm'
$backupName = "fresh-kanban-backup-$timestamp"
$tempFolder = "$env:TEMP\$backupName"
$zipPath = "..\$backupName.zip"

Write-Host "Creating backup: $backupName.zip"

# Create temp folder
if (Test-Path $tempFolder) {
    Remove-Item $tempFolder -Recurse -Force
}
New-Item -ItemType Directory -Path $tempFolder -Force | Out-Null

# Define exclusions
$excludePatterns = @(
    "node_modules",
    ".next",
    ".git",
    "*.log",
    "tsconfig.tsbuildinfo",
    "nul"
)

# Copy files
Write-Host "Copying source files..."
$copiedFiles = 0

Get-ChildItem -Path "." -Recurse -File | ForEach-Object {
    $file = $_
    $shouldExclude = $false
    
    # Check if file should be excluded
    foreach ($pattern in $excludePatterns) {
        if ($file.FullName -like "*$pattern*" -or $file.Name -like "$pattern") {
            $shouldExclude = $true
            break
        }
    }
    
    if (-not $shouldExclude) {
        try {
            # Get relative path
            $relativePath = $file.FullName.Replace((Get-Location).Path, "")
            if ($relativePath.StartsWith("\")) {
                $relativePath = $relativePath.Substring(1)
            }
            
            $destPath = Join-Path $tempFolder $relativePath
            $destDir = Split-Path $destPath -Parent
            
            # Create destination directory
            if (-not (Test-Path $destDir)) {
                New-Item -ItemType Directory -Path $destDir -Force | Out-Null
            }
            
            # Copy file
            Copy-Item $file.FullName $destPath -Force
            $copiedFiles++
            
        } catch {
            Write-Host "Could not copy: $($file.Name) - $($_.Exception.Message)"
        }
    }
}

Write-Host "Copied $copiedFiles files"

# Create ZIP from temp folder
Write-Host "Creating ZIP archive..."
try {
    Compress-Archive -Path "$tempFolder\*" -DestinationPath $zipPath -Force
    
    # Clean up temp folder
    Remove-Item $tempFolder -Recurse -Force
    
    # Get backup info
    $backupFile = Get-Item $zipPath
    $sizeInMB = [math]::Round($backupFile.Length / 1MB, 2)
    
    Write-Host "SUCCESS!"
    Write-Host "Backup created: $($backupFile.FullName)"
    Write-Host "File size: $sizeInMB MB"
    
} catch {
    Write-Host "Error creating ZIP: $($_.Exception.Message)"
    if (Test-Path $tempFolder) {
        Remove-Item $tempFolder -Recurse -Force
    }
}