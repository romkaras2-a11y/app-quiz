// app.routes.ts 
import { Routes } from '@angular/router';
import { QuizListComponent } from './components/quiz-list/quiz-list.component';


export const routes: Routes = [    
    { //Route zur Startseite 
        path:'home',
        component:QuizListComponent
    },     
    {//Route zum Quiz mit Parameter für Quiz-ID  
        path:'quiz/:id',
        loadComponent: () => import('./components/quiz-form/quiz-form.component')
        .then(m => m.QuizFormComponent), 

    },
    {//Route zur Ergebnisanzeige
        path: 'results/:id', 
        loadComponent: () => import('./components/quiz-result/quiz-result.component')
        .then(m => m.ResultComponent)
    },
    // Standard-Weiterleitung
    { path: '', redirectTo: 'home', pathMatch: 'full' },
     //Weiterleitung zur Startseite bei unbekannten Routen   
    { path: '**',  component:QuizListComponent    }        
];

