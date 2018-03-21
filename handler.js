const moltinGateway = require('@moltin/sdk').gateway

const moltin = moltinGateway({
  client_id: process.env.MOLTIN_CLIENT_ID
})

export const checkout = async (event, context, callback) => {
  const {
    billing_address: billing,
    customer,
    product,
    token,
    shipping_address: shipping
  } = await JSON.parse(event.body)

  try {
    const cartId = await moltin.cartId

    await moltin.Cart(cartId).AddProduct(product)

    const { data: order } = await moltin
      .Cart(cartId)
      .Checkout(customer, billing, shipping)

    await moltin.Orders.Payment(order.id, {
      gateway: 'stripe',
      method: 'purchase',
      payment: token
    })

    callback(null, { statusCode: 201 })
  } catch (e) {
    console.log(e)

    e.errors.forEach(error =>
      callback({
        statusCode: error.status,
        body: JSON.stringify({
          message: error.detail
        })
      })
    )
  }
}
