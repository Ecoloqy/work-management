# Funkcja pomocnicza do wyświetlania komunikatów
function Write-Step {
    param([string]$Message)
    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Write-Error {
    param([string]$Message)
    Write-Host "`n[BŁĄD] $Message" -ForegroundColor Red
}

# Funkcja do sprawdzania błędów
function Test-LastExitCode {
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Ostatnia komenda zakończyła się kodem $LASTEXITCODE"
        exit $LASTEXITCODE
    }
}

# Zmienne środowiskowe
$env:FLASK_APP = "wsgi.py"
$env:FLASK_ENV = "development"
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/work_management_dev"
$env:SQLALCHEMY_DATABASE_URI = $env:DATABASE_URL
$env:NODE_OPTIONS = "--openssl-legacy-provider"

# Sprawdzenie czy plik konfiguracyjny istnieje
Write-Step "Sprawdzanie plików konfiguracyjnych"
if (-not (Test-Path .env.development)) {
    Write-Error "Nie znaleziono pliku .env.development"
    exit 1
}

# Konfiguracja środowiska
Write-Step "Kopiowanie konfiguracji developerskiej"
try {
    if (Test-Path .env) {
        Remove-Item .env -Force
    }
    Copy-Item .env.development .env -ErrorAction Stop
} catch {
    Write-Error "Nie udało się skopiować pliku konfiguracyjnego: $_"
    exit 1
}

# Sprawdzenie czy Docker jest uruchomiony
Write-Step "Sprawdzanie statusu Docker"
try {
    docker info > $null 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Docker nie jest uruchomiony. Uruchom Docker Desktop i spróbuj ponownie."
        exit 1
    }
} catch {
    Write-Error "Nie można połączyć się z Docker. Upewnij się, że Docker Desktop jest zainstalowany i uruchomiony."
    exit 1
}

# Zatrzymanie kontenerów (bez usuwania wolumenów)
Write-Step "Zatrzymywanie kontenerów"
docker-compose -f docker-compose.db.yml stop

# Uruchomienie bazy danych
Write-Step "Uruchamianie bazy danych"
docker-compose -f docker-compose.db.yml up -d

Write-Step "Czekam na gotowość bazy danych..."
Start-Sleep -Seconds 5

# Przygotowanie backendu
Write-Step "Przygotowanie backendu"
Push-Location backend
try {
    # Usuń stare środowisko wirtualne jeśli istnieje
    if (Test-Path venv) {
        Write-Step "Usuwanie starego środowiska wirtualnego"
        Remove-Item -Recurse -Force venv
    }

    # Utwórz nowe środowisko wirtualne
    Write-Step "Tworzenie nowego środowiska wirtualnego"
    python -m venv venv
    
    # Aktywuj środowisko i zainstaluj zależności
    Write-Step "Instalacja zależności backendu"
    & ./venv/Scripts/Activate.ps1
    pip install -r requirements.txt
    
    # Uruchom backend w nowym oknie
    Write-Step "Uruchamianie backendu"
    $backendCmd = "Set-Location '$((Get-Location).Path)'; & ./venv/Scripts/Activate.ps1; flask run --host=0.0.0.0 --port=5000"
    Start-Process pwsh -ArgumentList "-NoExit", "-Command", $backendCmd
} finally {
    Pop-Location
}

# Przygotowanie frontendu
Write-Step "Przygotowanie frontendu"
Push-Location frontend
try {
    # Instalacja zależności i uruchomienie frontendu
    Write-Step "Instalacja zależności frontendu"
    npm install
    
    Write-Step "Uruchamianie frontendu"
    $frontendCmd = "Set-Location '$((Get-Location).Path)'; npm start"
    Start-Process pwsh -ArgumentList "-NoExit", "-Command", $frontendCmd
} finally {
    Pop-Location
}

Write-Host "`nŚrodowisko deweloperskie zostało uruchomione!" -ForegroundColor Green
Write-Host "Backend dostępny na: http://localhost:5000" -ForegroundColor Yellow
Write-Host "Frontend dostępny na: http://localhost:3000" -ForegroundColor Yellow 