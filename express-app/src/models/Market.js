import mongoose from 'mongoose';

const marketSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  location: { type: String, required: true, trim: true },
  region: { type: String, required: true, trim: true },
  country: { type: String, default: 'Uganda' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
const Market = mongoose.model('Market', marketSchema);
export default Market;
