import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FILES, INDEX, anchor, at } from './code';
import { Diagram } from './diagram';
import { LINKS } from './links';

@Component({
  selector: 'app-doc',
  imports: [Diagram],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './doc.html',
})
export class Doc {
  protected readonly links = LINKS;
  protected readonly files = FILES;
  protected readonly at = at;
  protected readonly anchor = anchor;
  /** Hero inventory: every resource, data source and output, straight from the file. */
  protected readonly inventory = Object.keys(INDEX)
    .filter((k) => !k.includes(':') && !/^(var|provider)\./.test(k))
    .map((k) => ({ addr: k, line: INDEX[k], kind: k.startsWith('data.') ? 'data' : k.startsWith('output.') ? 'output' : 'resource' }));
  protected readonly count = (kind: string) => this.inventory.filter((i) => i.kind === kind).length;
}
