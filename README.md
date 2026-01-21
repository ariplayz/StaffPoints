# 📊 Staff Points Slips

A modern, mobile-optimized web application for tracking staff performance through points and hours. Built with **React 19**, **Vite**, and **Express 5**, this tool provides real-time data entry, chronological tracking, and visual performance analytics with a secure user system and a professional dark green theme.

---

## ✨ Features

- **🔐 Secure Authentication**: Role-based access control (Admin/User) with persistent sessions.
- **📱 Mobile Optimized**: Fully responsive design with a dedicated mobile interface and hamburger menu.
- **🎨 Modern Dark Theme**: Professional dark green aesthetic (`#016c4a`) optimized for low-light environments.
- **🛠️ Admin Dashboard**: Manage user accounts and the official staff directory.
- **✍️ Enhanced Data Entry**: Autocomplete suggestions for staff names and local-timezone safe date picking.
- **📅 Comprehensive Table View**:
  - Horizontal scrolling through chronological records.
  - Sticky staff name columns for easy tracking.
  - Highlighting for the current day.
- **📈 Dynamic Performance Graphs**:
  - Individual staff member selection.
  - Bar graph visualization of points over time.
- **📊 Weekly Statistics**: Automatic calculation of total points, hours, and averages for the last 7 days.
- **🔄 Auto-Refresh**: Background data synchronization every 20 seconds.
- **💾 Persistent Storage**: Reliable JSON-based data storage with Docker volume persistence for points, users, and staff.

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
- **Backend**: [Node.js](https://nodejs.org/), [Express 5](https://expressjs.com/)
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
