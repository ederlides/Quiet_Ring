import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule, provideHttpClient } from '@angular/common/http'; 
import { CountrySelectorModule } from './country-selector/country-selector.module';
import { LoginModule } from './login/login.module';
import { ActivateQrModule } from './activate-qr/activate-qr.module';
import { LoadingInterceptor } from './core/interceptors/loading.interceptor';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule,
    CommonModule, 
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CountrySelectorModule,
    LoginModule,
    ActivateQrModule,
    
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
    provideHttpClient()
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
