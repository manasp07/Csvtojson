const express = require("express");
const multer = require("multer");
const path = require("path");
const dotenv = require("dotenv");
const fs = require("fs");
const parseCSV = require("./convert");
const { pool } = require("./db");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const upload = multer({ dest: process.env.UPLOAD_DIR || "uploads/" });
const cors = require("cors");

app.use(cors({ origin: "http://localhost:5173" }));

// Generate a unique table name based on timestamp
const generateTableName = () => `users_${Date.now()}`;

// Route for uploading CSV files
app.post("/upload", upload.single("csvFile"), async (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");

  const filePath = path.join(__dirname, req.file.path);
  const users = await parseCSV(filePath);
  const tableName = generateTableName(); // Unique table for each upload

  try {
    // Create a new table dynamically
    await pool.query(`
      CREATE TABLE ${tableName} (
        id SERIAL PRIMARY KEY,
        first_name TEXT,
        middle_name TEXT,
        last_name TEXT,
        age INT,
        address JSONB,
        additional_info JSONB
      )
    `);

    for (const user of users) {
      const age = user.age ? parseInt(user.age, 10) : null;
      if (age === null) continue;

      await pool.query(
        `INSERT INTO ${tableName} (first_name, middle_name, last_name, age, address, additional_info) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          user.first_name || "Unknown",
          user.middle_name || null,
          user.last_name || "Unknown",
          age,
          JSON.stringify({
            line_1: user.line_1 || "N/A",
            line_2: user.line_2 || "N/A",
            line_3: user.line_3 || "N/A",
          }),
          JSON.stringify(user.additional_info || {}),
        ]
      );
    }

    fs.unlinkSync(filePath);
    
    
    res.json({ message: "Upload successful", tableName });

  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).send("Server Error");
  }
});

// Route to get all available tables
app.get("/tables", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' AND tablename LIKE 'users_%'
    `);
    
    const tableNames = rows.map(row => row.tablename);
    res.json(tableNames);
  } catch (error) {
    console.error("Error fetching tables:", error);
    res.status(500).send("Server Error");
  }
});

// Route to get age distribution from any table
app.get("/age-distribution/:tableName", async (req, res) => {
  const tableName = req.params.tableName;

  try {
    const { rows } = await pool.query(`SELECT age FROM ${tableName}`);
    const ageGroups = { "< 20": 0, "20 to 40": 0, "40 to 60": 0, "> 60": 0 };

    rows.forEach(({ age }) => {
      if (age < 20) ageGroups["< 20"]++;
      else if (age <= 40) ageGroups["20 to 40"]++;
      else if (age <= 60) ageGroups["40 to 60"]++;
      else ageGroups["> 60"]++;
    });

    res.json(ageGroups);
  } catch (error) {
    console.error(`Error fetching age distribution from ${tableName}:`, error);
    res.status(500).send("Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
