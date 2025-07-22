# Grocery Store List - Frontend

Aplikacja webowa do zarządzania listami zakupów, zgodna z wymaganiami PRD.

## 🚀 Uruchomienie

### Opcja 1: Z Docker Compose (Zalecana)
```bash
cd frontend
docker-compose up -d
```

Aplikacja będzie dostępna pod adresem: http://localhost:3000

### Opcja 2: Lokalnie z Nginx
```bash
cd frontend
nginx -c $(pwd)/nginx.conf -p $(pwd)
```

### Opcja 3: Serwer deweloperski (Python)
```bash
cd frontend
python3 -m http.server 3000
```

## 🎨 Funkcje

### ✅ Zaimplementowane funkcje zgodnie z PRD:

**📝 Zarządzanie listami:**
- ✅ Tworzenie nowych list (Zakupy/Inne)
- ✅ Edytowanie nazw i typów list
- ✅ Usuwanie list
- ✅ Różnicowanie wizualne typów list

**🛒 Zarządzanie przedmiotami:**
- ✅ Dodawanie pozycji do list
- ✅ Edytowanie pozycji
- ✅ Oznaczanie jako odhaczone
- ✅ Usuwanie pozycji
- ✅ Quick-add przez Enter

**🎯 Funkcje zaawansowane:**
- ✅ System sugestii podczas pisania
- ✅ Sortowanie list "Zakupy" (AI)
- ✅ Responsywny design mobilny
- ✅ Neonowe kolory (róż #ff00ff, niebieski #00ffff)

**🔧 Integracja z backend:**
- ✅ REST API komunikacja
- ✅ Obsługa wszystkich endpointów
- ✅ Automatyczne odświeżanie

## 🎨 Design

- **Neonowy styl** z gradientami
- **TailwindCSS** + custom CSS
- **Responsywny** design mobile-first
- **Minimalistyczny** interfejs
- **Smooth animations** i hover effects

## 🔗 API Integration

Frontend komunikuje się z backendem przez następujące endpointy:

- `GET /api/v1/lists` - pobieranie listy wszystkich list
- `GET /api/v1/lists/{id}` - szczegóły konkretnej listy
- `POST /api/v1/lists` - tworzenie nowej listy
- `PUT /api/v1/lists/{id}` - edytowanie listy
- `DELETE /api/v1/lists/{id}` - usuwanie listy
- `POST /api/v1/lists/{id}/sort` - sortowanie listy AI

- `POST /api/v1/items?list_id={id}` - dodawanie przedmiotu
- `PUT /api/v1/items/{id}` - edytowanie przedmiotu
- `DELETE /api/v1/items/{id}` - usuwanie przedmiotu
- `PATCH /api/v1/items/{id}/check` - oznaczanie/odznaczanie
- `GET /api/v1/items/suggestions/{type}` - sugestie

## 📁 Struktura

```
frontend/
├── index.html          # Główna strona
├── js/
│   └── app.js         # Główna logika aplikacji
├── css/
│   └── styles.css     # Style CSS
├── assets/            # Zasoby (obrazy, ikony)
├── docker-compose.yml # Konfiguracja Docker
├── nginx.conf         # Konfiguracja Nginx
└── README.md         # Dokumentacja
```

## 🐳 Docker

Aplikacja jest skonfigurowana do uruchamiania w kontenerze Docker z Nginx jako serwerem statycznych plików i reverse proxy do backend.

## 📱 Responsywność

Frontend jest w pełni responsywny i dostosowany do urządzeń mobilnych zgodnie z wymaganiami PRD.