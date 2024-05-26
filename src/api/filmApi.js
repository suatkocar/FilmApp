import axiosClient from "./axiosClient";

// Defining a set of API utility functions for film operations,
// leveraging the pre-configured axiosClient which includes header management for content type.
const filmApi = {
  // Fetch all films, optionally specifying the response format.
  getAllFilms: (format = "json") => axiosClient.get(`/films?format=${format}`),

  // Retrieve a single film by its identifier, optionally specifying the response format.
  getFilmById: (id, format = "json") =>
    axiosClient.get(`/films/${id}?format=${format}`),

  // Create a new film entry with the provided film data, optionally specifying the response format.
  createFilm: (filmData, format = "json") =>
    axiosClient.post(`/films?format=${format}`, filmData),

  // Update an existing film entry by its identifier with provided update data, optionally specifying the response format.
  updateFilm: (id, updateData, format = "json") =>
    axiosClient.put(`/films/${id}?format=${format}`, updateData),

  // Delete a film by its identifier, optionally specifying the response format.
  deleteFilm: (id, format = "json") => {
    // Define header based on the format, handling content type specificity for deletion requests.
    const headers = {
      "Content-Type":
        format === "xml"
          ? "application/xml"
          : format === "json"
          ? "application/json"
          : "text/plain",
    };
    return axiosClient.delete(`/films/${id}?format=${format}`, { headers });
  },

  // Search films with broad parameters encapsulated in searchParams object.
  searchFilms: async (searchParams) => {
    // Append format explicitly to ensure the correct data handling on the server side.
    const params = new URLSearchParams({ ...searchParams, format: "json" });
    try {
      const response = await axiosClient.get(
        `/films/search?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      // Log and rethrow the error.
      console.error("Search Error:", error);
      throw error;
    }
  },

  // General search over all films with text query.
  searchFilmsGeneral: async (query) => {
    if (!query) return []; // Early return for empty query to prevent unnecessary requests.
    const params = new URLSearchParams({ query, type: "All", format: "json" });
    try {
      const response = await axiosClient.get(
        `/films/search?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      // Log and rethrow the error.
      console.error("General Search Error:", error);
      throw error;
    }
  },

  // Perform a field-specific search for films.
  searchFilmsByField: async (query, type) => {
    const params = new URLSearchParams({ type, query, format: "json" });
    try {
      const response = await axiosClient.get(
        `/films/search/?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      // Log and rethrow the error.
      console.error("Search By Field Error:", error);
      throw error;
    }
  },
};

export default filmApi;