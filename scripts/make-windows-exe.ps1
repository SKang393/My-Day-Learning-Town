$ErrorActionPreference = "Stop"

$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$Stage = Join-Path $Root ".desktop-staging"
$ReleaseRoot = Join-Path $Root "release"
$OutParent = Join-Path $ReleaseRoot "MyDayLearningTown-EXE"
$FinalFolder = Join-Path $OutParent "My Day Learning Town-win32-x64"
$NpmPath = if (Test-Path "C:\Program Files\nodejs\npm.cmd") { "C:\Program Files\nodejs\npm.cmd" } else { (Get-Command npm.cmd -ErrorAction Stop).Source }
$Packager = Join-Path $Root "node_modules\@electron\packager\bin\electron-packager.mjs"

Set-Location -LiteralPath $Root
& $NpmPath run build
if ($LASTEXITCODE -ne 0) { throw "Build failed. Desktop EXE package was not created." }

function Assert-InRoot {
  param([Parameter(Mandatory=$true)][string]$Path)
  $Resolved = (Resolve-Path -LiteralPath $Path -ErrorAction Stop).Path
  if (-not $Resolved.StartsWith($Root, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to touch outside workspace: $Resolved"
  }
  return $Resolved
}

function Remove-IfExistsInRoot {
  param([Parameter(Mandatory=$true)][string]$Path)
  if (Test-Path -LiteralPath $Path) {
    $Resolved = Assert-InRoot -Path $Path
    Remove-Item -LiteralPath $Resolved -Recurse -Force
  }
}

Remove-IfExistsInRoot -Path $Stage
Remove-IfExistsInRoot -Path $OutParent

New-Item -ItemType Directory -Force -Path $Stage | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $Stage "electron") | Out-Null
Copy-Item -LiteralPath (Join-Path $Root "dist") -Destination (Join-Path $Stage "dist") -Recurse
Copy-Item -LiteralPath (Join-Path $Root "electron\main.cjs") -Destination (Join-Path $Stage "electron\main.cjs")
Copy-Item -LiteralPath (Join-Path $Root "electron\preload.cjs") -Destination (Join-Path $Stage "electron\preload.cjs")

$StagePackageJson = @"
{
  "name": "my-day-learning-town-desktop",
  "version": "0.1.0",
  "private": true,
  "main": "electron/main.cjs",
  "description": "My Day Learning Town standalone Windows desktop game"
}
"@
$StagePackageJson | Set-Content -Encoding ASCII -LiteralPath (Join-Path $Stage "package.json")

& node $Packager $Stage "My Day Learning Town" --platform=win32 --arch=x64 --out=$OutParent --overwrite --app-version=0.1.0 --prune=false --asar=false
if ($LASTEXITCODE -ne 0) { throw "Electron packaging failed." }

$ExePath = Join-Path $FinalFolder "My Day Learning Town.exe"
if (-not (Test-Path -LiteralPath $ExePath)) { throw "Expected EXE was not created: $ExePath" }

$RuntimeNames = @(
  "My Day Learning Town.exe",
  "chrome_100_percent.pak",
  "chrome_200_percent.pak",
  "d3dcompiler_47.dll",
  "dxcompiler.dll",
  "dxil.dll",
  "ffmpeg.dll",
  "icudtl.dat",
  "libEGL.dll",
  "libGLESv2.dll",
  "LICENSE",
  "LICENSES.chromium.html",
  "locales",
  "resources",
  "resources.pak",
  "snapshot_blob.bin",
  "v8_context_snapshot.bin",
  "version",
  "vk_swiftshader.dll",
  "vk_swiftshader_icd.json",
  "vulkan-1.dll",
  "README-WINDOWS-EXE.txt"
)

foreach ($Name in $RuntimeNames) {
  Remove-IfExistsInRoot -Path (Join-Path $Root $Name)
}

Get-ChildItem -LiteralPath $FinalFolder -Force | Copy-Item -Destination $Root -Recurse -Force

$RootExe = Join-Path $Root "My Day Learning Town.exe"
if (-not (Test-Path -LiteralPath $RootExe)) { throw "Expected classroom EXE was not created at the main root: $RootExe" }

$NestedClassroomFolder = Join-Path $Root "LFI Games"
Remove-IfExistsInRoot -Path $NestedClassroomFolder
Remove-IfExistsInRoot -Path $OutParent
if ((Test-Path -LiteralPath $ReleaseRoot) -and -not (Get-ChildItem -LiteralPath $ReleaseRoot -Force)) {
  Remove-IfExistsInRoot -Path $ReleaseRoot
}
Remove-IfExistsInRoot -Path $Stage

Write-Host "Final classroom package exposed at the main project root:"
Write-Host $RootExe
