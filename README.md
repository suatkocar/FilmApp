# FilmApp (React Web Application)

## Home Page

![Home Page](screenshots/home-page.jpg)

## Film List Page

![Film List Page](screenshots/film-list-page.jpg)

## Project Overview

FilmApp is a React-based web application for managing and displaying a collection of films. The application fetches film data from an external API and displays it in a user-friendly interface. Users can search, filter, and view detailed information about each film.

## Features

- Display a list of films with detailed information
- Search films by title
- Filter films by various criteria
- Responsive design for mobile and desktop

## Technologies Used

- **Frontend:** React, Vite
- **Backend:** Node.js, Express (for proxy server)
- **Styling:** CSS, Tailwind CSS
- **API:** The Movie Database (TMDb) API

## Getting Started

### Prerequisites

- Node.js and npm (Node Package Manager)
- TMDb API key

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/suatkocar/FilmApp.git
   ```

2. Navigate to the project directory:

   ```bash
   cd FilmApp
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory and add your TMDb API key:

   ```env
   VITE_TMDB_API_KEY=your_api_key_here
   ```

### Development

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Build

To create a production build:

```bash
npm run build
```

The build output will be in the `dist` directory.

### Proxy Server

To run the proxy server:

```bash
node server.js
```

The proxy server will be available at `http://localhost:5000`.

## Usage

Access the application at `http://localhost:3000`.

## Project Structure

```plaintext
FilmApp
├── dist
│   ├── assets
│   │   ├── audio
│   │   ├── images
│   │   ├── index.css
│   │   ├── index.js
│   │   └── json
│   └── index.html
├── public
│   └── assets
│       ├── audio
│       ├── images
│       └── json
├── screenshots
│   ├── home-page.jpg
│   ├── film-list-page.jpg
├── src
│   ├── api
│   ├── components
│   ├── pages
│   ├── App.css
│   ├── App.jsx
│   ├── main.jsx
│   └── vite.config.js
├── .gitignore
├── package-lock.json
├── package.json
├── server.js
├── index.html
└── README.md
```

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Contact

For any inquiries, please contact me at suatkocar.dev@gmail.com.