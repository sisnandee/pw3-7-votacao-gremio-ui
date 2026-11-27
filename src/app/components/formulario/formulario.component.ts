import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CandidatoService } from '../../services/candidato.service';

@Component({
  selector: 'app-formulario',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <h1>{{ id ? 'Editar candidato' : 'Novo candidato' }}</h1>

    @if (mensagem(); as m) {
      <p [class]="'msg ' + m.tipo">{{ m.tipo === 'sucesso' ? '✅' : '❌' }} {{ m.texto }}</p>
    }

    <form [formGroup]="form" (ngSubmit)="salvar()">
      <label>
        Nome
        <input formControlName="nome" />
      </label>
      @if (campoInvalido('nome')) {
        <small class="erro">
          @if (form.controls.nome.errors?.['required']) { O nome é obrigatório. }
          @else if (form.controls.nome.errors?.['minlength']) { O nome precisa ter ao menos 3 letras. }
        </small>
      }

      <label>
        Categoria
        <select formControlName="categoria">
          <option value="">Selecione...</option>
          @for (cat of categorias; track cat) {
            <option [value]="cat">{{ cat }}</option>
          }
        </select>
      </label>
      @if (campoInvalido('categoria')) {
        <small class="erro">Escolha uma categoria.</small>
      }

      <div class="acoes">
        <button type="submit" [disabled]="salvando()">💾 Salvar registro</button>
        <a routerLink="/candidatos">❌ Cancelar</a>
      </div>
    </form>
  `,
  styles: [`
    form { display: flex; flex-direction: column; gap: .5rem; max-width: 400px; }
    label { display: flex; flex-direction: column; gap: .2rem; }
    input, select { padding: .4rem; }
    .erro { color: #c0392b; }
    .acoes { display: flex; gap: 1rem; align-items: center; margin-top: .5rem; }
    .msg { padding: .5rem; }
    .msg.sucesso { background: #d4edda; }
    .msg.erro { background: #f8d7da; }
  `],
})
export class FormularioComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(CandidatoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  categorias = ['Presidente', 'Vice-presidente', 'Secretário', 'Tesoureiro'];
  id: number | null = null;
  salvando = signal(false);
  mensagem = signal<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    categoria: ['', Validators.required],
  });

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = Number(idParam);
      this.service.buscarPorId(this.id).subscribe({
        next: c => this.form.patchValue({ nome: c.nome, categoria: c.categoria }),
        error: (e: Error) => this.mensagem.set({ tipo: 'erro', texto: e.message }),
      });
    }
  }

  campoInvalido(campo: 'nome' | 'categoria') {
    const c = this.form.controls[campo];
    return c.invalid && (c.touched || c.dirty);
  }

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.salvando.set(true);
    const dados = this.form.getRawValue();
    const requisicao = this.id
      ? this.service.atualizar(this.id, dados)
      : this.service.cadastrar(dados);

    requisicao.subscribe({
      next: () => {
        this.mensagem.set({ tipo: 'sucesso', texto: 'Operação realizada com sucesso!' });
        setTimeout(() => this.router.navigate(['/candidatos']), 800);
      },
      error: (e: Error) => {
        this.mensagem.set({ tipo: 'erro', texto: e.message });
        this.salvando.set(false);
      },
    });
  }
}