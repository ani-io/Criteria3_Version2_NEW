import { useState, useEffect, useContext } from "react";
import { MappingContext } from "./App";
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
import axios from "axios";

function Indirect({ showIndirect, directPO80 = {} }) {
  const { mappingMatrix } = useContext(MappingContext);
  const [file, setFile] = useState(null);
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!showIndirect) {
    return null; // Do not render anything if indirect attainment is not selected
  }

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) {
      alert("Please upload a file!");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("matrix", JSON.stringify(mappingMatrix));

    try {
      const response = await axios.post(
        "https://criteria3-backend.onrender.com/indirect-process",
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

  const poChartData = output
    ? [...Array(15).keys()].map((index) => {
        let name, value;
        if (index < 12) {
          name = `PO${index + 1}`;
          value = output.po_values[name] || 0;
        } else {
          name = `PSO${index - 11}`;
          // For PSO1,2,3 get value from po_values['PO13'], ['PO14'], ['PO15']
          value = output.po_values[`PO${index + 1}`] || output.po_values[name] || 0;
        }
        return {
          name,
          value,
        };
      })
    : [];

  // --- CO-PO-PSO Mapping vs Attainment Chart Data ---
  const mappingChartData = output
    ? [...Array(15).keys()].map((index) => {
        let name, poValue;
        if (index < 12) {
          name = `PO${index + 1}`;
          poValue = output.po_values[name] || 0;
        } else {
          name = `PSO${index - 11}`;
          poValue = output.po_values[`PO${index + 1}`] || output.po_values[name] || 0;
        }
        // Calculate CO-PO-PSO Mapping as the average mapping value for this PO/PSO across all COs
        const mappingValue = mappingMatrix && mappingMatrix.length > 0
          ? mappingMatrix.reduce((sum, row) => sum + (row[index] || 0), 0) / mappingMatrix.length
          : 0;
        return {
          name,
          "CO-PO-PSO Mapping": Number(mappingValue.toFixed(2)),
          "PO Attainment": Number(poValue.toFixed(2)),
        };
      })
    : [];

  // --- Prepare data for 80% Direct, 20% Indirect, and their sum for PO1-PO12, PSO1-PSO3 ---
  const poNames = [...Array(12).keys()].map(i => `PO${i+1}`).concat(["PSO1","PSO2","PSO3"]);
  // Helper to get 20% indirect value for each PO/PSO
  const getIndirect20 = (name) => {
    if (!output || !output.po_values) return 0;
    if (name === "PSO1") return (output.po_values["PO13"] || output.po_values["PSO1"] || 0) * 0.2;
    if (name === "PSO2") return (output.po_values["PO14"] || output.po_values["PSO2"] || 0) * 0.2;
    if (name === "PSO3") return (output.po_values["PO15"] || output.po_values["PSO3"] || 0) * 0.2;
    return (output.po_values[name] || 0) * 0.2;
  };
  // Helper to get 80% direct value for each PO/PSO
  const getDirect80 = (name) => {
    if (!directPO80) return 0;
    if (name === "PSO1") return directPO80["PO13"] || directPO80["PSO1"] || 0;
    if (name === "PSO2") return directPO80["PO14"] || directPO80["PSO2"] || 0;
    if (name === "PSO3") return directPO80["PO15"] || directPO80["PSO3"] || 0;
    return directPO80[name] || 0;
  };
  const combinedBarChartData = poNames.map(name => {
    const direct80 = Number(getDirect80(name).toFixed(2));
    const indirect20 = Number(getIndirect20(name).toFixed(2));
    return {
      name,
      "80% Direct": direct80,
      "20% Indirect": indirect20,
      "Final (Sum)": Number((direct80 + indirect20).toFixed(2)),
    };
  });


  return (
    <Container maxWidth="lg" style={{ marginTop: "20px" }}>
      <Box mb={3}>
        <Button variant="contained" component="label" fullWidth>
          Upload File
          <input type="file" hidden onChange={handleFileChange} />
        </Button>
        {file && (
          <Typography
            variant="caption"
            display="block"
            mt={1}
            color="textSecondary"
          >
            Selected File: {file.name}
          </Typography>
        )}
        <Box mt={2}>
          <Paper elevation={3} sx={{ p: 3, background: 'linear-gradient(90deg, #e3f2fd 0%, #fce4ec 100%)', borderRadius: 3, mb: 2 }}>
            <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 700, color: '#1976d2', letterSpacing: 1 }}>
              Sample upload file
            </Typography>
            <Typography variant="subtitle1" align="center" color="textSecondary" sx={{ mb: 2 }}>
              Please use the following format for your upload. Values should be between 0 and 3.
            </Typography>
            <TableContainer component={Paper} sx={{ maxWidth: 700, margin: '0 auto', boxShadow: 0, background: 'transparent' }}>
              <Table size="medium">
                <TableHead>
                  <TableRow sx={{ background: 'linear-gradient(90deg, #bbdefb 0%, #f8bbd0 100%)' }}>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: 16 }}>CO1</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: 16 }}>CO2</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: 16 }}>CO3</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: 16 }}>CO4</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: 16 }}>CO5</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: 16 }}>CO6</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>2</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>3</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>1</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>0</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>2</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>1</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>1</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>2</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>2</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>3</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>0</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>1</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>3</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>1</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>0</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>2</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>2</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>3</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>0</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>2</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>3</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>1</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>1</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>2</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>2</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>1</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>2</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>3</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>3</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 500, fontSize: 15 }}>0</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <Box textAlign="center" mt={2}>
              <a href="/sample_indirect_input.csv" download style={{ textDecoration: 'none' }}>
                <Button variant="contained" color="secondary" sx={{ borderRadius: 2, fontWeight: 600, px: 4, py: 1, fontSize: 16, boxShadow: 2 }}>
                  Download Sample File
                </Button>
              </a>
            </Box>
          </Paper>
        </Box>
      </Box>

      <Box mb={3} textAlign="center">
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



          {/* 6. Combined 80% Direct + 20% Indirect + Sum Bar Chart (moved below CO-PO-PSO Mapping vs Attainment Chart) */}
      {output && output.co_values && (
        <Box mt={4}>
          {/* 1. Indirect CO Attainment Table */}
          <Typography variant="h6" gutterBottom>
            Indirect CO Attainment Table
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {Object.entries(output.co_values).map(([key]) => (
                    <TableCell key={key} align="center"><b>{key}</b></TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  {Object.entries(output.co_values).map(([_, value], idx) => (
                    <TableCell key={idx} align="center">{Number(value).toFixed(2)}</TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* 1. Indirect CO Attainment Bar Chart */}
          <Typography variant="h6" gutterBottom>
            Indirect CO Attainment
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={Object.entries(output.co_values).map(([key, value]) => ({
                name: key,
                value: Number(value).toFixed(2),
              }))}
              margin={{ top: 30, right: 30, left: 10, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fontWeight: "bold", fill: "#555" }}
                axisLine={{ stroke: "#ddd" }}
                tickLine={{ stroke: "#ddd" }}
              />
              <YAxis
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
                formatter={(value) => Number(value).toFixed(2)}
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
                name="CO Attainment"
                label={{ position: 'top', fill: '#333', fontWeight: 'bold', fontSize: 12, formatter: (v) => Number(v).toFixed(2) }}
              />
            </BarChart>
          </ResponsiveContainer>

          {/* 2. Indirect PO Attainment Table */}
          {output && output.po_values && (
            <>
              <Typography variant="h6" gutterBottom style={{ marginTop: "30px" }}>
                Indirect PO Attainment Table
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {poChartData.map((data) => (
                        <TableCell key={data.name} align="center"><b>{data.name}</b></TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      {poChartData.map((data, idx) => (
                        <TableCell key={idx} align="center">{Number(data.value).toFixed(2)}</TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {/* 2. Indirect PO Attainment Bar Chart */}
              <Typography variant="h6" gutterBottom>
                Indirect PO Attainment
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={poChartData.map((data) => ({ ...data, value: Number(data.value).toFixed(2) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fontWeight: "bold", fill: "#555" }}
                    axisLine={{ stroke: "#ddd" }}
                    tickLine={{ stroke: "#ddd" }}
                    interval={0}
                  />
                  <YAxis
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
                    formatter={(value) => Number(value).toFixed(2)}
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
                    barSize={30}
                    radius={[10, 10, 0, 0]}
                    name="PO Attainment"
                    label={{ position: 'top', fill: '#333', fontWeight: 'bold', fontSize: 12, formatter: (v) => Number(v).toFixed(2) }}
                  />
                </BarChart>
              </ResponsiveContainer>

              {/* 3. 20% Attainment of Indirect PO Table */}
              <Typography variant="subtitle1" gutterBottom style={{ marginTop: "30px" }}>
                20% Attainment of Indirect PO Table
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {poChartData.map((data) => (
                        <TableCell key={data.name} align="center"><b>{data.name}</b></TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      {poChartData.map((data, idx) => (
                        <TableCell key={idx} align="center">{Number(data.value * 0.2).toFixed(2)}</TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {/* 3. 20% Attainment of Indirect PO Bar Chart */}
              <Typography variant="subtitle1" gutterBottom>
                20% Attainment of Indirect PO
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={poChartData.map((data) => ({
                    name: data.name,
                    value: Number(data.value * 0.2).toFixed(2),
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
                    formatter={(value) => Number(value).toFixed(2)}
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
                    fill="#00bcd4"
                    barSize={30}
                    radius={[10, 10, 0, 0]}
                    name="20% PO Value"
                    label={{ position: 'top', fill: '#333', fontWeight: 'bold', fontSize: 12, formatter: (v) => Number(v).toFixed(2) }}
                  />
                </BarChart>
              </ResponsiveContainer>

              {/* 4. CO-PO-PSO Mapping vs Attainment Chart */}
              <Typography variant="h6" gutterBottom style={{ marginTop: "30px" }}>
                CO-PO-PSO Mapping vs Attainment Chart
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={mappingChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="CO-PO-PSO Mapping" fill="#ffc658" />
                  <Bar dataKey="PO Attainment" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>

              {/* 5. Combined 80% Direct + 20% Indirect + Sum Bar Chart (with value labels and clear column boundaries) */}
              <Typography variant="h6" gutterBottom style={{ marginTop: "30px" }}>
                Combined PO Attainment (80% Direct, 20% Indirect, Sum)
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={combinedBarChartData} margin={{ top: 30, right: 30, left: 10, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={true} horizontal={true} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fontWeight: "bold", fill: "#555" }} 
                    axisLine={{ stroke: "#333", strokeWidth: 2 }}
                    tickLine={{ stroke: "#333", strokeWidth: 2 }}
                    interval={0}
                  />
                  <YAxis 
                    allowDecimals={false} 
                    tick={{ fontSize: 12, fontWeight: "bold", fill: "#555" }} 
                    axisLine={{ stroke: "#333", strokeWidth: 2 }}
                    tickLine={{ stroke: "#333", strokeWidth: 2 }}
                  />
                  <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #ddd", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }} labelStyle={{ fontWeight: "bold", color: "#555" }} itemStyle={{ color: "#555" }} />
                  <Legend wrapperStyle={{ marginTop: "10px", textAlign: "center", fontSize: "14px", color: "#333" }} />
                  <Bar dataKey="80% Direct" fill="#ff9800" barSize={22} radius={[10, 10, 0, 0]}
                    label={{ position: 'top', fill: '#ff9800', fontWeight: 'bold', fontSize: 12 }} />
                  <Bar dataKey="20% Indirect" fill="#00bcd4" barSize={22} radius={[10, 10, 0, 0]}
                    label={{ position: 'top', fill: '#00bcd4', fontWeight: 'bold', fontSize: 12 }} />
                  <Bar dataKey="Final (Sum)" fill="#43a047" barSize={22} radius={[10, 10, 0, 0]}
                    label={{ position: 'top', fill: '#43a047', fontWeight: 'bold', fontSize: 12 }} />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </Box>
      )}
    </Container>
  );
}

export default Indirect;
