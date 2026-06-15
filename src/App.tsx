import { useEffect, useState } from "react";
import Header from "./components/Header";
import GameCard from "./components/GameCard";
import GameModal from "./components/GameModal";
import { getFakeComments } from "./data/fakeComments";
import { getGameDetails, getPopularGames, searchGames } from "./services/gamesApi";
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

function getInitialTheme(): ThemeMode {
  const savedTheme = localStorage.getItem(themeStorageKey);

  if (savedTheme === "dark") {
    return "dark";
  }

  return "light";
}

function getInitialLibrary(): StoredLibrary {
  const savedLibrary = localStorage.getItem(libraryStorageKey);

  if (!savedLibrary) {
    return {};
  }

  return JSON.parse(savedLibrary);
}

function getInitialComments(): StoredComments {
  const savedComments = localStorage.getItem(commentsStorageKey);

  if (!savedComments) {
    return {};
  }

  return JSON.parse(savedComments);
}

function App() {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [games, setGames] = useState<Game[]>([]);
  const [library, setLibrary] = useState<StoredLibrary>(getInitialLibrary);
  const [comments, setComments] = useState<StoredComments>(getInitialComments);
  const [selectedGame, setSelectedGame] = useState<GameDetails | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchText, setSearchText] = useState("");
  const [genreFilter, setGenreFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<GameStatus>("none");
  const [logoutMessage, setLogoutMessage] = useState("");

  useEffect(function () {
    async function loadGames() {
      try {
        setIsPageLoading(true);
        setErrorMessage("");

        const loadedGames = await getPopularGames();

        setGames(loadedGames);

        const eldenRing = loadedGames.find(function (game) {
          return game.title.toLowerCase().includes("elden ring");
        });

        if (eldenRing) {
          setLibrary(function (currentLibrary) {
            if (currentLibrary[eldenRing.id]) {
              return currentLibrary;
            }

            return {
              ...currentLibrary,
              [eldenRing.id]: {
                gameId: eldenRing.id,
                status: "completed",
                personalRating: 5,
              },
            };
          });
        }
      } catch {
        setErrorMessage("Não foi possível carregar os jogos. Confira sua chave da API.");
      } finally {
        setIsPageLoading(false);
      }
    }

    loadGames();
  }, []);

  useEffect(
    function () {
      localStorage.setItem(themeStorageKey, theme);
      document.body.className = theme === "dark" ? "dark-theme" : "";
    },
    [theme]
  );

  useEffect(
    function () {
      localStorage.setItem(libraryStorageKey, JSON.stringify(library));
    },
    [library]
  );

  useEffect(
    function () {
      localStorage.setItem(commentsStorageKey, JSON.stringify(comments));
    },
    [comments]
  );

  function handleToggleTheme() {
    setTheme(function (currentTheme) {
      if (currentTheme === "light") {
        return "dark";
      }

      return "light";
    });
  }

  function handleLogout() {
    setLogoutMessage("Só pode sair se me contratar.");

    setTimeout(function () {
      setLogoutMessage("");
    }, 3000);
  }

  async function handleOpenGame(game: Game) {
    try {
      setSelectedGame(null);
      setIsModalLoading(true);

      const details = await getGameDetails(game.id);

      setSelectedGame(details);
    } catch {
      setErrorMessage("Não foi possível abrir os detalhes do jogo.");
    } finally {
      setIsModalLoading(false);
    }
  }

  function handleCloseModal() {
    setSelectedGame(null);
  }

  function handleChangeStatus(gameId: number, status: GameStatus) {
    setLibrary(function (currentLibrary) {
      if (status === "none") {
        const updatedLibrary = { ...currentLibrary };
        delete updatedLibrary[gameId];

        return updatedLibrary;
      }

      const currentItem = currentLibrary[gameId];

      const updatedItem: LibraryItem = {
        gameId: gameId,
        status: status,
        personalRating:
          status === "completed" && currentItem ? currentItem.personalRating : 0,
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
    const newComment: UserComment = {
      id: Date.now(),
      gameId: gameId,
      userName: "JoséPlayer",
      text: text,
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

  async function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (searchText.trim() === "") {
      return;
    }

    try {
      setIsPageLoading(true);
      setErrorMessage("");

      const searchedGames = await searchGames(searchText);

      setGames(searchedGames);
    } catch {
      setErrorMessage("Não foi possível pesquisar jogos.");
    } finally {
      setIsPageLoading(false);
    }
  }

  async function handleClearSearch() {
    try {
      setSearchText("");
      setGenreFilter("all");
      setPlatformFilter("all");
      setStatusFilter("none");
      setIsPageLoading(true);
      setErrorMessage("");

      const loadedGames = await getPopularGames();

      setGames(loadedGames);
    } catch {
      setErrorMessage("Não foi possível carregar os jogos iniciais.");
    } finally {
      setIsPageLoading(false);
    }
  }

  const genres = Array.from(
    new Set(
      games.flatMap(function (game) {
        return game.genres;
      })
    )
  );

  const platforms = Array.from(
    new Set(
      games.flatMap(function (game) {
        return game.platforms;
      })
    )
  );

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

  const libraryItems = Object.values(library);

  const libraryCount = libraryItems.length;

  const userCommentsCount = Object.values(comments).reduce(function (
    total,
    gameComments
  ) {
    return total + gameComments.length;
  },
  0);

  const completedCount = libraryItems.filter(function (item) {
    return item.status === "completed";
  }).length;

  const playingCount = libraryItems.filter(function (item) {
    return item.status === "playing";
  }).length;

  const selectedGameComments = selectedGame ? comments[selectedGame.id] || [] : [];
  const selectedGameFakeComments = selectedGame
    ? getFakeComments(selectedGame.id)
    : [];

  return (
    <div className="app">
      <Header
        theme={theme}
        libraryCount={libraryCount}
        userCommentsCount={userCommentsCount}
        onToggleTheme={handleToggleTheme}
        onLogout={handleLogout}
        logoutMessage={logoutMessage}
      />

      <main className="main">
        <section className="hero">
          <div>
            <span className="hero__label">Usuário logado</span>
            <h2>Bem-vindo de volta, JoséPlayer.</h2>
            <p>
              Pesquise jogos, veja detalhes, salve na sua biblioteca e registre
              comentários como em uma rede social de games.
            </p>
          </div>

          <div className="hero__panel">
            <div>
              <strong>{libraryCount}</strong>
              <span>na biblioteca</span>
            </div>

            <div>
              <strong>{completedCount}</strong>
              <span>finalizados</span>
            </div>

            <div>
              <strong>{playingCount}</strong>
              <span>jogando agora</span>
            </div>
          </div>
        </section>

        <section className="filters-section">
          <form className="search-form" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Pesquisar jogo..."
            />

            <button type="submit">Pesquisar</button>
            <button type="button" onClick={handleClearSearch}>
              Limpar
            </button>
          </form>

          <div className="filters">
            <label>
              Gênero
              <select
                value={genreFilter}
                onChange={(event) => setGenreFilter(event.target.value)}
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
                onChange={(event) => setPlatformFilter(event.target.value)}
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
                onChange={(event) => setStatusFilter(event.target.value as GameStatus)}
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

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        {isPageLoading && <p className="loading-message">Carregando jogos...</p>}

        {!isPageLoading && filteredGames.length === 0 && (
          <p className="empty-message">Nenhum jogo encontrado.</p>
        )}

        {!isPageLoading && filteredGames.length > 0 && (
          <section className="games-grid">
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
      </main>

      {(selectedGame || isModalLoading) && (
        <GameModal
          game={selectedGame}
          libraryItem={selectedGame ? library[selectedGame.id] : undefined}
          fakeComments={selectedGameFakeComments}
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
