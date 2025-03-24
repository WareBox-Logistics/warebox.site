import React from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

const LotsComponent = ({ parkingLot, lots, onAssign, onFree }) => {
  // Create a map of spot codes to their corresponding lot data
  const lotMap = {};
  lots.forEach((lot) => {
    lotMap[lot.spot_code] = lot;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px', marginBottom: '-100px' }}>
      {parkingLot.rows.map((row) => (
        <div key={row} style={{ display: 'flex' }}>
          {parkingLot.columns.map((column) => {
            const spaceId = `${row}${column}`;
            const lot = lotMap[spaceId]; // Get the lot data for this spot
            const isOccupied = lot?.is_occupied || false; // Check if the spot is occupied
            const vehicle = lot?.vehicle; // Get the vehicle data (if any)

            return (
              <div
                key={spaceId}
                style={{
                  width: '50px',
                  height: '70px',
                  border: '1px solid black',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  margin: '2px',
                  backgroundColor: isOccupied ? '#ffcccc' : '#ccffcc', // Red if occupied, green if free
                  position: 'relative',
                  cursor: 'pointer', // Disable click if occupied
                }}
                onClick={() => {
                  if (!isOccupied) {
                    onAssign(lot); // Trigger the onAssign function
                  }else if (isOccupied){
                    onFree(lot);
                  }
                }}
              >
                {spaceId}
                {isOccupied && vehicle && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '2px',
                      fontSize: '10px',
                      textAlign: 'center',
                      color: '#000',
                    }}
                  >
                    {vehicle.license_plate} {/* Display the vehicle's license plate */}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default LotsComponent;