// Filmlisten-Komponente, die die Liste der Filme anzeigt
function MovieList(props) {
  // Zustand für den ausgewählten Film, um das Detail-Modal anzuzeigen
  const [selectedMovieForDetails, setSelectedMovieForDetails] = React.useState(null);

  // Seitenzahlen für die Pagination berechnen (maximal 5 Seiten anzeigen)
  const currentPage = props.currentPage || 1; // Aktuelle Seite, Standardwert 1
  const totalPages = props.totalPages || 1; // Gesamtzahl der Seiten, Standardwert 1
  const maxPagesToShow = 5; // Maximale Anzahl anzuzeigender Seitenzahlen
  const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2)); // Startseite der Pagination
  const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1); // Endseite der Pagination
  const pages = []; // Array für die Seitenzahlen
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i); // Fügt die Seitenzahlen zum Array hinzu
  }

  // Komponente für das Detail-Modal, das mehr Informationen über einen Film anzeigt
  function MovieDetailModal({ movie, onClose, onOpenTrailer }) {
    // API-Schlüssel für TMDB
    const TMDB_API_KEY = 'a01af4a85f5ec44f11bda3b7f8969510';
    // Zustand für die Genres des Films
    const [genres, setGenres] = React.useState([]);

    // Genres von TMDB abrufen, basierend auf den Genre-IDs des Films
    React.useEffect(() => {
      const fetchGenres = async () => {
        try {
          const response = await fetch(
            `https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}&language=de-DE`
          );
          const data = await response.json();
          if (data.genres) {
            // Mappt Genre-IDs auf Genre-Namen
            const genreNames = movie.genre_ids.map(genreId => {
              const genre = data.genres.find(g => g.id === genreId);
              return genre ? genre.name : 'Unbekannt'; // Fallback, falls Genre nicht gefunden
            });
            setGenres(genreNames); // Speichert die Genre-Namen
          }
        } catch (error) {
          console.error('Fehler beim Abrufen der Genres:', error);
          setGenres(movie.genre_ids.map(() => 'Unbekannt')); // Fallback bei API-Fehler
        }
      };
      fetchGenres(); // Ruft die Funktion zum Abrufen der Genres auf
    }, [movie]);

    // Rendert das Detail-Modal
    return React.createElement(
      'div',
      { className: 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50' }, // Modal-Hintergrund
      React.createElement(
        'div',
        { className: 'bg-gray-800 p-6 rounded-lg max-w-3xl w-full' }, // Modal-Container
        React.createElement('h2', { className: 'text-2xl font-semibold mb-4' }, movie.title), // Filmtitel
        React.createElement('img', { // Film-Poster
          src: `https://image.tmdb.org/t/p/w500${movie.poster_path || '/placeholder.jpg'}`,
          alt: movie.title,
          className: 'w-full h-96 object-cover rounded-md mb-4',
          onError: (e) => (e.target.src = 'https://via.placeholder.com/500x750?text=Kein+Poster'), // Fallback-Bild bei Fehler
        }),
        React.createElement('p', { className: 'text-gray-400 mb-2' }, `Erscheinungsjahr: ${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}`), // Erscheinungsjahr
        React.createElement('p', { className: 'text-yellow-400 mb-2' }, `Bewertung: ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}`), // Bewertung
        React.createElement('p', { className: 'text-gray-300 mb-2' }, `Genres: ${genres.length > 0 ? genres.join(', ') : 'Keine Genres verfügbar'}`), // Genres
        React.createElement('p', { className: 'text-gray-300 mb-4' }, movie.overview || 'Keine Beschreibung verfügbar.'), // Beschreibung
        React.createElement(
          'button',
          {
            onClick: () => onOpenTrailer(movie), // Öffnet das Trailer-Modal
            className: 'w-full bg-yellow-400 text-gray-900 py-2 rounded-md hover:bg-yellow-500 transition mb-4',
          },
          'Trailer ansehen'
        ),
        React.createElement(
          'button',
          {
            onClick: onClose, // Schließt das Detail-Modal
            className: 'w-full bg-gray-600 text-white py-2 rounded-md hover:bg-gray-500 transition',
          },
          'Schließen'
        )
      )
    );
  }

  // Rendert die Filmliste und Pagination
  return React.createElement(
    'div',
    null,
    React.createElement(
      'div',
      { className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' }, // Grid-Layout für Filme
      props.movies.map((movie) =>
        React.createElement(
          'div',
          {
            key: movie.id,
            className: 'bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition cursor-pointer',
            onClick: () => setSelectedMovieForDetails(movie), // Öffnet Detail-Modal beim Klick
          },
          React.createElement('img', { // Film-Poster
            src: `https://image.tmdb.org/t/p/w500${movie.poster_path || '/placeholder.jpg'}`,
            alt: movie.title,
            className: 'w-full h-64 object-cover',
            onError: (e) => (e.target.src = 'https://via.placeholder.com/500x750?text=Kein+Poster'), // Fallback-Bild bei Fehler
          }),
          React.createElement(
            'div',
            { className: 'p-4' }, // Container für Filminformationen
            React.createElement('h3', { className: 'text-xl font-semibold' }, movie.title), // Filmtitel
            React.createElement('p', { className: 'text-gray-400 mt-1' }, movie.release_date ? movie.release_date.split('-')[0] : 'N/A'), // Erscheinungsjahr
            React.createElement('p', { className: 'text-gray-300 mt-2 line-clamp-3' }, movie.overview || 'Keine Beschreibung verfügbar.'), // Kurzbeschreibung
            React.createElement('p', { className: 'mt-2 text-yellow-400' }, `Bewertung: ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}`) // Bewertung
          )
        )
      )
    ),
    props.movies.length > 0 && React.createElement( // Pagination, nur wenn Filme vorhanden sind
      'div',
      { className: 'flex justify-end space-x-2 mt-6' }, // Container für Pagination-Buttons
      React.createElement(
        'button',
        {
          onClick: () => props.onGoToPage(currentPage - 1), // Geht zur vorherigen Seite
          className: `px-4 py-2 rounded-md ${currentPage === 1 ? 'bg-gray-600 cursor-not-allowed' : 'bg-yellow-400 text-gray-900 hover:bg-yellow-500'}`,
          disabled: currentPage === 1, // Deaktiviert, wenn erste Seite
        },
        'Vorherige'
      ),
      pages.map(pageNum =>
        React.createElement(
          'button',
          {
            key: pageNum,
            onClick: () => props.onGoToPage(pageNum), // Geht zur ausgewählten Seite
            className: `px-4 py-2 rounded-md ${pageNum === currentPage ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700 text-white hover:bg-gray-600'}`,
          },
          pageNum // Seitenzahl
        )
      ),
      React.createElement(
        'button',
        {
          onClick: () => props.onGoToPage(currentPage + 1), // Geht zur nächsten Seite
          className: `px-4 py-2 rounded-md ${currentPage === totalPages ? 'bg-gray-600 cursor-not-allowed' : 'bg-yellow-400 text-gray-900 hover:bg-yellow-500'}`,
          disabled: currentPage === totalPages, // Deaktiviert, wenn letzte Seite
        },
        'Nächste'
      )
    ),
    selectedMovieForDetails && React.createElement(MovieDetailModal, { // Zeigt Detail-Modal, wenn ein Film ausgewählt ist
      movie: selectedMovieForDetails, // Übergibt den ausgewählten Film
      onClose: () => setSelectedMovieForDetails(null), // Schließt das Modal
      onOpenTrailer: props.onOpenTrailer, // Öffnet das Trailer-Modal
    })
  );
}