// app-quiz/components/quiz-result/quiz-result.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { QuizService } from '../../services/quiz.service'
import { Quiz, Question } from '../../models/quiz.model';
@Component({
  selector: 'app-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz-result.component.html',
})
export class ResultComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router); 
    private quizService = inject(QuizService);

    quizId: string | null = null; // Speichert die ID für die Wiederholung  
    correctAnswers: number = 0;
    totalQuestions: number = 0;    
    quizData: Quiz | undefined;
    userAnswer: { [key: string]: string[] } = {};

    constructor(){
        // Holt die mitgeschickten Nutzerantworten aus dem Router-State
        const navigation = this.router.getCurrentNavigation();
        if (navigation?.extras.state && navigation.extras.state['answers']) {
            this.userAnswer = navigation.extras.state['answers'];
         }
    }

        // Auf async umgestellt
    async ngOnInit(): Promise<void> {
        this.quizId = this.route.snapshot.paramMap.get('id');
        
        // Synchrones Auslesen der Query-Parameter über den Snapshot (kein .subscribe nötig!)
        const queryMap = this.route.snapshot.queryParamMap;
        this.correctAnswers = +(queryMap.get('correct') || 0);
        this.totalQuestions = +(queryMap.get('total') || 0);

        // Quiz-Details per await aus dem JSON laden
        if (this.quizId) {
        try {
            this.quizData = await this.quizService.getQuizById(this.quizId);
        } catch (error) {
            console.error('Fehler beim Laden der Quiz-Details für die Auswertung:', error);
        }
        }
    }

    isOptionSelected(questionId: number, option: string): boolean {
            const answers = this.userAnswer[`question_${questionId}`] || [];
            return answers.includes(option);
    }


    getQuestionStatus(question: Question): 'correct' | 'partially-correct' | 'wrong' {
        
            const answersQuiz = this.userAnswer[`question_${question.id}`] || [];
            const correctAnswers = question.correctAnswer || [];

            // Wenn gar nichts ausgewählt wurde (Sicherheitsfall)
            if (answersQuiz.length === 0) return 'wrong';
            // Zähle, wie viele der richtigen Antworten der Nutzer getroffen hat
            const correctHits = correctAnswers.filter( answer => answersQuiz.includes(answer) ).length;
            // Zähle, wie viele falsche Antworten der Nutzer ausgewählt hat
            const wrongHits = answersQuiz.filter( answer => !correctAnswers.includes(answer) ).length;
            // Fall 1: Exakter Treffer (Alle Richtigen, keine Falschen)
            if (correctHits === correctAnswers.length && wrongHits === 0) {
                return 'correct';
            }
            // Fall 2: Teilweise richtig (Mindestens ein Treffer, aber unvollständig oder mit Fehlern)
            if (correctHits > 0) {
                return 'partially-correct';
            }
            // Fall 3: Komplett daneben
            return 'wrong';
    }   
            
    // Funktion für den "Wiederholen"-Button
    repeatQuiz(): void {       
            if (this.quizId) {
                this.router.navigate(['/quiz', this.quizId]);
            }
    }    

    goToBack(): void {
            this.router.navigate(['/home']);
    }
}
