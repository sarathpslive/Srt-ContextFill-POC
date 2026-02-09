import { Routes } from '@angular/router';
import { ContextFormComponent } from './components/context-form/context-form.component';
import { WidgetDemoComponent } from './components/widget-demo/widget-demo.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'widget',
    pathMatch: 'full'
  },
  {
    path: 'form',
    component: ContextFormComponent
  },
  {
    path: 'widget',
    component: WidgetDemoComponent
  },
  {
    path: '**',
    redirectTo: 'widget'
  }
];
