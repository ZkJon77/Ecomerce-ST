import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { OAuth2Client } from 'google-auth-library'

/**
 * Backend Server for Silver Tintas
 * Handles authentication, payment simulation, and health checks.
 *
 * This server acts as the bridge between the Next.js frontend and
 * external services (like Google Auth and Payment Gateways).
 */

const app = express()

// Initialize Google OAuth2 client for token verification
// GOOGLE_CLIENT_ID should be stored in .env for security
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// Middleware
app.use(helmet()) // Adds security headers to protect against common attacks
app.use(cors())   // Enables Cross-Origin Resource Sharing for the frontend
app.use(express.json()) // Parses incoming JSON request bodies

/**
 * Health Check Endpoint
 * Used by load balancers or monitoring tools to verify server status.
 */
app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'backend', ts: Date.now() })
})

/**
 * Google Authentication Endpoint
 * Receives an ID Token from the frontend, verifies it with Google,
 * and returns a session token if valid.
 *
 * POST /api/auth/google
 * Body: { token: string }
 */
app.post('/api/auth/google', async (req, res) => {
  const { token } = req.body
  if (!token) return res.status(400).json({ error: 'Token is required' })

  try {
    // Verify the ID token using the google-auth-library
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()

    // Return user data and a mock JWT token for session management
    return res.json({
      ok: true,
      user: {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      },
      token: 'mock-jwt-token-123', // In a real app, generate a real JWT here
    })
  } catch (error) {
    console.error('Google Auth Error:', error)
    return res.status(401).json({ error: 'Invalid Google token' })
  }
})

/**
 * Payment Creation Endpoint (Simulated)
 * Handles the creation of payments for different methods (Pix, Boleto, Card).
 *
 * POST /api/checkout/create-payment
 * Body: { cart: Array, userData: Object, paymentMethod: 'pix' | 'boleto' | 'card' }
 */
app.post('/api/checkout/create-payment', async (req, res) => {
  const { cart, userData, paymentMethod } = req.body
  if (!cart || !userData) return res.status(400).json({ error: 'Missing required data' })

  try {
    // Generate a unique payment ID
    const paymentId = \`pay_\${Math.random().toString(36).substr(2, 9)}\`;

    // Base payment response
    const response = {
      id: paymentId,
      status: 'pending',
      amount: cart.reduce((sum, item) => sum + item.price * item.qty, 0),
      paymentMethod,
    }

    // Simulate specific payment method responses
    if (paymentMethod === 'pix') {
      // Return a mock QR code image and a copy-paste string
      response.qrCode = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PIX-MOCK-DATA'
      response.copyPaste = '00020126360014BR.GOV.BCB.PIX0000000000'
    } else if (paymentMethod === 'boleto') {
      // Return a link to a simulated PDF boleto
      response.boletoUrl = 'https://example.com/boleto-pdf'
    } else if (paymentMethod === 'card') {
      // Credit card payments are simulated as instantly approved
      response.status = 'approved'
    }

    return res.json({ ok: true, payment: response })
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

// Server Configuration
const port = process.env.PORT ? Number(process.env.PORT) : 4000
app.listen(port, () => {
  console.log(\`Backend listening on http://localhost:\${port}\`)
})
