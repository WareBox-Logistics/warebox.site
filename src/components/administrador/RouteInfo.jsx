import { Col, Row, Typography } from 'antd';
import { metersToKm, minutesToHours, secondsToHours } from 'utils/routeConversion';
const { Title, Text } = Typography;

const RouteInfo = ({ path }) => {
 
  if (!path) {
    return null; 
  }
return (  

   <div style={{ paddingLeft: '30px', borderRadius: '10px' }}>
        <Row gutter={8}>
          <Title level={4}>Route Info</Title>
        </Row>

        <Row gutter={8}>
          <div
            style={{
              background: '#f0f2f5',
              padding: '10px',
              borderRadius: '10px',
              width: '100%',
              maxHeight: '60vh',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '5vh',
                background: '#FFFFFF',
                borderRadius: '10px',
                alignContent: 'center',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                padding: '10px',
                marginBottom: '10px',
              }}
            >
              <Text strong>Distance:</Text>
              <Text>{(path.distance) ? metersToKm(path.distance):path.long_km} Km</Text>
            </div>
            <div
              style={{
                width: '100%',
                height: '5vh',
                background: '#FFFFFF',
                borderRadius: '10px',
                alignContent: 'center',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                padding: '10px',
                marginBottom: '10px',
              }}
            >
              <Text strong>Duration:</Text>
              <Text>{(path.time)? secondsToHours(path.time):minutesToHours(path.tiempo_min)}</Text>
            </div>
            <div
              style={{
                width: '100%',
                height: '5vh',
                background: '#FFFFFF',
                borderRadius: '10px',
                alignContent: 'center',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                padding: '10px',
                marginBottom: '10px',
              }}
            >
              <Text strong>Tolls:</Text>
              <Text>${(!path.caseta)? path.costo_caseta : ""}</Text>
            </div>
            <div
              style={{
                width: '100%',
                height: '5vh',
                background: '#FFFFFF',
                borderRadius: '10px',
                alignContent: 'center',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                padding: '10px',
                marginBottom: '10px',
              }}
            >
              <Text strong>Warning:</Text>
              <Text>{(path.advertencia === "" || !path.advertencia)? "No warnings" :path.advertencia}</Text>
            </div>
            <div
              style={{
                width: '100%',
                height: '5vh',
                background: '#FFFFFF',
                borderRadius: '10px',
                alignContent: 'center',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                padding: '10px',
                marginBottom: '10px',
              }}
            >
              <Text strong>Passes through toll booths?</Text>
              <Text>{(path.peaje === "f" || !path.peaje)? "No tool booths" :"Yes"}</Text>
            </div>
          </div>
        </Row>
</div>
);

};

export default RouteInfo;