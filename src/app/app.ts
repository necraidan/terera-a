import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UpdateBannerComponent } from './shared/ui/update-banner.component';

@Component({
  selector: 'ta-root',
  imports: [RouterOutlet, UpdateBannerComponent],
  template: `
    <router-outlet />
    <ta-update-banner />
  `,
})
export class App {}
