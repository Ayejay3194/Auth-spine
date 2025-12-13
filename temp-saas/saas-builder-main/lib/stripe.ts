import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export const getStripeProducts = async () => {
  const products = await stripe.products.list({
    active: true,
    limit: 100,
  })
  return products
}

export const createCheckoutSession = async (
  priceId: string,
  customerId: string,
  successUrl: string,
  cancelUrl: string
) => {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
  })
  return session
}

export const createCustomer = async (email: string, name?: string) => {
  const customer = await stripe.customers.create({
    email,
    name,
  })
  return customer
}

export const getSubscription = async (subscriptionId: string) => {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  return subscription
}

export const cancelSubscription = async (subscriptionId: string) => {
  const subscription = await stripe.subscriptions.cancel(subscriptionId)
  return subscription
}
