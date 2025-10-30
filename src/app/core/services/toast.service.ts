import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    constructor(private toastController: ToastController) {}

    async show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
        const colors: Record<string, string> = {
            success: 'success',
            error: 'danger',
            warning: 'warning',
            info: 'primary'
        };

        const icons: Record<string, string> = {
            success: 'checkmark-outline',
            error: 'close-outline',
            warning: 'alert-outline',
            info: 'information-outline'
        };

        const toast = await this.toastController.create({
            message: `${message}`,
            duration: 3000,
            position: 'top',
            color: colors[type],
            cssClass: 'custom-toast',
            mode: 'ios',
            buttons: [
                {
                    text: '✖',
                    role: 'cancel'
                }
            ]
        });

        await toast.present();
    }
}
