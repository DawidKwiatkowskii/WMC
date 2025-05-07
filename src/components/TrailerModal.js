// Trailer-Modal-Komponente, die den Filmtrailer anzeigt
function TrailerModal(props) {
  // Zustand für die URL des Trailers
  const [trailerUrl, setTrailerUrl] = React.useState('');

  // API-Schlüssel für TMDB
  const TMDB_API_KEY = 'a01af4a85f5ec44f11bda3b7f8969510'; // TMDB-API-Schlüssel

  // Trailer von TMDB abrufen, wenn ein Film ausgewählt wird
  React.useEffect(() => {
    const fetchTrailer = async () => {
      // Prüft, ob ein Film ausgewählt wurde
      if (!props.movie || !props.movie.id) {
        setTrailerUrl(''); // Setzt die Trailer-URL zurück, wenn kein Film vorhanden ist
        return;
      }

      try {
        // API-Aufruf, um die Videos für den Film abzurufen
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${props.movie.id}/videos?api_key=${TMDB_API_KEY}&language=de-DE`
        );
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          // Sucht den ersten Trailer auf YouTube
          const trailer = data.results.find(
            video => video.type === 'Trailer' && video.site === 'YouTube'
          );
          if (trailer) {
            // Erstellt die YouTube-Embed-URL mit Autoplay
            setTrailerUrl(`https://www.youtube.com/embed/${trailer.key}?autoplay=1`);
          } else {
            setTrailerUrl(''); // Kein Trailer gefunden
          }
        } else {
          setTrailerUrl(''); // Keine Videos verfügbar
        }
      } catch (error) {
        console.error('Fehler beim Abrufen des Trailers:', error);
        setTrailerUrl(''); // Setzt die URL zurück bei API-Fehler
      }
    };

    fetchTrailer(); // Ruft die Funktion zum Abrufen des Trailers auf
  }, [props.movie]);

  // Rendert das Trailer-Modal
  return React.createElement(
    'div',
    { className: 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50' }, // Modal-Hintergrund
    React.createElement(
      'div',
      { className: 'bg-gray-800 p-6 rounded-lg max-w-3xl w-full' }, // Modal-Container
      React.createElement('h2', { className: 'text-2xl font-semibold mb-4' }, `${props.movie.title} - Trailer`), // Titel des Modals mit Filmtitel
      trailerUrl
        ? React.createElement('iframe', { // YouTube-Player für den Trailer
            className: 'w-full h-96',
            src: trailerUrl,
            title: 'Trailer',
            frameBorder: '0',
            allow: 'autoplay; encrypted-media', // Erlaubt Autoplay und verschlüsselte Medien
            allowFullScreen: true, // Erlaubt Vollbildmodus
          })
        : React.createElement('p', { className: 'text-gray-400' }, 'Kein Trailer verfügbar.'), // Nachricht, wenn kein Trailer verfügbar ist
      React.createElement(
        'button',
        {
          onClick: props.onClose, // Schließt das Modal
          className: 'mt-4 w-full bg-yellow-400 text-gray-900 py-2 rounded-md hover:bg-yellow-500 transition',
        },
        'Schließen' // Schließen-Button
      )
    )
  );
}