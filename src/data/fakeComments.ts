import type { FakeComment } from "../types/game";

const commentAuthors = [
  "Marina",
  "Lucas",
  "Rafael",
  "Bianca",
  "Thiago",
  "Camila",
  "Renan",
  "Julia",
];

const positiveComments = [
  "A ambientação é muito boa e dá vontade de continuar jogando.",
  "Gostei bastante do ritmo do jogo, principalmente depois das primeiras horas.",
  "É o tipo de jogo que prende sem precisar explicar tudo o tempo todo.",
  "Achei bem caprichado visualmente e com uma boa sensação de progresso.",
];

const neutralComments = [
  "Tem boas ideias, mas algumas partes poderiam ser melhor aproveitadas.",
  "Não achei perfeito, mas entendo bastante quem gostou.",
  "Começa um pouco devagar, mas melhora quando o jogo abre mais possibilidades.",
  "Funciona bem no geral, mesmo tendo algumas decisões meio estranhas.",
];

const criticalComments = [
  "Gostei de várias coisas, mas algumas missões ficaram repetitivas para mim.",
  "A experiência é boa, só que esperava um pouco mais pelo hype.",
  "Tem momentos excelentes, mas também tem partes que quebram um pouco o ritmo.",
  "Vale jogar, mas acho que não é para todo mundo.",
];

export function getFakeComments(gameId: number): FakeComment[] {
  const firstIndex = gameId % positiveComments.length;
  const secondIndex = gameId % neutralComments.length;
  const thirdIndex = gameId % criticalComments.length;

  return [
    {
      id: gameId * 10 + 1,
      author: commentAuthors[gameId % commentAuthors.length],
      text: positiveComments[firstIndex],
    },
    {
      id: gameId * 10 + 2,
      author: commentAuthors[(gameId + 2) % commentAuthors.length],
      text: neutralComments[secondIndex],
    },
    {
      id: gameId * 10 + 3,
      author: commentAuthors[(gameId + 4) % commentAuthors.length],
      text: criticalComments[thirdIndex],
    },
  ];
}