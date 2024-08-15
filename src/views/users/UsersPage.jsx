import React, { useEffect, useState, useMemo } from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import { GET_USERS, GET_ACTIVE_COMPANIES, USER_TABLE_SUBSCRIPTION } from '/src/graphql/queries';
import { CircularProgress, Snackbar, Alert, Paper, Typography, Button, Stack } from '@mui/material';
import UserRegister from '/src/components/users/UserRegister';
import UsersTable from '/src/components/users/UsersTable';
import UsersEdit from '/src/components/users/UsersEdit';

const UsersPage = () => {
  const { data: usersData, loading: usersLoading, error: usersError, refetch: refetchUsers } = useQuery(GET_USERS);
  const { data: companyData, loading: companyLoading, error: companyError } = useQuery(GET_ACTIVE_COMPANIES);
  const { data: subscriptionData } = useSubscription(USER_TABLE_SUBSCRIPTION);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [editUser, setEditUser] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filter, setFilter] = useState({
    email: '',
    is_admin: '',
    is_active: '',
    customer: '',
    company_type_code_name: ''
  });
  const [refreshLoading, setRefreshLoading] = useState(false);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleEditClick = (user) => {
    setEditUser(user);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setEditUser(null);
  };

  const handleRegisterDialogClose = () => {
    setRegisterDialogOpen(false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRefresh = async () => {
    setRefreshLoading(true);
    await refetchUsers();
    setRefreshLoading(false);
  };

  const updatedUsersData = useMemo(() => {
    if (subscriptionData) {
      return subscriptionData.web_services_users;
    }
    return usersData ? usersData.web_services_users : [];
  }, [subscriptionData, usersData]);

  if (usersLoading || companyLoading) return <CircularProgress />;
  if (usersError) return <p>Error loading users</p>;
  if (companyError) return <p>Error loading companies</p>;

  return (
    <Paper sx={{ padding: 2, maxWidth: 1200, margin: 'auto' }}>
      <UserRegister
        registerDialogOpen={registerDialogOpen}
        handleRegisterDialogClose={handleRegisterDialogClose}
        refetchUsers={refetchUsers}
        setSnackbarOpen={setSnackbarOpen}
        setSnackbarMessage={setSnackbarMessage}
        setSnackbarSeverity={setSnackbarSeverity}
      />
      <Typography variant="h4" gutterBottom align="center" sx={{ marginTop: 4 }}>
        Users Management
      </Typography>
      <UsersTable
        usersData={updatedUsersData || []}  // Ensure usersData is not undefined
        companies={companyData ? companyData.companies : []} // Ensure companies is not undefined
        handleEditClick={handleEditClick}
        filter={filter}
        setFilter={setFilter}
        page={page}
        rowsPerPage={rowsPerPage}
        handleChangePage={handleChangePage}
        handleChangeRowsPerPage={handleChangeRowsPerPage}
        handleRefresh={handleRefresh}
        loading={refreshLoading}
      />
      <UsersEdit
        editDialogOpen={editDialogOpen}
        handleEditDialogClose={handleEditDialogClose}
        editUser={editUser}
        refetchUsers={refetchUsers}
        setSnackbarOpen={setSnackbarOpen}
        setSnackbarMessage={setSnackbarMessage}
        setSnackbarSeverity={setSnackbarSeverity}
      />
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default UsersPage;
