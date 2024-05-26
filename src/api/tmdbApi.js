import axios from "axios";

// Constants for API key and base URL for The Movie Database (TMDb) API.
// This API key is stored in an environment variable for security.

const API_KEY = import.meta.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

// Create a configured instance of axios with base URL and default parameters
const tmdbApi = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
  },
});

// Async function to fetch movie data based on title and year with flexible year matching
// It filters the results based on the year range of 2 years before and after the given year
// Returns null if no matching results are found
const fetchMovieData = async (title, year) => {
  try {
    const encodedTitle = encodeURIComponent(title);
    const response = await tmdbApi.get(`/search/movie`, {
      params: {
        query: encodedTitle,
      },
    });

    const results = response.data.results;

    // Filter results to include only movies within a +/- 2 year range of the specified year
    const filteredResults = results.filter((movie) => {
      const movieYear = new Date(movie.release_date).getFullYear();
      return movieYear >= year - 2 && movieYear <= year + 2;
    });

    // Handle cases when no movies match the filter criteria
    if (filteredResults.length === 0) {
      console.log(
        `No matching results found for ${title} with close year match`
      );
      return null;
    }
    return filteredResults;
  } catch (error) {
    console.error(`Failed to fetch movie data for title: ${title}`, error);
    throw error;
  }
};

// Async function to fetch detailed data for a specific movie by ID
const fetchMovieDetails = async (movieId) => {
  try {
    // Request detailed information including related videos for the movie
    const response = await tmdbApi.get(`/movie/${movieId}`, {
      params: {
        append_to_response: "videos",
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch movie details for ID: ${movieId}`, error);
    throw error;
  }
};

// Helper function to extract the YouTube trailer key from movie detail data
const getTrailerKey = (videos) => {
  // Find a YouTube trailer video in the list of videos
  const trailer = videos?.results?.find(
    (video) => video.type === "Trailer" && video.site === "YouTube"
  );
  return trailer?.key || null;
};

// Export functions for external use
export default {
  fetchMovieData,
  fetchMovieDetails,
  getTrailerKey,
};