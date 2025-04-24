import Market from '../models/Market.js';
import Price from '../models/Price.js';

export const createMarket = async (req, res) => {
  try {
    const { name, location, region, country } = req.body;
    if (!name || !location || !region) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingMarket = await Market.findOne({ name });
    if (existingMarket) {
      return res.status(400).json({ message: 'Market already exists' });
    }

    const newMarket = new Market({ name, location, region, country });
    await newMarket.save();

    res.status(201).json({ message: 'Market created successfully', market: newMarket });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMarkets = async (req, res) => {
  try {
    const markets = await Market.find().sort({ name: 1 });
    res.status(200).json(markets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMarketById = async (req, res) => {
  try {
    const market = await Market.findById(req.params.id);
    if (!market) return res.status(404).json({ message: 'Market not found' });

    res.status(200).json(market);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMarket = async (req, res) => {
  try {
    const market = await Market.findById(req.params.id);
    if (!market) return res.status(404).json({ message: 'Market not found' });

    Object.assign(market, req.body);
    await market.save();

    res.status(200).json({ message: 'Market updated successfully', market });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// 5️⃣ Delete Market
// =========================
export const deleteMarket = async (req, res) => {
  try {
    const market = await Market.findById(req.params.id);
    if (!market) return res.status(404).json({ message: 'Market not found' });

    await market.deleteOne();
    res.status(200).json({ message: 'Market deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// 6️⃣ Get Prices for a Specific Market
// =========================
export const getPricesForMarket = async (req, res) => {
  try {
    const { marketId } = req.params;
    const market = await Market.findById(marketId);
    if (!market) return res.status(404).json({ message: 'Market not found' });

    const prices = await Price.find({ market: market.name }).sort({ date: -1 });

    res.status(200).json({ market, prices });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
