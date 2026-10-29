/**
 * Money rules for the wholesale catalogue.
 *
 * Prices in the catalogue are NET (VAT excluded). VAT is added once, at the
 * summary level, so the shopper always sees the same breakdown the invoice
 * will show. Both the app and the API import this module, so a total can never
 * be calculated two different ways.
 */

/** Single rate for every product in the catalogue, per the company decision. */
export const VAT_RATE = 0.1;

/** Free shipping applies to the NET total, so VAT cannot flip the threshold. */
export const FREE_SHIPPING_THRESHOLD = 5000;

export const STANDARD_SHIPPING = 49.9;
export const EXPRESS_SHIPPING = 89.9;

export type ShippingMethod = 'standart' | 'express';

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export type PricedLine = {
  /** Net line total, VAT excluded. */
  net: number;
  vatRate: number;
};

export type Totals = {
  /** Net subtotal — what the pack prices add up to. */
  netTotal: number;
  vatTotal: number;
  shippingCost: number;
  total: number;
  freeShipping: boolean;
};

export function shippingFor(netTotal: number, shipping: ShippingMethod): number {
  if (shipping === 'express') return EXPRESS_SHIPPING;
  return netTotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
}

export function calculateTotals(lines: PricedLine[], shipping: ShippingMethod): Totals {
  const netTotal = roundMoney(lines.reduce((sum, line) => sum + line.net, 0));
  const vatTotal = roundMoney(
    lines.reduce((sum, line) => sum + roundMoney(line.net * line.vatRate), 0)
  );
  const shippingCost = netTotal === 0 ? 0 : shippingFor(netTotal, shipping);

  return {
    netTotal,
    vatTotal,
    shippingCost,
    total: roundMoney(netTotal + vatTotal + shippingCost),
    freeShipping: shippingCost === 0,
  };
}

/** "KDV %10" label used across the cart, checkout and order pages. */
export function vatLabel(rate = VAT_RATE): string {
  const percent = roundMoney(rate * 100);
  return `KDV %${Number.isInteger(percent) ? percent : percent.toFixed(1)}`;
}
