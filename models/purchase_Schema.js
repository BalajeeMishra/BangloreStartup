const mongoose = require("mongoose")
const PurchaseOfUser = new mongoose.Schema(
  {
    method: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Webinar",
    },
    discount: {
      type: Number,
      default: 0,
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
    date: {
      type: String,
    },

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
)

module.exports = mongoose.model("PurchaseOfUser", PurchaseOfUser)
