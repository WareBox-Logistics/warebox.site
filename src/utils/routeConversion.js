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

//function to take minutes and turn them into hours and minutes
export const minutesToHours = (minutes) => {
  let hours = Math.floor(minutes / 60);
  let minute = minutes % 60;
  return `${hours} hours ${minute} minutes`;
}

export const transformGeoapifyResponse = (geoapifyResponse) => {
  const { results } = geoapifyResponse;

  if (!results || results.length === 0) {
    console.error("No results found in the Geoapify response");
    return null;
  }

  const firstResult = results[0];

  // Extract PolylinePath
  const polylinePath = [];
  if (firstResult.geometry && firstResult.geometry.length > 0) {
    const path = firstResult.geometry[0].map((point) => ({
      lat: point.lat,
      lng: point.lon,
    }));
    polylinePath.push(path); // Wrap the path in an array to match the MultiLineString structure
  }

  // Extract RouteDirections
  const routeDirections = [];
  if (firstResult.legs && firstResult.legs.length > 0) {
    const firstLeg = firstResult.legs[0];
    if (firstLeg.steps && firstLeg.steps.length > 0) {
      firstLeg.steps.forEach((step) => {
        const { distance, time, instruction } = step;
        const point = {
          lat: firstResult.waypoints[0].location[1], // Use the first waypoint's lat
          lng: firstResult.waypoints[0].location[0], // Use the first waypoint's lon
        };

        routeDirections.push({
          geojson: JSON.stringify({
            type: "Point",
            coordinates: [point.lng, point.lat],
          }),
          eje_excedente: 0,
          costo_caseta: 0,
          tiempo_min: time / 60, // Convert seconds to minutes
          long_m: distance,
          punto_caseta: null,
          direccion: instruction.text,
          giro: 0, // You might need to adjust this based on the step
          point,
        });
      });
    }
  }

  return {
    PolylinePath: polylinePath,
    RouteDirections: routeDirections,
  };
};