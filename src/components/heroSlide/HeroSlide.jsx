import { useState, useEffect, useCallback, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { Autoplay } from "swiper/modules";
import "swiper/swiper-bundle.css";
import "swiper/css/autoplay";
import "./HeroSlide.css";
import tmdbApi from "../../api/tmdbApi";
import filmApi from "../../api/filmApi";
import Modal from "../modal/Modal";

// Integrates the Autoplay module into Swiper's configuration for automatic sliding
SwiperCore.use([Autoplay]);

const HeroSlide = () => {
  const [films, setFilms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentTrailerKey, setCurrentTrailerKey] = useState("");
  const [expandedPoster, setExpandedPoster] = useState(null);
  const [posterTransform, setPosterTransform] = useState("");
  const swiperRef = useRef(null);

  // Fetching and processing film data for display
  const fetchFilmsAndDetails = useCallback(async () => {
    let { data } = await filmApi.getAllFilms();
    data = data.sort(() => 0.5 - Math.random()).slice(0, 10);
    const filmsWithDetails = await Promise.all(
      data.map(async (film) => {
        try {
          const searchResults = await tmdbApi.fetchMovieData(
            film.title,
            film.year
          );
          if (searchResults.length > 0) {
            const details = await tmdbApi.fetchMovieDetails(
              searchResults[0].id
            );
            return {
              ...film,
              backdrop: `https://image.tmdb.org/t/p/original${details.backdrop_path}`,
              poster: `https://image.tmdb.org/t/p/w500${details.poster_path}`,
              trailerKey: tmdbApi.getTrailerKey(details.videos),
            };
          }
        } catch (error) {
          console.error("Error fetching film details:", error);
        }
        return null; // Return null for failed API calls which are then filtered out
      })
    );
    setFilms(filmsWithDetails.filter((film) => film)); // Filter out null entries
  }, []);

  // Initiates data fetch on component mount
  useEffect(() => {
    fetchFilmsAndDetails();
  }, [fetchFilmsAndDetails]);

  // Handlers for modal and expanded posters
  const handleWatchTrailer = (trailerKey) => {
    setCurrentTrailerKey(trailerKey); // Set the trailer key for modal video play
    setShowModal(true); // Show the modal
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.autoplay.stop(); // Stop the swiper autoplay
    }
  };

  // Function to handle the expansion and transformation of the movie poster
  const handleExpandPoster = (poster, e) => {
    if (expandedPoster === poster) {
      setExpandedPoster(null); // Collapse the poster if it's already expanded
      setPosterTransform(""); // Reset transformations
      swiperRef.current.swiper.autoplay.start(); // Resume autoplay
    } else {
      const rect = e.target.getBoundingClientRect();
      const centerX = window.innerWidth / 2 - rect.left - rect.width / 2;
      const centerY = window.innerHeight / 2 - rect.top - rect.height / 2;
      setPosterTransform(`translate(${centerX}px, ${centerY}px) scale(1.5)`); // Center and zoom the poster
      setExpandedPoster(poster); // Set it as the currently expanded poster
      swiperRef.current.swiper.autoplay.stop(); // Stop autoplay
    }
  };

  // Key press event handler for closing expanded items or modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && expandedPoster) {
        setExpandedPoster(null);
        setPosterTransform("");
        swiperRef.current.swiper.autoplay.start();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [expandedPoster]);

  // Close the modal and reset relevant states
  const closeModal = () => {
    setShowModal(false);
    setExpandedPoster(null);
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.autoplay.start();
    }
  };

  return (
    <div className="heroSlide">
      <Swiper ref={swiperRef} slidesPerView={1} autoplay={{ delay: 4000 }}>
        {films.map((film, index) => (
          <SwiperSlide
            key={index}
            className="heroItem"
            style={{ backgroundImage: `url(${film.backdrop})` }}
          >
            <div
              className="posterSection"
              onClick={(e) => handleExpandPoster(film.poster, e)}
            >
              <img
                src={film.poster}
                alt={`${film.title} Poster`}
                className={`heroSlidefilmPoster ${expandedPoster === film.poster ? "expandedPoster" : ""
                  }`}
                style={{
                  transform:
                    expandedPoster === film.poster ? posterTransform : "",
                }}
              />
            </div>
            <div className="infoSection">
              <h2 className="filmTitle">{film.title}</h2>
              <p className="filmReview">{film.review}</p>
              <button
                className="WatchTrailerButton"
                onClick={() => handleWatchTrailer(film.trailerKey)}
              >
                Watch Trailer
              </button>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      {showModal && (
        <Modal
          show={showModal}
          onClose={closeModal}
          videoId={currentTrailerKey}
        >
          <iframe
            width="1280"
            height="720"
            src={`https://www.youtube.com/embed/${currentTrailerKey}?autoplay=1&mute=1`}
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          ></iframe>
        </Modal>
      )}
    </div>
  );
};

export default HeroSlide;