import type { ElementRef } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  output,
  resource,
  signal,
  viewChild,
} from '@angular/core';
import { ArrowLeft, LucideAngularModule, Search } from 'lucide-angular';
import { AutocompleteComponent } from '../shared/components/autocomplete/autocomplete.component';
import type {
  SGDBGame,
  SGDBGameWithIcon,
  SGDBImage,
} from '../../../shared/lib/SGDB';
import { Api } from '../api/api';
import { wait } from '../shared/functions/debounce';

@Component({
  selector: 'sgdb-dialog',
  imports: [AutocompleteComponent, LucideAngularModule],
  templateUrl: './sgdb-dialog.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SgdbDialogComponent {
  public readonly imageSelected = output<SGDBImage>();
  protected readonly icons = {
    Search,
    ArrowLeft,
  };
  protected readonly dialog =
    viewChild<ElementRef<HTMLDialogElement>>('sgdbDialog');
  protected readonly queryInProgress = signal<boolean>(false);
  protected readonly queryAutocomplete =
    viewChild<AutocompleteComponent<SGDBGame>>('queryInput');
  protected readonly query = signal<string>('');
  protected readonly games = resource<SGDBGameWithIcon[], string>({
    request: () => this.query(),
    loader: async ({ request, abortSignal }) => {
      if (request === '' || request.length < 3) {
        return [];
      }
      this.queryInProgress.set(true);
      // Debouncing: 300 ms
      await wait(400, abortSignal);
      return (await Api['sgdb.queryGames'](request, true).finally(() => {
        this.queryInProgress.set(false);
      })) as SGDBGameWithIcon[];
    },
    defaultValue: [],
  });
  protected readonly selectedGame = signal<SGDBGame | null>(null);
  protected readonly images = resource({
    request: () => this.selectedGame(),
    loader: ({ request }) => {
      if (request !== undefined && request !== null) {
        this.queryInProgress.set(true);
        return Api['sgdb.getImages'](request, ['grid', 'icon', 'logo']).finally(
          () => {
            this.queryInProgress.set(false);
          }
        );
      }
      return Promise.resolve<SGDBImage[]>([]);
    },
    defaultValue: [],
  });

  public open(query?: string) {
    this.dialog()?.nativeElement.showModal();
    if (query) {
      this.queryAutocomplete()?.setQuery(query);
      this.query.set(query);
    }
  }

  public close() {
    this.dialog()?.nativeElement.close();
  }

  protected reset() {
    const autocomplete = this.queryAutocomplete();
    if (autocomplete) {
      autocomplete.setQuery('');
    }
    this.query.set('');
    this.queryInProgress.set(false);
    this.selectedGame.set(null);
  }

  protected backToSearch() {
    this.selectedGame.set(null);
  }
}
