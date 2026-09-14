import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Lab } from './lab';

describe('Lab', () => {
  let fixture: ComponentFixture<Lab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Lab],
    }).compileComponents();

    fixture = TestBed.createComponent(Lab);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should toggle the hint with control flow', async () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h1')?.textContent).toContain('Lab');
    expect(el.textContent).not.toContain('This paragraph is shown');
    el.querySelector('button')?.click();
    await fixture.whenStable();
    expect(el.textContent).toContain('This paragraph is shown');
  });
});
