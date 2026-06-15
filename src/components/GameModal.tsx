import { useState } from "react";
import type {
  FakeComment,
  GameDetails,
  GameStatus,
  LibraryItem,
  UserComment,
} from "../types/game";

type GameModalProps = {
  game: GameDetails | null;
  libraryItem?: LibraryItem;
  fakeComments: FakeComment[];
  userComments: UserComment[];
  isLoading: boolean;
  onClose: () => void;
  onChangeStatus: (gameId: number, status: GameStatus) => void;
  onChangeRating: (gameId: number, rating: number) => void;
  onAddComment: (gameId: number, text: string) => void;
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

function GameModal({
  game,
  libraryItem,
  fakeComments,
  userComments,
  isLoading,
  onClose,
  onChangeStatus,
  onChangeRating,
  onAddComment,
}: GameModalProps) {
  const [commentText, setCommentText] = useState("");

  if (!game && !isLoading) {
    return null;
  }

  function handleCommentSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!game) {
      return;
    }

    if (commentText.trim() === "") {
      return;
    }

    onAddComment(game.id, commentText);
    setCommentText("");
  }

  function handleStatusChange(event: React.ChangeEvent<HTMLSelectElement>) {
    if (!game) {
      return;
    }

    onChangeStatus(game.id, event.target.value as GameStatus);
  }

  function handleRatingClick(rating: number) {
    if (!game) {
      return;
    }

    onChangeRating(game.id, rating);
  }

  const currentStatus = libraryItem ? libraryItem.status : "none";
  const personalRating = libraryItem ? libraryItem.personalRating : 0;
  const canRate = currentStatus === "completed";

  return (
    <div className="modal-backdrop">
      <section className="game-modal">
        <button className="game-modal__close" onClick={onClose}>
          Fechar
        </button>

        {isLoading && (
          <div className="modal-loading">
            <p>Carregando detalhes do jogo...</p>
          </div>
        )}

        {game && !isLoading && (
          <div className="game-modal__content">
            <div className="game-modal__image-area">
              <img className="game-modal__cover" src={game.cover} alt={game.title} />
            </div>

            <div className="game-modal__details">
              <span className="game-modal__tag">{getStatusText(currentStatus)}</span>

              <h2>{game.title}</h2>

              <p className="game-modal__description">{game.description}</p>

              <div className="game-modal__info-grid">
                <div>
                  <strong>Nota geral</strong>
                  <span>★ {game.rating.toFixed(1)}</span>
                </div>

                <div>
                  <strong>Avaliações</strong>
                  <span>{game.ratingsCount.toLocaleString("pt-BR")}</span>
                </div>

                <div>
                  <strong>Lançamento</strong>
                  <span>{game.releaseDate}</span>
                </div>

                <div>
                  <strong>Desenvolvedora</strong>
                  <span>{game.developer}</span>
                </div>

                <div>
                  <strong>Gêneros</strong>
                  <span>{game.genres.length > 0 ? game.genres.join(", ") : "Não informado"}</span>
                </div>

                <div>
                  <strong>Plataformas</strong>
                  <span>
                    {game.platforms.length > 0
                      ? game.platforms.slice(0, 5).join(", ")
                      : "Não informado"}
                  </span>
                </div>
              </div>

              <div className="library-box">
                <label htmlFor="status">Status na biblioteca</label>

                <select id="status" value={currentStatus} onChange={handleStatusChange}>
                  <option value="none">Fora da biblioteca</option>
                  <option value="wantToPlay">Quero jogar</option>
                  <option value="playing">Jogando</option>
                  <option value="completed">Finalizado</option>
                  <option value="dropped">Abandonado</option>
                  <option value="favorite">Favorito</option>
                </select>

                <div className="stars-area">
                  <span>Sua nota</span>

                  <div className="stars">
                    {[1, 2, 3, 4, 5].map(function (star) {
                      return (
                        <button
                          key={star}
                          className={star <= personalRating ? "star star--active" : "star"}
                          disabled={!canRate}
                          onClick={() => handleRatingClick(star)}
                        >
                          ★
                        </button>
                      );
                    })}
                  </div>

                  {!canRate && (
                    <small>Você só pode dar nota depois de marcar como Finalizado.</small>
                  )}
                </div>
              </div>

              <div className="comments-area">
                <h3>Comentários da comunidade</h3>

                <div className="comments-list">
                  {fakeComments.map(function (comment) {
                    return (
                      <article className="comment" key={comment.id}>
                        <strong>{comment.author}</strong>
                        <p>{comment.text}</p>
                      </article>
                    );
                  })}

                  {userComments.map(function (comment) {
                    return (
                      <article className="comment comment--user" key={comment.id}>
                        <strong>{comment.userName}</strong>
                        <p>{comment.text}</p>
                        <span>{comment.createdAt}</span>
                      </article>
                    );
                  })}
                </div>

                <form className="comment-form" onSubmit={handleCommentSubmit}>
                  <label htmlFor="comment">Adicionar comentário</label>

                  <textarea
                    id="comment"
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    placeholder="Escreva sua opinião sobre o jogo..."
                  />

                  <button type="submit">Comentar</button>
                </form>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default GameModal;