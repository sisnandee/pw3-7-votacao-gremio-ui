export type SimNao = 'S' | 'N';

export interface Candidato {
  id?: number;
  nome: string;
  categoria: string;
  quantidadeVotos?: number;
  eleito?: SimNao;
}