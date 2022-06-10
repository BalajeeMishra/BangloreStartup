detailofwebinar.js me agar koi 2 category select karta hai us basis pe result doo.

put the status inside webinar form with the option of live and recording once they will change it to recording pricing option will be change as well as date will be remove from there.show the status on product.

how to get value from input once we click button.??

==>verify will be verified.in user schema.

==>console.log would not be there.

==>wrapasync wala part sahi karna hai.

all listed product edit page.

**userId:{**

**type:mongoose.Schema.Types.ObjectId,**

**ref:"User"**

**},**

**if (typeofreq.file!=undefined) {**

**const{path,filename}=req.file;**

**information.images={**

**url:path,**

**filename,**

**};**

**}**

**_Dues.update(_**

** _{"feesDetail.\_id":comment_id},_**

** _{_**

** _$set:{_**

** _"feesDetail.$.total":valuetoenter,_**

** _"feesDetail.$.dues":valuetoenter,_**

** _"feesDetail.$.paided":amount/100,_**

** _"feesDetail.$.valuetopaid":0,_**

** _"feesDetail.$.totalpaidedyet":totalpaidedyet+amount/100,_**

** _},_**

** _},_**

** _function(err,model){_**

** _if (err) {_**

** _returnres.send(err);_**

** _}_**

** _}_**

** _);_**

image selecteddddd

```javascript
if (Date.now() >= exp * 1000) {
  return false;
}
check the more code on app.js file.
```

<% carts.forEach((cart)=>{%>

    <% Total=Total+cart.totalPrice;%>

    <%qty=qty+cart.quantity %>

    <% products.forEach((pro)=>{%>

    <%if(cart.products[0].toString()===pro._id.toString() ){%>
