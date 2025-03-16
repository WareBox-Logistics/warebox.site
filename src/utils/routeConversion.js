//function to take meters and turn them into km with 2 decimal places

export const metersToKm = (meters) => {
  return meters / 1000;
}

//function to take seconds and turn them into hours and minutes
export const secondsToHours = (seconds) => {
  let hours = Math.floor(seconds / 3600);
  let minutes = Math.floor((seconds % 3600) / 60);
  return `${hours} hours ${minutes} minutes`;
}