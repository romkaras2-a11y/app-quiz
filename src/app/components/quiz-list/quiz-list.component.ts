// app-quitz/components/quitz-list/quitz-list.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { QuizService } from '../../services/quiz-api.service';
import { Quiz } from '../../models/quiz.model';

@Component({
  selector: 'app-quiz-list',
  standalone: true,
  //imports: [CommonModule],
  imports: [CommonModule, RouterModule],
  templateUrl: './quiz-list.component.html', 
})


export class QuizListComponent implements OnInit {  
    // Deklaration als Signal mit einem leeren Array als Startwert
    quizzes = signal<Quiz[]>([]);

   constructor( private quizService: QuizService,  private router: Router ) {}
    // Auf async umgestellt
    async ngOnInit(): Promise<void> {
      try {
        // Per await auf das Promise warten
        this.quizzes.set( await this.quizService.getQuizzes() );
          
      } catch (error) {
        console.error('Fehler beim Laden der Quiz-Übersicht:', error);
      }
    }

    startQuiz(quizId: string): void {

      this.router.navigate(['/quiz', quizId])
        .then(success => console.log('Navigation erfolgreich?', success))
        .catch(err => console.error('Navigationsfehler:', err));
    }
    
    _startQuiz(quizId: string): void {
      // Leitet entweder an /quiz/angular-basics ODER /quiz/random-trivia weiter
      this.router.navigate(['/quiz', quizId]);
    }
}
