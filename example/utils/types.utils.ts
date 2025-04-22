/**
- Excludes common falsy values from a type
- @example
- type Example = string | number | null | undefined | 0 | '' | false
- type ValidExample = ValidValue<Example>
-        ^? string | number
**/
export type ValidValue<T> = Exclude<T, null | undefined | 0 | "" | false>

export type Optional<T> = T | undefined | null

/**
 * Just like .filter(Boolean), but allows TypeScript to exclude falsy values in return type
 * @example
 * const x = [1, 2, 3, "", null, undefined, 0, false]
 * const y = x.filter(BooleanFilter)
 *       ^? [1, 2, 3]
 */
export const BooleanFilter = <T>(x: T): x is ValidValue<T> => Boolean(x)
