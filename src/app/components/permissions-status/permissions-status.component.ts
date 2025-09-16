import { Component, OnInit } from '@angular/core';
import { PermissionsService } from '../../services/permissions.service';
import { WebrtcService } from '../../services/webrtc.service';
import { AlertController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-permissions-status',
  templateUrl: './permissions-status.component.html',
  styleUrls: ['./permissions-status.component.scss']
})
export class PermissionsStatusComponent implements OnInit {
  permissions = {
    audio: false,
    camera: false,
    allGranted: false
  };

  isLoading = false;
  errorMessage = '';

  constructor(
    private permissionsService: PermissionsService,
    private webrtcService: WebrtcService,
    private alertController: AlertController,
    private platform: Platform
  ) { }

  async ngOnInit() {
    await this.checkPermissions();
  }

  async checkPermissions() {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const result = await this.webrtcService.verifyCallPermissions();
      this.permissions = {
        audio: result.permissions.audio,
        camera: result.permissions.camera,
        allGranted: result.success
      };
    } catch (error) {
      console.error('Error checking permissions:', error);
      this.errorMessage = 'Error al verificar permisos';
    } finally {
      this.isLoading = false;
    }
  }

  async requestPermissions() {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const result = await this.webrtcService.requestCallPermissions();
      
      if (result.success) {
        this.permissions = {
          audio: result.permissions.audio,
          camera: result.permissions.camera,
          allGranted: true
        };
        
        await this.showSuccessAlert('Permisos concedidos exitosamente');
      } else {
        this.permissions = {
          audio: result.permissions.audio,
          camera: result.permissions.camera,
          allGranted: false
        };
        
        await this.showErrorAlert(`No se pudieron obtener todos los permisos: ${result.message}`);
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      this.errorMessage = 'Error al solicitar permisos';
      await this.showErrorAlert('Error al solicitar permisos');
    } finally {
      this.isLoading = false;
    }
  }

  async openAppSettings() {
    if (this.platform.is('android')) {
      // En Android, abrir configuración de la app
      const alert = await this.alertController.create({
        header: 'Configuración de Permisos',
        message: 'Para conceder permisos manualmente, ve a Configuración > Aplicaciones > Quiet Ring > Permisos y activa los permisos de Micrófono y Cámara.',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Entendido',
            handler: () => {
              // Opcional: abrir configuración de la app
              // this.appLauncher.openAppSettings();
            }
          }
        ]
      });
      await alert.present();
    }
  }

  private async showSuccessAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  private async showErrorAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  getPermissionIcon(permission: string): string {
    if (permission === 'audio') {
      return this.permissions.audio ? 'mic' : 'mic-off';
    } else if (permission === 'camera') {
      return this.permissions.camera ? 'videocam' : 'videocam-off';
    }
    return 'help';
  }

  getPermissionColor(permission: string): string {
    if (permission === 'audio') {
      return this.permissions.audio ? 'success' : 'danger';
    } else if (permission === 'camera') {
      return this.permissions.camera ? 'success' : 'danger';
    }
    return 'medium';
  }

  getPermissionText(permission: string): string {
    if (permission === 'audio') {
      return this.permissions.audio ? 'Micrófono concedido' : 'Micrófono denegado';
    } else if (permission === 'camera') {
      return this.permissions.camera ? 'Cámara concedida' : 'Cámara denegada';
    }
    return '';
  }
}
