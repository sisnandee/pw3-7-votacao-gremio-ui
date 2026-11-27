import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Candidato } from '../../models/candidato.model';
import { CandidatoService } from '../../services/candidato.service';

@Component({
  selector: 'app-listagem',
  imports: [RouterLink],
  template: `
    <div class="topo">
      <h1>Candidatos</h1>
      <a routerLink="/candidatos/novo" class="btn">+ Novo registro</a>
    </div>

    @if (mensagem(); as m) {
      <p [class]="'msg ' + m.tipo">{{ m.tipo === 'sucesso' ? '✅' : '❌' }} {{ m.texto }}</p>
    }

    @if (carregando()) {
      <p>Carregando...</p>
    } @else if (candidatos().length === 0) {
      <p>Nenhum candidato cadastrado.</p>
    } @else {
      <table>
        <thead>
          <tr><th>ID</th><th>Nome</th><th>Categoria</th><th>Votos</th><th>Status</th><th>Ações</th></tr>
        </thead>
        <tbody>
          @for (c of candidatos(); track c.id) {
            <tr>
              <td>{{ c.id }}</td>
              <td>{{ c.nome }}</td>
              <td>{{ c.categoria }}</td>
              <td>{{ c.quantidadeVotos }}</td>
              <td>
                @if (c.eleito === 'S') {
                  <span class="badge eleito">ELEITO</span>
                } @else {
                  <span class="badge disputa">EM DISPUTA</span>
                }
              </td>
              <td class="acoes">
                <button (click)="votar(c)">⚡ Votar</button>
                <a [routerLink]="['/candidatos', c.id, 'editar']" class="btn">✏️ Editar</a>
                <button class="perigo" (click)="excluir(c)">🗑️ Excluir</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    }
  `,
  styles: [`
    .topo { display: flex; justify-content: space-between; align-items: center; }
    table { border-collapse: collapse; width: 100%; margin-top: 1rem; }
    th, td { border: 1px solid #ccc; padding: .5rem; text-align: left; }
    .acoes { display: flex; gap: .5rem; }
    .btn, button { padding: .3rem .8rem; cursor: pointer; }
    .perigo { background: #c0392b; color: #fff; border: none; }
    .badge { padding: .2rem .6rem; border-radius: 1rem; font-size: .8rem; font-weight: 600; }
    .badge.eleito { background: #28a745; color: #fff; }
    .badge.disputa { background: #ffc107; color: #333; }
    .msg { padding: .5rem; margin-top: 1rem; }
    .msg.sucesso { background: #d4edda; }
    .msg.erro { background: #f8d7da; }
  `],
})
export class ListagemComponent implements OnInit {
  private service = inject(CandidatoService);

  candidatos = signal<Candidato[]>([]);
  carregando = signal(false);
  mensagem = signal<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  ngOnInit() { this.carregar(); }

  carregar() {
    this.carregando.set(true);
    this.service.listar().subscribe({
      next: lista => { this.candidatos.set(lista); this.carregando.set(false); },
      error: (e: Error) => { this.mostrar('erro', e.message); this.carregando.set(false); },
    });
  }

  votar(c: Candidato) {
    this.service.executarRegra(c.id!).subscribe({
      next: () => { this.mostrar('sucesso', `Voto registrado para ${c.nome}.`); this.carregar(); },
      error: (e: Error) => this.mostrar('erro', e.message),
    });
  }

  excluir(c: Candidato) {
    if (!confirm(`Excluir ${c.nome}?`)) return;
    this.service.excluir(c.id!).subscribe({
      next: () => { this.mostrar('sucesso', `${c.nome} foi excluído.`); this.carregar(); },
      error: (e: Error) => this.mostrar('erro', e.message),
    });
  }

  private mostrar(tipo: 'sucesso' | 'erro', texto: string) {
    this.mensagem.set({ tipo, texto });
  }
}