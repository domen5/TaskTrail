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

Follow these steps to get TaskTrail up and running locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/domen5/TaskTrail.git
   cd TrekkingTasks
   ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Start the development server:
    ```bash
    npm run dev
    ```

## Run with docker
1. Run backend:
    ```bash
    docker build -t tt-backend ./backend
    docker run -p 3000:3000 --name tt-backend tt-backend:latest
    ```
2. Run frontend:
    
    ```bash
    docker build -t tt-frontend ./frontend
    docker run -p 8080:80 --name tt-frontend tt-frontend:latest
    ```