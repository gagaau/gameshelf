import type { ThemeMode } from "../types/game";

type HeaderProps = {
  theme: ThemeMode;
  libraryCount: number;
  userCommentsCount: number;
  onToggleTheme: () => void;
};

function Header({
  theme,
  libraryCount,
  userCommentsCount,
  onToggleTheme,
}: HeaderProps) {
  return (
    <header className="header">
      <div className="header__logo-area">
        <span className="header__logo" aria-hidden="true">
          🎮
        </span>

        <div>
          <h1>GameShelf</h1>
          <p>Descubra, organize e avalie seus jogos.</p>
        </div>
      </div>

      <div className="header__actions">
        <div className="header__stats">
          <span>
            {libraryCount}{" "}
            {libraryCount === 1
              ? "jogo na biblioteca"
              : "jogos na biblioteca"}
          </span>

          <span>
            {userCommentsCount}{" "}
            {userCommentsCount === 1
              ? "anotação salva"
              : "anotações salvas"}
          </span>
        </div>

        <button
          className="theme-button"
          type="button"
          onClick={onToggleTheme}
          aria-label={
            theme === "light"
              ? "Ativar tema escuro"
              : "Ativar tema claro"
          }
        >
          {theme === "light" ? "Modo escuro" : "Modo claro"}
        </button>
      </div>
    </header>
  );
}

export default Header;