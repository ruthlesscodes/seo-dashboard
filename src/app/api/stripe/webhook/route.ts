import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const VALID_PLANS = ["FREE", "STARTER", "GROWTH", "SCALE", "ENTERPRISE"];

const PRICE_TO_PLAN: Record<string, string> = {
  [process.env.STRIPE_STARTER_PRICE_ID || ""]: "STARTER",
  [process.env.STRIPE_GROWTH_PRICE_ID || ""]: "GROWTH",
  [process.env.STRIPE_SCALE_PRICE_ID || ""]: "SCALE",
};

function priceIdToPlan(priceId: string | undefined): string | null {
  if (!priceId) return null;
  return PRICE_TO_PLAN[priceId] || null;
}

async function updateUserPlan(orgId: string, plan: string) {
  if (!VALID_PLANS.includes(plan)) return;
  // Update all dashboard users belonging to this org
  await prisma.user.updateMany({
    where: { seoOrgId: orgId },
    data: { seoPlan: plan },
  });
}

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 503 }
    );
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orgId = session.metadata?.orgId;
      let plan = session.metadata?.plan || null;

      if (!plan && session.subscription) {
        try {
          const sub = await stripe.subscriptions.retrieve(
            session.subscription as string,
            { expand: ["items.data.price"] }
          );
          const priceId = sub.items?.data?.[0]?.price?.id;
          plan = priceIdToPlan(priceId) || "STARTER";
        } catch {
          plan = "STARTER";
        }
      }

      if (orgId && plan) {
        await updateUserPlan(orgId, plan);
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const priceId = sub.items?.data?.[0]?.price?.id;
      const plan = priceIdToPlan(priceId);
      // Find org by looking up the customer's metadata or by matching stripeSubId
      const orgId = sub.metadata?.orgId;
      if (orgId && plan) {
        await updateUserPlan(orgId, plan);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const orgId = sub.metadata?.orgId;
      if (orgId) {
        await updateUserPlan(orgId, "FREE");
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
