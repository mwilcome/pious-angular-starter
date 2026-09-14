import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { appConfig } from './app.config';
import { App } from './app';
import { appTitle } from './core/site';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [...appConfig.providers],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should navigate home, lab, and unknown paths', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    const title = TestBed.inject(Title);
    fixture.detectChanges();

    await router.navigateByUrl('/');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain(appTitle);
    expect(title.getTitle()).toBe(`Home · ${appTitle}`);

    await router.navigateByUrl('/lab');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Lab');
    expect(title.getTitle()).toBe(`Lab · ${appTitle}`);

    await router.navigateByUrl('/not-a-route');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Not found');
    expect(title.getTitle()).toBe(`Not found · ${appTitle}`);
  });
});
