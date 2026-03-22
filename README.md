# Financial Records Dashboard 📊

A full-stack web application for managing financial records. This dashboard features a highly interactive data grid with real-time mathematical calculations, custom dynamic filtering, and document upload capabilities.

## ✨ Features

- **Full CRUD Operations:** Create, Read, Update, and Delete financial records seamlessly.
- **Advanced Data Grid:** Powered by AG Grid for a professional, enterprise-level user experience.
- **Dynamic Math Engine:** Instantly calculates and pins the Total (SUM) and Average (AVG) to the bottom of the grid. Updates automatically when data is edited, added, deleted, or filtered.
- **Smart Categorization:** Automatically assigns tier categories (A, B, or C) based on the dollar amount entered.
- **Document Management:** Upload, view, and replace files (PDF, JPG, JPEG) directly inside the grid rows.
- **Custom UI/UX:** Features a modern, responsive design system with custom dropdown filters, interactive hover states, and intuitive focus rings.

## 🛠️ Tech Stack

**Frontend:**
- React.js
- AG Grid (Community Version 33)
- Axios (for API requests)
- Custom CSS Design System

**Backend:**
- Node.js
- Express.js
- Multer (for handling file uploads)
- File System (`data.json` for local storage)
- CORS

## 🚀 How to Run Locally

### 1. Start the Backend
Open a terminal, navigate to the backend folder, install dependencies, and start the server:
\`\`\`bash
cd backend
npm install
node server.js
\`\`\`
*The server will run on http://localhost:5000*

### 2. Start the Frontend
Open a second, separate terminal, navigate to the frontend folder, install dependencies, and start the React app:
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`
*The application will open in your browser (usually http://localhost:5173).*