const fs = require("fs");
const csv = require("csv-parser");

function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        const record = {
          id: row.id || "",
          first_name: row.first_name || "",
          middle_name: row.middle_name || "",
          last_name: row.last_name || "",
          age: row.age || "",
        };

        
        const addressLines = (row.address || "").split(",").map(line => line.trim());
        record.line_1 = addressLines[0] || "";
        record.line_2 = addressLines[1] || "";
        record.line_3 = addressLines[2] || "";

        // Extract additional info
        const additionalInfo = {};
        Object.entries(row).forEach(([key, value]) => {
          if (!["id", "first_name", "middle_name", "last_name", "age", "address"].includes(key)) {
            additionalInfo[key] = value;
          }
        });

        record.additional_info = additionalInfo;
        results.push(record);
      })
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
}

module.exports = parseCSV;
