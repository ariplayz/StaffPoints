# 📊 Staff Points Slips

A modern, mobile-optimized web application for tracking staff performance through points and hours. Built with **React 19**, **Vite**, and **Express 5**, this tool provides real-time data entry, chronological tracking, and visual performance analytics with a secure user system and a professional dark green theme.

---

## ✨ Features

- **🔐 Secure Authentication**: Role-based access control (Admin/User) using **JSON Web Tokens (JWT)** and **bcrypt.js** password hashing. Legacy plain-text passwords are automatically migrated on first run.
- **📱 Mobile Optimized**: Fully responsive design with a dedicated mobile interface and hamburger menu.
- **🎨 Modern Dark Theme**: Professional dark green aesthetic (`#016c4a`) optimized for low-light environments.
- **🛠️ Admin Dashboard**: Manage user accounts and the official staff directory.
- **✍️ Enhanced Data Entry**: Autocomplete suggestions for staff names and local-timezone safe date picking.
- **📅 Comprehensive Table View**:
  - Horizontal scrolling through chronological records.
  - Sticky staff name columns for easy tracking.
  - Highlighting for the current day.
- **📈 Dynamic Performance Graphs**:
  - **Global Statistics**: Real-time bar graphs for *Students at Study*, *Avg Pts/Hour*, *Total Points*, and *Total Hours* over the last 14 days.
  - **Individual Tracking**: Select any staff member to visualize their specific points performance over time.
- **📊 Weekly Statistics**: Real-time metrics in View Mode:
  - **Students at Study**: Count of unique staff members with slips in the last 7 days.
  - **Avg Pts/Hour**: Productivity benchmark calculated across all staff for the week.
  - **Total Points & Hours**: Sum of all recorded effort for the last 7 days.
- **🔄 Auto-Refresh & Persistence**: 
  - Background data synchronization every 20 seconds.
  - Remembers your current page and selected staff member on refresh.
- **💾 Persistent Storage**: Reliable JSON-based data storage with Docker volume persistence for points, users, and staff.

---

## 🔐 Security & Data Persistence

### Authentication
The system uses a modern security stack:
- **JWT (JSON Web Tokens)**: All API requests are authenticated via Bearer tokens. Roles are signed on the server and verified for every protected endpoint.
- **Password Hashing**: Passwords are never stored in plain text. They are hashed using **bcrypt.js** with a salt factor of 10.
- **Auto-Migration**: If you are upgrading from an older version, the server will automatically detect and hash existing plain-text passwords on the first start, ensuring zero data loss and immediate security upgrades.

### Data Persistence
Data is preserved even when the container is stopped or removed:
- **Docker Volumes**: A named volume `staffpoints_data` maps to `/data` in the container.
- **File-based DB**: Uses `data.json`, `users.json`, and `staff.json` for lightweight, human-readable storage that doesn't require a heavy database engine.
- **State Persistence**: User preferences (active page, selected staff in graphs) are stored in the browser's `localStorage` and synchronized with the backend session.

---

## 🔐 Authentication & Roles

The application features two levels of access:

- **👤 User**: Can enter new points slips and view performance data/graphs.
- **🔑 Admin**: Full access, including the **Admin Management** page to manage users and the staff list.

### Default Credentials
- **Username**: `admin`
- **Password**: `Password01`

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/)
- **Backend**: [Node.js](https://nodejs.org/), [Express 5](https://expressjs.com/), [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken), [bcryptjs](https://www.npmjs.com/package/bcryptjs)
- **Styling**: Modern Dark Green Theme using Pure CSS.
- **Deployment**: [Docker](https://www.docker.com/), [Docker Compose](https://docs.docker.com/compose/)

---

## 🚀 Quick Start (Docker)

The recommended way to run the production environment:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ariplayz/StaffPoints.git
   cd StaffPoints
   ```

2. **Launch with Docker Compose**:
   ```bash
   docker compose up -d --build
   ```

3. **Access the app**:
   Open [http://localhost](http://localhost) and log in with the default admin credentials.

### 🔄 Updating the Application
When pulling new updates from Git, always include the `--build` flag to ensure the latest code is compiled:
```bash
git pull
docker compose up -d --build
```

> **Note**: Your data is safely stored in a Docker volume (`staffpoints_data`). Updating the app **will not delete your records** (points, users, or staff).

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
# May require root/sudo for port 80
npm run server
```

---

## 📂 Project Structure

- `src/`: React frontend source code.
- `server/`: Express backend (API and static file serving).
- `dist/`: Built production files.
- **Data Files** (persisted in `/data` via Docker):
  - `data.json`: Points slips records.
  - `users.json`: User accounts and credentials.
  - `staff.json`: Official list of staff members.

---

## 🛡️ License

This project is open-source and available under the [GNU GPL v3](https://www.gnu.org/licenses/gpl-3.0.txt).
