import { AbstractControl, ValidatorFn, FormArray } from '@angular/forms';

// Prüft, ob mindestens ein Wert im FormArray 'true' ist
export function OneCheckboxSelected(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const formArray = control as FormArray;
    const isAnySelected = formArray.controls.some(c => c.value === true);
    return isAnySelected ? null : { requireOneCheckbox: true };
  };
}
