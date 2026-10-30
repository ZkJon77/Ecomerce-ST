import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { OAuth2Client } from 'google-auth-library'
import { MercadoPagoConfig, Preference } from 'mercadopago'

/**
 * Backend Server for Silver Tintas
 * Handles authentication, payment processing via Mercado Pago, and health checks.
 */

const app = express()

// Initialize Mercado Pago Client
const clientMP = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
})

// Initialize Google OAuth2 client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// Middleware
app.use(helmet())
app.use(cors({
  origin: '*', // Permite que qualquer frontend (localhost:3000, etc) acesse a API
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())

/**
 * Health Check Endpoint
 */
app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'backend', ts: Date.now() })
})

/**
 * Google Authentication Endpoint
 */
app.post('/api/auth/google', async (req, res) => {
  const { token } = req.body
  if (!token) return res.status(400).json({ error: 'Token is required' })

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()

    return res.json({
      ok: true,
      user: {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      },
      token: 'mock-jwt-token-123',
    })
  } catch (error) {
    console.error('Google Auth Error:', error)
    return res.status(401).json({ error: 'Invalid Google token' })
  }
})

/**
 * Mercado Pago Payment Creation Endpoint
 * Creates a preference and returns the checkout link.
 *
 * POST /api/checkout/create-payment
 * Body: { cart: Array, userData: Object }
 */
app.post('/api/checkout/create-payment', async (req, res) => {
  const { cart, userData } = req.body
  if (!cart || !userData) return res.status(400).json({ error: 'Missing required data' })

  try {
    const preference = new Preference(clientMP);

    // Convert cart items to Mercado Pago format
    const items = cart.map(item => ({
      title: item.name,
      quantity: item.qty,
      unit_price: item.price,
      currency_id: 'BRL'
    }));

    const result = await preference.create({
      body: {
        items,
        payer: {
          name: userData.name,
          email: userData.email,
        },
        back_urls: {
          success: 'http://localhost:3000/checkout/success',
          failure: 'http://localhost:3000/checkout/failure',
          pending: 'http://localhost:3000/checkout/pending',
        },
        auto_return: 'approved',
      }
    });

    return res.json({
      ok: true,
      init_point: result.init_point, // Link for the customer to pay
      preference_id: result.id
    });
  } catch (error) {
    console.error('Mercado Pago Error:', error);
    return res.status(500).json({ error: 'Payment creation failed' });
  }
})

/**
 * Payment Webhook Endpoint
 * This is where Mercado Pago notifies us about payment status changes.
 */
app.post('/api/webhooks/payment', async (req, res) => {
  const { query, body } = req;

  if (query.topic === 'payment') {
    const paymentId = body.data.id;
    console.log(`Payment notification received for ID: ${paymentId}`);
    // Here you would update your database (e.g., Supabase) to mark the order as paid
  }

  res.sendStatus(200);
})

// Server Configuration
const port = process.env.PORT ? Number(process.env.PORT) : 4000
app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`)
})
