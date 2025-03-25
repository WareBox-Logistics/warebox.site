import React, { useEffect, useState } from "react";
import { Input, Col, Row, Card, Typography, Modal, message, Button, Spin } from "antd";
import { SearchOutlined, AppstoreOutlined,  } from "@ant-design/icons";
import axios from "axios";
import { API_URL_WHOLE_PARKINGLOTS, authToken, API_URL_FREE_TRAILERS, API_URL_FREE_TRUCKS, API_URL_ASSIGN_LOT, API_URL_FREE_LOT } from "../../../services/services";
import MainCard from "ui-component/cards/MainCard";
import Paper from "@mui/material/Paper";
import LotsComponent from 'components/administrador/ParkingLot/LotsComponent';


const { Title, Text } = Typography;

const generateParkingSpaces = (rows, columns) => {
  const spaces = {};
  for (let row = 0; row < rows; row++) {
    const rowLabel = String.fromCharCode(65 + row);
    for (let col = 1; col <= columns; col++) {
      const spaceId = `${rowLabel}${col}`;
      spaces[spaceId] = null; 
    }
  }
  return spaces;
};

const ParkingLots = () => {
  const [parkingLots, setParkingLots] = useState([]); 
  const [searchText, setSearchText] = useState("");//
  const [searchTextTruck, setSearchTextTrucks] = useState("");
  const [searchTextTrailer, setSearchTextTrailer] = useState("");
  const [filteredParkingLots, setFilteredParkingLots] = useState([]); 
  const [filteredFreeTrucks, setFilteredFreeTrucks] = useState([]); 
  const [filteredFreeTrailers, setFilteredFreeTrailers] = useState([]); 

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [freeTrucks, setFreeTrucks] = useState([]);
  const [freeTrailers, setFreeTrailers] = useState([]);
  const [selectedParking, setSelectedParking] = useState(null);
  const [rows, setRows] = useState(0); 
  const [columns, setColumns] = useState(0); 
    const [parkingLot, setParkingLot] = useState({
      rows: Array.from({ length: 4 }, (_, i) => String.fromCharCode(65 + i)), // A, B, C, D
      columns: Array.from({ length: 3 }, (_, i) => i + 1), // 1, 2, 3
      spaces: generateParkingSpaces(4, 3)
    });
    const [selectedLot, setSelectedLot] = useState(null);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
    const [freeing, setFreeing] = useState(false);
    const [loading, setLoading] = useState(false); // Loading state for spinners


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await fetchParkingLots();
      await fetchFreeTrailers();
      await fetchFreeTrucks();
      filterFreeVehicles(); // Apply filtering after all data is fetched
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Error fetching data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (parkingLots && Array.isArray(parkingLots)) {
      const filtered = parkingLots.filter((parking) =>
        parking.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredParkingLots(filtered);
    }
  }, [searchText, parkingLots]);

  useEffect(() => {
    if (freeTrailers) {
      const filtered = freeTrailers.filter((trailer) =>
        trailer.plates.toLowerCase().includes(searchTextTrailer.toLowerCase())
      );
      setFilteredFreeTrailers(filtered);
    }
  }, [searchTextTrailer, freeTrailers]);

  useEffect(() => {
    if (freeTrucks) {
      const filtered = freeTrucks.filter((truck) =>
        truck.plates.toLowerCase().includes(searchTextTruck.toLowerCase())
      );
      setFilteredFreeTrucks(filtered);
    }
  }, [searchTextTruck, freeTrucks]);

  const fetchParkingLots = async () => {
    try {
      const response = await axios.get(API_URL_WHOLE_PARKINGLOTS, {
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
      });
  
      const parkingLotsArray = Object.keys(response.data).map((key) => ({
        name: key,
        ...response.data[key],
      }));
  
      setParkingLots(parkingLotsArray);
    } catch (error) {
      console.error("Error fetching parking lots: ", error);
      message.error("Error fetching parking lots.");

    }
  };

  const fetchFreeTrucks = async() => {
    try {
      const response = await axios.get(API_URL_FREE_TRUCKS, {
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
      });
  
      setFreeTrucks(response.data.trucks);
    } catch (error) {
      console.error("Error fetching free truks: ", error);
      message.error("Error fetching free trucks.");

    }
  }

  const fetchFreeTrailers = async() => {
    try {
      const response = await axios.get(API_URL_FREE_TRAILERS, {
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
      });
  
      setFreeTrailers(response.data.trailers);
    } catch (error) {
      console.error("Error fetching free trailers: ", error);
      message.error("Error fetching free trailers.");

    }
  }

  const AssignLot = async(vehicle_id, lot_id) => {
    try {
      const payload = {
        vehicle_id: vehicle_id,
        lot_id: lot_id
      }
      const response = await axios.post(API_URL_ASSIGN_LOT, payload, {
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
      });
      message.success(response.data.message);
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error fetching free trailers: ", error);
      message.error("Error at assigning a lot");
    }
  }

  const handleAssignVehicle = async (vehicleId, lotId) => {
    try {
      await AssignLot(vehicleId, lotId); 
      message.success("Vehicle assigned successfully!");
      await fetchData(); 
    } catch (error) {
      console.error("Error assigning vehicle:", error);
      message.error("Error assigning vehicle.");
    }
  };

  const fetchAssignedVehicles = (parkingLots) => {
    const assignedVehicles = new Set();
    parkingLots.forEach((parking) => {
      parking.lots.forEach((lot) => {
        if (lot.is_occupied && lot.vehicle) {
          assignedVehicles.add(lot.vehicle.id); // Add the vehicle ID to the set
        }
      });
    });
    return assignedVehicles;
  };


  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedParking(null);
    setRows(0);
    setColumns(0);
  };

  useEffect(() => {
    handleGenerateParkingLot();
  },[rows,columns])

  const handleGenerateParkingLot = () => {
    const newRows = Array.from({ length: rows }, (_, i) => String.fromCharCode(65 + i)); // A, B, C, ...
    const newColumns = Array.from({ length: columns }, (_, i) => i + 1); // 1, 2, 3, ...
    const newSpaces = generateParkingSpaces(rows, columns);

    setParkingLot({
      rows: newRows,
      columns: newColumns,
      spaces: newSpaces
    });
  };

const freeLot = async(lotID) => {
  try{
    const payload = {
        lotID: lotID
    };

     await axios.post(API_URL_FREE_LOT,payload, {
      headers: {
        Authorization: authToken,
        "Content-Type": "application/json",
      },
    });
    message.success("Lot freed successfully!");
    setIsModalVisible(false);
    await fetchData();
  }catch(error){
    console.error("Error at freeing lot");    
    message.success("Couldn't free lot!");
  } finally {
    setFreeing(false);
    setIsAssignModalVisible(false);
  };
}

const filterFreeVehicles = () => {
  if (parkingLots.length > 0 && freeTrucks.length > 0 && freeTrailers.length > 0) {
    const assignedVehicles = fetchAssignedVehicles(parkingLots);

    // Filter free trucks
    const filteredFreeTrucks = freeTrucks.filter(
      (truck) => !assignedVehicles.has(truck.id)
    );
    setFilteredFreeTrucks(filteredFreeTrucks);

    // Filter free trailers
    const filteredFreeTrailers = freeTrailers.filter(
      (trailer) => !assignedVehicles.has(trailer.id)
    );
    setFilteredFreeTrailers(filteredFreeTrailers);
  }
};

useEffect(() => {
  filterFreeVehicles();
}, [parkingLots, freeTrucks, freeTrailers]);

  return (
    <Paper elevation={3} sx={{ padding: "16px", margin: "16px" }}>
      <MainCard title="Parking Lots">
        <Col>
          <Row style={{ marginBottom: "16px" }}>
            {/* Search bar */}
            <Input
              style={{ width: "100%", maxWidth: 300 }}
              prefix={<SearchOutlined />}
              placeholder="Search by name"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Row>

          {loading ? (
            <Spin size="large" />
          ) : filteredParkingLots.length > 0 ? (
            filteredParkingLots.map((parking) => (
              <Card
                key={parking.id}
                hoverable
                style={{
                  marginBottom: "16px",
                  cursor: "pointer",
                  padding: "16px",
                }}
                onClick={() => {
                  setIsModalVisible(true);
                  setSelectedParking(parking);
                  setRows(parking.rows);
                  setColumns(parking.columns);
                }}
              >
                <Row justify="space-between" align="middle" style={{ gap: "12px" }}>
                  <Col>
                    <AppstoreOutlined
                      style={{ fontSize: "36px", marginRight: "12px", color: "#FF731D" }}
                    />
                  </Col>
                  <Col flex="auto" style={{ maxWidth: "70%" }}>
                    <Title level={4} style={{ margin: 0, fontSize: "22px", wordWrap: "break-word" }}>
                      {parking.name}
                    </Title>
                    <Text style={{ fontSize: "16px", display: "block", marginTop: "8px" }}>
                      <span style={{ color: "gray" }}>Free:</span> {parking.free}
                    </Text>
                    <Text style={{ fontSize: "16px", display: "block", marginTop: "4px" }}>
                      <span style={{ color: "gray" }}>Occupied:</span> {parking.occupied}
                    </Text>
                  </Col>
                </Row>
              </Card>
            ))
          ) : (
            <Text style={{ fontSize: "16px", color: "gray" }}>No parking lots found.</Text>
          )}
        </Col>
        <Modal
          title="Lots"
          visible={isModalVisible}
          onCancel={handleModalClose}
          footer={null}
          width={800}
        >
          <Typography.Title level={5}>Parking lot grid layout</Typography.Title>
          <Col style={{ height: '50vh' }}>
            <LotsComponent
              parkingLot={parkingLot}
              lots={selectedParking?.lots || []}
              onAssign={(lot) => {
                setSelectedLot(lot);
                setIsAssignModalVisible(true);
              }}
              onFree={(lot) => {
                setSelectedLot(lot);
                setIsAssignModalVisible(true);
                setFreeing(true);
              }}
            />
          </Col>
        </Modal>
        <Modal
          title={freeing? "Free the lot" : `Assign Vehicle to Parking Lot`}
          visible={isAssignModalVisible}
          onCancel={() => {setIsAssignModalVisible(false);setFreeing(false)}}
          footer={null}
        >
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Typography.Text level={5}>{freeing? "Click on the button to free the lot up" : "Select a Truck or Trailer"}</Typography.Text>
            </Col>
            {!freeing &&(
              <>
            <Col span={24}>
              <Typography.Title level={5} style={{ marginTop: '-10px', color: "#FF731D" }}>Trucks</Typography.Title>
              <Input
                style={{ width: "100%", marginBottom: "10px" }}
                prefix={<SearchOutlined />}
                placeholder="Search by plate"
                value={searchTextTruck}
                onChange={(e) => setSearchTextTrucks(e.target.value)}
              />
              <div style={{ overflowY: "auto", height: "170px", width: "100%" }}>
                {filteredFreeTrucks.map((truck) => (
                  <Card
                    key={truck.id}
                    hoverable
                    style={{ marginBottom: '8px' }}
                    onClick={() => {
                      setIsAssignModalVisible(false); // Close the modal
                      handleAssignVehicle(truck.id, selectedLot.id); // Assign the selected vehicle
                    }}
                  >
                    <Text strong>{truck.plates}</Text> - {truck.model.name}
                  </Card>
                ))}
              </div>
            </Col>
            <Col span={24}>
              <Typography.Title level={5} style={{ color: "#FF731D", marginTop: "-10px" }}>Trailers</Typography.Title>
              <Input
                style={{ width: "100%", marginBottom: "10px" }}
                prefix={<SearchOutlined />}
                placeholder="Search by plate"
                value={searchTextTrailer}
                onChange={(e) => setSearchTextTrailer(e.target.value)}
              />
              <div style={{ overflowY: "auto", width: "100%" }}>
                {filteredFreeTrailers.map((trailer) => (
                  <Card
                    key={trailer.id}
                    hoverable
                    style={{ marginBottom: '8px' }}
                    onClick={() => {
                      setIsAssignModalVisible(false); // Close the modal
                      handleAssignVehicle(trailer.id, selectedLot.id); // Assign the selected vehicle
                    }}
                  >
                    <Text strong>{trailer.plates}</Text> - {trailer.model.name}
                  </Card>
                ))}
              </div>
            </Col>
            </>
            )}
            {freeing && (
              
              <Col span={24}>
                <Typography.Text strong type="danger">Do you wish to free the lot {selectedLot.spot_code}?</Typography.Text>
                <Row>
                <Typography.Text >Current vehicle is a {selectedLot.vehicle.type} with plates: {selectedLot.vehicle.license_plate}</Typography.Text>
                </Row>
                <Row>
                <Button  type="primary" danger onClick={()=>{freeLot(selectedLot.id)}} style={{marginTop:"16px"}}>Free lot</Button>
                </Row>
              </Col>
            )}
          </Row>
        </Modal>
      </MainCard>
    </Paper>
  );
};

export default ParkingLots;