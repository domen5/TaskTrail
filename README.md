# TaskTrail

TaskTrail is a web application designed to help you track your work hours, because time is money!

Track your daily tasks, calculate total hours, and generate exportable reports to ensure every minute is accounted for. Originally designed to create client-ready reports during my time as a consultant, this tool is ideal for freelancers, project managers, or anyone who values their time.

## Key Features

- **Task Management**: Add, view, and edit daily tasks with ease.
- **Total Hours Summary**: Automatically calculates the total hours worked per day and shows a breakdown of tasks. 
- **(WIP) Get a CSV or Excel report**: Export your tracked time and tasks into a CSV file for easy sharing and record-keeping.  

## Technologies Used

- **ReactJS**: Core framework for building the interactive frontend.
- **JavaScript (ES6+)**: Logic for dynamic rendering and state management.
- **Context API**: For managing shared application state like task data.
- **Vite**: Development environment for fast builds and optimized production output.

## How to Run

### Run with docker

1. Clone the repository:
   ```bash
   git clone https://github.com/domen5/TaskTrail.git
   cd TaskTrail
   ```
2. Install Docker (Linux):
    - https://docs.docker.com/engine/install
    or Docker Desktop (Linux, MacOs, Windows):
    - https://docs.docker.com/desktop
3. Make .env files following the example files
    ```bash
    mv ./example.env ./.env
    mv ./backend/env.example ./backend/.env
    mv ./db/env.example ./db/.env
    ```
4. Run docker compose:
    ```bash
    docker compose up --build -d
    ```
5. Access the web application at http://localhost:8080

### Run client web app locally
Docker is required to run the database and enable backend functionality. However, you can still demo the app locally, though several features will not be fully operational.

1. Clone the repository:
   
   ```bash
   git clone https://github.com/domen5/TaskTrail.git
   cd TaskTrail
   ```
2. Make .env files following the example files
    ```bash
    mv ./frontend/example.env ./frontend/.env
    ```
3. Start the frontend applciation:
    ```bash
   cd frontend
   npm install
   npm run dev
   ```
