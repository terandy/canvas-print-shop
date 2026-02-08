# Pre-Production Testing Checklist

Complete these tests before deploying to production to ensure all critical flows work correctly.

## Prerequisites

- [ ] Stripe test API keys configured in `.env.local`
- [ ] Resend API key configured
- [ ] ADMIN_EMAIL set for admin notifications
- [ ] Database connection working

## Test 1: Full Checkout Flow ✅

**What this tests:** Order creation when customer pays + Confirmation emails

### Steps:

1. **Start Stripe webhook listener:**
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhooks
   ```

   Copy the webhook signing secret (`whsec_...`) and add to `.env.local`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

2. **Start dev server:**
   ```bash
   npm run dev
   ```

3. **Make a test purchase:**
   - Go to http://localhost:3000
   - Browse products and click on "Canvas Prints"
   - Upload a test image
   - Select size, frame, depth options
   - Add to cart
   - Go to checkout
   - Fill in test info:
     - Email: your-test-email@example.com
     - Card: `4242 4242 4242 4242`
     - Expiry: Any future date (e.g., 12/25)
     - CVC: Any 3 digits (e.g., 123)
     - Name: Test Customer
     - Address: Any test address
   - Complete payment

4. **Verify order was created:**
   ```bash
   npm run verify:order
   ```

   Should show:
   - ✅ Order created in database
   - ✅ Correct customer info
   - ✅ Correct items and pricing
   - ✅ Correct shipping address
   - ✅ Payment status: "paid"
   - ✅ Stripe session ID present

5. **Verify emails were sent:**
   - Check https://resend.com/emails for sent emails
   - Check your test email inbox for customer confirmation
   - Check admin email inbox for admin notification

   **Customer email should include:**
   - ✅ Order number
   - ✅ Items purchased with prices
   - ✅ Subtotal, shipping, tax, total
   - ✅ Shipping address

   **Admin email should include:**
   - ✅ Order number
   - ✅ Customer details
   - ✅ Order items
   - ✅ Total amount
   - ✅ Link to admin order page

6. **Check Stripe dashboard:**
   - Go to https://dashboard.stripe.com/test/payments
   - ✅ Payment appears as successful
   - ✅ Correct amount charged

### Troubleshooting:

- **Order not created:** Check webhook logs in terminal
- **Email not sent:** Check Resend API key and verify domain
- **Wrong data:** Check cart-to-order conversion logic

---

## Test 2: Tracking Email Notification 📧

**What this tests:** Customer receives tracking update email

### Option A: Test with existing order

```bash
npm run test:tracking 6
```

This sends a test tracking email for order #6.

### Option B: Test with new order

1. After completing Test 1, update the order with tracking:
   ```bash
   npx tsx -e "
   import * as dotenv from 'dotenv';
   import { resolve } from 'path';
   dotenv.config({ path: resolve(__dirname, '.env.local') });

   import { addTrackingInfo } from './src/lib/db/queries/orders.js';
   import { sendShippingUpdate } from './src/lib/email/send.js';
   import { getOrder } from './src/lib/db/queries/orders.js';

   async function test() {
     const orderId = 'YOUR_ORDER_ID_HERE'; // From verify:order output
     await addTrackingInfo(orderId, '2010505530128336', 'https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=2010505530128336');
     const order = await getOrder(orderId);
     await sendShippingUpdate(order, order.trackingNumber, order.trackingUrl, 'en');
     console.log('✅ Tracking email sent!');
   }

   test().then(() => process.exit(0));
   "
   ```

2. **Verify tracking email:**
   - Check https://resend.com/emails
   - Check customer email inbox

   **Email should include:**
   - ✅ Order number
   - ✅ Tracking number
   - ✅ Link to track package
   - ✅ Professional formatting

---

## Test 3: Admin Flow Testing 🔧

**What this tests:** Admin can view and manage orders

### Steps:

1. **Login to admin:**
   ```bash
   npm run dev
   ```
   Go to http://localhost:3000/en/admin

2. **View orders:**
   - ✅ Orders list shows all orders
   - ✅ Order details page shows complete info
   - ✅ Customer details visible
   - ✅ Order items with images
   - ✅ Shipping address

3. **Update order status:**
   - Try changing order status (pending → processing → shipped)
   - ✅ Status updates in database
   - ✅ Admin can add tracking number
   - ✅ Tracking email triggers when tracking added

---

## Test 4: Edge Cases & Error Handling 🐛

### Test abandoned checkout:
1. Add item to cart
2. Start checkout but close browser
3. ✅ Cart persists
4. ✅ No order created
5. ✅ Can resume checkout

### Test failed payment:
1. Use test card: `4000 0000 0000 0002` (decline)
2. ✅ Payment fails gracefully
3. ✅ No order created
4. ✅ User shown error message
5. ✅ Can retry with valid card

### Test webhook failures:
1. Stop webhook listener
2. Complete checkout
3. Restart webhook listener
4. ✅ Webhook retries (check Stripe dashboard)

---

## Production Deployment Checklist ✈️

Before deploying, ensure:

- [ ] All Test 1 steps pass ✅
- [ ] All Test 2 steps pass ✅
- [ ] All Test 3 steps pass ✅
- [ ] `.env` production variables set on Vercel:
  - [ ] `STRIPE_SECRET_KEY` (live key, starts with `sk_live_`)
  - [ ] `STRIPE_WEBHOOK_SECRET` (production webhook secret)
  - [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (live key)
  - [ ] `POSTGRES_URL` (production database)
  - [ ] `RESEND_API_KEY`
  - [ ] `ADMIN_EMAIL`
  - [ ] `ORDER_EMAIL` (verified domain in Resend)
- [ ] Stripe webhook configured for production:
  - Go to https://dashboard.stripe.com/webhooks
  - Create webhook: `https://canvasprintshop.ca/api/stripe/webhooks`
  - Select event: `checkout.session.completed`
  - Copy webhook secret to Vercel env vars
- [ ] Test one real transaction in production
- [ ] Monitor first few orders closely

---

## Quick Reference Commands

```bash
# Verify latest order
npm run verify:order

# Test tracking email
npm run test:tracking <order_number>

# Import Shopify orders
npm run import:orders

# Start webhook listener
stripe listen --forward-to localhost:3000/api/stripe/webhooks

# Check database directly
npx tsx -e "import { db } from './src/lib/db/index.js'; ..."
```

---

## Support Resources

- **Stripe Webhooks:** https://dashboard.stripe.com/test/webhooks
- **Resend Emails:** https://resend.com/emails
- **Vercel Logs:** https://vercel.com/canvas-print-shop
- **Database (Vercel):** https://vercel.com/canvas-print-shop/stores
