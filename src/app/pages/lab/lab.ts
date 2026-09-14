import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-lab',
  styleUrl: './lab.scss',
  templateUrl: './lab.html',
})
export class Lab {
  protected readonly showHint = signal(false);

  protected toggleHint(): void {
    this.showHint.update((value) => !value);
  }
}
