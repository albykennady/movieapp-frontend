const API_BASE_URL = "http://localhost:8080";

export async function getMovies() {
  const response = await fetch(`${API_BASE_URL}/movies`);

  await checkResponse(response);

  const movies = await response.json();

  if (!Array.isArray(movies)) {
    throw new Error("The movie response was not a list.");
  }

  return movies;
}

export async function getMovie(movieId) {
  const response = await fetch(`${API_BASE_URL}/movies/${movieId}`);
  await checkResponse(response);

  const movie = await response.json();

  if (!movie || typeof movie !== "object" || Array.isArray(movie)) {
    throw new Error("The movie response was not a movie.");
  }

  return movie;
}

export async function createMovie(movie) {
  const response = await fetch(`${API_BASE_URL}/movies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(movie),
  });

  await checkResponse(response);
}

export async function updateMovie(movieId, changes) {
  const response = await fetch(`${API_BASE_URL}/movies/${movieId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(changes),
  });

  await checkResponse(response);
}

export async function deleteMovie(movieId) {
  const response = await fetch(`${API_BASE_URL}/movies/${movieId}`, {
    method: "DELETE",
  });

  await checkResponse(response);
}

export function getMovieImageUrl(image) {
  if (typeof image !== "string" || image.trim() === "") {
    return "";
  }

  const imageValue = image.trim();

  try {
    const imageUrl =
      imageValue.startsWith("/") && !imageValue.startsWith("//")
        ? new URL(imageValue, API_BASE_URL)
        : new URL(imageValue);

    if (imageUrl.protocol !== "http:" && imageUrl.protocol !== "https:") {
      return "";
    }

    return imageUrl.href;
  } catch {
    return "";
  }
}

async function checkResponse(response) {
  if (response.ok) {
    return;
  }

  const responseText = await response.text();
  const details = responseText.trim();
  const message = details || response.statusText;

  throw new Error(
    `The server responded with status ${response.status}${message ? `: ${message}` : "."}`,
  );
}
