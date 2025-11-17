import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container } from '@mui/material';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import StreamList from './pages/StreamList';
import StreamDetail from './pages/StreamDetail';
import CreateStream from './pages/CreateStream';
import Recordings from './pages/Recordings';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/streams" element={<StreamList />} />
        <Route path="/streams/new" element={<CreateStream />} />
        <Route path="/streams/:id" element={<StreamDetail />} />
        <Route path="/recordings" element={<Recordings />} />
      </Route>
    </Routes>
  );
}

export default App;
