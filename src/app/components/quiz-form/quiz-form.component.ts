// app-quiz/components/quiz-form/quiz-form.component.ts
import { Component, inject, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup,  ReactiveFormsModule, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from '../../services/quiz.service';
import { TimerService } from '../../services/timer.service';
import { Quiz, Question } from '../../models/quiz.model';
import {OneCheckboxSelected} from '../../validators/quiz.validator';

//Implementieren ein Reactive Form für das Quiz mit Multiple-Choice-Fragen (mindestens eine Antwort muss ausgewählt sein) 
//Formular-Validierung undSubmit-Button der nur aktiv ist, wenn alle Fragen beantwortet wurden 
@Component({
  selector: 'app-quiz-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './quiz-form.component.html',
})
export class QuizFormComponent implements OnInit, OnDestroy {

    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private quizService = inject( QuizService);
    private cdr = inject(ChangeDetectorRef);
    public  timerService = inject(TimerService);
    // Deklaration mit Type-Zuweisung
    quizForm!: FormGroup;
    quizData: Quiz | undefined;
    quizId: string | null = null; 

    async ngOnInit(): Promise<void> {
        this.quizId = this.route.snapshot.paramMap.get('id');
        
        if (this.quizId) {
            try {
            // Hier nutzen wir  await für service
                const quiz = await this.quizService.getQuizById(this.quizId);
                
                if (quiz) {
                    this.quizData = quiz;
                    this.initForm();
                    // Timer über den Service starten und die autoSubmit-Methode als Callback übergeben
                    const totalSeconds = quiz.questions.length * 30;
                     this.timerService.start(totalSeconds, () => this.autoSubmit()); // <-- Timer starten 
                    this.cdr.detectChanges(); 
                }
            } catch (error) {
                console.error('Fehler beim Laden des Quiz-Daten:', error);
            }
        }
    }
    // Zerstört den Intervall-Timer, wenn der Nutzer die Seite verlässt
    ngOnDestroy(): void {
       this.timerService.stop();
    }

    autoSubmit(): void {
        alert('Die Zeit ist abgelaufen! Dein Quiz wird jetzt automatisch ausgewertet.');
        this.onSubmit();
    }    
    // Fisher-Yates Shuffle-Algorithmus zum zufälligen Mischen von Arrays
    private shuffle<T>(array: T[]): T[] {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }


    initForm(): void {

        if (!this.quizData) return;

        const group: any = {};
        this.quizData.questions.forEach(question => {
        // Fallunterscheidung bei der Formular-Erstellung:
        if (question.correctAnswer.length > 1) {
            // MEHRFACHAUSWAHL: Ein FormArray für die Checkboxen erzeugen
            const checkboxControls = question.options.map(() => this.fb.control(false));
            // Validierung: Multiple-Choice-Fragen (mindestens eine Antwort muss ausgewählt sein) 
            group[`question_${question.id}`] = this.fb.array(checkboxControls, OneCheckboxSelected());
        } else {
            // Validierung: Multiple-Choice-Fragen (mindestens eine Antwort muss ausgewählt sein) 
            group[`question_${question.id}`] = ['', Validators.required];
        }
        });
        //FormGroup erstellen 
        this.quizForm = this.fb.group(group);
    }

    isMultipleChoice(question: Question): boolean {
        return question.correctAnswer.length > 1;
    } 

    getOptionsArray(questionId: number): FormArray {
        return this.quizForm.get(`question_${questionId}`) as FormArray;
    }

    getQuizProgress(): number {
        if (!this.quizForm || !this.quizData) return 0;
        let answeredCount = 0;
        // Wir gehen alle Fragen durch und prüfen, ob ein Wert ausgewählt wurde
        this.quizData.questions.forEach(question => {
        if (this.quizForm.get(`question_${question.id}`)?.valid) {
            answeredCount++;
        }
        });
        return Math.round((answeredCount / this.quizData.questions.length) * 100);
    }

    onSubmit(): void {
        this.timerService.stop(); // Timer stoppen

        if (this.quizForm.valid && this.quizId && this.quizData) {
            const userAnswers: { [key: string]: string[] } = {};
        
            this.quizData.questions.forEach(question => {
                if (this.isMultipleChoice(question)) {
                // Checkboxen auslesen
                const arrayValues = this.getOptionsArray(question.id).value;
                userAnswers[`question_${question.id}`] = question.options.filter((_, i) => arrayValues[i]);
                } else {
                // Radio-Button auslesen (als Array verpacken für einheitliche Service-Schnittstelle)
                const singleValue = this.quizForm.get(`question_${question.id}`)?.value;
                userAnswers[`question_${question.id}`] = singleValue ? [singleValue] : [];
                }
            });

            const results = this.quizService.calculateResult(this.quizData, userAnswers);
            // Weiterleitung zur Ergebnis-Seite mit Übergabe der Parameter
            this.router.navigate(['/results', this.quizId], { 
                queryParams: { correct: results.correct, total: results.total }, 
                state: { answers: userAnswers } 
            });
        }else{
            this.goToBack();
        }
    }

    
    goToBack(): void {
        this.timerService.stop(); // Timer stoppen
        this.router.navigate(['/home']);
    }    
}
