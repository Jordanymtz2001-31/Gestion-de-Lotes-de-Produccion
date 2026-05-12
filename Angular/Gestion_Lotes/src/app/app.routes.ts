import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Dashboard } from './features/dashboard/dashboard';
import { ListarU } from './features/usuarios/listar-u/listar-u';
import { ListarP } from './features/productos/listar-p/listar-p';
import { ListarPr } from './features/proveedores/listar-pr/listar-pr';
import { ListarL } from './features/lotes/listar-l/listar-l';
import { GuardarU } from './features/usuarios/guardar-u/guardar-u';
import { GuardarP } from './features/productos/guardar-p/guardar-p';
import { GuardarPr } from './features/proveedores/guardar-pr/guardar-pr';
import { GuardarL } from './features/lotes/guardar-l/guardar-l';
import { EditarU } from './features/usuarios/editar-u/editar-u';
import { EditarP } from './features/productos/editar-p/editar-p';
import { EditarPr } from './features/proveedores/editar-pr/editar-pr';
import { adminGuard, authGuard } from './core/guards/auth-guard';
export const routes: Routes = [

    //Este archivo es donde se definen las rutas de la peticion

    // Ruta principal de login para direccionar
    {path: '', redirectTo: '/login', pathMatch: 'full'},
    
    /* Ocupamos el loadComponent() (lazy) para importar el componente con la ventaja es que como solo va a dercargar el componente cuando lo necesitemos (velocidad)
    De esta manera no cargamos todo la aplicacióny como existen usuarios por roles solo usaran ciertos componentes sin tener que descargar el resto
    No todos los usuarios van a ver todos los componentes
    
    SEVE ALGO ASI EN LA PRACTICA
    
    Con component: (eager)
    Usuario abre app → descarga 500kb de toda la app → ve el login

    Con loadComponent: (lazy)
    Usuario abre app → descarga 50kb solo del login → ve el login
    Usuario va a /lotes → descarga 80kb solo de lotes → ve lotes*/

    /*El .then(m => m.Login) le dice explícitamente cuál es el componente a cargar. */

    //login publico sin guard
    {path: 'login', loadComponent: () => import('./features/auth/login/login').then(m => m.Login)}, 

    //dashboard con autenticacion
    {path: 'dashboard', canActivate: [authGuard], loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard)},
    //{path: 'dashboard', component: Dashboard},

    //Aqui definimos las rutas de la aplicación que utilizaremos en la navegación entre componentes de la aplicación

    //Cualquier usuario con token puede pasar: ADMIN, OPERADOR, SUPERVISOR
    {path: 'listar-lotes', canActivate: [authGuard], loadComponent: () => import('./features/lotes/listar-l/listar-l').then(m => m.ListarL)},
    {path: 'listar-proveedores', canActivate: [authGuard], loadComponent: () => import('./features/proveedores/listar-pr/listar-pr').then(m => m.ListarPr)},
    {path: 'listar-productos', canActivate: [authGuard], loadComponent: () => import('./features/productos/listar-p/listar-p').then(m => m.ListarP)},
    {path: 'guardar-lote', canActivate: [authGuard], loadComponent: () => import('./features/lotes/guardar-l/guardar-l').then(m => m.GuardarL)},
    //{path: 'editar-lote', canActivate: [authGuard], loadComponent: () => import('./features/lotes/editar-l/editar-l').then(m => m.EditarL)},

    //Solo admin puede pasar
    {path: 'listar-usuarios', canActivate: [authGuard, adminGuard], loadComponent: () => import('./features/usuarios/listar-u/listar-u').then(m => m.ListarU)},
    {path: 'guardar-usuario', canActivate: [authGuard, adminGuard], loadComponent: () => import('./features/usuarios/guardar-u/guardar-u').then(m => m.GuardarU)},
    {path: 'guardar-producto', canActivate: [authGuard, adminGuard], loadComponent: () => import('./features/productos/guardar-p/guardar-p').then(m => m.GuardarP)},
    {path: 'guardar-proveedor', canActivate: [authGuard, adminGuard], loadComponent: () => import('./features/proveedores/guardar-pr/guardar-pr').then(m => m.GuardarPr)},
    {path: 'editar-usuario', canActivate: [authGuard, adminGuard], loadComponent: () => import('./features/usuarios/editar-u/editar-u').then(m => m.EditarU)},
    {path: 'editar-producto/:id', canActivate: [authGuard, adminGuard], loadComponent: () => import('./features/productos/editar-p/editar-p').then(m => m.EditarP)},
    {path: 'editar-proveedore/:id', canActivate: [authGuard, adminGuard], loadComponent: () => import('./features/proveedores/editar-pr/editar-pr').then(m => m.EditarPr)},

];