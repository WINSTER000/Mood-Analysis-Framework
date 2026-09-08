# MoodAF — Mood Analysis Framework

> A web-based movie discovery and review analysis platform that combines movie data, search, watchlists, reviews, and sentiment analysis in a clean dark-themed interface.

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![TMDB](https://img.shields.io/badge/Data-TMDB-01B4E4?style=flat&logo=themoviedatabase&logoColor=white)](https://www.themoviedb.org/)

## Overview

**MoodAF (Mood Analysis Framework)** is a frontend movie companion designed to help users discover movies, explore detailed movie information, read reviews, analyze review sentiment, and maintain a personal watchlist.

The application uses the **TMDB API** for movie information and implements a lightweight client-side sentiment analysis system for movie reviews.
<img width="1280" height="865" alt="1769580463785" src="https://github.com/user-attachments/assets/b79ded5e-1dbb-4582-8253-75034323fc5a" /> <br>
<img width="1280" height="842" alt="1769580462840" src="https://github.com/user-attachments/assets/9f62f75b-1e49-48b0-a9e3-a46f2f0f1286" />

## Features

### 🎬 Movie Discovery
- Browse popular movies
- Explore trending movies
- View top-rated movies
- Browse movies by genre
- Explore new releases
- Search for movies by title

### 🔎 Movie Search & Details
- Movie poster and backdrop
- Rating and release information
- Synopsis
- Genres
- Director information
- Main cast
- Movie details
- User/retrieved reviews

### ❤️ Personal Watchlist
- Add movies to a personal watchlist
- Remove movies from the watchlist
- Watchlist item counter
- Watchlist statistics
- Watchlist data stored locally in the browser

<img width="1280" height="866" alt="1769580463025" src="https://github.com/user-attachments/assets/1f7dca5d-567f-4e51-93f6-f96b39d9a88c" />

### 📊 Review Sentiment Analysis
- Enter a movie review for analysis
- Classify reviews as:
  - Positive
  - Negative
  - Neutral
- Display confidence score
- Display positive, negative, and neutral score percentages
- Keep a short history of recent analyses
- Includes sample reviews for quick testing

### 🎨 User Interface
- Modern dark-themed interface
- Responsive movie cards and layouts
- Sticky navigation
- Search interface
- Tabbed movie details
- Loading states
- Lucide icons
- Responsive design for desktop and smaller screens

## How Sentiment Analysis Works

MoodAF currently uses a lightweight **client-side lexical sentiment approach** rather than a remote machine-learning inference service.

The analyzer checks the entered review against predefined positive and negative word lists, calculates normalized scores, and determines whether the review is positive, negative, or neutral.

The interface then presents the result as:

```text
Sentiment
Confidence
Positive Score
Negative Score
Neutral Score
```

> **Note:** The current sentiment analyzer is intended as a lightweight demonstration/analysis feature. It is not a trained NLP model and should not be treated as a production-grade sentiment classifier.

## Technology Stack

| Technology | Purpose |
|---|---|
| HTML5 | Page structure and application markup |
| CSS3 | Styling, layout, responsive design, and theme |
| JavaScript (ES6+) | Application logic and UI interactions |
| TMDB API | Movie data, posters, credits, and reviews |
| Lucide | Interface icons |
| LocalStorage | Persistent browser-side watchlist data |

## Project Structure

```text
Mood-Analysis-Framework/
│
├── .github/
│   └── workflows/
│
├── imgs/
│   └── favicon.png
│
├── src/
│   ├── css/
│   │   ├── styles.css
│   │   └── reviews.css
│   │
│   └── js/
│       ├── script.js
│       └── reviews.js
│
├── index.html
├── README.md
└── ...
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/WINSTER000/Mood-Analysis-Framework.git
cd Mood-Analysis-Framework
```

### 2. Run the website

This is a frontend web application, so no Node.js, Python, database, or package installation is required for the basic project.

You can open:

```text
index.html
```

directly in a browser.

For a more reliable local development experience, use a local web server.

#### VS Code Live Server

Install the **Live Server** extension in VS Code and open `index.html` with:

```text
Right Click → Open with Live Server
```

#### Python local server

If Python is installed:

```bash
python -m http.server 5500
```

Then open:

```text
http://localhost:5500
```

## TMDB API Configuration

MoodAF retrieves movie information from **The Movie Database (TMDB)** API, including movie listings, search results, details, credits, posters, and reviews.

You will need a TMDB API key for API requests.

### Important Security Note

The current project contains the TMDB API key in the frontend JavaScript configuration.

For a public production deployment, **do not expose a private API credential directly in client-side source code**.

A safer production architecture is:

```text
Browser
   │
   ▼
Your Backend / API Proxy
   │
   ▼
TMDB API
```

This allows the TMDB credential to remain on the server instead of being publicly exposed in browser JavaScript.

If you continue using a frontend-only architecture, configure the API key according to TMDB's current API-key and usage requirements and restrict the key where possible.

## Running on GitHub Pages

Because MoodAF is a static frontend application, it can be hosted using GitHub Pages.

General steps:

1. Push the project to GitHub.
2. Open the repository's **Settings**.
3. Open **Pages**.
4. Select the deployment source/branch.
5. Select the repository root if prompted.
6. Save the configuration.
7. GitHub will provide the published website URL.

## Application Flow

```text
                 ┌─────────────────────┐
                 │      MoodAF UI      │
                 └──────────┬──────────┘
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
   Movie Discovery      Movie Search      Watchlist
          │                 │                 │
          └─────────────────┼─────────────────┘
                            ▼
                       TMDB API
                            │
                            ▼
                    Movie Information
                            │
                            ▼
                  Reviews & Movie Details
                            │
                            ▼
                 Sentiment Analysis
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
          Positive       Neutral        Negative
```

## Main Application Sections

### Home

The home page provides movie discovery through categories such as popular, trending, and top-rated movies.

### Movie Details

Selecting a movie opens a detailed view containing the movie overview, genres, cast, director information, reviews, and additional movie details.

### Reviews

The review section allows users to inspect movie reviews and use the sentiment analyzer to classify review text.

### Watchlist

The watchlist provides a personal collection of movies selected by the user. Watchlist data is stored in browser `localStorage`.

## Browser Storage

MoodAF uses browser `localStorage` for client-side persistence.

The watchlist is stored locally, which means:

- No user account is required for the watchlist.
- Watchlist data is specific to the browser/device.
- Clearing browser storage can remove saved watchlist data.
- The watchlist is not synchronized between devices.

## External Services

### The Movie Database (TMDB)

Movie information and media metadata are provided through TMDB.

TMDB:
https://www.themoviedb.org/

The application is not endorsed or certified by TMDB.

### Lucide

MoodAF uses Lucide icons through its browser-delivered library.

Lucide:
https://lucide.dev/

## Deployment

MoodAF is suitable for static hosting platforms such as:

- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages
- Any standard static web server

For production deployment, review the **TMDB API configuration and credential handling** before publishing the site publicly.

## Limitations

The current version has some frontend-oriented limitations:

- Watchlists are stored locally rather than in a user account/database.
- Sentiment analysis uses predefined word lists rather than a trained NLP model.
- Sentiment scores are intended for demonstration/analysis purposes.
- TMDB API availability and limits depend on TMDB.
- A frontend-only TMDB integration exposes the configured client-side API credential.

## Future Improvements

Possible future enhancements include:

- User authentication
- Cloud-synchronized watchlists
- A backend API layer
- Secure server-side TMDB API handling
- A trained NLP sentiment model
- More advanced emotion classification
- Personalized movie recommendations
- Review filtering and sorting
- Pagination and infinite scrolling
- User ratings and reviews
- Movie comparison tools
- Progressive Web App support

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch:

```bash
git checkout -b feature/your-feature
```

3. Make your changes.
4. Test the application.
5. Commit your changes:

```bash
git add .
git commit -m "Add: your feature"
```

6. Push the branch:

```bash
git push origin feature/your-feature
```

7. Open a Pull Request.

## License

No license is currently specified in the repository.

If you plan to distribute or accept external contributions, consider adding an appropriate open-source license such as MIT.

## Author

**WINSTER000**

GitHub:
https://github.com/WINSTER000

## Repository

Source code:

https://github.com/WINSTER000/Mood-Analysis-Framework

---

<p align="center">
  Made with ❤️ for movie enthusiasts.
</p>
