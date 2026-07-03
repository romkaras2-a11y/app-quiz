import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Quiz, Question } from '../models/quiz.model';
import { environment } from '../../environments/environment.dev';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  // Lokaler Pfad für deine eigenen Quizze
  private localJsonUrl = './assets/daten.json';

  // Proxy-Ziel-URL für 5 JavaScript-Fragen
  private apiUrl = environment.apiQuizUrl; 
  private headers = new HttpHeaders(environment.headers); 

  constructor(private http: HttpClient) { }

  async getQuizzes(): Promise<Quiz[]> {      

      try {
        // Lokale Daten laden
        const localQuizzes = await firstValueFrom(this.http.get<Quiz[]>(this.localJsonUrl));
        // 2. Online-Quizze von QuizAPI abrufen
        const url = `${this.apiUrl}${environment.quizzesQuery}`;
        const apiResponse: any = await firstValueFrom(this.http.get(url,{ headers: this.headers }));    

        const apiQuizzesArray = apiResponse?.data || [];    

        const mappedApiQuizzes: Quiz[] = apiQuizzesArray.map((q: any) => ({
          id: `online_${q.id}`, // Unser Präfix für die Weiche
          title: `${q.title || q.name} (Live)`, // QuizAPI nutzt meist "title"
          questions: [] // Bleibt auf der Startseite leer, wird im Formular nachgeladen
        }));

        return [...localQuizzes, ...mappedApiQuizzes];
        
      } catch (error) {
        console.error('Fehler beim Laden der kombinierten Quiz-Liste:', error);
        // Fallback: Nur lokale Daten zurückgeben, falls das Internet/API offline ist
        return firstValueFrom(this.http.get<Quiz[]>(this.localJsonUrl));
      }
  }

  // 2. Ein bestimmtes Quiz anhand der ID suchen
  async getQuizById(id: string): Promise<Quiz | undefined> {
      // Falls die ID 'random-trivia' ist, rufen wir die externe API auf
      if (id.startsWith('online_')) {
        const realApiId = id.replace('online_', '');
        return this.fetchOnlineQuizQuestions(realApiId);
      }
      
      // Ansonsten suchen wir wie gewohnt in den lokalen Daten
      const quizzes = await this.getQuizzes();
      return quizzes.find(q => q.id === id);
  }

   // 3. Externe API aufrufen und die Daten für dein System umformen (Mapping)
   private async fetchOnlineQuizQuestions(quizId: string): Promise<Quiz> {
      try {
        const url = this.getQuestionsUrl( quizId );
        const apiResponse: any = await firstValueFrom(this.http.get( url ));
        const questionsArray = apiResponse?.data || [];

        const mappedQuestions: Question[] = questionsArray.map( (item: any, index: number) => {
            const optionsArray: string[] = [];
            const correctAnswersArray: string[] = [];

            if (item.answers && Array.isArray(item.answers)) {
              for (const ans of item.answers) {
                // SICHERHEIT: Falls Text da ist, nutzen, ansonsten leere Strings verhindern
                if (ans && ans.text) { 
                  optionsArray.push(ans.text);                
                  if (ans.isCorrect === true || ans.isCorrect === 'true') {
                    correctAnswersArray.push(ans.text);
                  }
                }
              }
            }

            return {
              id: index, // Nutzt den sicheren Index als ID
              text: item.text,
              options: optionsArray,
              correctAnswer: correctAnswersArray
            };
          });      

        return {
          id: `online_${quizId}`,
          title: 'QuizAPI Live-Herausforderung',
          questions: mappedQuestions
        };
      } catch (error) {
        console.error('Fehler im Service beim Laden des Online-Quiz:', error);
        throw error;
      }
   }
// Hilfsmethode furl
   getQuestionsUrl(quizId: string):string{
      return `${this.apiUrl}/questions?quiz_id=${quizId}&include_answers=true&limit=5`;
   }
    // Hilfsmethode, um HTML-Entities wie &ldquo; oder &Ouml; in echten Text umzuwandeln
    private decodeHtml(html: string): string {
      const txt: HTMLTextAreaElement= document.createElement('textarea');
      txt.innerHTML = html;
      return txt.value;
    }

    // Die Auswertungslogik bleibt unangetastet und funktioniert für lokale & API-Daten gleich
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

