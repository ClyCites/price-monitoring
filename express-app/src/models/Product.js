import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  category: { 
    type: String,
    required: true 
  },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

productSchema.virtual('prices', {
  ref: 'Price',
  localField: '_id',
  foreignField: 'product',
  justOne: false,
});

const Product = mongoose.model('Product', productSchema);
export default Product;
