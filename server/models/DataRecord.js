import mongoose from "mongoose";

const dataRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    businessDataId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessData",
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    processedData: {
      revenue: Number,
      date: { type: Date, required: false },
      customerId: String,
      productId: String,
      quantity: Number,
      price: Number,
      category: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
dataRecordSchema.index({ userId: 1, "processedData.date": 1 });
dataRecordSchema.index({ userId: 1, businessDataId: 1 });

// Pre-save middleware to ensure processedData has numbers
dataRecordSchema.pre('save', function(next) {
  if (this.processedData) {
    if (this.processedData.revenue) {
      this.processedData.revenue = Number(this.processedData.revenue);
    }
    if (this.processedData.price) {
      this.processedData.price = Number(this.processedData.price);
    }
    if (this.processedData.quantity) {
      this.processedData.quantity = Number(this.processedData.quantity);
    }
  }
  next();
});

export default mongoose.model("DataRecord", dataRecordSchema);
