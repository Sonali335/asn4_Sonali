const express = require("express");
const router = express.Router();
const Airbnb = require("../models/Airbnb");

// GET all
router.get("/", async (req, res) => {
  try {
    const data = await Airbnb.find().lean();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "DB Error" });
  }
});

// GET by ID
router.get("/:id", async (req, res) => {
  try {
    const item = await Airbnb.findOne({ id: Number(req.params.id) }).lean();
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "DB Error" });
  }
});

// INSERT
router.post("/", async (req, res) => {
  try {
    const newItem = new Airbnb(req.body);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: "DB Error" });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const updated = await Airbnb.findOneAndUpdate(
      { id: Number(req.params.id) },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "DB Error" });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Airbnb.findOneAndDelete({ id: Number(req.params.id) });
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "DB Error" });
  }
});

module.exports = router;
