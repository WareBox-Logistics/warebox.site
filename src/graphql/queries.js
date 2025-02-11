import gql from 'graphql-tag';

// export const LOGIN_USER = gql`
//   query LoginUser($email: String!, $password: String!) {
//     web_services_users(where: { email: { _eq: $email }, password: { _eq: $password }, is_active: { _eq: true } }) {
//       id
//       email
//       customer_id
//       is_active
//     }
//   }
// `;
export const REGISTER_USER = gql`
  mutation RegisterUser($email: String!, $password: String!, $customer_id: uuid!, $is_admin: Boolean!) {
    insert_web_services_users_one(object: { email: $email, password: $password, customer_id: $customer_id, is_admin: $is_admin }) {
      id
      email
      customer_id
      is_admin
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers {
    web_services_users(order_by: { created_at: desc }) {
      id
      email
      customer_id
      is_admin
      is_active
      created_at
      customer {
        id
        name
        company_type_code_name
      }
      is_session_active
      is_online
    }
  }
`;


// export const UPDATE_USER = gql`
//   mutation UpdateUser($id: uuid!, $email: String!, $password: String, $customer_id: uuid!, $is_admin: Boolean!, $is_active: Boolean!) {
//     update_web_services_users_by_pk(
//       pk_columns: { id: $id }
//       _set: { email: $email, password: $password, customer_id: $customer_id, is_admin: $is_admin, is_active: $is_active }
//     ) {
//       id
//       email
//       customer_id
//       is_admin
//       is_active
//     }
//   }
// `;

export const UPDATE_USER = gql`
  mutation UpdateUser($id: uuid!, $input: web_services_users_set_input!) {
    update_web_services_users_by_pk(
      pk_columns: { id: $id }
      _set: $input
    ) {
      id
      email
      customer_id
      is_admin
      is_active
    }
  }
`;

export const UPDATE_SESSION_STATUS = gql`
  mutation UpdateSessionStatus($id: uuid!, $is_session_active: Boolean!) {
    update_web_services_users_by_pk(pk_columns: { id: $id }, _set: { is_session_active: $is_session_active }) {
      id
      is_session_active
    }
  }
`;

export const UPDATE_ONLINE_STATUS = gql`
  mutation UpdateOnlineStatus($id: uuid!, $is_online: Boolean!) {
    update_web_services_users_by_pk(pk_columns: { id: $id }, _set: { is_online: $is_online }) {
      id
      is_online
    }
  }
`;

export const LOGIN_USER = gql`
  query LoginUser($email: String!) {
    web_services_users(where: { email: { _eq: $email }, is_active: { _eq: true } }) {
      id
      email
      customer_id
      is_active
      password
      is_admin
    }
  }
`;


export const CHECK_USER_STATUS = gql`
  query CheckUserStatus($id: uuid!) {
    web_services_users_by_pk(id: $id) {
      is_active
      email
      is_admin
    }
  }
`;

export const USER_STATUS_SUBSCRIPTION = gql`
  subscription UserStatus($id: uuid!) {
    web_services_users_by_pk(id: $id) {
      is_active
      is_admin
      is_online
    }
  }
`;

export const USER_TABLE_SUBSCRIPTION = gql`
  subscription OnUserStatusChange {
    web_services_users {
      id
      email
      customer_id
      is_admin
      is_active
      created_at
      customer {
        id
        name
        company_type_code_name
      }
      is_session_active
      is_online
    }
  }
`;

export const GET_CUSTOMER_CONFIG = gql`
  query GetCustomerConfig($customer_id: uuid!) {
    web_services_customer_config_by_pk(customer_id: $customer_id) {
      name
      allow_notifications
      notifications
      required_fields
      required_fields_rename
      process_fields
      created_at
      remark
      advanced_config
      needs_authentication
      authentication_type
      authentication_credentials
    }
  }
`;

// export const UPDATE_CUSTOMER_CONFIG = gql`
//   mutation UpdateCustomerConfig(
//     $customer_id: uuid!,
//     $allow_notifications: Boolean!,
//     $notifications: jsonb!,
//     $required_fields: jsonb
//   ) {
//     update_web_services_customer_config_by_pk(
//       pk_columns: { customer_id: $customer_id },
//       _set: { allow_notifications: $allow_notifications, notifications: $notifications, required_fields: $required_fields }
//     ) {
//       customer_id
//       name
//       allow_notifications
//       notifications
//       required_fields
//       created_at
//       remark
//     }
//   }
// `;

export const UPDATE_CUSTOMER_CONFIG = gql`
  mutation UpdateCustomerConfig(
    $customer_id: uuid!,
    $allow_notifications: Boolean!,
    $notifications: jsonb!,
    $required_fields: jsonb,
    $needs_authentication: Boolean!,
    $authentication_type: String,
    $authentication_credentials: jsonb
  ) {
    update_web_services_customer_config_by_pk(
      pk_columns: { customer_id: $customer_id },
      _set: {
        allow_notifications: $allow_notifications,
        notifications: $notifications,
        required_fields: $required_fields,
        needs_authentication: $needs_authentication,
        authentication_type: $authentication_type,
        authentication_credentials: $authentication_credentials
      }
    ) {
      customer_id
      name
      allow_notifications
      notifications
      required_fields
      created_at
      remark
    }
  }
`;

export const CREATE_CUSTOMER_CONFIG = gql`
  mutation CreateCustomerConfig(
    $customer_id: uuid!,
    $name: String!,
    $allow_notifications: Boolean!,
    $notifications: jsonb!,
    $required_fields: jsonb,
    $needs_authentication: Boolean!,
    $authentication_type: String,
    $authentication_credentials: jsonb
  ) {
    insert_web_services_customer_config_one(
      object: {
        customer_id: $customer_id,
        name: $name,
        allow_notifications: $allow_notifications,
        notifications: $notifications,
        required_fields: $required_fields,
        needs_authentication: $needs_authentication,
        authentication_type: $authentication_type,
        authentication_credentials: $authentication_credentials
      }
    ) {
      customer_id
      name
      allow_notifications
      notifications
      required_fields
      created_at
      remark
    }
  }
`;

// export const GET_NOTIFICATION_HISTORY = gql`
//   query GetNotificationHistory($customer_id: uuid!) {
//     web_services_notification_history(where: { customer_id: { _eq: $customer_id } }, order_by: { notified_at: desc }) {
//       id
//       event_id
//       route
//       notified_at
//       response_body
//       request_body
//       error_message
//     }
//   }
// `;

// export const GET_NOTIFICATION_HISTORY = gql`
//   query GetNotificationHistory($customer_id: uuid!, $limit: Int!, $offset: Int!) {
//     web_services_notification_history(
//       where: { customer_id: { _eq: $customer_id } }
//       order_by: { notified_at: desc }
//       limit: $limit
//       offset: $offset
//     ) {
//       id
//       event_id
//       route
//       notified_at
//       response_body
//       request_body
//       error_message
//     }
//     web_services_notification_history_aggregate(
//       where: { customer_id: { _eq: $customer_id } }
//     ) {
//       aggregate {
//         count
//       }
//     }
//   }
// `;

export const GET_NOTIFICATION_HISTORY = gql`
  query GetNotificationHistory(
    $customer_id: uuid!,
    $id: uuid,
    $event_id: uuid,
    $limit: Int, 
    $offset: Int, 
    $route: String, 
    $notified_at: timestamptz, 
    $error_message: String, 
    $request_body: jsonb, 
    $response_body: jsonb
  ) {
    web_services_notification_history(
      where: {
        customer_id: { _eq: $customer_id },
        id: { _eq: $id },
        event_id: { _eq: $event_id },
        route: { _ilike: $route },
        notified_at: { _eq: $notified_at },
        error_message: { _ilike: $error_message },
        request_body: { _contains: $request_body },
        response_body: { _contains: $response_body }
      },
      order_by: { notified_at: desc },
      limit: $limit,
      offset: $offset
    ) {
      id
      event_id
      route
      notified_at
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
      }
      driver_move {
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


export const SUBSCRIBE_NOTIFICATION_HISTORY_CUSTOMER = gql`
  subscription OnNotificationHistoryChanged($customer_id: uuid) {
    web_services_notification_history(
      where: { customer_id: { _eq: $customer_id } },
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
      }
      driver_move {
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
      response_body
      request_body
      error_message
    }
  }
`;


export const GET_NOTIFICATION_HISTORY_COUNT = gql`
  query GetNotificationHistoryCount {
    web_services_notification_history_aggregate {
      aggregate {
        count
      }
    }
  }
`;


// export const GET_ACTIVE_COMPANIES = gql`
//   query GetActiveCompanies {
//     companies(where: { status: { name: { _eq: "Active" } } }) {
//       id
//       name
//       company_type_code_name
//       status{
//         name
//       }
//     }
//   }
// `;

export const GET_ACTIVE_COMPANIES = gql`
query GetActiveCompanies($companyType: String) {
  companies(
    where: { 
      status: { name: { _eq: "Active" } }, 
      company_type_code_name: { _eq: $companyType } 
    }
  ) {
    id
    name
    company_type_code_name
    status {
      name
    }
  }
}
`;

export const CHECK_EMAIL_EXISTS = gql`
  query CheckEmailExists($email: String!) {
    web_services_users(where: {email: {_eq: $email}}) {
      id
    }
  }
`;

export const GET_WEB_SERVICES_EDI_CONFIGS = gql`
  query GetWebServicesEdiConfigs($limit: Int!, $offset: Int!) {
    web_services_edi_config_aggregate {
      aggregate {
        count
      }
    }
    web_services_edi_config(limit: $limit, offset: $offset, order_by: { created_at: desc }) {
      id
      customer {
        id
        name
      }
      sftp_url
      sftp_user
      sftp_password
      sftp_folder_get
      sftp_folder_send
      sftp_folder_send_history
      sftp_folder_get_history
      unit_type {
        id
        shortname
      }
      lb_id
      hc_equipment_type_id
      do_status {
        id
        name
      }
      content_status {
        id
        name
      }
      load_type {
        id
        name
      }
      file_name_patterns
      file_name_patterns_ret
      edi_990_accept
      edi_214_plan_delivery
      edi_214_plan_pickup
    }
  }
`;


export const GET_CUSTOMER_WEB_SERVICES_EDI_CONFIGS = gql`
  query GetCustomerEdiConfig($id: uuid!) {
    web_services_edi_config(where: { id: { _eq: $id } }) {
      customer {
        id
        name
      }
      sftp_url
      sftp_user
      sftp_password
      sftp_folder_get
      sftp_folder_send
      sftp_folder_send_history
      sftp_folder_get_history
      unit_type {
        id
        shortname
      }
      lb_id
      hc_equipment_type_id
      do_status {
        id
        name
      }
      content_status {
        id
        name
      }
      load_type {
        id
        name
      }
      file_name_patterns
      file_name_patterns_ret
      edi_990_accept
      edi_214_plan_delivery
      edi_214_plan_pickup
    }
  }
`;

export const GET_STATUS = gql`
 query GetStatus {
    status(where: { type: { _eq: "all" } }) {
      id
      name
      type
    }
  }
`;

export const GET_LOAD_TYPE = gql`
  query GetLoadType {
    load_types {
      id
      name
    }
  }
`;

export const GET_UNIT_TYPE = gql`
  query GetUnirType {
    unit_types {
      id
      name
    }
  }
`;

export const UPDATE_WEB_SERVICES_EDI_CONFIG = gql`
mutation updateEdiWebServices($id: uuid!, $input: web_services_edi_config_set_input!) {
  update_web_services_edi_config_by_pk(
    pk_columns: { id: $id },
    _set: $input
  ) {
    id
  }
}
`;

export const INSERT_WEB_SERVICES_EDI_CONFIG = gql`
mutation InsertEDIConfig($input: web_services_edi_config_insert_input!) {
  insert_web_services_edi_config_one(object: $input) {
    id
  }
}
`;

// chat helper
export const GET_CHAT_HELPER = gql`
query GET_CHAT_HELPER {
  web_services_chat_helper(order_by: {display_order: asc, created_at: asc}) {
    id
    category
    question
    answer
    display_order
    status
    created_at
    updated_at
  }
}
`;

export const UPDATE_FAVORITE = gql`
mutation UPDATE_FAVORITE($id: Int!, $favorite: Boolean!) {
  update_web_services_chat_helper_by_pk(pk_columns: { id: $id }, _set: { favorite: $favorite }) {
    id
    favorite
  }
}
`;

export const INSERT_CHAT_HELPER = gql`
mutation INSERT_CHAT_HELPER($category: String!, $question: String!, $answer: String!, $display_order: Int, $created_by: uuid, $status: String) {
  insert_web_services_chat_helper_one(object: {category: $category, question: $question, answer: $answer, display_order: $display_order, created_by: $created_by, status: $status}) {
    id
    category
    question
    answer
    display_order
    created_at
  }
}
`;

export const INSERT_FEEDBACK = gql`
mutation INSERT_FEEDBACK($input: web_services_user_feedback_insert_input!) {
  insert_web_services_user_feedback_one(object: $input) {
    id
  }
}
`;

export const CHECK_USER_FEEDBACK = gql`
query CHECK_USER_FEEDBACK($user_id: uuid!, $question_id: uuid!) {
  web_services_user_feedback(where: {user_id: {_eq: $user_id}, question_id: {_eq: $question_id}}) {
    id
  }
}

`;

export const GET_INFO_USER = gql`
query GetInforUser($id: bigint!) {
  employee_by_pk(id: $id) {
    id
    first_name
    last_name
    email
    role_table {
      name
      permisos {
        permiso {
          nombre
        }
      }
    }
  }
}
`;

export const QUERY = gql`
query {
  employee {
    id
  }
}
`;