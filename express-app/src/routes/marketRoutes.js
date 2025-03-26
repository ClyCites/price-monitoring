import express from 'express';
import { 
  createMarket, 
  getMarkets, 
  getMarketById, 
  updateMarket, 
  deleteMarket,
  getPricesForMarket 
} from '../controllers/marketController.js';

const router = express.Router();

// Market Routes
router.post('/', createMarket);
router.get('/', getMarkets);
router.get('/:id', getMarketById);
router.put('/:id', updateMarket);
router.delete('/:id', deleteMarket);

// Prices Related to Market
router.get('/:marketId/prices', getPricesForMarket);

export default router;
