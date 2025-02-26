# Funkcja pomocnicza do wyświetlania komunikatów
function Write-Step {
    param([string]$Message)
    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Write-Error {
    param([string]$Message)
    Write-Host "`n[BŁĄD] $Message" -ForegroundColor Red
}

# Sprawdzenie czy plik konfiguracyjny istnieje
Write-Step "Sprawdzanie plików konfiguracyjnych"
if (-not (Test-Path .env.production)) {
    Write-Error "Nie znaleziono pliku .env.production"
    exit 1
}

# Konfiguracja środowiska
Write-Step "Kopiowanie konfiguracji produkcyjnej"
try {
    if (Test-Path .env) {
        Remove-Item .env -Force
    }
    Copy-Item .env.production .env -ErrorAction Stop
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
docker-compose stop

# Budowanie i uruchamianie kontenerów
Write-Step "Budowanie i uruchamianie kontenerów"
try {
    # Przebuduj tylko obrazy aplikacji (bez bazy danych)
    docker-compose build backend frontend
    # Uruchom wszystkie kontenery (bez --force-recreate aby zachować dane)
    docker-compose up -d
} catch {
    Write-Error "Nie udało się uruchomić kontenerów: $_"
    exit 1
}

Write-Host "`nAplikacja produkcyjna została uruchomiona!" -ForegroundColor Green
Write-Host "Aby zobaczyć logi, użyj: docker-compose logs -f" -ForegroundColor Yellow 