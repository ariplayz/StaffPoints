# 📊 Staff Points Slips

A modern, lightweight web application for tracking staff performance through points and hours. Built with **React 19**, **Vite**, and **Express 5**, this tool provides real-time data entry, chronological tracking, and visual performance analytics.

---

## ✨ Features

- **🚀 Real-time Data Entry**: Quickly enter staff names, points, and hours worked.
- **📅 Comprehensive Table View**:
  - Horizontal scrolling through 30 days of records.
  - Sticky staff name columns for easy tracking.
  - Visual distinction for the current day.
- **📈 Dynamic Performance Graphs**:
  - Individual staff member selection.
  - Bar graph visualization of points over time.
- **📊 Weekly Statistics**: Automatic calculation of total points, hours, and averages for the last 7 days.
- **🔄 Auto-Refresh**: Background data synchronization every 20 seconds.
- **💾 Persistent Storage**: Reliable JSON-based data storage with Docker volume persistence.

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/)
- **Backend**: [Node.js](https://nodejs.org/), [Express 5](https://expressjs.com/)
- **Styling**: Pure CSS (Flexbox/Grid)
- **Deployment**: [Docker](https://www.docker.com/), [Docker Compose](https://docs.docker.com/compose/)

---

## 🚀 Quick Start (Docker)

The fastest way to get the production environment running:

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd staffpointsslips
   ```

2. **Launch with Docker Compose**:
   ```bash
   docker compose up -d --build
   ```

3. **Access the app**:
   Open [http://localhost](http://localhost) in your browser.

> **Note**: Your data is safely stored in a Docker volume (`staffpoints_data`). Rebuilding the container will update the app code but **will not delete your points slips**.

---

## 👨‍💻 Local Development

### Prerequisites
- Node.js 22+
- npm

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server (Frontend)
```bash
npm run dev
```
The frontend will run at `http://localhost:5173`.

### 3. Start API Server (Backend)
```bash
# May require sudo if port 80 is used
npm run server
```

### 4. Build for Production
```bash
npm run build
```

---

## 📂 Project Structure

- `src/`: React frontend source code.
- `server/`: Express backend (API and static file serving).
- `dist/`: Built production files (generated after `npm run build`).
- `data.json`: Local data storage file (fall-back if `/data/data.json` is unavailable).

---

## 🛡️ License

This project is open-source and available under the [MIT License](LICENSE).
