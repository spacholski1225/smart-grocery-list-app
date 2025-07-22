# Grocery Store List - Smart Shopping List Application

A comprehensive grocery list management application designed for efficient shopping with AI-powered features, built with Python FastAPI backend and responsive web frontend.

## Project Structure

```
grocery-store-list/
├── backend/
│   ├── app/
│   │   ├── core/           # Application configuration
│   │   ├── database/       # Database configuration
│   │   ├── models/         # SQLAlchemy models and Pydantic schemas
│   │   ├── routers/        # API endpoints
│   │   ├── services/       # Business logic
│   │   └── main.py         # Application entry point
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile         # Docker container configuration
├── frontend/
│   ├── js/                # JavaScript application logic
│   ├── css/               # Stylesheets
│   ├── index.html         # Main HTML file
│   ├── nginx.conf         # Nginx configuration
│   └── Dockerfile         # Frontend Docker configuration
├── docker-compose.yml     # Local development setup
├── docker-compose-hub.yml # Docker Hub deployment setup
└── README.md
```

## Features

### Core Functionality
- Create and manage multiple shopping lists
- Add, edit, and delete items with auto-complete suggestions
- Mark items as completed with visual indicators
- Drag & drop reordering of items
- AI-powered text-to-list conversion
- Smart grocery list sorting based on store layout

### API Endpoints

#### Lists (`/api/v1/lists`)
- `POST /` - Create a new list
- `GET /` - Get all lists
- `GET /{list_id}` - Get specific list
- `PUT /{list_id}` - Update list
- `DELETE /{list_id}` - Delete list
- `POST /{list_id}/sort` - AI-powered list sorting
- `PUT /{list_id}/reorder` - Manual item reordering
- `DELETE /{list_id}/clear-completed` - Remove completed items

#### Items (`/api/v1/items`)
- `POST /` - Add item to list
- `GET /{item_id}` - Get item details
- `PUT /{item_id}` - Update item
- `DELETE /{item_id}` - Delete item
- `PATCH /{item_id}/check` - Toggle completion status
- `GET /suggestions/{list_type}` - Get item suggestions

#### AI Features (`/api/v1/ai`)
- `POST /convert-text` - Convert natural text to shopping list items

### Database

The application uses SQLite with three main tables:
- `grocery_lists` - Shopping lists storage
- `list_items` - List items with positions and status
- `item_suggestions` - AI-generated suggestions based on usage patterns

### AI Integration

**Smart Sorting**: Uses OpenAI API through LangChain to organize items by typical store layout:
1. Dairy products (cheese, yogurt)
2. Meat and poultry
3. Bread and bakery items
4. Oils and condiments
5. Canned goods and preserves
6. Tea and coffee
7. Eggs
8. Pasta and grains
9. Fresh fruits and vegetables
10. Paper products
11. Beauty and bathroom items
12. Beverages
13. Snacks
14. Alcoholic beverages

**Text Conversion**: Converts natural language text (recipes, notes, shopping ideas) into structured grocery lists.

## Installation and Setup

### Using Docker Hub (Recommended)

1. Download the Docker Compose file:
```bash
wget https://raw.githubusercontent.com/spacholski/grocery-store-list/main/docker-compose-hub.yml
```

2. Run the application:
```bash
docker-compose -f docker-compose-hub.yml up
```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

### Local Development

1. Clone the repository
2. Copy `.env.example` to `.env` and configure variables
3. Run with Docker Compose:
```bash
docker-compose up --build
```

### Manual Installation

#### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend
Serve the frontend directory with any web server (nginx, Apache, or Python's http.server).

## Configuration

Environment variables (`.env` file):
- `DATABASE_URL` - Database URL (defaults to SQLite)
- `OPENAI_API_KEY` - OpenAI API key (optional, for AI features)
- `DEBUG` - Debug mode flag

## API Documentation

After running the application, API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Docker Images

Pre-built Docker images are available on Docker Hub:
- Backend: `spacholski/grocery-store-list-backend:latest`
- Frontend: `spacholski/grocery-store-list-frontend:latest`

## Technologies Used

- **Backend**: Python, FastAPI, SQLAlchemy, SQLite, LangChain, OpenAI API
- **Frontend**: Vanilla JavaScript, HTML5, CSS3, Tailwind CSS
- **Infrastructure**: Docker, Nginx, Docker Compose

## License

This project is open source and available under the MIT License.