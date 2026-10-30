import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Header from "./components/Header";
import GameCard from "./components/GameCard";
import GameModal from "./components/GameModal";
import {
  getGameDetails,
  getPopularGames,
  searchGames,
} from "./services/gamesApi";
import type {
  Game,
  GameDetails,
  GameStatus,
  LibraryItem,
  StoredComments,
  StoredLibrary,
  ThemeMode,
  UserComment,
} from "./types/game";

const libraryStorageKey = "gameshelf-library";
const commentsStorageKey = "gameshelf-comments";
const themeStorageKey = "gameshelf-theme";

type ActiveView = "catalog" | "library";

function getInitialTheme(): ThemeMode {
  const savedTheme = localStorage.getItem(themeStorageKey);

  if (savedTheme === "light") {
    return "light";
  }

  return "dark";
}

function getInitialLibrary(): StoredLibrary {
  try {
    const savedLibrary = localStorage.getItem(libraryStorageKey);

    if (!savedLibrary) {
      return {};
    }

    const parsedLibrary = JSON.parse(savedLibrary);

    if (
      parsedLibrary &&
      typeof parsedLibrary === "object" &&
      !Array.isArray(parsedLibrary)
    ) {
      return parsedLibrary;
    }

    return {};
  }
  catch {
    return {};
  }
}

function getInitialComments(): StoredComments {
  try {
    const savedComments = localStorage.getItem(commentsStorageKey);

    if (!savedComments) {
      return {};
    }

    const parsedComments = JSON.parse(savedComments);

    if (
      parsedComments &&
      typeof parsedComments === "object" &&
      !Array.isArray(parsedComments)
    ) {
      return parsedComments;
    }

    return {};
  }
  catch {
    return {};
  }
}

function getSavedGame(game: Game): Game {
  return {
    id: game.id,
    title: game.title,
    cover: game.cover,
    background: game.background,
    rating: game.rating,
    ratingsCount: game.ratingsCount,
    releaseDate: game.releaseDate,
    genres: game.genres,
    platforms: game.platforms,
  };
}

function App() {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [games, setGames] = useState<Game[]>([]);

  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  const [library, setLibrary] = useState<StoredLibrary>(getInitialLibrary);
  const [comments, setComments] = useState<StoredComments>(getInitialComments);

  const [activeView, setActiveView] = useState<ActiveView>("catalog");
  const [libraryFilter, setLibraryFilter] = useState<GameStatus>("none");
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);
  const [libraryError, setLibraryError] = useState("");

  const [selectedGame, setSelectedGame] = useState<GameDetails | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [searchText, setSearchText] = useState("");
  const [currentSearch, setCurrentSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<GameStatus>("none");

  const gamesRequest = useRef(0);
  const modalRequest = useRef(0);
  const libraryLoadingRef = useRef(false);

  useEffect(function () {
    const requestNumber = ++gamesRequest.current;
    let cancelled = false;

    async function loadInitialGames() {
      try {
        setIsPageLoading(true);
        setErrorMessage("");

        const loadedGames = await getPopularGames();

        if (cancelled || requestNumber !== gamesRequest.current) {
          return;
        }

        setGames(loadedGames);
        setFeaturedGames(loadedGames.slice(0, 5));
        setFeaturedIndex(0);
      }
      catch {
        if (cancelled || requestNumber !== gamesRequest.current) {
          return;
        }

        setGames([]);
        setErrorMessage(
          "Não foi possível carregar os jogos. Tente novamente mais tarde."
        );
      }
      finally {
        if (!cancelled && requestNumber === gamesRequest.current) {
          setIsPageLoading(false);
        }
      }
    }

    loadInitialGames();

    return function () {
      cancelled = true;
    };
  }, []);

  useEffect(function () {
    localStorage.setItem(themeStorageKey, theme);
    document.body.classList.toggle("dark-theme", theme === "dark");
  }, [theme]);

  useEffect(function () {
    localStorage.setItem(libraryStorageKey, JSON.stringify(library));
  }, [library]);

  useEffect(function () {
    localStorage.setItem(commentsStorageKey, JSON.stringify(comments));
  }, [comments]);

  useEffect(function () {
    if (
      featuredGames.length < 2 ||
      isCarouselPaused ||
      selectedGame ||
      isModalLoading
    ) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const interval = window.setInterval(function () {
      setFeaturedIndex(function (currentIndex) {
        return (currentIndex + 1) % featuredGames.length;
      });
    }, 8000);

    return function () {
      window.clearInterval(interval);
    };
  }, [
    featuredGames.length,
    isCarouselPaused,
    selectedGame,
    isModalLoading,
  ]);

  function handleToggleTheme() {
    setTheme(function (currentTheme) {
      if (currentTheme === "light") {
        return "dark";
      }

      return "light";
    });
  }

  function handleNextFeatured() {
    if (featuredGames.length < 2) {
      return;
    }

    setFeaturedIndex(function (currentIndex) {
      return (currentIndex + 1) % featuredGames.length;
    });
  }

  function handlePreviousFeatured() {
    if (featuredGames.length < 2) {
      return;
    }

    setFeaturedIndex(function (currentIndex) {
      return (currentIndex - 1 + featuredGames.length) % featuredGames.length;
    });
  }

  function handleToggleCarousel() {
    setIsCarouselPaused(function (currentValue) {
      return !currentValue;
    });
  }

  async function handleOpenGame(game: Game) {
    const requestNumber = ++modalRequest.current;

    try {
      setSelectedGame(null);
      setIsModalLoading(true);
      setErrorMessage("");

      const details = await getGameDetails(game.id);

      if (requestNumber !== modalRequest.current) {
        return;
      }

      setSelectedGame(details);
    }
    catch {
      if (requestNumber !== modalRequest.current) {
        return;
      }

      setErrorMessage("Não foi possível abrir os detalhes do jogo.");
    }
    finally {
      if (requestNumber === modalRequest.current) {
        setIsModalLoading(false);
      }
    }
  }

  function handleCloseModal() {
    modalRequest.current++;
    setSelectedGame(null);
    setIsModalLoading(false);
  }

  function handleChangeStatus(gameId: number, status: GameStatus) {
    setLibrary(function (currentLibrary) {
      if (status === "none") {
        const updatedLibrary = { ...currentLibrary };
        delete updatedLibrary[gameId];

        return updatedLibrary;
      }

      const currentItem = currentLibrary[gameId];

      const currentGame = selectedGame?.id === gameId
        ? getSavedGame(selectedGame)
        : currentItem?.game;

      const updatedItem: LibraryItem = {
        gameId: gameId,
        status: status,
        personalRating:
          status === "completed" && currentItem
            ? currentItem.personalRating
            : 0,
        game: currentGame,
      };

      return {
        ...currentLibrary,
        [gameId]: updatedItem,
      };
    });
  }

  function handleChangeRating(gameId: number, rating: number) {
    setLibrary(function (currentLibrary) {
      const currentItem = currentLibrary[gameId];

      if (!currentItem || currentItem.status !== "completed") {
        return currentLibrary;
      }

      return {
        ...currentLibrary,
        [gameId]: {
          ...currentItem,
          personalRating: rating,
        },
      };
    });
  }

  function handleAddComment(gameId: number, text: string) {
    const cleanText = text.trim();

    if (cleanText === "") {
      return;
    }

    const newComment: UserComment = {
      id: Date.now(),
      gameId: gameId,
      userName: "Você",
      text: cleanText,
      createdAt: new Date().toLocaleDateString("pt-BR"),
    };

    setComments(function (currentComments) {
      const currentGameComments = currentComments[gameId] || [];

      return {
        ...currentComments,
        [gameId]: [...currentGameComments, newComment],
      };
    });
  }

  async function handleShowLibrary() {
    setActiveView("library");

    if (libraryLoadingRef.current) {
      return;
    }

    const missingGames = Object.values(library).filter(function (item) {
      return item.status !== "none" && !item.game;
    });

    if (missingGames.length === 0) {
      setLibraryError("");
      return;
    }

    libraryLoadingRef.current = true;
    setIsLibraryLoading(true);
    setLibraryError("");

    try {
      const recoveredGames = await Promise.all(
        missingGames.map(async function (item) {
          try {
            const details = await getGameDetails(item.gameId);

            return {
              gameId: item.gameId,
              game: getSavedGame(details),
            };
          }
          catch {
            return null;
          }
        })
      );

      setLibrary(function (currentLibrary) {
        const updatedLibrary = { ...currentLibrary };

        recoveredGames.forEach(function (result) {
          if (!result) {
            return;
          }

          const currentItem = updatedLibrary[result.gameId];

          if (currentItem && !currentItem.game) {
            updatedLibrary[result.gameId] = {
              ...currentItem,
              game: result.game,
            };
          }
        });

        return updatedLibrary;
      });

      if (recoveredGames.some(function (result) {
        return result === null;
      })) {
        setLibraryError(
          "Não foi possível recuperar todos os jogos antigos. Seus registros continuam salvos."
        );
      }
    }
    catch {
      setLibraryError("Não foi possível recuperar os dados da biblioteca.");
    }
    finally {
      libraryLoadingRef.current = false;
      setIsLibraryLoading(false);
    }
  }

  async function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanSearch = searchText.trim();

    if (cleanSearch === "") {
      return;
    }

    const requestNumber = ++gamesRequest.current;

    try {
      setIsPageLoading(true);
      setErrorMessage("");
      setGenreFilter("all");
      setPlatformFilter("all");
      setStatusFilter("none");

      const searchedGames = await searchGames(cleanSearch);

      if (requestNumber !== gamesRequest.current) {
        return;
      }

      setGames(searchedGames);
      setCurrentSearch(cleanSearch);
    }
    catch {
      if (requestNumber !== gamesRequest.current) {
        return;
      }

      setGames([]);
      setErrorMessage("Não foi possível pesquisar jogos. Tente novamente.");
    }
    finally {
      if (requestNumber === gamesRequest.current) {
        setIsPageLoading(false);
      }
    }
  }

  async function handleClearSearch() {
    const requestNumber = ++gamesRequest.current;

    setSearchText("");
    setCurrentSearch("");
    setGenreFilter("all");
    setPlatformFilter("all");
    setStatusFilter("none");

    try {
      setIsPageLoading(true);
      setErrorMessage("");

      const loadedGames = await getPopularGames();

      if (requestNumber !== gamesRequest.current) {
        return;
      }

      setGames(loadedGames);
      setFeaturedGames(loadedGames.slice(0, 5));
      setFeaturedIndex(0);
    }
    catch {
      if (requestNumber !== gamesRequest.current) {
        return;
      }

      setGames([]);
      setErrorMessage("Não foi possível recarregar os jogos.");
    }
    finally {
      if (requestNumber === gamesRequest.current) {
        setIsPageLoading(false);
      }
    }
  }

  const genres = Array.from(
    new Set(
      games.flatMap(function (game) {
        return game.genres;
      })
    )
  ).sort();

  const platforms = Array.from(
    new Set(
      games.flatMap(function (game) {
        return game.platforms;
      })
    )
  ).sort();

  const filteredGames = games.filter(function (game) {
    const libraryItem = library[game.id];

    const matchesGenre =
      genreFilter === "all" || game.genres.includes(genreFilter);

    const matchesPlatform =
      platformFilter === "all" || game.platforms.includes(platformFilter);

    const matchesStatus =
      statusFilter === "none" ||
      (libraryItem && libraryItem.status === statusFilter);

    return matchesGenre && matchesPlatform && matchesStatus;
  });

  const libraryItems = Object.values(library).filter(function (item) {
    return item.status !== "none";
  });

  const visibleLibrary = libraryItems.filter(function (item) {
    return libraryFilter === "none" || item.status === libraryFilter;
  });

  const libraryCount = libraryItems.length;

  const completedCount = libraryItems.filter(function (item) {
    return item.status === "completed";
  }).length;

  const playingCount = libraryItems.filter(function (item) {
    return item.status === "playing";
  }).length;

  const userCommentsCount = Object.values(comments).reduce(
    function (total, gameComments) {
      return total + gameComments.length;
    },
    0
  );

  const selectedGameComments = selectedGame
    ? comments[selectedGame.id] || []
    : [];

  const featuredGame = featuredGames[featuredIndex] || null;

  const nextFeaturedGame = featuredGames.length > 1
    ? featuredGames[(featuredIndex + 1) % featuredGames.length]
    : null;

  const heroStyle = featuredGame
    ? {
        backgroundImage: `linear-gradient(90deg, rgba(8, 13, 25, 0.96), rgba(8, 13, 25, 0.65), rgba(8, 13, 25, 0.3)), url("${featuredGame.background}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : undefined;

  return (
    <div className="app">
      <Header
        theme={theme}
        libraryCount={libraryCount}
        userCommentsCount={userCommentsCount}
        onToggleTheme={handleToggleTheme}
      />

      <main className="main">
        <section
          className="hero"
          style={heroStyle}
          aria-label="Jogos em destaque"
        >
          <div className="hero__content">
            <span className="hero__label">EM DESTAQUE</span>

            <h2>
              {featuredGame
                ? featuredGame.title
                : "Descubra seu próximo jogo"}
            </h2>

            {featuredGame && (
              <div className="hero__meta">
                {featuredGame.ratingsCount > 0 && (
                  <span>★ {featuredGame.rating.toFixed(1)}</span>
                )}

                {featuredGame.genres.slice(0, 2).map(function (genre) {
                  return <span key={genre}>{genre}</span>;
                })}

                {featuredGame.releaseDate !== "Data não informada" && (
                  <span>{featuredGame.releaseDate.slice(0, 4)}</span>
                )}
              </div>
            )}

            <p>
              Explore novos títulos, descubra suas próximas aventuras
              e organize seus jogos em uma única biblioteca.
            </p>

            {featuredGame && (
              <button
                className="hero__button"
                type="button"
                onClick={() => handleOpenGame(featuredGame)}
              >
                Ver detalhes do jogo
              </button>
            )}

            {featuredGames.length > 1 && (
              <div className="hero__controls">
                <div
                  className="hero__dots"
                  aria-label="Selecionar jogo em destaque"
                >
                  {featuredGames.map(function (game, index) {
                    return (
                      <button
                        key={game.id}
                        type="button"
                        className={
                          index === featuredIndex
                            ? "hero__dot hero__dot--active"
                            : "hero__dot"
                        }
                        aria-label={`Mostrar ${game.title}`}
                        aria-pressed={index === featuredIndex}
                        onClick={() => setFeaturedIndex(index)}
                      />
                    );
                  })}
                </div>

                <div className="hero__navigation">
                  <button
                    type="button"
                    onClick={handlePreviousFeatured}
                    aria-label="Jogo anterior"
                  >
                    ←
                  </button>

                  <button
                    type="button"
                    onClick={handleNextFeatured}
                    aria-label="Próximo jogo"
                  >
                    →
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleCarousel}
                  >
                    {isCarouselPaused ? "Continuar" : "Pausar"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {nextFeaturedGame && (
            <div className="hero__preview">
              <span>PRÓXIMO DESTAQUE</span>

              <button
                type="button"
                onClick={handleNextFeatured}
                aria-label={`Mostrar ${nextFeaturedGame.title}`}
              >
                <img src={nextFeaturedGame.background} alt="" />
                <strong>{nextFeaturedGame.title}</strong>
              </button>
            </div>
          )}
        </section>

        <section
          className="library-summary"
          aria-label="Resumo da biblioteca"
        >
          <div>
            <span>Na biblioteca</span>
            <strong>{libraryCount}</strong>
          </div>

          <div>
            <span>Finalizados</span>
            <strong>{completedCount}</strong>
          </div>

          <div>
            <span>Jogando agora</span>
            <strong>{playingCount}</strong>
          </div>
        </section>

        <nav className="view-tabs" aria-label="Navegação do GameShelf">
          <button
            className={
              activeView === "catalog"
                ? "view-tab view-tab--active"
                : "view-tab"
            }
            type="button"
            aria-current={activeView === "catalog" ? "page" : undefined}
            onClick={() => setActiveView("catalog")}
          >
            Explorar jogos
          </button>

          <button
            className={
              activeView === "library"
                ? "view-tab view-tab--active"
                : "view-tab"
            }
            type="button"
            aria-current={activeView === "library" ? "page" : undefined}
            onClick={handleShowLibrary}
          >
            Minha Biblioteca ({libraryCount})
          </button>
        </nav>

        {activeView === "catalog" ? (
          <>
            <section
              className="filters-section"
              aria-label="Buscar e filtrar jogos"
            >
              <form
                className="search-form"
                onSubmit={handleSearchSubmit}
              >
                <input
                  type="search"
                  aria-label="Pesquisar jogos"
                  value={searchText}
                  onChange={(event) =>
                    setSearchText(event.target.value)
                  }
                  placeholder="Pesquisar jogo..."
                  autoComplete="off"
                />

                <button type="submit" disabled={isPageLoading}>
                  Pesquisar
                </button>

                <button
                  type="button"
                  onClick={handleClearSearch}
                  disabled={isPageLoading}
                >
                  Limpar
                </button>
              </form>

              <div className="filters">
                <label>
                  Gênero
                  <select
                    value={genreFilter}
                    onChange={(event) =>
                      setGenreFilter(event.target.value)
                    }
                  >
                    <option value="all">Todos</option>

                    {genres.map(function (genre) {
                      return (
                        <option key={genre} value={genre}>
                          {genre}
                        </option>
                      );
                    })}
                  </select>
                </label>

                <label>
                  Plataforma
                  <select
                    value={platformFilter}
                    onChange={(event) =>
                      setPlatformFilter(event.target.value)
                    }
                  >
                    <option value="all">Todas</option>

                    {platforms.map(function (platform) {
                      return (
                        <option key={platform} value={platform}>
                          {platform}
                        </option>
                      );
                    })}
                  </select>
                </label>

                <label>
                  Status
                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(event.target.value as GameStatus)
                    }
                  >
                    <option value="none">Todos</option>
                    <option value="wantToPlay">Quero jogar</option>
                    <option value="playing">Jogando</option>
                    <option value="completed">Finalizado</option>
                    <option value="dropped">Abandonado</option>
                    <option value="favorite">Favorito</option>
                  </select>
                </label>
              </div>
            </section>

            {errorMessage && (
              <p className="error-message" role="alert">
                {errorMessage}
              </p>
            )}

            {isPageLoading && (
              <p className="loading-message" role="status">
                Carregando jogos...
              </p>
            )}

            {!isPageLoading && !errorMessage && (
              <>
                <div className="catalog-header">
                  <div>
                    <span className="catalog-label">EXPLORE</span>

                    <h2>
                      {currentSearch
                        ? "Resultados da pesquisa"
                        : "Jogos em destaque"}
                    </h2>
                  </div>

                  <span className="catalog-count">
                    {filteredGames.length} jogos encontrados
                  </span>
                </div>

                {filteredGames.length === 0 ? (
                  <p className="empty-message">
                    Nenhum jogo corresponde aos filtros selecionados.
                  </p>
                ) : (
                  <section
                    className="games-grid"
                    aria-label="Catálogo de jogos"
                  >
                    {filteredGames.map(function (game) {
                      return (
                        <GameCard
                          key={game.id}
                          game={game}
                          libraryItem={library[game.id]}
                          onOpenGame={handleOpenGame}
                        />
                      );
                    })}
                  </section>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <div className="catalog-header">
              <div>
                <span className="catalog-label">SUA COLEÇÃO</span>
                <h2>Minha Biblioteca</h2>
              </div>

              <span className="catalog-count">
                {libraryCount} jogos salvos
              </span>
            </div>

            <section className="filters-section" aria-label="Filtrar biblioteca">
              <div className="filters">
                <label>
                  Mostrar por status
                  <select
                    value={libraryFilter}
                    onChange={(event) =>
                      setLibraryFilter(event.target.value as GameStatus)
                    }
                  >
                    <option value="none">Todos os jogos</option>
                    <option value="wantToPlay">Quero jogar</option>
                    <option value="playing">Jogando</option>
                    <option value="completed">Finalizados</option>
                    <option value="dropped">Abandonados</option>
                    <option value="favorite">Favoritos</option>
                  </select>
                </label>
              </div>
            </section>

            {isLibraryLoading && (
              <p className="loading-message" role="status">
                Recuperando informações dos jogos salvos...
              </p>
            )}

            {libraryError && (
              <p className="error-message" role="alert">
                {libraryError}
              </p>
            )}

            {visibleLibrary.length === 0 ? (
              <div className="empty-message">
                {libraryCount === 0 ? (
                  <>
                    <p>Sua biblioteca ainda está vazia.</p>
                    <p>Explore o catálogo e adicione seu primeiro jogo!</p>
                  </>
                ) : (
                  <p>Nenhum jogo corresponde ao status selecionado.</p>
                )}

                <button
                  className="theme-button"
                  type="button"
                  onClick={() => setActiveView("catalog")}
                >
                  Explorar jogos
                </button>
              </div>
            ) : (
              <section
                className="games-grid"
                aria-label="Jogos da minha biblioteca"
              >
                {visibleLibrary.map(function (item) {
                  if (!item.game) {
                    return (
                      <article className="game-card" key={item.gameId}>
                        <div className="game-card__content">
                          <h3>Jogo #{item.gameId}</h3>

                          <p className="game-card__info">
                            Informações do jogo ainda não disponíveis.
                          </p>

                          <button
                            className="theme-button"
                            type="button"
                            disabled={isLibraryLoading}
                            onClick={handleShowLibrary}
                          >
                            Tentar recuperar
                          </button>
                        </div>
                      </article>
                    );
                  }

                  return (
                    <GameCard
                      key={item.gameId}
                      game={item.game}
                      libraryItem={item}
                      onOpenGame={handleOpenGame}
                    />
                  );
                })}
              </section>
            )}
          </>
        )}
      </main>

      {(selectedGame || isModalLoading) && (
        <GameModal
          game={selectedGame}
          libraryItem={
            selectedGame
              ? library[selectedGame.id]
              : undefined
          }
          userComments={selectedGameComments}
          isLoading={isModalLoading}
          onClose={handleCloseModal}
          onChangeStatus={handleChangeStatus}
          onChangeRating={handleChangeRating}
          onAddComment={handleAddComment}
        />
      )}
    </div>
  );
}

export default App;