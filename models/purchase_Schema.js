const mongoose = require("mongoose");

const PurchaseOfUser = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Webinar",
    },
    purchaseId: {
      type: String,
    },
    purchaseOrder: [
      {
        quantity: Number,
        price: {
          type: Number,
        },
        totalPrice: {
          type: Number,
        },
        name: {
          type: String,
        },
      },
    ],
    modifiedOn: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PurchaseOfUser", PurchaseOfUser);
