import { Injectable, Inject, computed, signal, OnDestroy, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ThemeService implements OnDestroy {
  private readonly storageKey = 'produck-theme';
  private readonly isBrowser: boolean;
  private readonly darkMode = signal(false);
  private mediaQuery?: MediaQueryList;
  private mediaQueryListener?: (event: MediaQueryListEvent) => void;

  readonly isDarkMode = computed(() => this.darkMode());

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      this.initializeTheme();
    }
  }

  ngOnDestroy(): void {
    if (!this.isBrowser || !this.mediaQuery || !this.mediaQueryListener) {
      return;
    }

    if (typeof this.mediaQuery.removeEventListener === 'function') {
      this.mediaQuery.removeEventListener('change', this.mediaQueryListener);
    } else if (typeof this.mediaQuery.removeListener === 'function') {
      this.mediaQuery.removeListener(this.mediaQueryListener);
    }
  }

  toggleTheme(): void {
    this.setTheme(!this.darkMode(), true);
  }

  setTheme(isDark: boolean, persistPreference: boolean = true): void {
    this.darkMode.set(isDark);

    if (this.isBrowser) {
      this.applyTheme(isDark);
      if (persistPreference) {
        try {
          localStorage.setItem(this.storageKey, isDark ? 'dark' : 'light');
        } catch (error) {
          // Storage might be unavailable; fail silently.
        }
      }
    }
  }

  resetToSystemPreference(): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      // Ignore storage errors.
    }

    const prefersDark = this.mediaQuery?.matches ?? false;
    this.setTheme(prefersDark, false);
  }

  private initializeTheme(): void {
    const storedPreference = this.getStoredPreference();
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    const initialDarkMode = storedPreference ?? prefersDark.matches;
    this.darkMode.set(initialDarkMode);
    this.applyTheme(initialDarkMode);

    this.mediaQuery = prefersDark;
    this.mediaQueryListener = (event: MediaQueryListEvent) => {
      if (this.getStoredPreference() === null) {
        this.setTheme(event.matches, false);
      }
    };

    if (typeof prefersDark.addEventListener === 'function') {
      prefersDark.addEventListener('change', this.mediaQueryListener);
    } else if (typeof prefersDark.addListener === 'function') {
      prefersDark.addListener(this.mediaQueryListener);
    }
  }

  private getStoredPreference(): boolean | null {
    if (!this.isBrowser) {
      return null;
    }

    try {
      const storedValue = localStorage.getItem(this.storageKey);
      if (storedValue === 'dark') {
        return true;
      }
      if (storedValue === 'light') {
        return false;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  private applyTheme(isDark: boolean): void {
    const root = this.document.documentElement;
    root.classList.toggle('dark', isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';

    const body = this.document.body;
    if (body) {
      body.dataset['theme'] = isDark ? 'dark' : 'light';
    }
  }
}
