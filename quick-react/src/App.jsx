import { useEffect, useState } from "react";
import {
  createMovie,
  deleteMovie,
  getMovie,
  getMovies,
  updateMovie,
} from "./api/movies.js";
import MovieCard from "./components/MovieCard.jsx";
import MovieForm from "./components/MovieForm.jsx";
import "./App.css";

function App() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [refreshError, setRefreshError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deletingMovieId, setDeletingMovieId] = useState(null);
  const [editingMovie, setEditingMovie] = useState(null);
  const [loadingEditId, setLoadingEditId] = useState(null);
  const [editError, setEditError] = useState("");

  const filteredMovies = movies.filter((movie) =>
    (movie.title || "").toLowerCase().includes(searchTerm.trim().toLowerCase()),
  );

  useEffect(() => {
    async function loadMovies() {
      try {
        const movieList = await getMovies();
        setMovies(movieList);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadMovies();
  }, []);

  async function refreshMovies() {
    try {
      const movieList = await getMovies();
      setMovies(movieList);
      setRefreshError("");
    } catch (requestError) {
      setRefreshError(
        `The change succeeded, but the movie list could not be refreshed: ${requestError.message}`,
      );
    }
  }

  async function handleCreate(movie) {
    await createMovie(movie);
    setSuccessMessage(`${movie.title} was added.`);
    setDeleteError("");
    setEditError("");
    await refreshMovies();
  }

  async function handleEdit(movie) {
    setEditError("");
    setSuccessMessage("");
    setLoadingEditId(movie.id);

    try {
      const movieDetails = await getMovie(movie.id);
      setEditingMovie(movieDetails);
    } catch (requestError) {
      setEditError(`Could not load this movie for editing: ${requestError.message}`);
    } finally {
      setLoadingEditId(null);
    }
  }

  async function handleUpdate(movieId, changes) {
    await updateMovie(movieId, changes);
    setSuccessMessage("Movie updated successfully.");
    setEditingMovie(null);
    setEditError("");
    await refreshMovies();
  }

  async function handleDelete(movie) {
    const confirmed = window.confirm(`Delete "${movie.title}"?`);

    if (!confirmed) {
      return;
    }

    setDeleteError("");
    setSuccessMessage("");
    setDeletingMovieId(movie.id);

    try {
      await deleteMovie(movie.id);
      setSuccessMessage(`${movie.title} was deleted.`);
      await refreshMovies();
    } catch (requestError) {
      setDeleteError(requestError.message);
    } finally {
      setDeletingMovieId(null);
    }
  }

  return (
    <main className="page">
      <header className="page-header">
        <p className="eyebrow">YOUR PERSONAL CINEMA</p>
        <h1>Movie Explorer</h1>
        <p className="page-header__description">
          Browse the movies in your collection.
        </p>
      </header>

      {loadingEditId !== null && (
        <p className="status-message" role="status">
          Loading movie details for editing...
        </p>
      )}

      {editError && (
        <p className="status-message status-message--error" role="alert">
          {editError}
        </p>
      )}

      <MovieForm
        key={editingMovie ? `edit-${editingMovie.id}` : "create"}
        movie={editingMovie}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onCancel={() => setEditingMovie(null)}
      />

      <section className="movie-section" aria-labelledby="movie-list-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE COLLECTION</p>
            <h2 id="movie-list-title">All movies</h2>
          </div>
          {!isLoading && !error && movies.length > 0 && (
            <p className="movie-count">
              {filteredMovies.length}{" "}
              {filteredMovies.length === 1 ? "movie" : "movies"}
            </p>
          )}
        </div>

        {successMessage && (
          <p className="status-message status-message--success" role="status">
            {successMessage}
          </p>
        )}

        {(refreshError || deleteError) && (
          <p className="status-message status-message--error" role="alert">
            {deleteError || refreshError}
          </p>
        )}

        {!isLoading && !error && movies.length > 0 && (
          <label className="search-field">
            <span>Search by title</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="e.g. Inception"
            />
          </label>
        )}

        {isLoading && (
          <p className="status-message" role="status">
            Loading movies...
          </p>
        )}

        {!isLoading && error && (
          <div className="status-message status-message--error" role="alert">
            <h3>Could not load movies</h3>
            <p>{error}</p>
            <p>
              Make sure your Go API is running at{" "}
              <code>http://localhost:8080</code>, then refresh this page.
            </p>
          </div>
        )}

        {!isLoading && !error && movies.length === 0 && (
          <p className="status-message">There are no movies to show yet.</p>
        )}

        {!isLoading && !error && movies.length > 0 && filteredMovies.length === 0 && (
          <p className="status-message">
            No movies match “{searchTerm.trim()}”. Try a different title.
          </p>
        )}

        {!isLoading && !error && filteredMovies.length > 0 && (
          <div className="movie-grid">
            {filteredMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isEditing={loadingEditId === movie.id}
                isDeleting={deletingMovieId === movie.id}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
