# AWOL America Awards Nomination Platform

A comprehensive, dynamic web application designed to handle the end-to-end lifecycle of the AWOL America Awards. Built with a modern tech stack, this platform enables users to nominate candidates, cast votes securely, and allows administrators to oversee every phase of the event through a powerful backend system.

## 🚀 Key Features

### User Experience
* **Secure Authentication:** Passwordless magic links and robust email login via Supabase.
* **Phase-Based Access:** The platform dynamically adapts its UI depending on the current phase (Announcement, Nominations, Voting, Results).
* **Interactive Voting Center:** Users can browse categories, search nominees, view dynamic voting progress, and cast secure votes.
* **Guestbook:** A community message board for congratulations and event discussions.

### 🛡️ Admin Dashboard
The system features a heavily customized developer console and admin panel for comprehensive event management:
* **Category Management:** Create, edit, delete, and manually re-arrange categories using drag-and-drop-style controls. Includes dynamic Grid & List view toggles, advanced sorting, and filtering.
* **Nomination Control:** Approve or decline user-submitted nominations, automatically converting them into official nominees upon approval.
* **Nominee & Grouping Logic:** Create robust groups/affiliations for nominees to prevent vote-splitting and audit grouping modifications.
* **Real-time Analytics:** View voting trends and charts to monitor platform engagement instantly.
* **Timeline Customization:** Control the precise start and end times for all phases of the awards.

## 🛠️ Tech Stack

* **Frontend:** React, Vite, TypeScript, Tailwind CSS, Lucide React (Icons), Recharts (Data Visualization)
* **Backend:** Supabase (PostgreSQL Database, Real-time Subscriptions, Row Level Security, Edge Functions)

## 💻 Running Locally

### Prerequisites
* Node.js (v18+)
* A Supabase project

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/dreamdaytech/AWO-US-Nomination-.git
cd AWO-US-Nomination-
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory and add your Supabase credentials. Do not commit this file.

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Initialization

To set up the database schema with the correct structure and security, you must execute the SQL migration scripts located in your project artifacts directory directly in your Supabase SQL Editor. These include:
1. Roles and Admin user setup (`roles_migration.sql`)
2. Categories setup with the custom `order_index` (`categories_migration.sql`)
3. Achievements and Grouping audit logs.

### 4. Start the Application

```bash
npm run dev
```

The app will start on your local development server, typically `http://localhost:5173`.

---
*Developed for DreamDay Technology.*
