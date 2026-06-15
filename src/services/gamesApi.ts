import type { Game, GameDetails, RawgGame, RawgGameDetails } from "../types/game";

const API_URL = "https://api.rawg.io/api";

const defaultSearches = [
  "Elden Ring",
  "Resident Evil Requiem",
  "Pragmata",
  "Clair Obscur Expedition 33",
  "Monster Hunter Wilds",
  "Final Fantasy VII Rebirth",
  "Dragon's Dogma 2",
  "Like a Dragon Infinite Wealth",
  "Silent Hill 2",
  "Black Myth Wukong",
  "Hades II",
  "Death Stranding 2",
];

function getApiKey() {
  return import.meta.env.VITE_RAWG_API_KEY;
}

function getCover(image: string | null) {
  if (image) {
    return image;
  }

  return "https://placehold.co/600x800?text=Sem+Imagem";
}

function formatGame(rawGame: RawgGame): Game {
  return {
    id: rawGame.id,
    title: rawGame.name,
    cover: getCover(rawGame.background_image),
    background: getCover(rawGame.background_image),
    rating: rawGame.rating,
    ratingsCount: rawGame.ratings_count,
    releaseDate: rawGame.released || "Data não informada",
    genres: rawGame.genres.map(function (genre) {
      return genre.name;
    }),
    platforms: rawGame.platforms.map(function (item) {
      return item.platform.name;
    }),
  };
}

function formatGameDetails(rawGame: RawgGameDetails): GameDetails {
  return {
    id: rawGame.id,
    title: rawGame.name,
    cover: getCover(rawGame.background_image),
    background: getCover(rawGame.background_image),
    rating: rawGame.rating,
    ratingsCount: rawGame.ratings_count,
    releaseDate: rawGame.released || "Data não informada",
    genres: rawGame.genres.map(function (genre) {
      return genre.name;
    }),
    platforms: rawGame.platforms.map(function (item) {
      return item.platform.name;
    }),
    description: rawGame.description_raw || "Descrição não encontrada.",
    developer:
      rawGame.developers.length > 0
        ? rawGame.developers[0].name
        : "Desenvolvedora não informada",
    website: rawGame.website || "Site não informado",
  };
}

async function fetchFirstGameBySearch(searchText: string) {
  const apiKey = getApiKey();

  const response = await fetch(
    `${API_URL}/games?key=${apiKey}&search=${encodeURIComponent(
      searchText
    )}&page_size=1`
  );

  if (!response.ok) {
    throw new Error("Não foi possível buscar os jogos.");
  }

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    return null;
  }

  return formatGame(data.results[0]);
}

export async function getPopularGames() {
  const games = await Promise.all(
    defaultSearches.map(function (searchText) {
      return fetchFirstGameBySearch(searchText);
    })
  );

  return games.filter(function (game) {
    return game !== null;
  });
}

export async function searchGames(searchText: string) {
  const apiKey = getApiKey();

  const response = await fetch(
    `${API_URL}/games?key=${apiKey}&search=${encodeURIComponent(
      searchText
    )}&page_size=12`
  );

  if (!response.ok) {
    throw new Error("Não foi possível pesquisar jogos.");
  }

  const data = await response.json();

  return data.results.map(function (game: RawgGame) {
    return formatGame(game);
  });
}

export async function getGameDetails(gameId: number) {
  const apiKey = getApiKey();

  const response = await fetch(`${API_URL}/games/${gameId}?key=${apiKey}`);

  if (!response.ok) {
    throw new Error("Não foi possível carregar os detalhes do jogo.");
  }

  const data = await response.json();

  return formatGameDetails(data);
}