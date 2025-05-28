import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { MenuComponent } from './menu/menu.component';
import { RegisterComponent } from './register/register.component';

// En lugar de importar directamente, definiremos la ruta utilizando loadChildren
const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginModule)
  },
  {
    path: 'menu',
    component: MenuComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'country-selector',
    loadChildren: () => import('./country-selector/country-selector.module').then(m => m.CountrySelectorModule)
  },
  {
    path: 'activate-qr',
    loadChildren: () => import('./activate-qr/activate-qr.module').then(m => m.ActivateQrModule)
  },
  {
    path: 'qr-reader',
    loadChildren: () => import('./qr-reader/qr-reader.module').then(m => m.QrReaderModule)
  },
  {
    path: 'activation-code',
    loadChildren: () => import('./activation-code/activation-code.module').then(m => m.ActivationCodeModule)
  },
  {
    path: 'calling',
    loadChildren: () => import('./calling/calling.module').then(m => m.CallingModule)
  },
  {
    path: 'create-doorbell',
    loadChildren: () => import('./create-doorbell/create-doorbell.module').then(m => m.CreateDoorbellModule)
  },
  {
    path: 'add-members',
    loadChildren: () => import('./add-members/add-members.module').then(m => m.AddMembersModule)
  },
  {
    path: 'order-qr-code',
    loadChildren: () => import('./order-qr-code/order-qr-code.module').then(m => m.OrderQrCodeModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
