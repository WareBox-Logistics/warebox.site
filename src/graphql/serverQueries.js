// src/graphql/serverQueries.js
const { gql } = require('@apollo/client');

const UPDATE_ONLINE_STATUS = gql`
  mutation UpdateOnlineStatus($id: uuid!, $is_online: Boolean!) {
    update_web_services_users_by_pk(pk_columns: { id: $id }, _set: { is_online: $is_online }) {
      id
      is_online
    }
  }
`;

module.exports = {
  UPDATE_ONLINE_STATUS,
};
