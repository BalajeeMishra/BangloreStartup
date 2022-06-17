// purchaseofuser means user who purchased the data.
const PurchaseOfUser = require("../models/purchase_Schema")
// this is for Transactiondetail model updation for admin purpose
const TransactionDetail = require("../models/transaction")
const Cart = require("../models/cart")
const User = require("../models/user")
const wrapAsync = require("../controlError/wrapAsync")
const { timingFormat } = require("../helper/date")
// this is the middleware that will execute after payment succession.
module.exports.isSuccess = wrapAsync(async (req, res, next) => {
  // taking all cart on the basis of userid so that we can store the purchased item in other
  // schema named PurchaseOfUser.
  const allCartofuser = await Cart.find({ userId: req.user._id })
  const dateformat = timingFormat(new Date())
  for (let i = 0; i < allCartofuser.length; i++) {
    var purchaseOfUser = new PurchaseOfUser({
      userId: req.user._id,
      product: allCartofuser[i].product,
      date: dateformat.dateformattransaction,
      method: req.session.method,
    })

    for (let j = 0; j < allCartofuser[i].categoryofprice.length; j++) {
      purchaseOfUser.purchaseOrder = [
        ...purchaseOfUser.purchaseOrder,
        {
          quantity: allCartofuser[i].categoryofprice[j].quantity,
          price: allCartofuser[i].categoryofprice[j].price,
          totalPrice: allCartofuser[i].categoryofprice[j].totalPrice,
          name: allCartofuser[i].categoryofprice[j].name,
        },
      ]
    }
    await purchaseOfUser.save()
  }
  // deleting the method from session.
  delete req.session.method
  // for storing current date.
  const dateNow = timingFormat(new Date())
  // finding previous purchase id.
  const lastPurchase = await TransactionDetail.find({})
  if (lastPurchase.length) {
    var id = lastPurchase[lastPurchase.length - 1].purchaseId
  }

  // storing it for admin purpose.

  const amount = new TransactionDetail({
    userId: req.user._id,
    amount: req.session.amount,
    date: dateNow.dateformattransaction,
  })
  amount.purchaseId = !id ? 1111 : id + 1
  await amount.save()
  delete req.session.amount
  //now deleting everything relared to coupon session
  //new code.

  // const discountinprice = req.session.discountinprice;
  //   const discountinpercentage = req.session.discountinpercentage;
  if (req.session.discountinprice) {
    delete req.session.discountinprice
    console.log("lets,see 1", req.session.discountinprice)
  }
  if (req.session.discountinpercentage) {
    delete req.session.discountinpercentage
    console.log("lets,see 2", req.session.discountinpercentage)
  }
  await req.session.save()
  // removing all the cart after successfully payment.
  await Cart.deleteMany({ userId: req.user._id })
  // basically here we will give null to cart of that user.
  const user = await User.findById(req.user._id)
  user.cart = null
  await user.save()
  // await PurchaseOfUser.find({ userId: req.user._id }).updateMany(
  //   {},
  //   { purchaseId: Date.now() }
  // );
})
