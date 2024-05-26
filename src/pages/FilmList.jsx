import { useState, useEffect, useCallback } from "react";
import { Table, Button, Modal, Form, Image, Row, Col } from "react-bootstrap";
import axiosClient from "./../api/axiosClient";
import FormatSelector from "./../components/format-selector/FormatSelector";
import filmApi from "./../api/filmApi";
import tmdbApi from "./../api/tmdbApi";
import { parseData } from "./../utils/parser";
import "./FilmList.css";
import CustomPagination from "../components/customPagination/CustomPagination";

const FilmList = () => {
  const [films, setFilms] = useState([]);
  const [displayedFilms, setDisplayedFilms] = useState([]);
  const [format, setFormat] = useState("json");
  const [searchType, setSearchType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 24;
  const [showModal, setShowModal] = useState(false);
  const [editFilm, setEditFilm] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchResults, setSearchResults] = useState([]); 
  const [loading, setLoading] = useState(false);

  // Fetch all films with API call
  const fetchAllFilms = useCallback(async () => {
    setLoading(true);
    try {
      const response = await filmApi.getAllFilms(format);
      const parsedFilms = parseData(response.data, format);
      setFilms(parsedFilms);
      setDisplayedFilms(parsedFilms.slice(0, pageSize));
      setTotalPages(Math.ceil(parsedFilms.length / pageSize));
    } catch (error) {
      console.error("Error fetching films:", error);
    } finally {
      setLoading(false);
    }
  }, [format, pageSize]);

  // Update displayed films when page changes
  const updateDisplayedFilms = useCallback(
    async (page) => {
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const currentFilms = films.slice(start, end);
      const filmsWithPosters = await fetchFilmPosters(currentFilms);
      setDisplayedFilms(filmsWithPosters);
    },
    [films, pageSize]
  );

  useEffect(() => {
    updateDisplayedFilms(currentPage);
  }, [currentPage, films, format, updateDisplayedFilms]);

  const fetchFilmPosters = async (films) => {
    return Promise.all(
      films.map(async (film) => {
        try {
          const searchResults = await tmdbApi.fetchMovieData(
            film.title,
            film.year
          );

          const match =
            searchResults.find(
              (m) =>
                Math.abs(new Date(m.release_date).getFullYear() - film.year) <=
                1
            ) || searchResults[0];

          if (match) {
            const details = await tmdbApi.fetchMovieDetails(match.id);
            return {
              ...film,
              posterUrl:
                details && details.poster_path
                  ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
                  : "https://via.placeholder.com/150",
            };
          }
        } catch (error) {
          console.error("Error fetching film poster:", error);
        }
        return { ...film, posterUrl: "https://via.placeholder.com/150" };
      })
    );
  };

  useEffect(() => {
    if (searchQuery === "") {
      setSearchResults([]);
      fetchAllFilms(format);
    }
  }, [searchQuery, format, fetchAllFilms]);

  // Clear search results and queries
  const clearSearchResults = () => {
    setSearchQuery("");
    setSearchType("All");
    setSearchResults([]);
    fetchAllFilms(format);
  };

  const handleSearchResults = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setDisplayedFilms([]);
      return;
    }
    setLoading(true);

    try {
      let results;
      if (searchType === "All") {
        results = await filmApi.searchFilmsGeneral(searchQuery);
      } else {
        results = await filmApi.searchFilmsByField(searchQuery, searchType);
      }

      if (!Array.isArray(results) || results.length === 0) {
        console.error("No results found or an unexpected response:", results);
        setSearchResults([]);
        setDisplayedFilms([]);
        return;
      }

      const parsedResults = parseData(results, "json");
      const filmsWithPosters = await fetchFilmPosters(parsedResults);
      setSearchResults(filmsWithPosters);
      setDisplayedFilms(filmsWithPosters);
    } catch (error) {
      console.error("Handling search error:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, searchType]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    updateDisplayedFilms(page, films);
  };

  const handleEdit = (film) => {
    if (!film) {
      console.error("Edit error: No film data");
      return;
    }
    setEditFilm(film);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    console.log(`Attempting to delete film with id ${id}`);
    setDeleteConfirm(true);
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await filmApi.deleteFilm(deleteId, format);
      fetchAllFilms(format);
      setDeleteConfirm(false);
    } catch (error) {
      console.error("Failed to delete film:", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const isNewFilm = !editFilm.id;
    if (!editFilm || !editFilm.title) {
      alert("Title is required");
      return;
    }

    const filmData = {
      title: editFilm.title,
      year: parseInt(editFilm.year, 10),
      director: editFilm.director,
      stars: editFilm.stars,
      review: editFilm.review,
    };

    try {
      let payload;
      if (format === "json") {
        payload = JSON.stringify(filmData);
      } else if (format === "xml") {
        payload = `<film>
                    <title>${filmData.title}</title>
                    <year>${filmData.year}</year>
                    <director>${filmData.director}</director>
                    <stars>${filmData.stars}</stars>
                    <review>${filmData.review}</review>
                </film>`;
      } else if (format === "text") {
        payload = `Title: ${filmData.title}\nYear: ${filmData.year}\nDirector: ${filmData.director}\nStars: ${filmData.stars}\nReview: ${filmData.review}`;
      }

      if (!isNewFilm && editFilm.id) {
        await axiosClient.put(
          `/films/${editFilm.id}?format=${format}`,
          payload,
          {
            headers: {
              "Content-Type":
                format === "json"
                  ? "application/json"
                  : format === "xml"
                  ? "application/xml"
                  : "text/plain",
            },
          }
        );
      } else {
        await axiosClient.post(`/films?format=${format}`, payload, {
          headers: {
            "Content-Type":
              format === "json"
                ? "application/json"
                : format === "xml"
                ? "application/xml"
                : "text/plain",
          },
        });
      }
      setShowModal(false);
      fetchAllFilms();
    } catch (error) {
      console.error(
        "Failed to save film:",
        error.response ? error.response.data : error.message
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePosterClick = (film) => {
    const modalBackdrop = document.createElement("div");
    modalBackdrop.id = "modalBackdrop";
    modalBackdrop.style.position = "fixed";
    modalBackdrop.style.top = "0";
    modalBackdrop.style.left = "0";
    modalBackdrop.style.width = "100%";
    modalBackdrop.style.height = "100%";
    modalBackdrop.style.backgroundColor = "rgba(0, 0, 0, 0.75)";
    modalBackdrop.style.zIndex = "1040";
    modalBackdrop.style.display = "flex";
    modalBackdrop.style.justifyContent = "center";
    modalBackdrop.style.alignItems = "center";

    const clone = document.createElement("img");
    clone.src = film.posterUrl;
    clone.style.maxWidth = "600px";
    clone.style.maxHeight = "100%";
    clone.style.transform = "scale(1.3)";
    clone.style.transition = "transform 0.5s ease";
    document.body.appendChild(modalBackdrop);
    modalBackdrop.appendChild(clone);

    const closePoster = () => {
      document.body.removeChild(modalBackdrop);
    };

    modalBackdrop.addEventListener("click", closePoster);
    clone.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    document.addEventListener(
      "keydown",
      (e) => {
        if (e.key === "Escape") {
          closePoster();
          document.removeEventListener("keydown", closePoster);
        }
      },
      { once: true }
    );
  };

  return (
    <div className="filmListContainer">
      {loading && (
        <div className="loading-overlay visible">
          <div className="spinner"></div>
        </div>
      )}
      <h1>Film List</h1>
      <div className="formatSelector">
        <FormatSelector format={format} setFormat={setFormat} />
      </div>
      <div className="add-new-film-button">
        <Button
          className="addButton"
          variant="success"
          onClick={() => handleEdit({})}
        >
          Add New Film
        </Button>
      </div>

      <Row className="search-bar align-items-center">
        <Col md={3}>
          <div className="custom-select-wrapper">
            <Form.Control
              as="select"
              className="custom-select"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
            >
              <option value="All">All</option>
              <option value="ID">ID</option>
              <option value="Title">Title</option>
              <option value="Year">Year</option>
              <option value="Director">Director</option>
              <option value="Stars">Stars</option>
            </Form.Control>
          </div>
        </Col>
        <Col md={9} className="d-flex">
          <Form.Control
            type="text"
            placeholder="Search for films..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearchResults();
              }
            }}
          />

          <Button variant="primary" onClick={handleSearchResults}>
            Search
          </Button>
          <Button
            variant="warning"
            onClick={clearSearchResults}
            className="ms-2"
          >
            Clear Search Results
          </Button>
        </Col>
      </Row>

      {searchResults.length > 0 && (
        <>
          <h2>Search Type: {searchType}</h2>
          <h2>Search Results for: &quot;{searchQuery}&quot;</h2>
          <h2>{displayedFilms.length} films found.</h2>
        </>
      )}

      {searchResults.length === 0 && (
        <CustomPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      <Table className="table">
        <thead>
          <tr>
            <th className="poster">Poster</th>
            <th className="id">ID</th>
            <th className="title">Title</th>
            <th className="year">Year</th>
            <th className="director">Director</th>
            <th className="stars">Stars</th>
            <th className="review">Review</th>
            <th className="actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayedFilms.map((film) => (
            <tr key={film.id}>
              <td className="poster">
                <Image
                  src={film.posterUrl}
                  alt={"Poster of " + film.title}
                  thumbnail
                  onClick={() => handlePosterClick(film)}
                />
              </td>
              <td className="id">{film.id}</td>
              <td className="title">{film.title}</td>
              <td className="year">{film.year}</td>
              <td className="director">{film.director}</td>
              <td className="stars">{film.stars}</td>
              <td className="review">{film.review}</td>
              <td className="actions">
                <Button
                  variant="warning editButton"
                  size="sm"
                  onClick={() => handleEdit(film)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger deleteButton"
                  size="sm"
                  onClick={() => handleDelete(film.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {searchResults.length === 0 && (
        <CustomPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editFilm?.id ? "Edit Film" : "Add New Film"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formFilmTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter title"
                value={editFilm?.title || ""}
                onChange={(e) =>
                  setEditFilm({ ...editFilm, title: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group controlId="formFilmYear">
              <Form.Label>Year</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter year"
                value={editFilm?.year || ""}
                onChange={(e) =>
                  setEditFilm({ ...editFilm, year: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group controlId="formFilmDirector">
              <Form.Label>Director</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter director"
                value={editFilm?.director || ""}
                onChange={(e) =>
                  setEditFilm({ ...editFilm, director: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group controlId="formFilmStars">
              <Form.Label>Stars</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter stars"
                value={editFilm?.stars || ""}
                onChange={(e) =>
                  setEditFilm({ ...editFilm, stars: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group controlId="formFilmReview">
              <Form.Label>Review</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter review"
                value={editFilm?.review || ""}
                onChange={(e) =>
                  setEditFilm({ ...editFilm, review: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={deleteConfirm} onHide={() => setDeleteConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this film?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FilmList;