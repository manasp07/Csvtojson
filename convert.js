const fs = require("fs");
const csv = require("csv-parser");

function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
    
        const nameParts = (row.name || "").split(" ").map(part => part.trim());
        const firstName = nameParts[0] || "";
        const lastName = nameParts.length > 1 ? nameParts.slice(-1)[0] : "";
        const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : "";

        const addressLines = (row.address || "").split(",").map(line => line.trim());
        const address = {
          line1: addressLines[0] || "",
          line2: addressLines[1] || "",
          line3: addressLines.length > 2 ? addressLines.slice(2).join(", ") : "",
        };

        const record = {
          name: {
            first_name: firstName,
            middle_name: middleName,
            last_name: lastName,
          },
          age: row.age || "",
          address: address,
        };

        results.push(record);
      })
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
}

module.exports = parseCSV;
