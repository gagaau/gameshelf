import { useState } from "react";
import type { ThemeMode } from "../types/game";

type HeaderProps = {
  theme: ThemeMode;
  libraryCount: number;
  userCommentsCount: number;
  onToggleTheme: () => void;
  onLogout: () => void;
  logoutMessage: string;
};

function Header({
  theme,
  libraryCount,
  userCommentsCount,
  onToggleTheme,
  onLogout,
  logoutMessage,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function handleProfileClick() {
    setIsMenuOpen(!isMenuOpen);
  }

  function handleLogoutClick() {
    onLogout();
    setIsMenuOpen(false);
  }

  return (
    <header className="header">
      <div className="header__logo-area">
        <span className="header__logo">🎮</span>

        <div>
          <h1>GameShelf</h1>
          <p>Sua estante de jogos, avaliações e comentários.</p>
        </div>
      </div>

      <div className="header__actions">
        <div className="header__stats">
          <span>{libraryCount} jogos na biblioteca</span>
          <span>{userCommentsCount} comentários feitos</span>
        </div>

        <button className="theme-button" onClick={onToggleTheme}>
          {theme === "light" ? "Modo escuro" : "Modo claro"}
        </button>

        <div className="profile">
          <button className="profile__button" onClick={handleProfileClick}>
            <span className="profile__avatar">JP</span>
            <span className="profile__name">JoséPlayer</span>
          </button>

          {isMenuOpen && (
            <div className="profile__menu">
              <button>Seu Perfil</button>
              <button>Configurações</button>
              <button onClick={handleLogoutClick}>Sair</button>
            </div>
          )}
        </div>
      </div>

      {logoutMessage && <div className="logout-message">{logoutMessage}</div>}
    </header>
  );
}

export default Header;