# KPI Manager – Zoho Cliqtrix Edition

KPI Manager is a performance-based KPI management platform that helps teams define goals, track progress, and recognize individual contributions. It is built as a full-stack web application with a Zoho Cliq extension, so employees and admins can access KPI insights both on the web and directly from chat.

## Features

- **Role-based dashboards**
  - Admin dashboard to manage projects, tasks, teams, goals, and overall KPI progress.
  - Employee dashboard showing personal tasks, points, completion rate, workload, and progress graphs.

- **KPI tracking**
  - Create and assign KPIs and weekly goals.
  - Track completion rate, tasks completed today, points earned, and overdue work.
  - Visual task progress graph for each employee.

- **Zoho Cliq integration**
  - KPI Assistant bot bundled as a Cliq extension.
  - `/kpi` command that returns a quick KPI snapshot card inside Zoho Cliq.
  - Secure backend endpoint protected by an app key so only the extension can access it.

- **AI coach (web app)**
  - Integrated AI assistant (via OpenAI API) to answer questions about productivity, KPIs, tasks, and best practices.
  - Exposed through a dedicated chatbot page in the web app.

- **Tech stack**
  - **Frontend:** React, Vite, TypeScript, Tailwind CSS.
  - **Backend:** Node.js, Express, TypeScript.
  - **Database:** MongoDB (Mongoose).
  - **Auth:** JWT-based authentication, role-based access control.

## How it works

1. **Web app**
   - Admins log in to configure projects, teams, tasks, and goals.
   - Employees log in to see their assigned work, mark tasks complete, and monitor their performance metrics.
   - Dashboards show KPI summaries, points, completion trends, and recognition for silent achievers.

2. **Zoho Cliq extension**
   - After installing the KPI Manager extension, users can open the KPI Assistant bot in Cliq.
   - Running `/kpi` calls a special backend API endpoint and returns a KPI snapshot with:
     - Completion rate
     - Tasks completed today
     - Points earned
   - This demonstrates how KPIs from the main app can surface directly in team conversations.

## Running the project locally

2. **Backend**

cd server
npm install
cp .env.example .env.development


3. **Frontend**

cd ../client
npm install
npm run dev


4. Open the frontend in your browser (e.g. `http://localhost:5173`) and log in with the configured demo credentials.

## Zoho Cliq setup

- Install the **KPI Manager** extension from the provided installation URL.
- Open **KPI Assistant** bot in Cliq.
- Use the `/kpi` command to get a KPI snapshot.
- The bot communicates with the deployed backend via a secure app key.

## Demo credentials

For Cliqtrix judging, demo credentials and deployment URLs are provided in the submission form so the judges can log in and explore the full application.

## License

This project is released under the MIT License.

1. **Clone the repository**

