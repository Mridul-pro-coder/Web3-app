// Calculates days left until a deadline
export const daysLeft = (deadline: string): string => {
  const difference = new Date(deadline).getTime() - Date.now();
  const remainingDays = difference / (1000 * 3600 * 24);
  return remainingDays.toFixed(0);
};

// Calculates percentage of goal completed
export const calculateBarPercentage = (goal: number, raisedAmount: number): number => {
  const percentage = Math.round((raisedAmount * 100) / goal);
  return percentage;
};

// Checks if a given URL is a valid image
export const checkIfImage = (url: string, callback: (isValid: boolean) => void): void => {
  const img = new Image();
  img.src = url;

  if (img.complete) {
    callback(true);
  }

  img.onload = () => callback(true);
  img.onerror = () => callback(false);
};
