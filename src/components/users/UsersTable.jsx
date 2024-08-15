import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Stack,
  TablePagination,
  MenuItem,
  Autocomplete,
  Button,
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import OnlineIcon from '@mui/icons-material/OnlinePrediction';
import OfflineIcon from '@mui/icons-material/OfflineBolt';

const UsersTable = ({
  usersData = [], // Ensure usersData is not undefined
  companies = [], // Ensure companies is not undefined
  handleEditClick,
  filter,
  setFilter,
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  handleRefresh,
  loading
}) => {
  const filteredUsers = usersData.filter((user) => {
    const emailMatch = user.email.toLowerCase().includes(filter.email.toLowerCase());
    const adminMatch = filter.is_admin === '' || user.is_admin === (filter.is_admin === 'true');
    const activeMatch = filter.is_active === '' || user.is_active === (filter.is_active === 'true');
    const customerMatch = filter.customer === '' || user.customer.name.toLowerCase().includes(filter.customer.toLowerCase());
    const companyTypeMatch = filter.company_type_code_name === '' || user.customer.company_type_code_name === filter.company_type_code_name;
    return emailMatch && adminMatch && activeMatch && customerMatch && companyTypeMatch;
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prevFilter) => ({
      ...prevFilter,
      [name]: value
    }));
  };

  const handleCustomerFilterChange = (event, value) => {
    setFilter((prevFilter) => ({
      ...prevFilter,
      customer: value ? value.name : ''
    }));
  };

  return (
    <>
      <Stack direction="row" spacing={2} sx={{ marginBottom: 2 }}>
        <TextField
          label="Filter by Email"
          name="email"
          value={filter.email}
          onChange={handleFilterChange}
          sx={{ minWidth: 220 }}
        />
        <TextField
          label="Filter by Admin"
          name="is_admin"
          select
          SelectProps={{ native: false }}
          value={filter.is_admin}
          onChange={handleFilterChange}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="true">Yes</MenuItem>
          <MenuItem value="false">No</MenuItem>
        </TextField>
        <TextField
          label="Filter by Status"
          name="is_active"
          select
          SelectProps={{ native: false }}
          value={filter.is_active}
          onChange={handleFilterChange}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="true">Active</MenuItem>
          <MenuItem value="false">Inactive</MenuItem>
        </TextField>
        <TextField
          label="Filter by Company Type"
          name="company_type_code_name"
          select
          value={filter.company_type_code_name}
          onChange={handleFilterChange}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="CUSTOMER">Customer</MenuItem>
          <MenuItem value="CONSIGNEE">Consignee</MenuItem>
        </TextField>
        <Autocomplete
          options={companies}
          getOptionLabel={(option) => option.name}
          onChange={handleCustomerFilterChange}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Filter by Customer"
              sx={{ minWidth: 300 }}
            />
          )}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </Stack>
      {loading ? (
        <Stack direction="row" justifyContent="center" alignItems="center" sx={{ mt: 2 }}>
          <CircularProgress />
        </Stack>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Admin</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Company Type</TableCell>
                <TableCell>Session Active</TableCell>
                <TableCell>Online Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.customer.name}</TableCell>
                  <TableCell>{user.is_admin ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{user.is_active ? 'Active' : 'Inactive'}</TableCell>
                  <TableCell>{user.customer.company_type_code_name}</TableCell>
                  <TableCell>
                    {user.is_session_active ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
                  </TableCell>
                  <TableCell>
                    {user.is_online ? <OnlineIcon color="primary" /> : <OfflineIcon color="disabled" />}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditClick(user)}>
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredUsers.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
          />
        </TableContainer>
      )}
    </>
  );
};

export default UsersTable;
