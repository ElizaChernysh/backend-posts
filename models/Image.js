import mongoose from "mongoose";

const imgSchema = new mongoose.Schema({
 img: {
  data: Buffer,
  contentType: String
 }
  
});

export default mongoose.model('Image', imgSchema);