import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
  Input,
  Paper,
  MenuItem,
  Select,
} from "@mui/material";
import { BarChart } from "@mui/x-charts";

const App = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState([]); 
  const [selectedTable, setSelectedTable] = useState(""); 
  const [ageDistribution, setAgeDistribution] = useState(null);

  useEffect(() => {
    fetchTables(); 
  }, []);

  const fetchTables = async () => {
    try {
      const response = await axios.get("http://localhost:3000/tables");
      setTables(response.data);
    } catch (error) {
      console.error("Error fetching tables:", error);
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("csvFile", file);

    try {
      const response = await axios.post("http://localhost:3000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newTableName = response.data.tableName; 
      alert(`File uploaded successfully! New table created: ${newTableName}`);

      await fetchTables(); 
      setSelectedTable(newTableName); 
      fetchAgeDistribution(newTableName); 
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Upload failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAgeDistribution = async (table) => {
    if (!table) return;

    try {
      const response = await axios.get(`http://localhost:3000/age-distribution/${table}`);
      setAgeDistribution(response.data);
    } catch (error) {
      console.error("Error fetching age distribution:", error);
      alert("Failed to load age distribution.");
    }
  };

  const handleTableSelect = (table) => {
    setSelectedTable(table);
    fetchAgeDistribution(table);
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        textAlign: "center",
        marginLeft:"80%",
      }}
    >
      <Typography variant="h4" gutterBottom>
        CSV Upload & Age Group Analysis
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3, width: "100%", maxWidth: 500 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Input type="file" onChange={handleFileChange} />
          <Button variant="contained" color="primary" onClick={handleUpload} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Upload CSV"}
          </Button>
        </Box>
      </Paper>

      {tables.length > 0 && (
        <Paper elevation={3} sx={{ p: 3, mb: 3, width: "100%", maxWidth: 500 }}>
          <Typography variant="h6">Select a Table:</Typography>
          <Select
            value={selectedTable}
            onChange={(e) => handleTableSelect(e.target.value)}
            displayEmpty
            fullWidth
          >
            <MenuItem value="" disabled>
              Choose a table
            </MenuItem>
            {tables.map((table, index) => (
              <MenuItem key={index} value={table}>
                {table}
              </MenuItem>
            ))}
          </Select>
        </Paper>
      )}

      {ageDistribution && (
        <Paper elevation={3} sx={{ p: 3, mt: 3, width: "100%", maxWidth: 500 }}>
          <Typography variant="h5" gutterBottom>
            Age Group Distribution
          </Typography>
          <BarChart
            xAxis={[{ scaleType: "band", data: Object.keys(ageDistribution) }]}
            series={[{ data: Object.values(ageDistribution), label: "Users", color: "#1976d2" }]}
            width={500}
            height={300}
          />
        </Paper>
      )}
    </Container>
  );
};

export default App;
