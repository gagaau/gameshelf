export type GameStatus =
  | "none"
  | "wantToPlay"
  | "playing"
  | "completed"
  | "dropped"
  | "favorite";

export type ThemeMode = "light" | "dark";

export type Game = {
  id: number;
  title: string;
  cover: string;
  background: string;
  rating: number;
  ratingsCount: number;
  releaseDate: string;
  genres: string[];
  platforms: string[];
};

export type GameDetails = Game & {
  description: string;
  developer: string;
  website: string;
};

export type UserComment = {
  id: number;
  gameId: number;
  userName: string;
  text: string;
  createdAt: string;
};

export type FakeComment = {
  id: number;
  author: string;
  text: string;
};

export type LibraryItem = {
  gameId: number;
  status: GameStatus;
  personalRating: number;
};

export type StoredLibrary = {
  [gameId: number]: LibraryItem;
};

export type StoredComments = {
  [gameId: number]: UserComment[];
};

export type RawgGame = {
  id: number;
  name: string;
  background_image: string | null;
  rating: number;
  ratings_count: number;
  released: string | null;
  genres: {
    id: number;
    name: string;
  }[];
  platforms: {
    platform: {
      id: number;
      name: string;
    };
  }[];
};

export type RawgGameDetails = RawgGame & {
  description_raw: string;
  website: string;
  developers: {
    id: number;
    name: string;
  }[];
};