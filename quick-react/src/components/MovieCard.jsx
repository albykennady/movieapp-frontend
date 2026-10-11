import { useState } from "react";
import { getMovieImageUrl } from "../api/movies.js";

function MovieCard({ movie, onEdit, onDelete, isEditing, isDeleting }) {
  const imageUrl = getMovieImageUrl(movie.image);
  const [failedImageUrl, setFailedImageUrl] = useState("");
  const imageFailed = failedImageUrl === imageUrl;

  return (
    <article className="movie-card">
      <div className="movie-card__poster">
        {imageUrl && !imageFailed ? (
          <img
            src={imageUrl}
            alt={`${movie.title || "Movie"} poster`}
            onError={() => setFailedImageUrl(imageUrl)}
          />
        ) : (
          <div
            className="movie-card__placeholder"
            role="img"
            aria-label="Poster unavailable"
          >
            <span>Poster unavailable</span>
          </div>
        )}
      </div>

      <div className="movie-card__content">
        <div className="movie-card__heading">
          <h3>{movie.title || "Untitled movie"}</h3>
          <span className="rating">
            {movie.mpaa_rating || "Not rated"}
          </span>
        </div>

        <p className="movie-card__details">
          {movie.year || "Year unavailable"}
          <span aria-hidden="true"> · </span>
          {movie.runtime ? `${movie.runtime} min` : "Runtime unavailable"}
        </p>

        <p className="movie-card__description">
          {movie.description || "No description available."}
        </p>
        <div className="movie-card__actions">
          <button
            className="text-button edit-button"
            type="button"
            disabled={isEditing || isDeleting}
            onClick={() => onEdit(movie)}
          >
            {isEditing ? "Opening..." : "Edit"}
          </button>
          <button
            className="text-button delete-button"
            type="button"
            disabled={isDeleting || isEditing}
            onClick={() => onDelete(movie)}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default MovieCard;
