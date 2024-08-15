// src/components/MenuComponent.jsx
import React from 'react';
import { List, ListItem, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';

const MenuComponent = ({ items }) => {
  return (
    <List>
      {items.map((item, index) => (
        <ListItem button component={Link} to={item.path} key={index}>
          <ListItemText primary={item.title} />
        </ListItem>
      ))}
    </List>
  );
};

export default MenuComponent;
