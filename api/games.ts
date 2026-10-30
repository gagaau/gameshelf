
const API_URL = "https://api.rawg.io/api";

export async function GET(request: Request) {
  const apiKey = process.env.RAWG_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "Chave da API não configurada." },
      { status: 500 }
    );
  }

  const url = new URL(request.url);
  const gameId = url.searchParams.get("id");
  const search = url.searchParams.get("search")?.trim();

  const apiUrl = new URL(`${API_URL}/games`);

  if (gameId) {
    if (!/^[1-9]\d*$/.test(gameId)) {
      return Response.json(
        { error: "ID do jogo inválido." },
        { status: 400 }
      );
    }

    apiUrl.pathname = `/api/games/${gameId}`;
  }
  else if (search) {
    apiUrl.searchParams.set("search", search.slice(0, 100));
    apiUrl.searchParams.set("page_size", "12");
  }
  else {
    apiUrl.searchParams.set("ordering", "-added");
    apiUrl.searchParams.set("page_size", "18");
  }

  apiUrl.searchParams.set("key", apiKey);

  try {
    const response = await fetch(apiUrl, {
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return Response.json(
        { error: "Não foi possível consultar a RAWG." },
        { status: response.status }
      );
    }

    const data = await response.json();

    return Response.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=600",
      },
    });
  }
  catch {
    return Response.json(
      { error: "Falha na comunicação com a RAWG." },
      { status: 502 }
    );
  }
}
