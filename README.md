
# Spotify Integration Project 🎵

This project demonstrates the integration of Spotify's API to create a simple web app for authenticating users and interacting with their Spotify account.

---

## 📖 Description

This app allows users to log in with their Spotify account and perform basic operations, such as retrieving their user profile. It’s a learning project aimed at exploring OAuth 2.0 and API calls in a JavaScript/Node.js environment.

---

## ✨ Features

- Login with Spotify using OAuth 2.0
- Exchange authorization codes for access tokens
- Fetch user profile details via Spotify's API

---

## ⚙️ Setup Instructions

Follow these steps to set up the project locally:

### Prerequisites
1. Ensure you have Node.js installed:
   ```bash
   node -v
   npm -v
   ```
2. A Spotify Developer account with an app created. Obtain your **Client ID** and **Client Secret**.

---

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/spotify-integration-project.git
   cd spotify-integration-project
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up a `.env` file in the `blindspot-backend` directory with your Spotify credentials:
   ```env
   CLIENT_ID=<Your_Spotify_Client_ID>
   CLIENT_SECRET=<Your_Spotify_Client_Secret>
   REDIRECT_URI=http://localhost:3000/callback
   ```

4. Start the server:
   ```bash
   node server.js
   ```

5. Open the app in your browser:
   ```
   http://localhost:3000
   ```

---

## 🚀 Usage

1. Click the **Login with Spotify** button.
2. Grant permissions on the Spotify login page.
3. After redirection, view the logged-in user details in the console or the app.

---

## 🛠️ Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **API**: Spotify Web API
- **Authentication**: OAuth 2.0

---

## 🌱 Future Enhancements

- Add support for fetching user playlists.
- Display top tracks and artists.
- Implement token refresh for seamless experience.

---

## 🤝 Contributing

Contributions are welcome! To contribute:
1. Fork the project.
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add your message here"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a pull request.

---

## 📜 License

This project is licensed under the MIT License. See `LICENSE` for more details.
