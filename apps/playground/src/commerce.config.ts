// Configure per deployment. This is a flat-rate policy, not a jurisdiction tax engine.
export const commercePolicy = {
  currency: 'INR',
  shippingFee: 0,
  taxBasisPoints: 0,
  taxLabel: 'Tax',
  deliveryDescription: 'Standard delivery',
} as const
