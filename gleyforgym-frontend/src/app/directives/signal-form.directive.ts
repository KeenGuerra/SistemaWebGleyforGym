import { Directive, Input, HostListener, ElementRef, Renderer2, inject, effect } from '@angular/core';
import { SignalFormField } from '../utils/signal-form';

@Directive({
  selector: '[signalForm]',
  standalone: true
})
export class SignalFormDirective {
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  private _field!: SignalFormField<any>;

  @Input('signalForm')
  set signalForm(field: SignalFormField<any> | (() => SignalFormField<any>) | undefined | null) {
    if (field) {
      this._field = typeof field === 'function' ? field() : field;
      this.updateDomValue();
    }
  }

  constructor() {
    // Sincronizar reactivamente cuando cambie el valor del Signal
    effect(() => {
      this.updateDomValue();
    });
  }

  @HostListener('input', ['$event'])
  @HostListener('change', ['$event'])
  onInput(event: Event) {
    const target = event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
    if (target && this._field) {
      const value = target.value;
      const originalValue = this._field.value();
      let parsedValue: any = value;

      if (typeof originalValue === 'number') {
        parsedValue = value === '' ? 0 : Number(value);
      } else if (typeof originalValue === 'boolean') {
        parsedValue = value === 'true';
      }

      if (originalValue !== parsedValue) {
        this._field.set(parsedValue);
      }
    }
  }
  private updateDomValue() {
    if (this._field) {
      const val = this._field.value();
      const element = this.el.nativeElement;

      if (element.type === 'checkbox') {
        this.renderer.setProperty(element, 'checked', !!val);
      } else {
        this.renderer.setProperty(
          element,
          'value',
          val === undefined || val === null ? '' : val
        );
      }
    }
  }
}
