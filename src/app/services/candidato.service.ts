import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { Candidato } from '../models/candidato.model';

@Injectable({ providedIn: 'root' })
export class CandidatoService {
  private http = inject(HttpClient);
  private api = 'http://localhost:8080/api/candidatos';

  listar(): Observable<Candidato[]> {
    return this.http.get<Candidato[]>(this.api).pipe(catchError(e => this.tratarErro(e)));
  }

  buscarPorId(id: number): Observable<Candidato> {
    return this.http.get<Candidato>(`${this.api}/${id}`).pipe(catchError(e => this.tratarErro(e)));
  }

  cadastrar(obj: Candidato): Observable<Candidato> {
    return this.http.post<Candidato>(this.api, obj).pipe(catchError(e => this.tratarErro(e)));
  }

  atualizar(id: number, obj: Candidato): Observable<Candidato> {
    return this.http.put<Candidato>(`${this.api}/${id}`, obj).pipe(catchError(e => this.tratarErro(e)));
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`).pipe(catchError(e => this.tratarErro(e)));
  }

  executarRegra(id: number): Observable<Candidato> {
    return this.http.post<Candidato>(`${this.api}/${id}/votar`, {}).pipe(catchError(e => this.tratarErro(e)));
  }

  private tratarErro(err: HttpErrorResponse) {
    let msg: string;
    if (err.status === 0) {
      msg = 'Não foi possível conectar ao servidor.';
    } else if (err.status === 400 || err.status === 409) {
      msg = err.error?.message ?? (typeof err.error === 'string' && err.error ? err.error : 'Operação não permitida.');
    } else if (err.status === 404) {
      msg = 'Registro não encontrado.';
    } else {
      msg = 'Erro inesperado no servidor.';
    }
    return throwError(() => new Error(`Erro: ${msg}`));
  }
}