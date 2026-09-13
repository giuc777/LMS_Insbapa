import { Component } from '@angular/core';

@Component({
  selector: 'app-estudiante-notas',
  standalone: true,
  template: `
    <div class="page-head">
      <div class="crumb">Mis Notas</div>
      <h2>Mis Notas</h2>
      <div class="page-sub">Calificaciones por bloque</div>
    </div>
    <div class="card">
      <p>Modulo en construccion - Fase 8.</p>
    </div>
  `,
  styles: [`
    .page-head { margin-bottom: 24px; }
    .page-head .crumb { font-size: 13px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .page-head h2 { font-size: 24px; font-weight: 700; color: var(--ink); margin: 0 0 4px 0; }
    .page-head .page-sub { font-size: 14px; color: var(--muted); }
    .card { background: var(--surface); border: 1px solid var(--border-soft); border-radius: var(--radius); padding: 24px; }
  `]
})
export class EstudianteNotasComponent {}
