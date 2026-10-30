import type { Game, GameStatus, LibraryItem } from "../types/game";

type GameCardProps = {
  game: Game;
  libraryItem?: LibraryItem;
  onOpenGame: (game: Game) => void;
};

function getStatusText(status: GameStatus) {
  if (status === "wantToPlay") {
    return "Quero jogar";
  }

  if (status === "playing") {
    return "Jogando";
  }

  if (status === "completed") {
    return "Finalizado";
  }

  if (status === "dropped") {
    return "Abandonado";
  }

  if (status === "favorite") {
    return "Favorito";
  }

  return "Fora da biblioteca";
}

function getShortPlatforms(platforms: string[]) {
  if (platforms.length === 0) {
    return "Plataforma não informada";
  }

  const visiblePlatforms = platforms.slice(0, 2).join(" · ");
  const remainingCount = platforms.length - 2;

  if (remainingCount > 0) {
    return `${visiblePlatforms} +${remainingCount}`;
  }

  return visiblePlatforms;
}

function GameCard({ game, libraryItem, onOpenGame }: GameCardProps) {
  const status = libraryItem ? libraryItem.status : "none";

  const genres = game.genres.length > 0
    ? game.genres.slice(0, 2).join(" · ")
    : "Gênero não informado";

  const ratingsText = game.ratingsCount === 1
    ? "1 avaliação"
    : `${game.ratingsCount.toLocaleString("pt-BR")} avaliações`;

  return (
    <article className="game-card">
      <button
        className="game-card__cover-button"
        type="button"
        onClick={() => onOpenGame(game)}
        aria-label={`Ver detalhes de ${game.title}`}
      >
        <img
          className="game-card__cover"
          src={game.cover}
          alt=""
          loading="lazy"
          decoding="async"
        />
      </button>

      <div className="game-card__content">
        <div className="game-card__top">
          <h3>{game.title}</h3>

          {game.ratingsCount > 0 && (
            <span className="game-card__rating">
              ★ {game.rating.toFixed(1)}
            </span>
          )}
        </div>

        <p className="game-card__info">{genres}</p>

        <p className="game-card__platforms">
          {getShortPlatforms(game.platforms)}
        </p>

        <div className="game-card__footer">
          {status !== "none" && (
            <span className="game-card__status">
              {getStatusText(status)}
            </span>
          )}

          <span className="game-card__reviews">
            {ratingsText}
          </span>
        </div>
      </div>
    </article>
  );
}

export default GameCard;