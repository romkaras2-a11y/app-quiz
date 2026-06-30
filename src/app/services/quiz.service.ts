// app-quiz/services/quiz.service.ts
import { Injectable } from '@angular/core'; 
import { HttpClient } from '@angular/common/http';
import { firstValueFrom} from 'rxjs';
import { Quiz } from '../models/quiz.model';

@Injectable({ providedIn: 'root' })
// Service für Quiz-Fragen und Auswertung  
export class QuizService {

    // Mock-Daten für Quizze
    private jsonUrl = './assets/daten.json';

    constructor(private http: HttpClient) { }

    // Gibt jetzt ein Promise zurück
    async getQuizzes(): Promise<Quiz[]> {      
      return firstValueFrom(this.http.get<Quiz[]>(this.jsonUrl));
    }

    // Nutzt await, um auf die Daten zu warten, und filtert sie dann
    async getQuizById(id: string): Promise<Quiz | undefined> {
      const quizzes = await this.getQuizzes();
      return quizzes.find(q => q.id === id);
    }   
     
    //Auswertung
    calculateResult(quiz: Quiz, userAnswers: { [key: string]: string[] }): { correct: number, total: number } {
      let correctCount = 0;
      quiz.questions.forEach(q => {
        const userAnswersForQuestion = (userAnswers[`question_${q.id}`] || []) as string[];
        const correctAnswersForQuestion = (q.correctAnswer || []) as string[];

        if (userAnswersForQuestion.length === correctAnswersForQuestion.length) {
          const allAnswersCorrect = correctAnswersForQuestion.every(answer => 
            userAnswersForQuestion.includes(answer)
          );
          if (allAnswersCorrect) {
            correctCount++;
          }
        }
      });
      return { correct: correctCount, total: quiz.questions.length };
    }        
}
