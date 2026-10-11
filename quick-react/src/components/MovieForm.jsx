import { useState } from "react";

function getInitialValues(movie) {
  let genreIds = movie?.genres_array || [];

  if (genreIds.length === 0 && Array.isArray(movie?.genres)) {
    genreIds = movie.genres
      .filter((genre) => genre.checked)
      .map((genre) => genre.id);
  }

  return {
    title: movie?.title ?? "",
    year: movie?.year == null ? "" : String(movie.year),
    runtime: movie?.runtime == null ? "" : String(movie.runtime),
    mpaa_rating: movie?.mpaa_rating ?? "",
    description: movie?.description ?? "",
    image: movie?.image ?? "",
    genres_array: genreIds.join(", "),
  };
}

function MovieForm({ movie, onCreate, onUpdate, onCancel }) {
  const initialValues = getInitialValues(movie);
  const [values, setValues] = useState(initialValues);
  const [changedFields, setChangedFields] = useState(() => new Set());
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = Boolean(movie);

  function handleChange(event) {
    const { name, value } = event.target;

    setValues((currentValues) => ({ ...currentValues, [name]: value }));
    setChangedFields((currentFields) => new Set(currentFields).add(name));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const fieldsToUpdate = new Set(
      [...changedFields].filter((field) => values[field] !== initialValues[field]),
    );

    if (isEditing && fieldsToUpdate.size === 0) {
      setError("Change at least one field before saving.");
      return;
    }

    if ((!isEditing || fieldsToUpdate.has("title")) && !values.title.trim()) {
      setError("Enter a movie title.");
      return;
    }

    const movieData = {};

    if (!isEditing || fieldsToUpdate.has("title")) {
      movieData.title = values.title.trim();
    }

    for (const field of ["year", "runtime"]) {
      if (!isEditing || fieldsToUpdate.has(field)) {
        const number = Number(values[field]);

        if (!Number.isInteger(number) || number <= 0) {
          setError(`Enter a valid ${field === "year" ? "year" : "runtime in minutes"}.`);
          return;
        }

        movieData[field] = number;
      }
    }

    if (!isEditing || fieldsToUpdate.has("mpaa_rating")) {
      movieData.mpaa_rating = values.mpaa_rating.trim();
    }
    if (!isEditing || fieldsToUpdate.has("description")) {
      movieData.description = values.description.trim();
    }
    if (!isEditing || fieldsToUpdate.has("image")) {
      movieData.image = values.image.trim();
    }

    if (!isEditing || fieldsToUpdate.has("genres_array")) {
      const genreIds = values.genres_array
        .split(",")
        .map((genreId) => genreId.trim())
        .filter(Boolean)
        .map(Number);

      if (genreIds.some((genreId) => !Number.isInteger(genreId) || genreId <= 0)) {
        setError("Genre IDs must be positive whole numbers separated by commas.");
        return;
      }

      movieData.genres_array = genreIds;
    }

    setIsSubmitting(true);

    try {
      if (isEditing) {
        await onUpdate(movie.id, movieData);
      } else {
        await onCreate(movieData);
        setValues(getInitialValues(null));
        setChangedFields(new Set());
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="movie-form" onSubmit={handleSubmit}>
      <div className="form-heading">
        <div>
          <p className="eyebrow">{isEditing ? "UPDATE YOUR COLLECTION" : "GROW YOUR COLLECTION"}</p>
          <h2>{isEditing ? `Edit ${movie.title}` : "Add a movie"}</h2>
        </div>
      </div>

      <div className="form-grid">
        <label className="form-field form-field--wide">
          <span>Title *</span>
          <input
            name="title"
            required={!isEditing || changedFields.has("title")}
            value={values.title}
            onChange={handleChange}
            placeholder="Movie title"
          />
        </label>
        <label className="form-field">
          <span>Year *</span>
          <input
            name="year"
            required={!isEditing || changedFields.has("year")}
            type="number"
            min="1"
            step="1"
            value={values.year}
            onChange={handleChange}
            placeholder="2024"
          />
        </label>
        <label className="form-field">
          <span>Runtime (minutes) *</span>
          <input
            name="runtime"
            required={!isEditing || changedFields.has("runtime")}
            type="number"
            min="1"
            step="1"
            value={values.runtime}
            onChange={handleChange}
            placeholder="120"
          />
        </label>
        <label className="form-field">
          <span>MPAA rating</span>
          <input
            name="mpaa_rating"
            value={values.mpaa_rating}
            onChange={handleChange}
            placeholder="PG-13"
          />
        </label>
        <label className="form-field">
          <span>Image URL</span>
          <input
            name="image"
            value={values.image}
            onChange={handleChange}
            placeholder="https://example.com/movie-poster.jpg"
          />
          <small>Enter a complete http(s) URL. API-relative paths are also supported.</small>
        </label>
        <label className="form-field form-field--wide">
          <span>Description</span>
          <textarea
            name="description"
            rows="3"
            value={values.description}
            onChange={handleChange}
            placeholder="A short description of the movie"
          />
        </label>
        <label className="form-field form-field--wide">
          <span>Genre IDs (comma-separated)</span>
          <input
            name="genres_array"
            value={values.genres_array}
            onChange={handleChange}
            placeholder="1, 2"
          />
          <small>Use numeric genre IDs from your API. Leave blank for none.</small>
        </label>
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="form-actions">
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEditing ? "Save changes" : "Add movie"}
        </button>
        {isEditing && (
          <button
            className="secondary-button"
            type="button"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default MovieForm;
