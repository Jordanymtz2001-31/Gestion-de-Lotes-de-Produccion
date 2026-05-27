//Importaciones necesarias para arrancar la aplicacion Angular
import 'zone.js'; // Importa Zone.js que nos ayuda a manejar asincronismo en Angular
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
