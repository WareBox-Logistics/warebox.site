//BACKEND VARIABLE
export const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;
// export const BASE_API_URL = 'http://127.0.0.1:8000/api'

//TOKEN
export const authToken = `Bearer ${localStorage.getItem('token')}`;
export const userID = localStorage.getItem('user_id');

//GEOAPIFY
export const GEOAPIFY_BASE_API_URL = 'https://api.geoapify.com/v1/routing?';

//INEGI SAKABE
export const API_SAKABE_COORDS = BASE_API_URL + '/proxy/coordsID';
export const API_SAKABE_COORDS_OPTIMA = BASE_API_URL + '/proxy/optima';
export const API_SAKABE_COORDS_OPTIMA_DETAILS = BASE_API_URL + '/proxy/optima/details';





// ***** API URL VARIABLES *****

//Auth
export const API_URL_REGISTER_EMPLOYEE = BASE_API_URL + '/registerEmployee';
export const API_URL_LOGIN_EMPLOYEE = BASE_API_URL + '/loginEmployee';
export const API_URL_LOGOUT = BASE_API_URL + '/logout';
//Role
export const API_URL_ROLE = BASE_API_URL + '/role';
//Company
export const API_URL_COMPANY = BASE_API_URL + '/company';
//Delivery
export const API_URL_DELIVERY_DETAIL = BASE_API_URL + '/delivery-detail';
//Employee
export const API_URL_EMPLOYEE = BASE_API_URL + '/employee';
//Driver
export const API_URL_DRIVER = BASE_API_URL + '/driver';
//Operator
export const API_URL_OPERATOR = BASE_API_URL + '/operator';
//Client
export const API_URL_CLIENT = BASE_API_URL + '/client';
//Location
export const API_URL_LOCATION = BASE_API_URL + '/location';
//Routes
export const API_URL_ROUTE = BASE_API_URL + '/route';
export const API_URL_ROUTES_DELIVERY = BASE_API_URL + '/routes-delivery';
//Service
export const API_URL_SERVICE = BASE_API_URL + '/service';
//Vehicle
export const API_URL_VEHICLE = BASE_API_URL + '/vehicle';
//Brand
export const API_URL_BRAND = BASE_API_URL + '/brand';
//Model
export const API_URL_MODEL = BASE_API_URL + '/model';
//Warehouse
export const API_URL_WAREHOUSE = BASE_API_URL + '/warehouse';
export const API_URL_DASHBOARD_STATS = BASE_API_URL + '/dashboard-stats';
//Inventory
export const API_URL_BOX_INVENTORY = BASE_API_URL + '/box-inventory';
export const API_URL_PALLET = BASE_API_URL + '/pallet';
export const API_URL_PALLET_FILTER = BASE_API_URL + '/pallets/filter?';
//export const API_URL_DOCK_ASSIGNMENT = BASE_API_URL + '/dock-assignment';
export const API_URL_RACK = BASE_API_URL + '/rack';
export const API_URL_STORAGE_RACK_PALLET = BASE_API_URL + '/storage-rack-pallet';
export const API_URL_DOCK_ASSIGMNET = BASE_API_URL + '/dock-assignments';
export const API_URL_DOCK_ALL_ASS = BASE_API_URL + '/docks/reservations/';
export const API_URL_FILTERED_DELIVERY = BASE_API_URL + '/delivery/filtered/';
export const API_URL_DOCK_FILTER = BASE_API_URL + '/docks/filter?status='
//Dispatch
export const API_URL_REPORT = BASE_API_URL + '/report';
    export const API_URL_REPORT_WITHOUT_ISSUE = BASE_API_URL + '/report/without-issue';
    export const API_URL_REPORT_TOP5 = BASE_API_URL + '/report/top-problems';
export const API_URL_PROBLEM = BASE_API_URL + '/problem';
export const API_URL_ISSUE = BASE_API_URL + '/issue';
    export const API_URL_ISSUE_WITHOUT_SUPPORT = BASE_API_URL + '/issue/without-support';
    export const API_URL_ISSUE_STATS = BASE_API_URL + '/issue/status-stats';

export const API_URL_SUPPORT = BASE_API_URL + '/support';
    export const API_URL_SUPPORT_STATS = BASE_API_URL + '/support/status-stats';


//Category
export const API_URL_CATEGORY = BASE_API_URL + '/category';
//Product
export const API_URL_PRODUCT = BASE_API_URL + '/product';

//Trailer
export const API_URL_TRAILER = BASE_API_URL + '/trailer';
//Truck
export const API_URL_TRUCK = BASE_API_URL + '/truck';

//Parking Lot
export const API_URL_PARKING_LOT = BASE_API_URL + '/parking-lots';
export const API_URL_GENERATE_LOTS = BASE_API_URL + '/generate-parking-lot';
export const API_URL_WHOLE_PARKINGLOTS = BASE_API_URL + '/get-parkinglot-with-lots';
export const API_URL_FREE_TRAILERS = BASE_API_URL + '/vehicles/available-trailers';
export const API_URL_FREE_TRUCKS = BASE_API_URL + '/vehicles/available-trucks';
export const API_URL_ASSIGN_LOT = BASE_API_URL + '/lots/assign-vehicle';
export const API_URL_FREE_LOT = BASE_API_URL + '/lots/free';
export const API_URL_DOCK = BASE_API_URL + '/dock';
export const API_URL_DELIVERY = BASE_API_URL + '/delivery';

//QR Code
export const API_URL_GENERATE_QR = BASE_API_URL + '/deliveries/{delivery}/generate-code';
export const API_URL_CONFIRM_QR = BASE_API_URL + '/deliveries/confirm-by-code';



// OPTIMIZED ROUTES
export const API_URL_ALL_COMPANIES = BASE_API_URL + '/companies/all';
export const API_URL_ALL_DELIVERIES = BASE_API_URL + '/deliveries/all';
export const API_URL_DELIVERIES_COMPANY = BASE_API_URL + '/deliveries/company';
export const API_URL_LOCATIONS_COMPANY = BASE_API_URL + '/locations/company';
export const API_URL_ALL_PALLETS = BASE_API_URL + '/pallets/all';
export const API_URL_PALLETS_COMPANY = BASE_API_URL + '/pallets/company';
// export const API_URL_ALL_PRODUCTS = BASE_API_URL + '/products/all';
export const API_URL_PRODUCTS_COMPANY = BASE_API_URL + '/products/company';




//TESTING URLS
export const BASE_API_TEST = 'http://127.0.0.1:8000/api';
export const API_TEST_WAREHOUSE = BASE_API_TEST + '/warehouse';
export const API_TEST_LOCATION = BASE_API_TEST + '/location';
export const API_URL_PALLET_CWS = BASE_API_URL + '/pallet/warehouse-company'; //company warehouse status
export const API_URL_DOCK_BY_WAREHOUSE = BASE_API_URL + '/docks/warehouse/';
export const API_URL_DOCK_RESERVE = BASE_API_URL + '/docks/reserve';
export const API_URL_DOCK_CHECK_AVA = BASE_API_URL + '/docks/check-availability';
export const API_URL_DOCK_RELEASE = BASE_API_URL + '/docks/release';



//Inegi SAKABE
// export const API_SAKABE_COORDS = BASE_API_TEST + '/proxy/coordsID';

//Parking Lot
// export const API_URL_PARKING_LOT = BASE_API_TEST + '/parking-lots';
// export const API_URL_GENERATE_LOTS = BASE_API_TEST + '/generate-parking-lot';
// export const API_URL_WAREHOUSE = BASE_API_TEST + '/warehouse';
// export const API_URL_WHOLE_PARKINGLOTS = BASE_API_TEST + '/get-parkinglot-with-lots';
// export const API_URL_FREE_TRAILERS = BASE_API_TEST + '/vehicles/available-trailers';
// export const API_URL_FREE_TRUCKS = BASE_API_TEST + '/vehicles/available-trucks';
// export const API_URL_ASSIGN_LOT = BASE_API_TEST + '/lots/assign-vehicle';
// export const API_URL_FREE_LOT = BASE_API_TEST + '/lots/free';
// export const API_URL_DOCK = BASE_API_TEST + '/dock';
// export const API_URL_PALLET_CWS = BASE_API_TEST + '/pallet/warehouse-company'; //company warehouse status
// export const API_URL_VEHICLE = BASE_API_TEST + '/vehicle';
export const API_URL_DELIVERY_FUTURE = BASE_API_URL + '/deliveries/current-and-future';
export const API_URL_VEHICLE_AVA = BASE_API_URL + '/vehicles/available';
export const API_URL_VEHICLE_RESERVE = BASE_API_URL + '/vehicles/reserve';

