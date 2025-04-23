// priceData.ts
export const bathData = [
  { weight: "< 5kg", price: 150000 },
  { weight: "5 - 10kg", price: 200000 },
  { weight: "10 - 20kg", price: 250000 },
  { weight: "20 - 40kg", price: 300000 },
  { weight: "> 40kg", price: 350000 },
];

export const comboBathData = [
  { weight: "< 5kg", price: 320000 },
  { weight: "5 - 10kg", price: 520000 },
  { weight: "10 - 20kg", price: 620000 },
  { weight: "20 - 40kg", price: 720000 },
  { weight: "> 40kg", price: 820000 },
];

export const serviceBathData = [
  { weight: "< 5kg", price: 150000 },
  { weight: "5 - 10kg", price: 180000 },
  { weight: "10 - 20kg", price: 210000 },
  { weight: "20 - 40kg", price: 240000 },
  { weight: "> 40kg", price: 270000 },
];

// Optionally, you can include the calculatePrice function here as well
export const calculatePrice = (
  serviceName: string,
  petWeight: number,
  petType: string
): number => {
  const getWeightRange = (weight: number): string => {
    if (weight < 5) return "< 5kg";
    if (weight >= 5 && weight <= 10) return "5 - 10kg";
    if (weight > 10 && weight <= 20) return "10 - 20kg";
    if (weight > 20 && weight <= 40) return "20 - 40kg";
    return "> 40kg";
  };

  const weightRange = getWeightRange(petWeight);

  if (serviceName.includes("Tắm") && !serviceName.includes("Combo")) {
    const priceEntry = bathData.find((item) => item.weight === weightRange);
    return priceEntry ? priceEntry.price : 0;
  } else if (serviceName.includes("Combo")) {
    const priceEntry = comboBathData.find((item) => item.weight === weightRange);
    return priceEntry ? priceEntry.price : 0;
  } else if (
    serviceName.includes("Cắt, tỉa") ||
    serviceName.includes("Cạo")
  ) {
    const priceEntry = serviceBathData.find((item) => item.weight === weightRange);
    return priceEntry ? priceEntry.price : 0;
  }

  return 0;
};