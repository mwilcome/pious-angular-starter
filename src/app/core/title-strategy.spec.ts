import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter, TitleStrategy } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { appTitle } from './site';
import { AppTitleStrategy } from './title-strategy';

@Component({ template: '' })
class BlankPage {}

/** Covers both branches of AppTitleStrategy.updateTitle. */
describe('AppTitleStrategy', () => {
  async function titleAfter(path: string, title?: string): Promise<string> {
    const route =
      title === undefined ? { path, component: BlankPage } : { path, title, component: BlankPage };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([route]),
        { provide: TitleStrategy, useClass: AppTitleStrategy },
      ],
    });

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(`/${path}`, BlankPage);
    return TestBed.inject(Title).getTitle();
  }

  it('joins a page title with the app title', async () => {
    expect(await titleAfter('named', 'Home')).toBe(`Home · ${appTitle}`);
  });

  it('uses the app title when the route has no page title', async () => {
    expect(await titleAfter('plain')).toBe(appTitle);
  });
});
