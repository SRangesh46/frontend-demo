import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[numberOnly]'
})
export class NumberOnlyDirective {

  constructor(private el: ElementRef) { }

  @HostListener('input', ['$event']) onInputChange(event:any) {
    const initialValue:any = this.el.nativeElement.value;
    console.log(initialValue,'ini');
    console.log(this.el.nativeElement.value,'el');
    
    
    this.el.nativeElement.value = initialValue.replace(/[^0-9]*/g, '');
    if (initialValue !== this.el.nativeElement.value) {
      event.stopPropagation();
    }
  }
}

