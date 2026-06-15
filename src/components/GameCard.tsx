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

  return platforms.slice(0, 3).join(", ");
}

function GameCard({ game, libraryItem, onOpenGame }: GameCardProps) {
  const status = libraryItem ? libraryItem.status : "none";

  return (
    <article className="game-card">
      <button className="game-card__cover-button" onClick={() => onOpenGame(game)}>
        <img className="game-card__cover" src={game.cover} alt={game.title} />
      </button>

      <div className="game-card__content">
        <div className="game-card__top">
          <h2>{game.title}</h2>
          <span className="game-card__rating">★ {game.rating.toFixed(1)}</span>
        </div>

        <p className="game-card__info">
          {game.genres.length > 0 ? game.genres[0] : "Gênero não informado"}
        </p>

        <p className="game-card__platforms">{getShortPlatforms(game.platforms)}</p>

        <div className="game-card__footer">
          <span className="game-card__status">{getStatusText(status)}</span>
          <span>{game.ratingsCount.toLocaleString("pt-BR")} avaliações</span>
        </div>
      </div>
    </article>
  );
}

export default GameCard;