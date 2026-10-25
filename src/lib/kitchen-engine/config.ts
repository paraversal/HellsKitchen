// The named values of the engine, in one place. Rules read them from here instead of hiding numbers in the code.

/** Raised whenever a rule changes, and written into every saved plan. See CHANGELOG.md. */
export const RULES_VERSION = 0;

/** Main dishes share the meal between them: with two mains each gets a half. See R4. */
export const SHARED_CATEGORY = 'main';

/** The store for things that are never bought. See R9. */
export const NO_STORE = 'none';

/** A tiny allowance so that 3.0000000000000004 packs does not become 4 packs. See R10. */
export const ROUNDING_ALLOWANCE = 1e-9;
