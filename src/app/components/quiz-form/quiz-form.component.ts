// app-quiz/components/quiz-form/quiz-form.component.ts
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup,  ReactiveFormsModule, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from '../../services/quiz-api.service';

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
export class QuizFormComponent implements OnInit {

    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private quizService = inject( QuizService);
    private cdr = inject(ChangeDetectorRef); 

    // Deklaration mit Type-Zuweisung
    quizForm!: FormGroup;
    quizData: Quiz | undefined;
    quizId: string | null = null; 

    constructor(){ }

    async ngOnInit(): Promise<void> {
        this.quizId = this.route.snapshot.paramMap.get('id');
        
        if (this.quizId) {
            try {
            // Hier nutzen wir  await für service
                const quiz = await this.quizService.getQuizById(this.quizId);
                
                if (quiz) {
                    this.quizData = quiz;
                    this.initForm();                    
                                       
                    this.cdr.detectChanges(); 
                }
            } catch (error) {
                console.error('Fehler beim Laden des Quiz-Daten:', error);
            }
        }
    }


    autoSubmit = (): void => {
        alert('Die Zeit ist abgelaufen! Dein Quiz wird jetzt automatisch ausgewertet.');    
        this.onSubmit(); // Löst nun garantiert die Weiterleitung aus
        
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

        if (!this.quizData || !this.quizData.questions) {
            console.error('Formular-Initialisierung abgebrochen: Keine Fragen im Quiz-Objekt vorhanden!');
            return;
        }

        const group: any = {};

        this.quizData.questions.forEach((question, i) => {
            if (!question || !question.correctAnswer) return;  

            // Fallunterscheidung bei der Formular-Erstellung:
            if (question.correctAnswer.length > 1) {
                // MEHRFACHAUSWAHL: Ein FormArray für die Checkboxen erzeugen
                const checkboxControls = question.options.map(() => this.fb.control(false));           
                group[`question_${i}`] = this.fb.array(checkboxControls, OneCheckboxSelected());
            } else {
                // Validierung: Multiple-Choice-Fragen (mindestens eine Antwort muss ausgewählt sein) 
                group[`question_${i}`] = ['', Validators.required];
            }
        });
        //FormGroup erstellen 
        this.quizForm = this.fb.group(group);
    }

    isMultipleChoice(question: Question): boolean {
        if (!question || !question.correctAnswer) {
            return false;
        }    
        return question.correctAnswer.length > 1;
    } 

    getOptionsArray(index: number): FormArray {
        return this.quizForm.get(`question_${index}`) as FormArray;
    }

    getQuizProgress(): number {
        if (!this.quizForm || !this.quizData) return 0;
        let answeredCount = 0;
        // Wir gehen alle Fragen durch und prüfen, ob ein Wert ausgewählt wurde
        this.quizData.questions.forEach((_, i) => {
            if (this.quizForm.get(`question_${i}`)?.valid) {
                answeredCount++;
            }
        });
        return Math.round((answeredCount / this.quizData.questions.length) * 100);
    }

    onSubmit(): void {
        

        if (this.quizForm.valid && this.quizId && this.quizData) {
            const userAnswers: { [key: string]: string[] } = {};
        
            this.quizData.questions.forEach((question, i) => {
                if (this.isMultipleChoice(question)) {
                    const arrayValues = this.getOptionsArray(i).value; // Index i übergeben
                    userAnswers[`question_${question.id}`] = question.options.filter((_, index) => arrayValues[index]);
                } else {
                    const singleValue = this.quizForm.get(`question_${i}`)?.value; // Index i nutzen
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
        
        this.router.navigate(['/home']);
    }    
}
