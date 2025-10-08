exports.computeSalePrice = (basePrice) => {
  if (basePrice == null) return null;
  const pct = basePrice * 1.35;
  return Math.round(pct * 10) / 10; // redondeo a décima
};
