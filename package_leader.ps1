$projectDir = "C:\Users\nirma\OneDrive\Desktop\SkyWatch"
$distDir = "$projectDir\Distribution"
$tempDir = "$distDir\temp_leader"

Write-Host "Creating temp directory..."
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

Write-Host "Copying files..."
Get-ChildItem -Path $projectDir -Exclude "Distribution" | Copy-Item -Destination $tempDir -Recurse -Force

Write-Host "Cleaning up heavy dependencies..."
$dirsToRemove = @("backend\node_modules", "frontend\node_modules", "frontend\dist", "edge-ai\venv", "edge-ai\__pycache__", ".git")
foreach ($dir in $dirsToRemove) {
    $path = "$tempDir\$dir"
    if (Test-Path $path) {
        Remove-Item -Path $path -Recurse -Force
    }
}

Write-Host "Zipping Full Project for Leader..."
Compress-Archive -Path "$tempDir\*" -DestinationPath "$distDir\leader_full_project.zip" -Force

Write-Host "Cleaning up temp directory..."
Remove-Item -Path $tempDir -Recurse -Force

Write-Host "Leader packaging complete."
