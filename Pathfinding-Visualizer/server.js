const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use("/public", express.static(__dirname + "/public"))

// Create stores directory if it doesn't exist
const storesDir = path.join(__dirname, "saved_stores");
if (!fs.existsSync(storesDir)) {
  fs.mkdirSync(storesDir, { recursive: true });
}

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
})

// Save store layout and path
app.post("/api/save-store", (req, res) => {
  try {
    const storeData = req.body;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `store_${timestamp}.json`;
    const filepath = path.join(storesDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(storeData, null, 2));
    
    res.json({
      success: true,
      message: "Store saved successfully",
      filename: filename,
      path: filepath
    });
  } catch (error) {
    console.error("Error saving store:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save store",
      error: error.message
    });
  }
});

// Get list of saved stores
app.get("/api/stores", (req, res) => {
  try {
    const files = fs.readdirSync(storesDir)
      .filter(file => file.endsWith('.json'))
      .map(file => ({
        filename: file,
        path: path.join(storesDir, file),
        created: fs.statSync(path.join(storesDir, file)).birthtime
      }))
      .sort((a, b) => b.created - a.created);
    
    res.json({ success: true, stores: files });
  } catch (error) {
    console.error("Error listing stores:", error);
    res.status(500).json({
      success: false,
      message: "Failed to list stores",
      error: error.message
    });
  }
});

// Load a specific store
app.get("/api/store/:filename", (req, res) => {
  try {
    const filepath = path.join(storesDir, req.params.filename);
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({
        success: false,
        message: "Store not found"
      });
    }
    
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    res.json({ success: true, data });
  } catch (error) {
    console.error("Error loading store:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load store",
      error: error.message
    });
  }
});

app.listen(1337, () => {
  console.log("The server is up and running!");
  console.log(`Stores will be saved to: ${storesDir}`);
});
