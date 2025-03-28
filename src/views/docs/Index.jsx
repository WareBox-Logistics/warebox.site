import React, { useState } from 'react';
import {
    Box, Grid, Paper, Switch, Tab, Tabs, Typography, TextField, FormControlLabel, Divider,
    Table, TableHead, TableRow, TableCell, TableBody, TableContainer, IconButton,
    InputAdornment
} from '@mui/material';
import { DriveEtaOutlined, SettingsOutlined, Delete as DeleteIcon } from '@mui/icons-material';
import DriveMoveDoc from './DriveMoveDoc';
import WorkOrderDoc from './WorkOrderDoc';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { padding } from '@mui/system';

const Index = () => {
    const { t } = useTranslation();
    const theme = useTheme();
    const [value, setValue] = useState(0);
    const [valuestoinput, setValueToInput] = useState('NAME');
    const [valuestoinput2, setValueToInput2] = useState('ESTATICO');
    const [isEditing, setIsEditing] = useState(false);
    const field = {
        [valuestoinput]: 'NAME',
        value: '{{exampleFieldValue}}'
    };
    const codeString1 = `{
    "${valuestoinput}": "2024-07-15T23:20:33.618+00:00",
}`;
    const codeString2 = `{
    "${valuestoinput}": "${valuestoinput2}",
}`;

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const TabPanel = ({ children, value, index, ...other }) => (
        <Box
            role="tabpanel"
            hidden={value !== index}
            id={`profile-tabpanel-${index}`}
            aria-labelledby={`profile-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }} style={{ padding: 0 }}>
                    {children}
                </Box>
            )}
        </Box>
    );

    return (
        <Paper sx={{ padding: 4, maxWidth: 1200, margin: 'auto', minHeight: "100vh", backgroundColor: '#f5f5f5' }}>
            <Typography variant="h4" gutterBottom>
                {t('documentationView.title')}
            </Typography>
            <Typography variant="body1" gutterBottom sx={{ marginBottom: 3 }}>
                {t('documentationView.subtitle')}
            </Typography>
            <Divider sx={{ marginBottom: 4 }} />
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <Typography variant="h6" gutterBottom>
                        {t('customerConfig.receiveAllData')}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                        {t('documentationView.notification.title1')}
                    </Typography>
                    <FormControlLabel
                        control={<Switch checked={true} name={t('customerConfig.receiveAllData')} color="primary" disabled />}
                        label={t('customerConfig.receiveAllData')}
                        sx={{ color: theme.palette.primary.main }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Typography variant="h6" gutterBottom>
                        {t('customerConfig.allowMultipleNotifications')}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                        {t('documentationView.notification.title2')}
                    </Typography>
                    <FormControlLabel
                        control={<Switch checked={true} name={t('customerConfig.allowMultipleNotifications')} color="primary" disabled />}
                        label={t('customerConfig.allowMultipleNotifications')}
                        sx={{ color: theme.palette.secondary.main }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Typography variant="h6" gutterBottom>
                        {t('customerConfig.allowNotifications')}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                        {t('documentationView.notification.title3')}
                    </Typography>
                    <FormControlLabel
                        control={<Switch checked={true} name={t('customerConfig.allowNotifications')} color="primary" disabled />}
                        label={t('customerConfig.allowNotifications')}
                    />
                </Grid>
            </Grid>
            <Grid container spacing={3} marginTop={1}>
                <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="h6" gutterBottom>
                        {t('documentationView.input.title1')}
                    </Typography>
                    <TextField
                        label="Route Name"
                        size="small"
                        value=""
                        fullWidth
                        disabled
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="h6" gutterBottom>
                        {t('documentationView.input.title2')}
                    </Typography>
                    <TextField
                        label="URL"
                        size="small"
                        value="https://api.example.com"
                        fullWidth
                        disabled
                    />
                </Grid>
            </Grid>
            <Divider sx={{ marginBottom: 4 }} />
            <Grid container alignItems="center" marginTop={3}>
                <Box sx={{ width: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                        {t('documentationView.input.title3')}
                    </Typography>
                    <Grid item xs={12} sm={6} md={4}>

                        <TextField
                            md={4}
                            label="Field Name"
                            size="small"
                            value={valuestoinput}
                            fullWidth
                            onChange={(e) => setValueToInput(e.target.value)}
                            sx={{ marginBottom: 2 }}
                        />
                    </Grid>
                    <Typography variant="h6" gutterBottom>
                        {t('documentationView.input.title4')}
                    </Typography>
                    <Grid item xs={12} sm={6} md={4}>

                        <TextField
                            md={4}
                            label="Field Value"
                            size="small"
                            value="arrival_date"
                            fullWidth
                            disabled={!isEditing}
                            InputProps={{
                                startAdornment: field.value.startsWith('{{') && field.value.endsWith('}}') && (
                                    <InputAdornment position="start">
                                        <span style={{ userSelect: 'none' }}>{'{{'}</span>
                                    </InputAdornment>
                                ),
                                endAdornment: field.value.startsWith('{{') && field.value.endsWith('}}') && (
                                    <InputAdornment position="end">
                                        <span style={{ userSelect: 'none' }}>{'}}'}</span>
                                        {isEditing && (
                                            <IconButton size="small">
                                                <DeleteIcon />
                                            </IconButton>
                                        )}
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                    <Grid container alignItems="center" marginTop={3}>
                        <Box sx={{ width: '100%' }}>
                            <Typography variant="h6" gutterBottom>
                                {t('documentationView.input.title5')}
                            </Typography>
                            <Grid item xs={12} sm={6} md={4}>

                                <TextField
                                    label="Field Value"
                                    size="small"
                                    value={valuestoinput2}
                                    fullWidth
                                    onChange={(e) => setValueToInput2(e.target.value)}
                                />
                            </Grid>
                        </Box>
                    </Grid>
                    <TableContainer component={Paper} sx={{ marginBottom: 2, marginTop: 2 }}>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">{t('documentationView.table.title1')}<br /><code>{t('documentationView.table.title1')}</code></TableCell>
                                    <TableCell align="center">{t('documentationView.table.title2')} <br /><code>&#123;&#123;arrival_date&#125;&#125;</code></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell>
                                        <SyntaxHighlighter language="json" style={atomOneDark} customStyle={{ fontSize: 14, borderRadius: 4 }}>
                                            {codeString2}
                                        </SyntaxHighlighter>
                                    </TableCell>
                                    <TableCell>
                                        <SyntaxHighlighter language="json" style={atomOneDark} customStyle={{ fontSize: 14, borderRadius: 4 }}>
                                            {codeString1}
                                        </SyntaxHighlighter>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Grid>
            <Divider sx={{ marginTop: 4, marginBottom: 4 }} />
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="profile tabs">
                    <Tab
                        icon={<DriveEtaOutlined sx={{ marginBottom: 0, marginRight: 1 }} />}
                        label="Driver Move"
                        sx={{ textTransform: 'capitalize', minHeight: 40, fontSize: 14, padding: '6px 12px' }}
                    />
                    <Tab
                        icon={<SettingsOutlined sx={{ marginBottom: 0, marginRight: 1 }} />}
                        label="Work Orders"
                        sx={{ textTransform: 'capitalize', minHeight: 40, fontSize: 14, padding: '6px 12px' }}
                    />
                </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
                <DriveMoveDoc />
            </TabPanel>
            <TabPanel value={value} index={1}>
                <WorkOrderDoc />
            </TabPanel>
        </Paper>
    );
};

export default Index;
