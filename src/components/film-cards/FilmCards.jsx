import { useState, useEffect, useCallback } from "react";
import Modal from "../modal/Modal";
import tmdbApi from "../../api/tmdbApi";
import filmApi from "../../api/filmApi";
import "./FilmCards.css";
import SearchBox from "../search-box/SearchBox";

function FilmCards() {
  const [allFilms, setAllFilms] = useState([]);
  const [films, setFilms] = useState([]);
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const filmsPerPage = 24;
  const [prevSearchQuery, setPrevSearchQuery] = useState("");

  // Update previous search query upon change
  useEffect(() => {
    setPrevSearchQuery(searchQuery);
  }, [searchQuery]);

  // Async function to fetch film details
  const fetchFilmDetails = useCallback(async (films) => {
    return Promise.all(
      films.map(async (film) => {
        try {
          const searchResults = await tmdbApi.fetchMovieData(
            film.title,
            film.year
          );
          if (!searchResults || searchResults.length === 0) {
            return { ...film, poster: "https://via.placeholder.com/500" };
          }
          const details = await tmdbApi.fetchMovieDetails(searchResults[0].id);
          return {
            ...film,
            poster: details.poster_path
              ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
              : "https://via.placeholder.com/500",
            trailerKey: tmdbApi.getTrailerKey(details.videos),
          };
        } catch (error) {
          console.error("Error fetching additional film details:", error);
          return { ...film, poster: "https://via.placeholder.com/500" };
        }
      })
    );
  }, []);

  // Fetch initial set of films
  const fetchInitialFilms = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await filmApi.getAllFilms();
      setAllFilms(data);
      if (data.length > 0) {
        const initialFilms = data.slice(0, filmsPerPage);
        const detailedFilms = await fetchFilmDetails(initialFilms);
        setFilms(detailedFilms);
        setHasMore(data.length > filmsPerPage);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching films:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [filmsPerPage, fetchFilmDetails]);

  // Initial call to fetch films
  useEffect(() => {
    fetchInitialFilms();
  }, [fetchInitialFilms]);

  // Search films based on user query
  const searchFilms = useCallback(
    async (query) => {
      setLoading(true);
      try {
        // Try-Catch block to ensure the query is passed as an object with a 'query' key
        const results = await filmApi.searchFilms({ query });
        if (results.length === 0) {
          setFilms([]);
          setHasMore(false);
          setLoading(false);
          return;
        }
        const detailedFilms = await fetchFilmDetails(results);
        setFilms(detailedFilms);
        setHasMore(results.length > filmsPerPage);
      } catch (error) {
        console.error("Error searching films:", error);
      } finally {
        setLoading(false);
      }
    },
    [fetchFilmDetails]
  );

  // Initialise search or restore initial films on query change
  useEffect(() => {
    if (searchQuery === "" && prevSearchQuery) {
      const initialFilms = allFilms.slice(0, filmsPerPage);
      fetchFilmDetails(initialFilms).then(setFilms);
      setHasMore(allFilms.length > filmsPerPage);
    } else if (searchQuery) {
      searchFilms(searchQuery);
    }
  }, [searchQuery, allFilms, searchFilms]);

  // Load more films handler
  const handleLoadMore = async () => {
    if (!loading && hasMore) {
      setLoading(true);
      const newPage = page + 1;
      const startIndex = filmsPerPage * (newPage - 1);
      const endIndex = startIndex + filmsPerPage;
      const newFilmsBatch = allFilms.slice(startIndex, endIndex);
      const detailedFilms = await fetchFilmDetails(newFilmsBatch);
      setFilms((prevFilms) => [...prevFilms, ...detailedFilms]);
      setPage(newPage);
      setHasMore(endIndex < allFilms.length);
      setLoading(false);
    }
  };

  // Modal open handler
  const openModal = (film) => {
    setSelectedFilm(film);
    setModalVisible(true);
  };

  // Modal close handler
  const closeModal = () => {
    setSelectedFilm(null);
    setModalVisible(false);
  };

  return (
    <div className="Film-cards-area">
      {/* Loading overlay */}
      {loading && (
        <div className="loading-overlay visible">
          <div className="spinner"></div>
        </div>
      )}

      {/* Search box */}
      <SearchBox onSearch={(query) => setSearchQuery(query)} />

      {/* Film cards container */}
      <div className="film-container">
        {films.map((film, index) => (
          <div
            key={`${film.id}-${index}`}
            className="film-card"
            onClick={() => openModal(film)}
          >
            <img
              src={film.poster ?? "https://via.placeholder.com/500"}
              alt={`${film.title} Poster`}
              className="filmPoster"
            />
            <div className="film-details">
              <p>{film.title}</p>
              <p>Year: {film.year}</p>
              <p>Director: {film.director}</p>
              <p>Stars: {film.stars}</p>
            </div>
            <div className="playButton">▶</div>
          </div>
        ))}
      </div>

      {/* Modal for showing trailer */}
      {modalVisible && selectedFilm && (
        <Modal
          show={modalVisible}
          onClose={closeModal}
          videoId={selectedFilm.trailerKey}
        />
      )}

      {/* Conditionally render 'Load More' button */}
      {hasMore && !loading && !searchQuery && (
        <button className="load-more-button" onClick={handleLoadMore}>
          Load More
        </button>
      )}
    </div>
  );
}

export default FilmCards;