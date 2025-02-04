import express, { RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";

const router = express.Router();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

const createCheckoutSessionHandler: RequestHandler = async (req, res) => {
  try {
    const { userId, priceId, password } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Example if you need to verify a password:
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer: user.stripeCustomerId || undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: "https://your-app.com/success",
      cancel_url: "https://your-app.com/cancel",
    });

    res.json({ url: session.url, token });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

router.post("/create-checkout-session", createCheckoutSessionHandler);

export default router;
