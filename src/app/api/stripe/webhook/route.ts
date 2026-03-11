// TODO: Implement Stripe webhook handler — see CURSOR.md Section 15
// Handle: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // 1. Verify Stripe signature using STRIPE_WEBHOOK_SECRET
  // 2. Parse event type
  // 3. Update user plan in dashboard DB
  // 4. Return 200
  return NextResponse.json({ received: true });
}
