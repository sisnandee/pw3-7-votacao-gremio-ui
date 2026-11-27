import { Routes } from '@angular/router';
import { ListagemComponent } from './components/listagem/listagem.component';
import { FormularioComponent } from './components/formulario/formulario.component';

export const routes: Routes = [
  { path: '', redirectTo: 'candidatos', pathMatch: 'full' },
  { path: 'candidatos', component: ListagemComponent },
  { path: 'candidatos/novo', component: FormularioComponent },
  { path: 'candidatos/:id/editar', component: FormularioComponent },
];