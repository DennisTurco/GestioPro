export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value)
}

export function getTotalAmount(amount: number, vatPercentage: number, discountPercentage: number = 0) : number {
    const discount = amount * discountPercentage / 100;
    amount -= discount;
    const vatAmount = amount * vatPercentage / 100;
    return Number((amount + vatAmount).toFixed(2));
}

// Accepts numbers typed with an Italian-style decimal comma (e.g. "22,5") — the
// native number input's comma handling depends on the browser/OS locale and can't
// be relied on, so text inputs are normalized here before any parseFloat/Number call.
export function normalizeDecimalInput(value: string) : string {
    return value.replace(',', '.')
}

export function fixPercentageValueIfOutOfBoundary(percentage: number) : string {
    if (percentage < 0)
        return "0"
    else if (percentage > 100)
        return "100"
    return String(percentage)
}
