param(
  [string]$ProjectRoot
)

$ErrorActionPreference = "Stop"

function Add-CandidatePath {
  param(
    [System.Collections.Generic.List[string]]$Paths,
    [string]$Path
  )

  if ([string]::IsNullOrWhiteSpace($Path)) {
    return
  }

  $expanded = [Environment]::ExpandEnvironmentVariables($Path)

  if (-not $Paths.Contains($expanded)) {
    $Paths.Add($expanded)
  }
}

function Get-DesktopPath {
  $paths = [System.Collections.Generic.List[string]]::new()

  Add-CandidatePath $paths ([Environment]::GetFolderPath("Desktop"))

  try {
    $userShellFolders = Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders"
    Add-CandidatePath $paths $userShellFolders.Desktop
  } catch {
    # Registry lookup is best-effort; fallback candidates below cover common layouts.
  }

  Add-CandidatePath $paths (Join-Path $env:USERPROFILE "OneDrive\Escritorio")
  Add-CandidatePath $paths (Join-Path $env:USERPROFILE "OneDrive\Desktop")
  Add-CandidatePath $paths (Join-Path $env:USERPROFILE "Desktop")
  Add-CandidatePath $paths (Join-Path $env:USERPROFILE "Escritorio")

  foreach ($path in $paths) {
    if (Test-Path -LiteralPath $path) {
      return $path
    }
  }

  if ($paths.Count -gt 0) {
    return $paths[0]
  }

  return (Join-Path $env:USERPROFILE "Desktop")
}

if ([string]::IsNullOrWhiteSpace($ProjectRoot)) {
  $ProjectRoot = Join-Path $PSScriptRoot ".."
}

$projectPath = [System.IO.Path]::GetFullPath($ProjectRoot).TrimEnd("\", "/")
$targetPath = Join-Path $projectPath "organizador.cmd"
$cmdPath = Join-Path $env:SystemRoot "System32\cmd.exe"

if (-not (Test-Path -LiteralPath $targetPath)) {
  throw "No existe el lanzador: $targetPath"
}

$desktopPath = Get-DesktopPath

if (-not (Test-Path -LiteralPath $desktopPath)) {
  New-Item -ItemType Directory -Force -Path $desktopPath | Out-Null
}

$shortcutPath = Join-Path $desktopPath "Organizador de descargas.lnk"
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)

$shortcut.TargetPath = $cmdPath
$shortcut.Arguments = "/d /c `"$targetPath`""
$shortcut.WorkingDirectory = $projectPath
$shortcut.WindowStyle = 1
$shortcut.IconLocation = Join-Path $env:SystemRoot "System32\shell32.dll,46"
$shortcut.Description = "Abrir el organizador de descargas"
$shortcut.Save()

Write-Host "Acceso directo creado:"
Write-Host $shortcutPath
