import React from 'react';

const ParkingLotUI = ({ parkingLot }) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px',marginBottom:'-100px' }}>
        {parkingLot.rows.map(row => (
          <div key={row} style={{ display: 'flex' }}>
            {parkingLot.columns.map(column => {
              const spaceId = `${row}${column}`;
              return (
                <div
                  key={spaceId}
                  style={{
                    width: '50px',
                    height: '50px',
                    border: '1px solid black',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: '2px',
                    backgroundColor: parkingLot.spaces[spaceId] ? '#ffcccc' : '#ccffcc' // Red if occupied, green if free
                  }}
                >
                  {spaceId}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };
  
export default ParkingLotUI;