// The easing tokens as strings the Web Animations API accepts. `var(--spring-soft)` does not work there, so the value is read from the page's own tokens.
export type Easing = 'ease-out' | 'ease-in' | 'spring-soft' | 'spring-bouncy';

export const easing = (name: Easing): string => getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim() || 'ease-out';

export const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** The duration to use: nothing moves when motion is off. */
export const ms = (value: number) => (document.documentElement.dataset.motion === 'off' ? 0 : value);
