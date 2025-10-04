import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private loading?: HTMLIonLoadingElement;
  private loadingCount = 0;
  private timeoutId?: any;

  constructor(private loadingCtrl: LoadingController) {}

  async show(message: string = 'Cargando...') {
    this.loadingCount++;

    if (!this.loading) {
      this.loading = await this.loadingCtrl.create({
        message,
        spinner: 'crescent',
        translucent: true,
        backdropDismiss: false
      });
      await this.loading.present();

      // Seguridad: cerrar después de 10s máximo
      this.timeoutId = setTimeout(() => {
        this.forceHide();
      }, 10000);
    }
  }

  async hide() {
    this.loadingCount--;

    if (this.loadingCount <= 0 && this.loading) {
      await this.loading.dismiss();
      this.loading = undefined;
      this.loadingCount = 0;

      // limpiar timeout
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = undefined;
      }
    }
  }

  private async forceHide() {
    if (this.loading) {
      await this.loading.dismiss();
      this.loading = undefined;
      this.loadingCount = 0;
      this.timeoutId = undefined;
      console.warn('⏳ Loading cerrado automáticamente por timeout');
    }
  }
}
