import gql from 'graphql-tag';

export const GET_ALL_NOTIFICATION_HISTORY = gql`
  query GetAllNotificationHistory($limit: Int, $offset: Int) {
    web_services_notification_history(
      order_by: { notified_at: desc },
      limit: $limit,
      offset: $offset
    ) {
      id
      event_id
      route
      notified_at
      customer {
        name
        company_type_code_name
      }
      work_order {
        customer_reference
        container
        from_zone {
          zone_name
        }
        to_zone {
          zone_name
        }
        order_type {
          id
          name
        }
        load_type {
          name
        }
        folio {
          prefix
          folio
        }
        driver_moves {
          from_zone {
            zone_name
          }
          to_zone {
            zone_name
          }
          load_type {
            name
          }
          folio {
            prefix
            folio
          }
        }
      }
      response_body
      request_body
      error_message
    }
    web_services_notification_history_aggregate {
      aggregate {
        count
      }
    }
  }
`;

export const SUBSCRIBE_NOTIFICATION_HISTORY = gql`
  subscription OnNotificationHistoryChanged {
    web_services_notification_history(
      order_by: { notified_at: desc }
    ) {
      id
      event_id
      route
      notified_at
      customer {
        name
        company_type_code_name
      }
      work_order {
        folio {
          prefix
          folio
        }
        driver_moves {
          folio {
            prefix
            folio
          }
        }
      }
      response_body
      request_body
      error_message
    }
    web_services_notification_history_aggregate {
      aggregate {
        count
      }
    }
  }
`;

export const USER_STATUS_SUBSCRIPTION = gql`
  subscription UserStatus {
    web_services_users {
      id
      email
      is_online
    }
  }
`;