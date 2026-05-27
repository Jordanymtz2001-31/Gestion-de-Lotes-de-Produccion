import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { producerIncrementEpoch } from '@angular/core/primitives/signals';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/interceptor';
import { FormsModule } from '@angular/forms';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(), // Manejador de errores globales
    provideRouter(routes), // Proveedor de rutas
    provideZoneChangeDetection({eventCoalescing: true}), // Deteccion de cambios automatica
    importProvidersFrom(FormsModule), // Importacion de FormsModule para formularios
    provideHttpClient(withInterceptors([authInterceptor])), // Añadimos el interceptor que creamos para la autenticacion y Proveedor de HTTPClient para las peticiones
  ]
};
