class MovieSearchApp {
  constructor() {
    this.apiKey = "e9b615d1";
    this.baseUrl = "https://www.omdbapi.com/";
    this.searchTimeout = null;
    this.currentSearchTerm = "";

    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");

    searchInput.addEventListener("input", (e) => {
      this.handleSearch(e.target.value.trim());
    });

    searchButton.addEventListener("click", () => {
      this.handleSearch(searchInput.value.trim());
    });

    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.handleSearch(searchInput.value.trim());
      }
    });
  }

  handleSearch(searchTerm) {
    if (searchTerm.length < 2) {
      this.clearResults();
      return;
    }

    this.currentSearchTerm = searchTerm;
    this.debounceSearch();
  }

  debounceSearch() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.searchMovies(this.currentSearchTerm);
    }, 500);
  }

  async searchMovies(searchTerm) {
    if (!searchTerm) return;

    this.showLoading(true);
    this.clearResults();

    try {
      const response = await fetch(
        `${this.baseUrl}?apikey=${this.apiKey}&s=${encodeURIComponent(
          searchTerm
        )}`
      );
      const data = await response.json();

      if (data.Response === "True") {
        const moviesToShow = data.Search.slice(0, 6);
        const detailedResults = await Promise.all(
          moviesToShow.map((movie) =>
            fetch(`${this.baseUrl}?apikey=${this.apiKey}&i=${movie.imdbID}`)
              .then((res) => res.json())
              .catch(() => null)
          )
        );

        this.displayResults(detailedResults.filter(Boolean));
      } else {
        this.displayNoResults();
      }
    } catch (error) {
      console.error("Error:", error);
      this.displayError();
    } finally {
      this.showLoading(false);
    }
  }

  displayResults(movies) {
    const resultsContainer = document.getElementById("resultsContainer");

    movies.forEach((movie) => {
      const movieCard = document.createElement("div");
      movieCard.className = "movie-card";

      const poster = document.createElement("div");
      poster.className = "movie-poster";

      if (movie.Poster !== "N/A") {
        const img = document.createElement("img");
        img.src = movie.Poster;
        img.alt = `Poster ${movie.Title}`;
        img.loading = "lazy";
        poster.appendChild(img);
      } else {
        const placeholder = document.createElement("div");
        placeholder.innerHTML = `
                    <i class="fas fa-film" style="font-size: 3rem; opacity: 0.5;"></i>
                    <p style="margin-top: 1rem;">No poster</p>
                `;
        placeholder.style.display = "flex";
        placeholder.style.flexDirection = "column";
        placeholder.style.alignItems = "center";
        placeholder.style.justifyContent = "center";
        placeholder.style.color = "rgba(255,255,255,0.7)";
        placeholder.style.height = "100%";
        poster.appendChild(placeholder);
      }

      const info = document.createElement("div");
      info.className = "movie-info";

      const title = document.createElement("h3");
      title.textContent = movie.Title;

      const year = document.createElement("p");
      year.textContent = `Year: ${movie.Year}`;

      const type = document.createElement("p");
      type.textContent = `Type: ${this.translateType(movie.Type)}`;

      const rated = document.createElement("p");
      rated.textContent = `Movie rating: ${
        movie.Rated !== "N/A" ? movie.Rated : "No data"
      }`;

      const rating = document.createElement("div");
      rating.className = "rating";
      if (movie.imdbRating !== "N/A") {
        rating.innerHTML = `
                    <i class="fas fa-star"></i>
                    <span>${movie.imdbRating}/10 (IMDb)</span>
                `;
      }

      info.appendChild(title);
      info.appendChild(year);
      info.appendChild(type);
      info.appendChild(rated);
      info.appendChild(rating);

      movieCard.appendChild(poster);
      movieCard.appendChild(info);

      resultsContainer.appendChild(movieCard);
    });
  }

  translateType(type) {
    const types = {
      movie: "Movie",
      series: "Serie",
      game: "Game",
    };
    return types[type] || type;
  }

  clearResults() {
    const resultsContainer = document.getElementById("resultsContainer");
    resultsContainer.innerHTML = "";
  }

  displayNoResults() {
    const resultsContainer = document.getElementById("resultsContainer");
    resultsContainer.innerHTML = `
            <div class="no-results" style="grid-column: 1/-1; text-align: center; color: white;">
                <i class="fas fa-search" style="font-size: 3rem; opacity: 0.5; margin-bottom: 1rem;"></i>
                <h3>No results found</h3>
                <p>Please try another query</p>
            </div>
        `;
  }

  displayError() {
    const resultsContainer = document.getElementById("resultsContainer");
    resultsContainer.innerHTML = `
            <div class="error-message" style="grid-column: 1/-1; text-align: center; color: #ff6b6b;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <h3>Downloading error</h3>
                <p>Please try again later</p>
            </div>
        `;
  }

  showLoading(show) {
    const loadingIndicator = document.getElementById("loadingIndicator");
    loadingIndicator.style.display = show ? "flex" : "none";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new MovieSearchApp();
});
