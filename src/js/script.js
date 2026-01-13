// MovieSense - Movie Database Application
// Pure JavaScript implementation with TMDB API integration

// Configuration
const CONFIG = {
  TMDB_API_KEY: '49e3be45df1c1a483b5eb9560e3c73ab',
  TMDB_BASE_URL: 'https://api.themoviedb.org/3',
  TMDB_IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
  IMAGE_PLACEHOLDER: 'https://images.unsplash.com/photo-1619164816991-22d393238d8f?w=400'
};

// Application State
const AppState = {
  currentPage: 'home',
  selectedMovieId: null,
  searchQuery: '',
  watchlist: JSON.parse(localStorage.getItem('movieWatchlist') || '[]'),
  popularMovies: [],
  trendingMovies: [],
  topRatedMovies: [],
  searchResults: [],
  movieDetails: null,
  movieCredits: null,
  movieReviews: [],
  isDarkMode: localStorage.getItem('darkMode') === 'true'
};

// TMDB API Service
class TMDBService {
  constructor() {
    this.baseURL = CONFIG.TMDB_BASE_URL;
    this.apiKey = CONFIG.TMDB_API_KEY;
    this.imageBaseURL = CONFIG.TMDB_IMAGE_BASE_URL;
  }

  async fetchData(endpoint) {
    const url = `${this.baseURL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${this.apiKey}`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('TMDB API Error:', error);
      throw error;
    }
  }

  async getPopularMovies(page = 1) {
    return this.fetchData(`/discover/movie?language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${page}&with_watch_monetization_types=flatrate`);
  }

  async getTrendingMovies() {
    return this.fetchData('/trending/movie/week?language=en-US');
  }

  async getTopRatedMovies(page = 1) {
    return this.fetchData(`/movie/top_rated?language=en-US&page=${page}`);
  }

  async searchMovies(query, page = 1) {
    const encodedQuery = encodeURIComponent(query);
    return this.fetchData(`/search/movie?query=${encodedQuery}&language=en-US&page=${page}&include_adult=false`);
  }

  async getMovieDetails(movieId) {
    return this.fetchData(`/movie/${movieId}?language=en-US`);
  }

  async getMovieCredits(movieId) {
    return this.fetchData(`/movie/${movieId}/credits?language=en-US`);
  }

  async getMovieReviews(movieId) {
    return this.fetchData(`/movie/${movieId}/reviews?language=en-US&page=1`);
  }

  getPosterUrl(posterPath, size = 'w500') {
    if (!posterPath) return CONFIG.IMAGE_PLACEHOLDER;
    return `${this.imageBaseURL}/${size}${posterPath}`;
  }

  getBackdropUrl(backdropPath, size = 'w1280') {
    if (!backdropPath) return CONFIG.IMAGE_PLACEHOLDER;
    return `${this.imageBaseURL}/${size}${backdropPath}`;
  }

  getProfileUrl(profilePath, size = 'w185') {
    if (!profilePath) return CONFIG.IMAGE_PLACEHOLDER;
    return `${this.imageBaseURL}/${size}${profilePath}`;
  }

  formatRating(rating) {
    return (rating / 2).toFixed(1);
  }

  getGenreById(genreId) {
    const genres = {
      28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
      99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
      27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
      10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
    };
    
    return genres[genreId] || 'Unknown';
  }
}

// Initialize TMDB service
const tmdbApi = new TMDBService();

// Utility Functions
function showLoading() {
  document.getElementById('loading-overlay').classList.remove('hidden');
}

function hideLoading() {
  document.getElementById('loading-overlay').classList.add('hidden');
}

function saveWatchlist() {
  localStorage.setItem('movieWatchlist', JSON.stringify(AppState.watchlist));
}

function isInWatchlist(movieId) {
  return AppState.watchlist.some(movie => movie.id === movieId);
}

function addToWatchlist(movie) {
  if (!isInWatchlist(movie.id)) {
    AppState.watchlist.push(movie);
    saveWatchlist();
    updateWatchlistUI();
  }
}

function removeFromWatchlist(movieId) {
  AppState.watchlist = AppState.watchlist.filter(movie => movie.id !== movieId);
  saveWatchlist();
  updateWatchlistUI();
}

function updateWatchlistUI() {
  const count = AppState.watchlist.length;
  const badge = document.getElementById('watchlist-count');
  
  if (count > 0) {
    badge.textContent = count;
    badge.classList.remove('hidden');
    badge.classList.add('flex');
  } else {
    badge.classList.add('hidden');
    badge.classList.remove('flex');
  }

  // Update watchlist page if currently viewing
  if (AppState.currentPage === 'watchlist') {
    renderWatchlistPage();
  }
}

function toggleTheme() {
  AppState.isDarkMode = !AppState.isDarkMode;
  document.documentElement.classList.toggle('dark', AppState.isDarkMode);
  localStorage.setItem('darkMode', AppState.isDarkMode.toString());
  
  const icon = document.querySelector('#theme-toggle i');
  icon.setAttribute('data-lucide', AppState.isDarkMode ? 'sun' : 'moon');
  lucide.createIcons();
}

// Navigation Functions
function showPage(pageName) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });

  // Show selected page
  document.getElementById(`${pageName}-page`).classList.add('active');

  // Update navigation buttons
  document.querySelectorAll('.nav-button').forEach(btn => {
    btn.classList.remove('active');
  });
  
  const activeBtn = document.querySelector(`[data-page="${pageName}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }

  AppState.currentPage = pageName;

  // Load page content if needed
  switch (pageName) {
    case 'home':
      if (AppState.popularMovies.length === 0) {
        loadHomePageData();
      }
      break;
    case 'watchlist':
      renderWatchlistPage();
      break;
  }
}

// Movie Rendering Functions
function createMovieCard(movie, showWatchlistButton = true) {
  const isWatched = isInWatchlist(movie.id);
  
  return `
    <div class="movie-card" data-movie-id="${movie.id}">
      <div class="relative">
        <img 
          src="${tmdbApi.getPosterUrl(movie.poster_path)}" 
          alt="${movie.title}"
          onerror="this.src='${CONFIG.IMAGE_PLACEHOLDER}'"
        />
        <div class="movie-card-overlay">
          <div class="rating-badge">
            <i data-lucide="star" class="w-3 h-3" style="fill: #facc15; color: #facc15;"></i>
            ${tmdbApi.formatRating(movie.vote_average)}
          </div>
          ${showWatchlistButton ? `
            <button class="watchlist-btn ${isWatched ? 'in-watchlist' : ''}" 
                    onclick="toggleMovieInWatchlist(${movie.id}, event)">
              <i data-lucide="heart" class="w-4 h-4" style="fill: currentColor;"></i>
            </button>
          ` : ''}
        </div>
      </div>
      <div class="movie-card-content">
        <div class="movie-card-title" onclick="showMovieDetails(${movie.id})">${movie.title}</div>
        <div class="movie-card-info">
          <span>${new Date(movie.release_date).getFullYear() || 'N/A'}</span>
          <span class="badge">${movie.genre_ids && movie.genre_ids[0] ? tmdbApi.getGenreById(movie.genre_ids[0]) : 'Unknown'}</span>
        </div>
      </div>
    </div>
  `;
}

function renderMovieGrid(container, movies) {
  if (!container) return;
  
  if (movies.length === 0) {
    container.innerHTML = '<p class="text-center text-muted-foreground py-8">No movies found</p>';
    return;
  }

  container.innerHTML = movies.map(movie => createMovieCard(movie)).join('');
  lucide.createIcons();
}

function createSkeletonCards(count = 12) {
  return Array.from({ length: count }, () => `
    <div class="movie-card">
      <div class="loading-skeleton aspect-2-3 w-full"></div>
      <div class="movie-card-content">
        <div class="loading-skeleton h-4 w-full mb-2"></div>
        <div class="loading-skeleton h-4 w-2/3"></div>
      </div>
    </div>
  `).join('');
}

// Home Page Functions
async function loadHomePageData() {
  try {
    showLoading();
    
    const [popular, trending, topRated] = await Promise.all([
      tmdbApi.getPopularMovies(),
      tmdbApi.getTrendingMovies(),
      tmdbApi.getTopRatedMovies()
    ]);

    AppState.popularMovies = popular.results.slice(0, 20);
    AppState.trendingMovies = trending.results.slice(0, 20);
    AppState.topRatedMovies = topRated.results.slice(0, 20);

    // Update movie grids
    renderMovieGrid(
      document.querySelector('#popular-movies .movies-container'),
      AppState.popularMovies
    );
    renderMovieGrid(
      document.querySelector('#trending-movies .movies-container'),
      AppState.trendingMovies
    );
    renderMovieGrid(
      document.querySelector('#toprated-movies .movies-container'),
      AppState.topRatedMovies
    );

    // Update badges
    document.querySelector('#popular-movies .badge').textContent = `${AppState.popularMovies.length} movies`;
    document.querySelector('#trending-movies .badge').textContent = `${AppState.trendingMovies.length} movies`;
    document.querySelector('#toprated-movies .badge').textContent = `${AppState.topRatedMovies.length} movies`;

  } catch (error) {
    console.error('Error loading home page data:', error);
    showError('Failed to load movies. Please try again later.');
  } finally {
    hideLoading();
  }
}

function switchMovieTab(tabName) {
  // Hide all movie grids
  document.querySelectorAll('.movie-grid').forEach(grid => {
    grid.classList.remove('active');
  });

  // Show selected grid
  document.getElementById(`${tabName}-movies`).classList.add('active');

  // Update tab buttons
  document.querySelectorAll('.movie-tab-button').forEach(btn => {
    btn.classList.remove('active');
  });
  
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

// Movie Details Functions
async function showMovieDetails(movieId) {
  try {
    showLoading();
    AppState.selectedMovieId = movieId;

    const [movieDetails, movieCredits, movieReviews] = await Promise.all([
      tmdbApi.getMovieDetails(movieId),
      tmdbApi.getMovieCredits(movieId),
      tmdbApi.getMovieReviews(movieId)
    ]);

    AppState.movieDetails = movieDetails;
    AppState.movieCredits = movieCredits;
    AppState.movieReviews = movieReviews.results || [];

    renderMovieDetailsPage();
    showPage('movie-details');

  } catch (error) {
    console.error('Error loading movie details:', error);
    showError('Failed to load movie details. Please try again later.');
  } finally {
    hideLoading();
  }
}

function renderMovieDetailsPage() {
  const movie = AppState.movieDetails;
  const credits = AppState.movieCredits;
  
  if (!movie) return;

  // Update backdrop
  const backdrop = document.getElementById('movie-backdrop');
  backdrop.style.backgroundImage = `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${tmdbApi.getBackdropUrl(movie.backdrop_path)})`;

  // Update basic info
  document.getElementById('movie-title').textContent = movie.title;
  document.getElementById('movie-tagline').textContent = movie.tagline || '';
  document.getElementById('movie-poster').src = tmdbApi.getPosterUrl(movie.poster_path);
  
  // Update watchlist button
  const watchlistBtn = document.getElementById('watchlist-toggle');
  const isWatched = isInWatchlist(movie.id);
  
  watchlistBtn.className = isWatched ? 'w-full btn-destructive' : 'w-full btn-primary';
  watchlistBtn.innerHTML = `
    <i data-lucide="heart" class="w-4 h-4 mr-2" ${isWatched ? 'style="fill: currentColor;"' : ''}></i>
    ${isWatched ? 'Remove from Watchlist' : 'Add to Watchlist'}
  `;

  // Update movie stats
  document.getElementById('movie-stats').innerHTML = `
    <div class="flex items-center gap-2">
      <i data-lucide="star" class="w-4 h-4" style="fill: #facc15; color: #facc15;"></i>
      <span class="font-medium">${tmdbApi.formatRating(movie.vote_average)}/5</span>
    </div>
    <div class="flex items-center gap-2">
      <i data-lucide="users" class="w-4 h-4"></i>
      <span>${movie.vote_count.toLocaleString()} votes</span>
    </div>
    <div class="flex items-center gap-2">
      <i data-lucide="calendar" class="w-4 h-4"></i>
      <span>${new Date(movie.release_date).getFullYear()}</span>
    </div>
    <div class="flex items-center gap-2">
      <i data-lucide="clock" class="w-4 h-4"></i>
      <span>${formatRuntime(movie.runtime)}</span>
    </div>
  `;

  // Update overview tab
  document.getElementById('movie-overview').textContent = movie.overview;
  
  // Update genres
  const genresHtml = movie.genres.map(genre => 
    `<span class="badge">${genre.name}</span>`
  ).join('');
  document.getElementById('movie-genres').innerHTML = genresHtml;

  // Update director
  const director = credits?.crew.find(person => person.job === 'Director');
  const directorSection = document.getElementById('director-section');
  
  if (director) {
    directorSection.classList.remove('hidden');
    document.getElementById('director-info').innerHTML = `
      <img src="${tmdbApi.getProfileUrl(director.profile_path)}" 
           alt="${director.name}" 
           class="w-12 h-12 rounded-full object-cover cast-cover"
           onerror="this.src='${CONFIG.IMAGE_PLACEHOLDER}'" />
      <div>
        <p class="font-medium">${director.name}</p>
        <p class="text-sm text-muted-foreground">${director.job}</p>
      </div>
    `;
  } else {
    directorSection.classList.add('hidden');
  }

  // Update cast
  const mainCast = credits?.cast.slice(0, 10) || [];
  const castHtml = mainCast.map(actor => `
    <div class="card p-4">
      <div class="flex items-center gap-3">
        <img src="${tmdbApi.getProfileUrl(actor.profile_path)}" 
             alt="${actor.name}" 
             class="w-12 h-12 rounded-full object-cover cast-cover"
             onerror="this.src='${CONFIG.IMAGE_PLACEHOLDER}'" />
        <div class="flex-1">
          <p class="font-medium">${actor.name}</p>
          <p class="text-sm text-muted-foreground">${actor.character}</p>
        </div>
      </div>
    </div>
  `).join('');
  document.getElementById('cast-grid').innerHTML = castHtml;

  // Update reviews
  const reviewsHtml = AppState.movieReviews.slice(0, 3).map(review => `
    <div class="card">
      <div class="p-4 border-b border-border">
        <div class="flex items-center justify-between">
          <h5 class="font-medium">${review.author}</h5>
          <span class="badge">
            ${review.author_details?.rating ? `${review.author_details.rating}/10` : 'No rating'}
          </span>
        </div>
      </div>
      <div class="p-4">
        <p class="text-sm text-muted-foreground line-clamp-4">${review.content}</p>
      </div>
    </div>
  `).join('');
  
  document.getElementById('movie-reviews').innerHTML = reviewsHtml || 
    '<p class="text-muted-foreground">No reviews available for this movie.</p>';

  // Update details cards
  document.getElementById('movie-detail-cards').innerHTML = `
    <div class="card p-4 space-y-2">
      <div class="flex justify-between">
        <span class="text-muted-foreground">Status:</span>
        <span class="font-medium">${movie.status}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-muted-foreground">Runtime:</span>
        <span class="font-medium">${formatRuntime(movie.runtime)}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-muted-foreground">Language:</span>
        <span class="font-medium">${movie.original_language.toUpperCase()}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-muted-foreground">Release Date:</span>
        <span class="font-medium">${new Date(movie.release_date).toLocaleDateString()}</span>
      </div>
    </div>
    <div class="card p-4 space-y-2">
      <div class="flex justify-between">
        <span class="text-muted-foreground">Budget:</span>
        <span class="font-medium">${movie.budget > 0 ? formatCurrency(movie.budget) : 'N/A'}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-muted-foreground">Revenue:</span>
        <span class="font-medium">${movie.revenue > 0 ? formatCurrency(movie.revenue) : 'N/A'}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-muted-foreground">Rating:</span>
        <span class="font-medium">${tmdbApi.formatRating(movie.vote_average)}/5</span>
      </div>
      <div class="flex justify-between">
        <span class="text-muted-foreground">Votes:</span>
        <span class="font-medium">${movie.vote_count.toLocaleString()}</span>
      </div>
    </div>
  `;

  // Update production companies
  const productionSection = document.getElementById('production-companies');
  if (movie.production_companies.length > 0) {
    productionSection.classList.remove('hidden');
    const companiesHtml = movie.production_companies.map(company => 
      `<span class="badge">${company.name}</span>`
    ).join('');
    productionSection.querySelector('div').innerHTML = companiesHtml;
  } else {
    productionSection.classList.add('hidden');
  }

  lucide.createIcons();
}

function switchMovieDetailsTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.movie-detail-tab').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(`${tabName}-content`).classList.add('active');
}

// Search Functions
async function performSearch(query) {
  if (!query.trim()) return;

  try {
    showLoading();
    AppState.searchQuery = query;

    const results = await tmdbApi.searchMovies(query);
    AppState.searchResults = results.results;

    renderSearchResults();
    showPage('search');

  } catch (error) {
    console.error('Error searching movies:', error);
    showError('Failed to search movies. Please try again later.');
  } finally {
    hideLoading();
  }
}

function renderSearchResults() {
  const resultsText = document.getElementById('search-results-text');
  const resultsGrid = document.getElementById('search-results-grid');
  const emptyState = document.getElementById('search-empty');

  if (AppState.searchResults.length === 0) {
    resultsText.textContent = `No results found for "${AppState.searchQuery}"`;
    resultsGrid.innerHTML = '';
    emptyState.classList.remove('hidden');
  } else {
    resultsText.textContent = `Results for "${AppState.searchQuery}" (${AppState.searchResults.length} results)`;
    renderMovieGrid(resultsGrid, AppState.searchResults);
    emptyState.classList.add('hidden');
  }
}

// Watchlist Functions
function renderWatchlistPage() {
  const emptyState = document.getElementById('watchlist-empty');
  const watchlistGrid = document.getElementById('watchlist-grid');
  const watchlistStats = document.getElementById('watchlist-stats');
  const description = document.getElementById('watchlist-description');
  const total = document.getElementById('watchlist-total');

  if (AppState.watchlist.length === 0) {
    emptyState.classList.remove('hidden');
    watchlistGrid.classList.add('hidden');
    watchlistStats.classList.add('hidden');
    description.textContent = 'Your watchlist is empty';
    total.textContent = '0 movies';
  } else {
    emptyState.classList.add('hidden');
    watchlistGrid.classList.remove('hidden');
    watchlistStats.classList.remove('hidden');
    
    description.textContent = `${AppState.watchlist.length} movie${AppState.watchlist.length === 1 ? '' : 's'} in your watchlist`;
    total.textContent = `${AppState.watchlist.length} ${AppState.watchlist.length === 1 ? 'movie' : 'movies'}`;

    // Render watchlist cards with additional controls
    watchlistGrid.innerHTML = AppState.watchlist.map(movie => `
      <div class="card group overflow-hidden watchlist-div-size">
        <div class="relative">
          <img src="${tmdbApi.getPosterUrl(movie.poster_path)}" 
               alt="${movie.title}"
               class="w-full aspect-2-3 object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
               onclick="showMovieDetails(${movie.id})"
               onerror="this.src='${CONFIG.IMAGE_PLACEHOLDER}'" />
          
          <div class="absolute top-2 left-2">
            <div class="rating-badge">
              <i data-lucide="star" class="w-3 h-3" style="fill: #facc15; color: #facc15;"></i>
              ${tmdbApi.formatRating(movie.vote_average)}
            </div>
          </div>

          <div class="absolute top-2 right-2 flex gap-2" style="display:none;">
            <button class="watchlist-btn" onclick="showMovieDetails(${movie.id})">
              <i data-lucide="play" class="w-4 h-4"></i>
            </button>
            <button class="btn-destructive p-2" onclick="removeFromWatchlist(${movie.id})">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>

          <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <button class="btn-secondary" onclick="showMovieDetails(${movie.id})" style="display:none;">
              <i data-lucide="play" class="w-4 h-4 mr-2"></i>View Details
            </button>
          </div>
        </div>

        <div class="p-4 space-y-3">
          <div>
            <h3 class="font-semibold text-lg line-clamp-2 cursor-pointer hover:text-primary"
                onclick="showMovieDetails(${movie.id})">
              ${movie.title}
            </h3>
            <div class="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <span>${new Date(movie.release_date).getFullYear()}</span>
              <span>•</span>
              <div class="flex items-center gap-1">
                <i data-lucide="star" class="w-3 h-3" style="fill: #facc15; color: #facc15;"></i>
                <span>${tmdbApi.formatRating(movie.vote_average)}/5</span>
              </div>
            </div>
          </div>

          <p class="text-sm text-muted-foreground line-clamp-3">${movie.overview}</p>

          <div class="flex flex-wrap gap-1">
            ${movie.genre_ids.slice(0, 2).map(genreId => 
              `<span class="badge text-xs">${tmdbApi.getGenreById(genreId)}</span>`
            ).join('')}
            ${movie.genre_ids.length > 2 ? `<span class="badge text-xs">+${movie.genre_ids.length - 2}</span>` : ''}
          </div>

          <div class="flex gap-2 pt-2">
            <button class="btn-primary flex-1" onclick="showMovieDetails(${movie.id})">
              <i data-lucide="play" class="w-4 h-4 mr-2"></i>Details
            </button>
            <button class="btn-destructive" onclick="removeFromWatchlist(${movie.id})">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Update statistics
    const totalMovies = AppState.watchlist.length;
    const avgRating = Math.round(AppState.watchlist.reduce((sum, movie) => sum + movie.vote_average, 0) / totalMovies / 2 * 10) / 10;
    const uniqueGenres = new Set(AppState.watchlist.flatMap(movie => movie.genre_ids)).size;
    const estimatedRuntime = Math.round(totalMovies * 2.1);

    document.getElementById('stat-total').textContent = totalMovies;
    document.getElementById('stat-rating').textContent = avgRating || '0';
    document.getElementById('stat-genres').textContent = uniqueGenres;
    document.getElementById('stat-runtime').textContent = `${estimatedRuntime} hrs`;
  }

  lucide.createIcons();
}

function toggleMovieInWatchlist(movieId, event) {
  event.stopPropagation();
  
  const movie = findMovieById(movieId);
  if (!movie) return;

  if (isInWatchlist(movieId)) {
    removeFromWatchlist(movieId);
  } else {
    addToWatchlist(movie);
  }

  // Update the button immediately
  const button = event.target.closest('.watchlist-btn');
  const icon = button.querySelector('i');
  const isWatched = isInWatchlist(movieId);
  
  button.className = `watchlist-btn ${isWatched ? 'in-watchlist' : ''}`;
  icon.style.fill = isWatched ? 'currentColor' : '';
}

function findMovieById(movieId) {
  // Search in all movie arrays
  const allMovies = [
    ...AppState.popularMovies,
    ...AppState.trendingMovies,
    ...AppState.topRatedMovies,
    ...AppState.searchResults,
    ...AppState.watchlist
  ];
  
  return allMovies.find(movie => movie.id === movieId) || AppState.movieDetails;
}

// Sentiment Analysis Functions
function analyzeSentiment(text) {
  if (!text.trim()) return null;

  // Simple sentiment analysis (in a real app, you'd use a proper API)
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'best', 'perfect', 'brilliant', 'outstanding'];
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'boring', 'disappointing', 'poor', 'waste'];

  const words = text.toLowerCase().split(/\W+/);
  let positiveCount = 0;
  let negativeCount = 0;

  words.forEach(word => {
    if (positiveWords.includes(word)) positiveCount++;
    if (negativeWords.includes(word)) negativeCount++;
  });

  const total = positiveCount + negativeCount;
  const neutral = Math.max(0, words.length - total) / words.length * 100;

  if (total === 0) {
    return { positive: 33, negative: 33, neutral: 34 };
  }

  const positive = (positiveCount / total) * (100 - neutral);
  const negative = (negativeCount / total) * (100 - neutral);

  return {
    positive: Math.round(positive),
    negative: Math.round(negative),
    neutral: Math.round(neutral)
  };
}

function renderSentimentResult(sentiment) {
  const resultDiv = document.getElementById('sentiment-result');
  
  resultDiv.innerHTML = `
    <h4 class="font-semibold mb-3">Sentiment Analysis Results</h4>
    
    <div class="sentiment-score">
      <span class="text-sm font-medium w-20">Positive</span>
      <div class="sentiment-bar">
        <div class="sentiment-fill sentiment-positive" style="width: ${sentiment.positive}%"></div>
      </div>
      <span class="text-sm font-medium w-12">${sentiment.positive}%</span>
    </div>
    
    <div class="sentiment-score">
      <span class="text-sm font-medium w-20">Negative</span>
      <div class="sentiment-bar">
        <div class="sentiment-fill sentiment-negative" style="width: ${sentiment.negative}%"></div>
      </div>
      <span class="text-sm font-medium w-12">${sentiment.negative}%</span>
    </div>
    
    <div class="sentiment-score">
      <span class="text-sm font-medium w-20">Neutral</span>
      <div class="sentiment-bar">
        <div class="sentiment-fill sentiment-neutral" style="width: ${sentiment.neutral}%"></div>
      </div>
      <span class="text-sm font-medium w-12">${sentiment.neutral}%</span>
    </div>
    
    <div class="mt-4 p-3 rounded-lg ${sentiment.positive > 50 ? 'bg-green-100' : sentiment.negative > 50 ? 'bg-red-100' : 'bg-gray-100'}">
      <p class="text-sm">
        <strong>Overall Sentiment:</strong> 
        ${sentiment.positive > 50 ? 'Positive' : sentiment.negative > 50 ? 'Negative' : 'Neutral'}
      </p>
    </div>
  `;
  
  resultDiv.classList.remove('hidden');
}

// Utility Functions
function formatRuntime(minutes) {
  if (!minutes) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function showError(message) {
  // Simple error display - in a real app, you might want a toast notification
  alert(message);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  // Initialize theme
  if (AppState.isDarkMode) {
    document.documentElement.classList.add('dark');
    document.querySelector('#theme-toggle i').setAttribute('data-lucide', 'sun');
  }

  // Update watchlist UI
  updateWatchlistUI();

  // Load initial data
  loadHomePageData();

  // Navigation event listeners
  document.querySelectorAll('.nav-button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const page = e.currentTarget.getAttribute('data-page');
      showPage(page);
    });
  });

  // Logo click
  document.getElementById('logo').addEventListener('click', () => showPage('home'));

  // Theme toggle
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

  // Search form
  document.getElementById('search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const query = document.getElementById('search-input').value.trim();
    if (query) {
      performSearch(query);
    }
  });

  // Search form
  document.getElementById('mobile-search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const query = document.getElementById('mobile-search-input').value.trim();
    if (query) {
      performSearch(query);
    }
  });

  // Search input changes
  document.getElementById('search-input').addEventListener('input', (e) => {
    const button = document.getElementById('search-button');
    if (e.target.value.trim()) {
      button.classList.remove('hidden');
    } else {
      button.classList.add('hidden');
    }
  });

  // Movie tab buttons
  document.querySelectorAll('.movie-tab-button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.currentTarget.getAttribute('data-tab');
      switchMovieTab(tab);
    });
  });

  // Movie details tab buttons
  document.querySelectorAll('.movie-detail-tab').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.currentTarget.getAttribute('data-tab');
      switchMovieDetailsTab(tab);
    });
  });

  // Back button
  document.getElementById('back-button').addEventListener('click', () => {
    showPage('home');
  });
  
  // Watchlist toggle in movie details
  document.getElementById('watchlist-toggle').addEventListener('click', () => {
    const movie = AppState.movieDetails;
    if (!movie) return;

    if (isInWatchlist(movie.id)) {
      removeFromWatchlist(movie.id);
    } else {
      // Convert movie details to watchlist format
      const watchlistMovie = {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path || '',
        vote_average: movie.vote_average,
        overview: movie.overview,
        release_date: movie.release_date,
        genre_ids: movie.genres.map(g => g.id)
      };
      addToWatchlist(watchlistMovie);
    }

    // Update the button
    renderMovieDetailsPage();
  });

  // Sentiment analysis
  document.getElementById('analyze-button').addEventListener('click', () => {
    const text = document.getElementById('review-input').value.trim();
    if (text) {
      const sentiment = analyzeSentiment(text);
      renderSentimentResult(sentiment);
    } else {
      alert('Please enter a review to analyze.');
    }
  });

  // Initialize Lucide icons
  lucide.createIcons();
});

// Global functions for HTML onclick handlers
window.showMovieDetails = showMovieDetails;
window.showPage = showPage;
window.toggleMovieInWatchlist = toggleMovieInWatchlist;
window.removeFromWatchlist = removeFromWatchlist;

