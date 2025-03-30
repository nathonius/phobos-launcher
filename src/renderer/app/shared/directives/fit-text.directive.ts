import type { OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ElementRef, Renderer2, Directive, inject, input } from '@angular/core';

import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Directive({
  selector: '[fittext]',
  standalone: true,
})
export class FitTextDirective implements OnInit, OnChanges {
  public readonly compressor = input<number>(1); // Compression factor, default is 1
  public readonly minFontSize = input<number>(0); // Minimum font size in pixels
  public readonly maxFontSize = input<number>(Number.POSITIVE_INFINITY); // Maximum font size in pixels
  public readonly debounceTime = input<number>(250); // Debounce time in milliseconds

  private resizeSubject = new Subject<void>();
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  ngOnInit() {
    this.resizeSubject
      .pipe(debounceTime(this.debounceTime()))
      .subscribe(() => this.adjustFontSize());

    // Adjust font size initially
    this.adjustFontSize();

    // Listen for window resize events
    window.addEventListener('resize', () => this.resizeSubject.next());
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['compressor'] ||
      changes['minFontSize'] ||
      changes['maxFontSize']
    ) {
      this.adjustFontSize();
    }
  }

  private adjustFontSize() {
    const element = this.el.nativeElement;
    const parentWidth = element.parentElement.offsetWidth;
    const newFontSize = Math.max(
      Math.min(parentWidth / (this.compressor() * 10), this.maxFontSize()),
      this.minFontSize()
    );

    this.renderer.setStyle(element, 'fontSize', `${newFontSize}px`);
  }

  ngOnDestroy() {
    this.resizeSubject.complete();
    window.removeEventListener('resize', () => this.resizeSubject.next());
  }
}
