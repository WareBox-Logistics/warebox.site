import gql from 'graphql-tag';


export const ADD_EMPLOYEE = gql`
    mutation AddEmployee($employee: EmployeeInput!) {
        addEmployee(employee: $employee) {
        id
        name
        last_name
        email
        role
        }
    }
    `;
export const UPDATE_EMPLOYEE = gql`
    mutation UpdateEmployee($employee: EmployeeInput!) {
        updateEmployee(employee: $employee) {
        id
        name
        last_name
        email
        role
        }
    }
    `;
