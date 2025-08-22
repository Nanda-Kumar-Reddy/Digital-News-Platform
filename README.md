Setup Instructions:

1. Clone the Repository:

git clone https://github.com/your-username/news-app-backend.git
cd news-app-backend

2. Install Dependencies

Ensure you have Node.js (>=16) and npm installed.
npm install

3. Configure Environment Variables

Create a .env file in the root directory and add the following:

PORT=5000
JWT_SECRET=your_secret_key
DATABASE_URL=./newsapp.db
PORT → Port number for the server.
JWT_SECRET → Secret key for JWT authentication.
DATABASE_URL → SQLite database path.

4. Initialize Database:

Run the migration script to create required tables:
npm run migrate

This will create tables like:

users
articles
bookmarks
notifications
notification_settings ...

5. Start the Server:

For development (with nodemon):

npm run dev

For production:

npm start

Server will run at:
http://localhost:5000

6. API Endpoints:

Auth: /api/auth/register, /api/auth/login
Articles: /api/articles
Bookmarks: /api/bookmarks
Notifications: /api/notifications/settings, /api/notifications/register-device
E-Paper: /api/epaper/editions

For full API details, refer to the API Documentation in the repo.
