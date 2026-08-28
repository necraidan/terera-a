import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './shared/ui/footer.component';
import { UpdateBannerComponent } from './shared/ui/update-banner.component';

@Component({
  selector: 'ta-root',
  imports: [RouterOutlet, UpdateBannerComponent, FooterComponent],
  template: `
    <router-outlet />
    <ta-footer />
    <ta-update-banner />
  `,
})
export class App {}
