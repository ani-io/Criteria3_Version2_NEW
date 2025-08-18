import { createContext, useState } from "react";
import { parseFileToMatrix } from "./utils/parseFile";
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import UserData from "./UserData";
import Course from "./Course";
import from "./";

// Create a context for sharing CO PO PSO Mapping data
export const MappingContext = createContext();

function App() {
  const [mappingFile, setMappingFile] = useState(null);
  const [directFile, setDirectFile] = useState(null);
  const [mappingMatrix, setMappingMatrix] = useState(
    Array.from({ length: 6 }, () => Array(15).fill(0))
  );
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [show, setShowIndirect] = useState(false);
  const [mappingError, setMappingError] = useState("");

  const handleShowIndirect = () => {
    const userResponse = window.confirm("Do you want to continue for Indirect attainment?");
    setShowIndirect(userResponse);
  };

  const columnHeaders = [
    ...Array.from({ length: 15 }, (_, i) => `PO${i + 1}`),
  ];
  const POPSOmap = {
    'PO13':'PSO1',
    'PO14':'PSO2',
    'PO15':'PSO3'
  }
  const columnHeaders2 = [
    ...Array.from({ length: 12 }, (_, i) => `PO${i + 1}`),
    "PSO1",
    "PSO2",
    "PSO3",
  ];
  const rowHeaders = ["CO1", "CO2", "CO3", "CO4", "CO5", "CO6"];

  // Handles file upload for CO PO PSO Mapping
  const handleMappingFileChange = async (e) => {
    const uploadedFile = e.target.files[0];
    setMappingFile(uploadedFile);
    if (!uploadedFile) return;
    // Only parse if Excel or CSV
    const ext = uploadedFile.name.split('.').pop().toLowerCase();
    if (["xlsx", "xls", "csv"].includes(ext)) {
      try {
        const matrix = await parseFileToMatrix(uploadedFile);
        setMappingMatrix(matrix);
        setMappingError("");
      } catch (err) {
        setMappingError("Failed to parse file. Please upload a valid Excel or CSV file with mapping values (0-3).");
      }
    }
  };

  // Handles file upload for Direct Attainment
  const handleDirectFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    setDirectFile(uploadedFile);
    // No parsing here, just set the file for submission
  };

  const handleMatrixChange = (params) => {
    const updatedMatrix = [...mappingMatrix];
    const rowIndex = params.id;
    const colIndex = parseInt(params.field, 10);
    updatedMatrix[rowIndex][colIndex] = parseFloat(params.value) || 0;
    setMappingMatrix(updatedMatrix);
  };

  const handleSubmit = async () => {
    if (!directFile) {
      alert("Please upload a Direct Attainment file!");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    const formData = new FormData();
    formData.append("file", directFile);
    formData.append("matrix", JSON.stringify(mappingMatrix));

    try {
      const response = await axios.post(
        "https://criteria3-backend.onrender.com/direct-process",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setOutput(response.data);
    } catch (error) {
      console.error("Error while processing:", error);
      setErrorMsg("Failed to process the data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateAverages = () => {
    const numRows = mappingMatrix.length;
    const numCols = mappingMatrix[0].length;
    const averages = Array(numCols).fill(0);
    for (let col = 0; col < numCols; col++) {
      let sum = 0;
      for (let row = 0; row < numRows; row++) {
        sum += mappingMatrix[row][col];
      }
      averages[col] = sum / numRows;
    }
    return averages;
  };

  const averages = calculateAverages();

  const rows = mappingMatrix.map((row, rowIndex) => {
    const rowData = {
      id: rowIndex,
      ...Object.fromEntries(row.map((val, i) => [`${i}`, val])),
    };
    return { ...rowData, name: rowHeaders[rowIndex] };
  });

  // Add average row with custom label for direct or  attainment
  let footerLabel = "Average";
  let mappingFooterLabel = "Average Mapping Value";
  if (output && output.type && output.type.toLowerCase() === "") {
    footerLabel = " Attainment";
    mappingFooterLabel = " Attainment";
  } else if (output && output.type && output.type.toLowerCase() === "direct") {
    footerLabel = "CO-PO-PSO Mapping";
    mappingFooterLabel = "CO-PO-PSO Mapping";
  } else if (output) {
    // fallback for legacy direct output without type
    footerLabel = "CO-PO-PSO Mapping";
    mappingFooterLabel = "CO-PO-PSO Mapping";
  }
  rows.push({
    id: 6,
    name: footerLabel,
    ...Object.fromEntries(averages.map((val, i) => [`${i}`, val.toFixed(2)])),
  });

  const columns = [
    { field: "name", headerName: "CO/PO", width: 100 },
    ...columnHeaders2.map((header, index) => ({
      field: `${index}`,
      headerName: header,
      width: 70,
      editable: index < 15, // Only CO rows are editable
    })),
  ];

  const coChartData = output
    ? Object.entries(output.co_values).map(([key, value]) => ({
        name: key,
        value: value,
      }))
    : [];

  const poChartData = output
    ? columnHeaders.map((header) => ({
        name: POPSOmap[header] || header,
        value: output.po_values[header] || 0,
      }))
    : [];

  const mappingChartData =
    output && output.po_values
      ? columnHeaders.map((header, index) => {
          const averageValue = averages[index] || 0;
          const poValue = output.po_values[header] || 0;
          return {
            name: POPSOmap[header] || header,
            [mappingFooterLabel]: parseFloat(averageValue.toFixed(2)),
            "PO Attainment": parseFloat(poValue.toFixed(2)),
          };
        })
      : [];

  const handleGenerateReport = () => {
    setReportGenerated(true);
    document.title = "Report";
    setTimeout(() => window.print(), 100);
  };

  return (
    <MappingContext.Provider value={{ mappingMatrix, setMappingMatrix }}>
      <UserData />
      <Course />
      <Container maxWidth="lg" style={{ marginTop: "20px" }}>
        {!reportGenerated && (
          <div>
            <Box textAlign="center" mb={3}>
              <Typography variant="h4" component="h1">
                CO/PO-PSO Calculator
              </Typography>
            </Box>

            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                CO PO PSO Mapping
              </Typography>
              <div style={{ height: "auto", width: "100%" }}>
                {mappingError && (
                  <Typography color="error" variant="body2" mb={1}>
                    {mappingError}
                  </Typography>
                )}
                <DataGrid
                  rows={rows}
                  columns={columns}
                  pageSize={7}
                  processRowUpdate={(newRow, oldRow) => {
                    if (newRow.name === "Average") return newRow;
                    const updatedMatrix = [...mappingMatrix];
                    const rowIndex = newRow.id;
                    let invalid = false;
                    Object.keys(newRow).forEach((key) => {
                      if (key !== "id" && key !== "name") {
                        const colIndex = parseInt(key, 10);
                        let value = parseFloat(newRow[key]);
                        if (isNaN(value)) value = 0;
                        if (value < 0 || value > 3) {
                          invalid = true;
                        }
                      }
                    });
                    if (invalid) {
                      setMappingError("Please enter mapping values between 0-3");
                      return oldRow; // revert to previous row
                    } else {
                      setMappingError("");
                      Object.keys(newRow).forEach((key) => {
                        if (key !== "id" && key !== "name") {
                          const colIndex = parseInt(key, 10);
                          let value = parseFloat(newRow[key]);
                          if (isNaN(value)) value = 0;
                          updatedMatrix[rowIndex][colIndex] = value;
                          newRow[key] = value;
                        }
                      });
                      setMappingMatrix(updatedMatrix);
                      return newRow;
                    }
                  }}
                  disableSelectionOnClick
                  experimentalFeatures={{ newEditingApi: true }}
                  sx={{
                    "& .MuiDataGrid-cell": {
                      padding: "4px",
                      fontSize: "0.8rem",
                    },
                    "& .MuiDataGrid-columnHeader": {
                      fontSize: "0.9rem",
                      padding: "4px",
                    },
                  }}
                />
              </div>
            </Box>
            {/* CO PO PSO Mapping Upload Button */}
            <Box mb={3}>
              <Button variant="contained" component="label" color="primary" fullWidth>
                Upload CO PO PSO Mapping File
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  hidden
                  onChange={handleMappingFileChange}
                />
              </Button>
              {mappingFile && (
                <Typography
                  variant="caption"
                  display="block"
                  mt={1}
                  color="textSecondary"
                >
                  Selected Mapping File: {mappingFile.name}
                </Typography>
              )}
            </Box>
            {/* Sample Table for Direct Attainment */}
            <Box mt={2}>
              <Paper elevation={3} sx={{ p: 3, background: 'linear-gradient(90deg, #e3f2fd 0%, #fce4ec 100%)', borderRadius: 3, mb: 2 }}>
                <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 700, color: '#1976d2', letterSpacing: 1 }}>
                  Sample upload file (Direct Attainment)
                </Typography>
                <Typography variant="subtitle1" align="center" color="textSecondary" sx={{ mb: 2 }}>
                  Please use the following format for your upload. Enter marks for each test in the columns below.
                </Typography>
                <TableContainer component={Paper} sx={{ maxWidth: 700, margin: '0 auto', boxShadow: 0, background: 'transparent' }}>
                  <Table size="medium">
                    <TableHead>
                      <TableRow sx={{ background: 'linear-gradient(90deg, #bbdefb 0%, #f8bbd0 100%)' }}>
                        <TableCell align="center" sx={{ fontWeight: 700, fontSize: 16 }}>UT1</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, fontSize: 16 }}>UT2</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, fontSize: 16 }}>UT3</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, fontSize: 16 }}>Insem</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, fontSize: 16 }}>Endsem</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>25</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>12</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>29</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>18</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>50</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>28</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>20</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>15</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>20</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>67</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>30</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>14</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>12</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>19</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>52</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>22</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>23</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>24</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>27</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>58</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>47</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>41</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>53</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>60</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>68</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box textAlign="center" mt={2}>
                  <a href="/sample_direct_input.xlsx" download style={{ textDecoration: 'none' }}>
                    <Button variant="contained" color="secondary" sx={{ borderRadius: 2, fontWeight: 600, px: 4, py: 1, fontSize: 16, boxShadow: 2 }}>
                      Download Sample File
                    </Button>
                  </a>
                </Box>
              </Paper>
            </Box>

            {/* Direct Attainment Upload Button and Calculate Button (moved below sample table) */}
            <Box mb={3}>
              <Button variant="contained" component="label" color="success" fullWidth>
               Upload marks file 
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  hidden
                  onChange={handleDirectFileChange}
                />
              </Button>
              {directFile && (
                <Typography
                  variant="caption"
                  display="block"
                  mt={1}
                  color="textSecondary"
                >
                  Selected Direct Attainment File: {directFile.name}
                </Typography>
              )}
              <Box mt={2} textAlign="center">
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleSubmit}
                  disabled={loading}
                  fullWidth
                >
                  {loading ? <CircularProgress size={24} /> : "Calculate"}
                </Button>
                {errorMsg && (
                  <Typography variant="body2" color="error">
                    {errorMsg}
                  </Typography>
                )}
              </Box>
            </Box>
          </div>
        )}

        {output && output.co_values && output.po_values && (
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Results
            </Typography>

            <Box mb={2}>
              <Typography variant="subtitle1" gutterBottom>
                CO Attainment
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" style={{ fontWeight: "bold" }}>
                        CO
                      </TableCell>
                      {Object.keys(output.co_values).map((key) => (
                        <TableCell
                          key={key}
                          align="center"
                          style={{ fontWeight: "bold" }}
                        >
                          {key}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" style={{ fontWeight: "bold" }}>
                        Attainment
                      </TableCell>
                      {Object.values(output.co_values).map((value, index) => (
                        <TableCell key={index} align="center">
                          {value.toFixed(2)}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <Box mb={2}>
              <Typography variant="subtitle1" gutterBottom>
                PO Attainment
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">PO</TableCell>
                      {columnHeaders2.map((header) => (
                        <TableCell key={header} align="center">
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell align="center">Attainment</TableCell>
                      {columnHeaders.map((header) => (
                        <TableCell key={header} align="right">
                          {(output.po_values[header] || 0).toFixed(2)}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* 80% Attainment of Direct PO Bar Chart */}
            <Box mb={2}>
              <Typography variant="subtitle1" gutterBottom>
                80% Attainment of Direct PO
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={columnHeaders.map((header) => ({
                    name: POPSOmap[header] || header,
                    value: Number(((output.po_values[header] || 0) * 0.8).toFixed(2)),
                  }))}
                  margin={{ top: 30, right: 30, left: 10, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fontWeight: "bold", fill: "#555" }}
                    axisLine={{ stroke: "#ddd" }}
                    tickLine={{ stroke: "#ddd" }}
                    interval={0}
                  />
                  <YAxis
                    domain={[0, 'dataMax + 1']}
                    allowDecimals={false}
                    tick={{ fontSize: 12, fontWeight: "bold", fill: "#555" }}
                    axisLine={{ stroke: "#ddd" }}
                    tickLine={{ stroke: "#ddd" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    }}
                    labelStyle={{ fontWeight: "bold", color: "#555" }}
                    itemStyle={{ color: "#555" }}
                  />
                  <Legend
                    wrapperStyle={{
                      marginTop: "10px",
                      textAlign: "center",
                      fontSize: "14px",
                      color: "#333",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#ff9800"
                    barSize={30}
                    radius={[10, 10, 0, 0]}
                    name="80% PO Value"
                    label={{ position: 'top', fill: '#333', fontWeight: 'bold', fontSize: 12 }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>

            <Box mb={2}>
              <Typography variant="subtitle1" gutterBottom>
                CO Attainment
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={coChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis
                    dataKey="name"
                    tick={{
                      fontSize: 12,
                      fontWeight: "bold",
                      fill: "#555",
                    }}
                    axisLine={{ stroke: "#ddd" }}
                    tickLine={{ stroke: "#ddd" }}
                  />
                  <YAxis
                    tick={{
                      fontSize: 12,
                      fontWeight: "bold",
                      fill: "#555",
                    }}
                    axisLine={{ stroke: "#ddd" }}
                    tickLine={{ stroke: "#ddd" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    }}
                    labelStyle={{ fontWeight: "bold", color: "#555" }}
                    itemStyle={{ color: "#555" }}
                  />
                  <Legend
                    wrapperStyle={{
                      marginTop: "10px",
                      textAlign: "center",
                      fontSize: "14px",
                      color: "#333",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#8884d8"
                    barSize={40}
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>

            <Box mb={2}>
              <Typography variant="subtitle1" gutterBottom>
                PO Attainment
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={poChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis
                    dataKey="name"
                    tick={{
                      fontSize: 12,
                      fontWeight: "bold",
                      fill: "#555",
                    }}
                    axisLine={{ stroke: "#ddd" }}
                    tickLine={{ stroke: "#ddd" }}
                  />
                  <YAxis
                    tick={{
                      fontSize: 12,
                      fontWeight: "bold",
                      fill: "#555",
                    }}
                    axisLine={{ stroke: "#ddd" }}
                    tickLine={{ stroke: "#ddd" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    }}
                    labelStyle={{ fontWeight: "bold", color: "#555" }}
                    itemStyle={{ color: "#555" }}
                  />
                  <Legend
                    wrapperStyle={{
                      marginTop: "10px",
                      textAlign: "center",
                      fontSize: "14px",
                      color: "#333",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#82ca9d"
                    barSize={40}
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>

            <Box mt={4}>
              <Typography variant="h6" gutterBottom>
                CO-PO-PSO Mapping vs Attainment
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={mappingChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={mappingFooterLabel} fill="#8884d8" />
                  <Bar dataKey="PO Attainment" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Box>

            {/* Only show the  component if show is true */}
            {show ? (
              <
                show={show}
                directPO80={output && output.po_values
                  ? Object.fromEntries(
                      Object.entries(output.po_values).map(([key, value]) => [key, value * 0.8])
                    )
                  : {}}
              />
            ) : (
              !reportGenerated && (
                <Box mb={3} textAlign="center">
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleShow}
                    fullWidth
                  >
                    Do you want to continue for  attainment?
                  </Button>
                </Box>
              )
            )}

            {!reportGenerated && (
              <Box mb={3} textAlign="center">
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={handleGenerateReport}
                  disabled={loading}
                  fullWidth
                >
                  Generate Report
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Container>
    </MappingContext.Provider>
  );
}

export default App;
