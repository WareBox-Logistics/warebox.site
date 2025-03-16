import { Col, Row, Typography } from 'antd';
import { metersToKm, secondsToHours } from 'utils/routeConversion';
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
              <Text>{metersToKm(path.results[0].distance)} Km</Text>
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
              <Text>{secondsToHours(path.results[0].time)}</Text>
            </div>
          </div>
        </Row>
</div>
);

};

export default RouteInfo;