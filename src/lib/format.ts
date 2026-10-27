/** Turkish price formatting without relying on Intl support. */
export function formatPrice(value: number): string {
  const [whole, decimals] = value.toFixed(2).split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${grouped},${decimals} ₺`;
}

export function formatPriceShort(value: number): string {
  const [whole] = value.toFixed(0).split('.');
  return `${whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.')} ₺`;
}

/** ISO timestamp to Turkish DD.MM.YYYY. */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}.${date.getFullYear()}`;
}

export function orderNumber(): string {
  const stamp = Date.now().toString().slice(-6);
  return `RM-${stamp}`;
}

export function estimatedDelivery(): string {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}`;
}
