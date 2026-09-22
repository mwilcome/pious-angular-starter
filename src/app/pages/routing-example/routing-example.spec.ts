import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { RoutingExample } from './routing-example';

/** Example Vitest + RouterTestingHarness spec. Replace with tests for your routes. */
describe('RoutingExample', () => {
  it('is reachable as a route', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    });

    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/routing-example', RoutingExample);

    expect(page).toBeInstanceOf(RoutingExample);
  });

  it('toggles the hint', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    });

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/routing-example', RoutingExample);

    const el = harness.routeNativeElement as HTMLElement;
    const button = el.querySelector('button');
    expect(button).toBeTruthy();
    expect(el.textContent).not.toContain('boolean signal');

    button!.click();
    await harness.fixture.whenStable();
    expect(el.textContent).toContain('boolean signal');

    button!.click();
    await harness.fixture.whenStable();
    expect(el.textContent).not.toContain('boolean signal');
  });
});
