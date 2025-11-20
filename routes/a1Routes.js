const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Airbnb = require("../models/Airbnb");  // Mongoose model

// -------------------- TEST ROUTE --------------------
router.get('/test', (req, res) => {
  res.send("Routes are working!");
});

// -------------------- PRICE RANGE SEARCH --------------------
router.get('/viewData/price', (req, res) => {
  res.render('priceForm', { title: 'Search by Price Range' });
});

router.post(
  '/viewData/price',
  [
    body('minPrice').notEmpty().withMessage('Minimum price is required').isNumeric(),
    body('maxPrice').notEmpty().withMessage('Maximum price is required').isNumeric()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const min = Number(req.body.minPrice);
    const max = Number(req.body.maxPrice);

    if (!errors.isEmpty() || max < min) {
      const customErrors = errors.array();
      if (max < min) customErrors.push({ msg: 'Maximum price must be >= minimum price' });

      return res.render('priceForm', {
        title: 'Search by Price Range',
        errors: customErrors,
        minPrice: req.body.minPrice,
        maxPrice: req.body.maxPrice
      });
    }

    try {
      // Fetch only required fields and use lean()
      const results = await Airbnb.find({}, {
        id: 1,
        NAME: 1,
        neighbourhood: 1,
        country: 1,
        instant_bookable: 1,
        property_type: 1,
        price: 1,
        thumbnail: 1,
        _id: 0
      }).lean();

      // Filter by numeric price safely
      const filtered = results.filter(item => {
        if (!item.price) return false;
        const priceNum = Number(item.price.replace(/[^0-9.-]+/g, '')); // remove $, commas etc.
        return priceNum >= min && priceNum <= max;
      });

      res.render('priceForm', { 
        title: 'Search by Price Range', 
        results: filtered, 
        minPrice: min, 
        maxPrice: max 
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("DB Error");
    }
  }
);


// -------------------- VIEW INITIAL 10 ROWS --------------------
router.get('/viewData', async (req, res) => {
  try {
    const first10 = await Airbnb.find()
      .select("id NAME neighbourhood country instant_bookable property_type price thumbnail")
      .limit(10);

    const totalCount = await Airbnb.countDocuments();

    const data = first10.map(item => ({
      ...item._doc,
      price: item.price ? item.price.trim() : "N/A"
    }));

    res.render('viewData', { title: 'All Airbnb Properties', data, totalCount });
  } catch (err) {
    console.error(err);
    res.status(500).send("DB Error");
  }
});

// -------------------- LOAD MORE DATA FOR INFINITE SCROLL --------------------
router.get('/viewData/more', async (req, res) => {
  try {
    const start = Number(req.query.start) || 0;

    const nextItems = await Airbnb.find()
      .skip(start)
      .limit(10)
      .select("id NAME neighbourhood country instant_bookable property_type price thumbnail");

    const data = nextItems.map(item => ({
      ...item._doc,
      price: item.price ? item.price.trim() : "N/A"
    }));

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("DB Error");
  }
});

// -------------------- SEARCH BY PROPERTY NAME --------------------
router.get('/searchName', (req, res) => {
  res.render('searchProduce', { title: 'Search by Property Name' });
});

router.post('/searchName',
  [
    body('name').notEmpty().withMessage('Property name is required').trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const query = req.body.name.trim();

    if (!errors.isEmpty()) {
      return res.render('searchProduce', { title: 'Search by Property Name', errors: errors.array(), query });
    }

    try {
      // Only fields from your schema
      const results = await Airbnb.find({ NAME: { $regex: query, $options: "i" } }, {
        id: 1,
        NAME: 1,
        neighbourhood: 1,
        country: 1,
        instant_bookable: 1,
        property_type: 1,
        price: 1,
        thumbnail: 1,
        _id: 0
      }).lean(); // plain JS object for Handlebars

      res.render('searchProduce', { title: 'Search by Property Name', results, query });
    } catch (err) {
      console.error(err);
      res.status(500).send("DB Error");
    }
  }
);


// -------------------- SEARCH BY PROPERTY ID --------------------
router.get('/searchID', (req, res) => {
  res.render('searchInvoice', { title: 'Search by Property ID' });
});

router.get("/searchID/:id", async (req, res) => {
  const id = req.params.id;
  const data = await AirBnB.findOne({ id: Number(id) });
  
  if (!data) return res.render("error", { title: "Not Found" });

  res.render("viewSpecific", { title: "Property Details", data });
});

router.post('/searchID',
  [
    body('id').notEmpty().withMessage('Property ID is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const id = req.body.id.trim();  // treat as string

    if (!errors.isEmpty()) {
      return res.render('searchInvoice', { title: 'Search by Property ID', errors: errors.array(), id });
    }

    try {
      const property = await Airbnb.findOne({ id: id }, {
        id: 1,
        NAME: 1,
        neighbourhood: 1,
        country: 1,
        instant_bookable: 1,
        property_type: 1,
        price: 1,
        thumbnail: 1,
        _id: 0
      }).lean();

      if (!property) {
        return res.render('searchInvoice', { title: 'Search by Property ID', message: `No property found with ID "${id}".`, id });
      }

      res.render('searchInvoice', { title: 'Search by Property ID', results: [property], id });
    } catch (err) {
      console.error(err);
      res.status(500).send("DB Error");
    }
  }
);

// -------------------- INSERT NEW PROPERTY --------------------
router.get('/addAirbnb', (req, res) => {
  res.render('addAirbnb', { title: 'Add New Airbnb Property' });
});

router.post('/addAirbnb', async (req, res) => {
  try {
    const newItem = new Airbnb({
      id: req.body.id,
      NAME: req.body.NAME,
      neighbourhood: req.body.neighbourhood,
      country: req.body.country,
      instant_bookable: req.body.instant_bookable,
      property_type: req.body.property_type,
      price: req.body.price,
      thumbnail: req.body.thumbnail
    });
    await newItem.save();
    res.send("New Airbnb property added!");
  } catch (err) {
    console.error(err);
    res.status(500).send("DB Error");
  }
});

// Render Add form
router.get('/addAirbnb', (req, res) => {
  res.render('addAirbnb', { title: 'Add New Airbnb Property' });
});

// Render Update form
router.get('/updateAirbnb', (req, res) => {
  res.render('updateAirbnb', { title: 'Update Airbnb Property' });
});

// Render Delete form
router.get('/deleteAirbnb', (req, res) => {
  res.render('deleteAirbnb', { title: 'Delete Airbnb Property' });
});


// -------------------- UPDATE PROPERTY --------------------
router.post('/updateAirbnb', async (req, res) => {
  try {
    const updated = await Airbnb.updateOne(
      { id: req.body.id },
      { $set: { NAME: req.body.NAME, price: req.body.price } }
    );
    if (updated.matchedCount === 0) {
      return res.send("No property found to update.");
    }
    res.send("Property updated successfully!");
  } catch (err) {
    console.error(err);
    res.status(500).send("DB Error");
  }
});

// -------------------- DELETE PROPERTY --------------------
router.post('/deleteAirbnb', async (req, res) => {
  try {
    const result = await Airbnb.deleteOne({ id: req.body.id });
    if (result.deletedCount === 0) {
      return res.send("No property found with that ID.");
    }
    res.send("Property deleted successfully!");
  } catch (err) {
    console.error(err);
    res.status(500).send("DB Error");
  }
});


module.exports = router;
