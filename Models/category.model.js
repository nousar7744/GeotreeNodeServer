import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Carbon', 'Plantation', 'Occasion'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category_image: {
    type: String,
    required: true
  }
}, { timestamps: true });

export default mongoose.model("Category", CategorySchema);

