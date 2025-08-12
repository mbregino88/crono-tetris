# Create backup script
$backupName = "fresh-kanban-backup-$(Get-Date -Format 'yyyyMMdd').zip"
$sourcePath = "."
$destinationPath = "..\$backupName"

# Get all files except node_modules and build files
Get-ChildItem -Path $sourcePath -Recurse -File | 
    Where-Object { 
        $_.DirectoryName -notlike "*node_modules*" -and 
        $_.DirectoryName -notlike "*.next*" -and 
        $_.Name -ne "nul" -and 
        $_.Name -notlike "*.log" -and
        $_.Name -ne "tsconfig.tsbuildinfo"
    } | 
    Compress-Archive -DestinationPath $destinationPath -Force

Write-Host "Backup created: $backupName"