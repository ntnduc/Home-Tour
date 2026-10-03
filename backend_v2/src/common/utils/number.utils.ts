/**
 * Round a number to the nearest integer.
 * @param number The number to round.
 * @returns The rounded number.
 */
export function roundMoney(number: number): number {
  const rounded = Number(number).toFixed(2);
  return Number(rounded);
}
