// Suchformular-Komponente zum Filtern und Suchen von Filmen
function SearchForm(props) {
  // Zustände für Genre, Stimmung, Titel, Pagination und Fehlermeldungen
  const [genre, setGenre] = React.useState(''); // Speichert das ausgewählte Genre
  const [mood, setMood] = React.useState(''); // Speichert die ausgewählte Stimmung
  const [similarTo, setSimilarTo] = React.useState(''); // Speichert den eingegebenen Filmtitel
  const [page, setPage] = React.useState(1); // Aktuelle Seite für Pagination
  const [totalPages, setTotalPages] = React.useState(1); // Gesamtzahl der Seiten
  const [errorMessage, setErrorMessage] = React.useState(''); // Fehlermeldungen bei Problemen
  const [genres, setGenres] = React.useState([]); // Speichert die Liste der Genres von TMDB

  // API-Schlüssel für TMDB
  const TMDB_API_KEY = 'a01af4a85f5ec44f11bda3b7f8969510'; // TMDB-API-Schlüssel

  // Genres von TMDB abrufen, wenn die Komponente geladen wird
  React.useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}&language=de-DE`
        );
        const data = await response.json();
        if (data.genres) {
          setGenres(data.genres); // Speichert die Genres im Zustand
        } else {
          setErrorMessage('Fehler beim Abrufen der Genres.'); // Fehlermeldung bei leerer Antwort
        }
      } catch (error) {
        console.error('Fehler beim Abrufen der Genres:', error);
        setErrorMessage('Fehler beim Abrufen der Genres.'); // Fehlermeldung bei API-Fehler
      }
    };
    fetchGenres(); // Ruft die Funktion zum Abrufen der Genres auf
  }, []);

  // Funktion für Seitennavigation, stabilisiert mit useCallback
  const goToPage = React.useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      handleSearch({ preventDefault: () => {} }, newPage); // Führt Suche mit neuer Seite aus
    }
  }, [totalPages]);

  // Funktion zum Senden der Suchanfrage an TMDB
  const handleSearch = async (e, requestedPage = 1) => {
    e.preventDefault(); // Verhindert das Standardverhalten des Formulars
    setErrorMessage(''); // Setzt Fehlermeldungen zurück

    // Setzt die aktuelle Seite für die Pagination
    setPage(requestedPage);

    let results = []; // Speichert die Suchergebnisse
    let hasFilters = false; // Prüft, ob Filter angewendet wurden

    // Genre-Parameter hinzufügen
    let genreId = null;
    if (genre) {
      genreId = parseInt(genre, 10); // Wandelt Genre-ID in Zahl um
      hasFilters = true; // Setzt Filter-Flag
    }

    // Stimmung als Keyword hinzufügen
    let keywordId = null;
    if (mood) {
      // Mappt Stimmungen auf passende TMDB-Keywords
      const keywordMap = {
        happy: 'feel good',
        intense: 'thrilling',
        sad: 'emotional',
        romantic: 'romance',
        adventurous: 'adventure',
        scary: 'horror',
        funny: 'comedy',
        mysterious: 'mystery',
        inspiring: 'inspirational',
        actionpacked: 'action packed',
        dramatic: 'drama',
        nostalgic: 'nostalgic',
      };
      try {
        const keywordResponse = await fetch(
          `https://api.themoviedb.org/3/search/keyword?api_key=${TMDB_API_KEY}&query=${keywordMap[mood]}`
        );
        const keywordData = await keywordResponse.json();
        if (keywordData.results[0]) {
          keywordId = keywordData.results[0].id; // Speichert die Keyword-ID
          hasFilters = true; // Setzt Filter-Flag
        } else {
          setErrorMessage('Kein passendes Keyword für die Stimmung gefunden.'); // Fehlermeldung bei fehlendem Keyword
        }
      } catch (error) {
        console.error('Fehler beim Abrufen der Keywords:', error);
        setErrorMessage('Fehler beim Abrufen der Stimmung.'); // Fehlermeldung bei API-Fehler
      }
    }

    // Suche nach Filmtitel durchführen
    if (similarTo) {
      try {
        let searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(similarTo)}&language=de-DE&page=${requestedPage}`;
        if (genreId) {
          searchUrl += `&with_genres=${genreId}`; // Fügt Genre-Filter hinzu
        }
        if (keywordId) {
          searchUrl += `&with_keywords=${keywordId}`; // Fügt Stimmungs-Filter hinzu
        }

        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();
        if (searchData.results && searchData.results.length > 0) {
          results = searchData.results; // Speichert die Suchergebnisse
          setTotalPages(searchData.total_pages || 1); // Aktualisiert die Gesamtzahl der Seiten
          if (props.onPageChange) {
            props.onPageChange(requestedPage, searchData.total_pages || 1); // Informiert über Seitenänderung
          }
          hasFilters = true; // Setzt Filter-Flag
        } else {
          setErrorMessage(`Keine Filme mit dem Titel "${similarTo}" gefunden.`); // Fehlermeldung bei leerer Suche
        }
      } catch (error) {
        console.error('Fehler beim Suchen nach Filmtitel:', error);
        setErrorMessage('Fehler beim Suchen nach Filmtitel.'); // Fehlermeldung bei API-Fehler
      }
    } else {
      // Fallback auf discover-API, wenn kein Titel angegeben ist
      let url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=de-DE&page=${requestedPage}`;
      if (genreId) {
        url += `&with_genres=${genreId}`; // Fügt Genre-Filter hinzu
      }
      if (keywordId) {
        url += `&with_keywords=${keywordId}`; // Fügt Stimmungs-Filter hinzu
      }

      if (!genre && !mood) {
        setErrorMessage('Bitte wähle mindestens ein Suchkriterium (Genre, Stimmung oder Ähnlich wie).');
        props.onSearchResults([]); // Gibt leere Ergebnisse zurück
        return;
      }

      try {
        const response = await fetch(url);
        const data = await response.json();
        results = data.results || []; // Speichert die Ergebnisse
        setTotalPages(data.total_pages || 1); // Aktualisiert die Gesamtzahl der Seiten
        if (props.onPageChange) {
          props.onPageChange(requestedPage, data.total_pages || 1); // Informiert über Seitenänderung
        }
      } catch (error) {
        console.error('Fehler beim Abrufen der Filme:', error);
        setErrorMessage('Fehler beim Abrufen der Filme.');
        props.onSearchResults([]); // Gibt leere Ergebnisse zurück
        return;
      }
    }

    // Fallback: Suche ohne Stimmung, wenn keine Ergebnisse gefunden wurden
    if (results.length === 0 && keywordId) {
      setErrorMessage('Keine Filme mit dieser Stimmung gefunden. Suche ohne Stimmung...');
      keywordId = null; // Ignoriert die Stimmung
      if (similarTo) {
        try {
          let searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(similarTo)}&language=de-DE&page=${requestedPage}`;
          if (genreId) {
            searchUrl += `&with_genres=${genreId}`; // Fügt Genre-Filter hinzu
          }
          const searchResponse = await fetch(searchUrl);
          const searchData = await searchResponse.json();
          if (searchData.results && searchData.results.length > 0) {
            results = searchData.results; // Speichert die neuen Ergebnisse
            setTotalPages(searchData.total_pages || 1); // Aktualisiert die Gesamtzahl der Seiten
            if (props.onPageChange) {
              props.onPageChange(requestedPage, data.total_pages || 1); // Informiert über Seitenänderung
            }
          }
        } catch (error) {
          console.error('Fehler beim Suchen ohne Stimmung:', error);
          setErrorMessage('Fehler beim Suchen ohne Stimmung.');
        }
      } else {
        let url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=de-DE&page=${requestedPage}`;
        if (genreId) {
          url += `&with_genres=${genreId}`; // Fügt Genre-Filter hinzu
        }
        try {
          const response = await fetch(url);
          const data = await response.json();
          results = data.results || []; // Speichert die neuen Ergebnisse
          setTotalPages(data.total_pages || 1); // Aktualisiert die Gesamtzahl der Seiten
          if (props.onPageChange) {
            props.onPageChange(requestedPage, data.total_pages || 1); // Informiert über Seitenänderung
          }
        } catch (error) {
          console.error('Fehler beim Abrufen der Filme ohne Stimmung:', error);
          setErrorMessage('Fehler beim Abrufen der Filme ohne Stimmung.');
        }
      }
    }

    if (results.length === 0) {
      setErrorMessage('Keine Filme gefunden. Versuche andere Kriterien.'); // Fehlermeldung bei leerer Suche
    }
    props.onSearchResults(results); // Gibt die Suchergebnisse an die übergeordnete Komponente weiter
  };

  // Übergibt die goToPage-Funktion an die übergeordnete Komponente
  React.useEffect(() => {
    if (props.onGoToPageChange) {
      props.onGoToPageChange(goToPage); // Stellt die Funktion für Seitennavigation bereit
    }
  }, [props.onGoToPageChange, goToPage]);

  // Rendert das Suchformular
  return React.createElement(
    'form',
    { onSubmit: handleSearch, className: 'bg-gray-800 p-6 rounded-md shadow-lg mb-8' }, // Formular-Container
    React.createElement(
      'div',
      { className: 'grid grid-cols-1 md:grid-cols-3 gap-4' }, // Grid-Layout für Eingabefelder
      React.createElement(
        'div',
        null,
        React.createElement('label', { className: 'block text-sm font-medium text-gray-300' }, 'Genre'), // Label für Genre
        React.createElement(
          'select',
          {
            value: genre,
            onChange: (e) => setGenre(e.target.value), // Aktualisiert Genre bei Auswahl
            className: 'mt-1 block w-full p-2 bg-gray-700 rounded-md text-white',
          },
          React.createElement('option', { value: '' }, 'Wähle ein Genre'), // Standard-Option
          genres.map(g => React.createElement('option', { key: g.id, value: g.id }, g.name)) // Dynamische Genre-Optionen
        )
      ),
      React.createElement(
        'div',
        null,
        React.createElement('label', { className: 'block text-sm font-medium text-gray-300' }, 'Stimmung'), // Label für Stimmung
        React.createElement(
          'select',
          {
            value: mood,
            onChange: (e) => setMood(e.target.value), // Aktualisiert Stimmung bei Auswahl
            className: 'mt-1 block w-full p-2 bg-gray-700 rounded-md text-white',
          },
          React.createElement('option', { value: '' }, 'Wähle eine Stimmung'), // Standard-Option
          React.createElement('option', { value: 'happy' }, 'Fröhlich'),
          React.createElement('option', { value: 'intense' }, 'Intensiv'),
          React.createElement('option', { value: 'sad' }, 'Traurig'),
          React.createElement('option', { value: 'romantic' }, 'Romantisch'),
          React.createElement('option', { value: 'adventurous' }, 'Abenteuerlich'),
          React.createElement('option', { value: 'scary' }, 'Gruselig'),
          React.createElement('option', { value: 'funny' }, 'Lustig'),
          React.createElement('option', { value: 'mysterious' }, 'Mysteriös'),
          React.createElement('option', { value: 'inspiring' }, 'Inspirierend'),
          React.createElement('option', { value: 'actionpacked' }, 'Actiongeladen'),
          React.createElement('option', { value: 'dramatic' }, 'Dramatisch'),
          React.createElement('option', { value: 'nostalgic' }, 'Nostalgisch')
        )
      ),
      React.createElement(
        'div',
        null,
        React.createElement('label', { className: 'block text-sm font-medium text-gray-300' }, 'Ähnlich wie'), // Label für Titel
        React.createElement('input', {
          type: 'text',
          value: similarTo,
          onChange: (e) => setSimilarTo(e.target.value), // Aktualisiert Titel bei Eingabe
          placeholder: 'z.B. Interstellar',
          className: 'mt-1 block w-full p-2 bg-gray-700 rounded-md text-white',
        })
      )
    ),
    errorMessage && React.createElement('p', { className: 'text-red-400 mt-2' }, errorMessage), // Zeigt Fehlermeldungen an
    React.createElement(
      'button',
      { type: 'submit', className: 'mt-4 w-full bg-yellow-400 text-gray-900 py-2 rounded-md hover:bg-yellow-500 transition' },
      'Suche starten' // Button zum Starten der Suche
    )
  );
}