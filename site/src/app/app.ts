import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Doc } from './doc';
import { LINKS } from './links';

@Component({
  selector: 'app-root',
  imports: [Doc],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="skip" href="#conteudo">Pular para o conteúdo</a>
    <p class="credit"><a [href]="links.project">Projeto de portfólio de Gustavo Martins Gripaldi.</a></p>
    @defer (hydrate never) {
      <app-doc />
    }
  `,
})
export class App {
  protected readonly links = LINKS;
}
