import { AbstractControl, ValidationErrors } from '@angular/forms';

export function numbersOnlyValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const isNumeric = /^\d+$/.test(control.value);
  return isNumeric ? null : { numbersOnly: true };
}

export function outsourceEmployeeValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const startsWithOutsource = control.value.toString().startsWith('789');
  return startsWithOutsource ? { outsourceEmployee: true } : null;
}
