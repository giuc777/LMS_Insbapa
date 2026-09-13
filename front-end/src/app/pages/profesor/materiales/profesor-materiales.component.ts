import { Component } from '@angular/core';

@Component({
  selector: 'app-profesor-materiales',
  standalone: true,
  template: `
    <div class="page-head">
      <div class="crumb">Materiales</div>
      <h2>Materiales</h2>
      <div class="page-sub">Gestor de archivos por materia</div>
    </div>
    <div class="card">
      <p>Modulo en construccion - Fase 9.</p>
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
export class ProfesorMaterialesComponent {}
