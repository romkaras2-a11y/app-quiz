import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
    // Internes Signal für die Sekunden
    private _timeLeft = signal<number>(0);
    
    // Öffentliches, schreibgeschütztes Signal für die Komponente
    public timeLeft = this._timeLeft.asReadonly();
    
    private timerInterval: any;
    
    // Gibt zurück, ob die Zeit knapp wird (unter 10 Sekunden)
    public isUrgent = computed(() => this._timeLeft() <= 10 && this._timeLeft() > 0);

    public isTimeout = computed(() => this._timeLeft() === 0);
    // Formatiert die Sekunden direkt reaktiv in MM:SS
    public formattedTime = computed(() => {
      const totalSeconds = this._timeLeft();
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    });

    start(seconds: number) {
        this.stop(); // Alten Timer falls vorhanden aufräumen
        this._timeLeft.set(seconds);
        
        this.timerInterval = setInterval(() => {
          if (this._timeLeft() > 0) {
            this._timeLeft.update(time => time - 1);
          } else {
            this.stop();        
          }
        }, 1000);
    }

    stop() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
      }      
      this._timeLeft.set(0);
    }
}
