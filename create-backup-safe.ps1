# Safe backup script that handles locked files
$backupName = "fresh-kanban-backup-$(Get-Date -Format 'yyyyMMdd-HHmm').zip"
$sourcePath = "."
$destinationPath = "..\$backupName"

Write-Host "Creating backup: $backupName"
Write-Host "This may take a moment..."

# Remove existing backup if it exists
if (Test-Path $destinationPath) {
    Remove-Item $destinationPath -Force
    Write-Host "Removed existing backup"
}

# Create list of files to exclude
$excludePatterns = @(
    "node_modules",
    ".next",
    ".git",
    "*.log",
    "tsconfig.tsbuildinfo",
    "nul",
    "*.tmp",
    "*.temp"
)

# Get all files except excluded ones
$filesToZip = Get-ChildItem -Path $sourcePath -Recurse -File | Where-Object {
    $file = $_
    $shouldExclude = $false
    
    foreach ($pattern in $excludePatterns) {
        if ($file.FullName -like "*$pattern*" -or $file.Name -like "$pattern") {
            $shouldExclude = $true
            break
        }
    }
    
    # Try to open the file to check if it's locked
    if (-not $shouldExclude) {
        try {
            $stream = [System.IO.File]::Open($file.FullName, 'Open', 'Read', 'ReadWrite')
            $stream.Close()
            return $true
        } catch {
            Write-Host "Skipping locked file: $($file.Name)"
            return $false
        }
    }
    
    return -not $shouldExclude
}

Write-Host "Found $($filesToZip.Count) files to backup"

# Create the archive
try {
    $filesToZip | Compress-Archive -DestinationPath $destinationPath -Force
    Write-Host "Backup created successfully: $destinationPath"
    
    # Get file size
    $backupFile = Get-Item $destinationPath
    $sizeInMB = [math]::Round($backupFile.Length / 1MB, 2)
    Write-Host "Backup size: $sizeInMB MB"
    
} catch {
    Write-Host "Error creating backup: $($_.Exception.Message)"
}