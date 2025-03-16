//BACKEND VARIABLE
export const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

//TOKEN
export const authToken = `Bearer ${localStorage.getItem('token')}`;

//GEOAPIFY
export const GEOAPIFY_BASE_API_URL = 'https://api.geoapify.com/v1/routing?';


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
export const API_URL_DELIVERY = BASE_API_URL + '/delivery';
export const API_URL_DELIVERY_DETAIL = BASE_API_URL + '/delivery-detail';
//Employee
export const API_URL_EMPLOYEE = BASE_API_URL + '/employee';
//Location
export const API_URL_LOCATION = BASE_API_URL + '/location';
//Routes
export const API_URL_ROUTE = BASE_API_URL + '/route';
export const API_URL_ROUTES_DELIVERY = BASE_API_URL + '/routes-delivery';
//Service
export const API_URL_SERVICE = BASE_API_URL + '/service';
//Service
export const API_URL_TRAILER = BASE_API_URL + '/trailer';
//Truck
export const API_URL_TRUCK = BASE_API_URL + '/truck';

//Warehouse
export const API_URL_WAREHOUSE = BASE_API_URL + '/warehouse';
export const API_URL_BOX_INVENTORY = BASE_API_URL + '/box-inventory';
export const API_URL_PALLET = BASE_API_URL + '/pallet';
export const API_URL_DOCK = BASE_API_URL + '/dock';
export const API_URL_DOCK_ASSIGNMENT = BASE_API_URL + '/dock-assignment';
export const API_URL_RACK = BASE_API_URL + '/rack';
export const API_URL_STORAGE_RACK_PALLET = BASE_API_URL + '/storage-rack-pallet';

//Dispatch
export const API_URL_REPORT = BASE_API_URL + '/report';
export const API_URL_ISSUE = BASE_API_URL + '/issue';
export const API_URL_SUPPORT = BASE_API_URL + '/support';

//Category
export const API_URL_CATEGORY = BASE_API_URL + '/category';
//Product
export const API_URL_PRODUCT = BASE_API_URL + '/product';