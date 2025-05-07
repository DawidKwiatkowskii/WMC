// Haupt-App-Komponente, die die gesamte Anwendung rendert
function App() {
  // Zustände für die Filmliste, ausgewählten Film für Trailer, Pagination und Seitennavigation
  const [movies, setMovies] = React.useState([]); // Speichert die Liste der Filme
  const [selectedMovie, setSelectedMovie] = React.useState(null); // Speichert den Film für das Trailer-Modal
  const [currentPage, setCurrentPage] = React.useState(1); // Aktuelle Seite der Pagination
  const [totalPages, setTotalPages] = React.useState(1); // Gesamtzahl der Seiten
  const [goToPage, setGoToPage] = React.useState(() => () => {}); // Funktion für Seitennavigation

  // Callback-Funktion, die die Filmliste aktualisiert, wenn neue Suchergebnisse kommen
  const handleSearchResults = (results) => {
    setMovies(results); // Setzt die neuen Suchergebnisse in den Zustand
  };

  // Öffnet das Trailer-Modal für den ausgewählten Film
  const openTrailer = (movie) => {
    setSelectedMovie(movie); // Setzt den ausgewählten Film für das Trailer-Modal
  };

  // Schließt das Trailer-Modal
  const closeTrailer = () => {
    setSelectedMovie(null); // Setzt den ausgewählten Film zurück, um das Modal zu schließen
  };

  // Rendert die Hauptkomponente der Anwendung
  return React.createElement(
    'div',
    { className: 'min-h-screen bg-gradient-to-b from-gray-900 to-gray-800' }, // Container mit Hintergrundfarbe
    React.createElement(
      'header',
      { className: 'py-6 text-center' }, // Header mit Titel und Beschreibung
      React.createElement('h1', { className: 'text-4xl font-bold text-yellow-400' }, 'What to Watch?'), // Haupttitel
      React.createElement('p', { className: 'mt-2 text-lg text-gray-300' }, 'Finde die perfekte Serie oder den perfekten Film für dich!') // Untertitel
    ),
    React.createElement(
      'main',
      { className: 'container mx-auto px-4' }, // Hauptbereich mit zentriertem Inhalt
      React.createElement(SearchForm, { // Suchformular-Komponente
        onSearchResults: handleSearchResults, // Übergibt die Funktion zum Speichern der Suchergebnisse
        onPageChange: (page, total) => { // Callback für Seitenänderungen
          setCurrentPage(page); // Aktualisiert die aktuelle Seite
          setTotalPages(total); // Aktualisiert die Gesamtzahl der Seiten
        },
        onGoToPageChange: (goToPageFunc) => { // Callback für die Seitennavigationsfunktion
          setGoToPage(() => goToPageFunc); // Setzt die Funktion für Seitennavigation
        }
      }),
      React.createElement(MovieList, { // Filmlisten-Komponente
        movies: movies, // Übergibt die Liste der Filme
        onOpenTrailer: openTrailer, // Übergibt die Funktion zum Öffnen des Trailers
        currentPage: currentPage, // Aktuelle Seite für Pagination
        totalPages: totalPages, // Gesamtzahl der Seiten
        onGoToPage: goToPage // Funktion für Seitennavigation
      }),
      selectedMovie && React.createElement(TrailerModal, { // Trailer-Modal, wird nur angezeigt, wenn ein Film ausgewählt ist
        movie: selectedMovie, // Übergibt den ausgewählten Film
        onClose: closeTrailer // Übergibt die Funktion zum Schließen des Modals
      })
    )
  );
}