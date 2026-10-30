import type {
  Game,
  GameDetails,
  RawgGame,
  RawgGameDetails,
} from "../types/game";

const API_URL = "/api/games";

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
    genres: rawGame.genres?.map(function (genre) {
      return genre.name;
    }) ?? [],
    platforms: rawGame.platforms?.map(function (item) {
      return item.platform.name;
    }) ?? [],
  };
}

function formatGameDetails(rawGame: RawgGameDetails): GameDetails {
  return {
    ...formatGame(rawGame),
    description: rawGame.description_raw || "Descrição não encontrada.",
    developer:
      rawGame.developers?.[0]?.name || "Desenvolvedora não informada",
    website: rawGame.website || "Site não informado",
  };
}

async function fetchGames(url: string): Promise<Game[]> {
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Limite de consultas atingido. Tente novamente mais tarde.");
    }

    throw new Error("Não foi possível carregar os jogos.");
  }

  const data: { results: RawgGame[] } = await response.json();

  if (!Array.isArray(data.results)) {
    throw new Error("A API retornou dados inválidos.");
  }

  return data.results.map(function (game) {
    return formatGame(game);
  });
}

export async function getPopularGames(): Promise<Game[]> {
  return fetchGames(API_URL);
}

export async function searchGames(searchText: string): Promise<Game[]> {
  const cleanSearch = searchText.trim();

  if (cleanSearch === "") {
    return [];
  }

  return fetchGames(
    `${API_URL}?search=${encodeURIComponent(cleanSearch)}`
  );
}

export async function getGameDetails(gameId: number): Promise<GameDetails> {
  const response = await fetch(`${API_URL}?id=${gameId}`);

  if (!response.ok) {
    throw new Error("Não foi possível carregar os detalhes do jogo.");
  }

  const data: RawgGameDetails = await response.json();

  return formatGameDetails(data);
}