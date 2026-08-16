$projectDir = "C:\Users\nirma\OneDrive\Desktop\SkyWatch"
$distDir = "$projectDir\Distribution"
if (!(Test-Path $distDir)) {
    New-Item -ItemType Directory -Force -Path $distDir
}

Write-Host "Zipping Backend..."
$backendFiles = Get-ChildItem -Path "$projectDir\backend" | Where-Object { $_.Name -ne 'node_modules' }
Compress-Archive -Path $backendFiles.FullName -DestinationPath "$distDir\backend_team.zip" -Force

Write-Host "Zipping Frontend..."
$frontendFiles = Get-ChildItem -Path "$projectDir\frontend" | Where-Object { $_.Name -notin @('node_modules', 'dist') }
Compress-Archive -Path $frontendFiles.FullName -DestinationPath "$distDir\frontend_team.zip" -Force

Write-Host "Zipping Edge AI..."
$edgeAiFiles = Get-ChildItem -Path "$projectDir\edge-ai" | Where-Object { $_.Name -notin @('__pycache__', 'venv', '.env') }
Compress-Archive -Path $edgeAiFiles.FullName -DestinationPath "$distDir\edge_ai_team.zip" -Force

Write-Host "Packaging complete."
