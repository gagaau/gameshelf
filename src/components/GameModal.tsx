import { useEffect, useRef, useState } from "react";
import type {
  GameDetails,
  GameStatus,
  LibraryItem,
  UserComment,
} from "../types/game";

type GameModalProps = {
  game: GameDetails | null;
  libraryItem?: LibraryItem;
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
  userComments,
  isLoading,
  onClose,
  onChangeStatus,
  onChangeRating,
  onAddComment,
}: GameModalProps) {
  const [commentText, setCommentText] = useState("");
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(function () {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return function () {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  useEffect(function () {
    const previousElement = document.activeElement as HTMLElement | null;

    closeButtonRef.current?.focus();

    return function () {
      previousElement?.focus();
    };
  }, []);

  if (!game && !isLoading) {
    return null;
  }

  function handleBackdropClick(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  function handleCommentSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!game || commentText.trim() === "") {
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
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <section
        className="game-modal"
        role="dialog"
        aria-modal="true"
        aria-label={game ? `Detalhes de ${game.title}` : "Carregando jogo"}
      >
        <button
          ref={closeButtonRef}
          className="game-modal__close"
          type="button"
          onClick={onClose}
        >
          Fechar
        </button>

        {isLoading && (
          <div className="modal-loading" role="status">
            <p>Carregando detalhes do jogo...</p>
          </div>
        )}

        {game && !isLoading && (
          <div className="game-modal__content">
            <div className="game-modal__image-area">
              <img
                className="game-modal__cover"
                src={game.cover}
                alt={`Capa de ${game.title}`}
              />
            </div>

            <div className="game-modal__details">
              <span className="game-modal__tag">
                {getStatusText(currentStatus)}
              </span>

              <h2>{game.title}</h2>

              <p className="game-modal__description">
                {game.description}
              </p>

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
                  <span>
                    {game.genres.length > 0
                      ? game.genres.join(", ")
                      : "Não informado"}
                  </span>
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

                <select
                  id="status"
                  value={currentStatus}
                  onChange={handleStatusChange}
                >
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
                          type="button"
                          className={
                            star <= personalRating
                              ? "star star--active"
                              : "star"
                          }
                          disabled={!canRate}
                          aria-label={`Avaliar com ${star} estrelas`}
                          aria-pressed={personalRating === star}
                          onClick={() => handleRatingClick(star)}
                        >
                          ★
                        </button>
                      );
                    })}
                  </div>

                  {!canRate && (
                    <small>
                      Você só pode dar nota depois de marcar como Finalizado.
                    </small>
                  )}
                </div>
              </div>

              <div className="comments-area">
                <h3>Suas anotações</h3>

                {userComments.length === 0 ? (
                  <p className="empty-message">
                    Você ainda não escreveu nenhuma anotação sobre este jogo.
                  </p>
                ) : (
                  <div className="comments-list">
                    {userComments.map(function (comment) {
                      return (
                        <article
                          className="comment comment--user"
                          key={comment.id}
                        >
                          <strong>{comment.userName}</strong>
                          <p>{comment.text}</p>
                          <span>{comment.createdAt}</span>
                        </article>
                      );
                    })}
                  </div>
                )}

                <form
                  className="comment-form"
                  onSubmit={handleCommentSubmit}
                >
                  <label htmlFor="comment">Adicionar anotação</label>

                  <textarea
                    id="comment"
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    placeholder="Escreva sua opinião ou anotações sobre o jogo..."
                    maxLength={1000}
                    required
                  />

                  <button type="submit">
                    Salvar anotação
                  </button>
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