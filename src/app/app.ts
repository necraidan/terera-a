import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UpdateBannerComponent } from './shared/ui/update-banner.component';

@Component({
  selector: 'ta-root',
  imports: [RouterOutlet, UpdateBannerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <router-outlet />
    <ta-update-banner />
  `,
})
export class App {}
