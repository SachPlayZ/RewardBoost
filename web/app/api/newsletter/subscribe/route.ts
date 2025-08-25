import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Basic email validation
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingSubscription = await prisma.newsletterSubscription.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingSubscription) {
      if (existingSubscription.subscribed) {
        return NextResponse.json(
          { message: "Email is already subscribed" },
          { status: 200 }
        );
      } else {
        // Re-subscribe if previously unsubscribed
        await prisma.newsletterSubscription.update({
          where: { email: email.toLowerCase() },
          data: { subscribed: true },
        });
        return NextResponse.json(
          { message: "Successfully re-subscribed" },
          { status: 200 }
        );
      }
    }

    // Create new subscription
    await prisma.newsletterSubscription.create({
      data: {
        email: email.toLowerCase(),
        subscribed: true,
      },
    });

    return NextResponse.json(
      { message: "Successfully subscribed to newsletter" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
