# DISCORD X 

> The ultimate industrial-grade discord bio and friend request management system.

![Discord X Branding](https://i.imgur.com/aaWKLXX.png)

**Discord X** is a high-performance, aesthetically pleasing "Link-in-Bio" style application designed specifically for Discord power users. It features an industrial, black-and-white monochromatic design, custom media support, and a local-first architecture using IndexedDB for handling large media files without external dependencies.

## 🚀 Features

*   **Industrial UI/UX**: Custom cursor trails, glitch animations, and a strict formal aesthetic.
*   **Media Heavy**: Support for 500MB+ avatars and backgrounds (MP4/WebM) via IndexedDB.
*   **Spam Protection**: Smart local tracking to prevent repeated friend request spamming.
*   **Audit Logging**: Internal system logs for security and tracking advanced interactions.
*   **Audio Integration**: Automatic music playback and video audio synchronization.
*   **Gamification**: Badge system for user engagement (First Contact, Popular, Icon).

## 🛠 Tech Stack

*   **Frontend**: React 18 (TypeScript)
*   **Styling**: Tailwind CSS + Custom Animations
*   **Icons**: Lucide React
*   **Database**: Native IndexedDB (Client-side NoSQL)
*   **Build Tool**: Vite

## 📦 Installation & Setup

To run this project locally, follow these steps:

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/discord-x.git
    cd discord-x
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:5173`.

4.  **Build for production**
    ```bash
    npm run build
    ```

## 🏗 Deployment

This project is a Single Page Application (SPA). It can be deployed easily to static hosts like **Vercel**, **Netlify**, or **Cloudflare Pages**.

### Vercel Deployment
1.  Push your code to GitHub.
2.  Import the project in Vercel.
3.  Framework Preset: `Vite`.
4.  Build Command: `npm run build`.
5.  Output Directory: `dist`.

## 🔒 Security Note

This application currently uses **Client-Side Storage (IndexedDB)**. This means:
*   Data is stored on the user's device.
*   There is no central backend server.
*   To make your profile visible to *others* on the internet, you would typically need to integrate a cloud database (like Firebase or Supabase). This repo is configured as a standalone progressive web app prototype.

---

**STATUS**: SYSTEM OPERATIONAL
**VERSION**: 2.0.0
