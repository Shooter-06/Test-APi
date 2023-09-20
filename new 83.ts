reactive forms

import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports:      [ ReactiveFormsModule ],
})
export class AppModule { }


validation.service.ts
import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  constructor() {}

  dataValidation(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    // Add your data validation logic here
    if (value === null || value === undefined || value === '') {
      return { dataValidation: 'Invalid data' };
    }
    return null;
  }

  inputValidation(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      // Add your input validation logic here
      if (value.length < min || value.length > max) {
        return { inputValidation: `Input must be between ${min} and ${max} characters` };
      }
      return null;
    };
  }

  numValidation(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      // Add your number validation logic here
      if (value < min || value > max) {
        return { numValidation: `Number must be between ${min} and ${max}` };
      }
      return null;
    };
  }

  // ... add other necessary validation methods
}

ts.

import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ValidationService } from './path-to-your-service/validation.service';

@Component({
  selector: 'app-your-component',
  templateUrl: './your-component.component.html',
  styleUrls: ['./your-component.component.css'],
})
export class YourComponentComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder, private validationService: ValidationService) {
    this.form = this.fb.group({
      dataField: ['', [this.validationService.dataValidation.bind(this.validationService)]],
      inputField: ['', [this.validationService.inputValidation(3, 100)]],
      numField: ['', [this.validationService.numValidation(1, 1000)]],
    });
  }
}


html file
<form [formGroup]="form">
  <div>
    <label for="dataField">Data Field</label>
    <input id="dataField" formControlName="dataField" />
    <div *ngIf="form.get('dataField').hasError('dataValidation')">
      Invalid data
    </div>
  </div>
  
  <div>
    <label for="inputField">Input Field</label>
    <input id="inputField" formControlName="inputField" />
    <div *ngIf="form.get('inputField').hasError('inputValidation')">
      Input must be between 3 and 100 characters
    </div>
  </div>
  
  <div>
    <label for="numField">Number Field</label>
    <input id="numField" formControlName="numField" type="number" />
    <div *ngIf="form.get('numField').hasError('numValidation')">
      Number must be between 1 and 1000
    </div>
  </div>
  
  <button [disabled]="form.invalid">Submit</button>
</form>
