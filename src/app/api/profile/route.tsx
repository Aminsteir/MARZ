// API Route: /api/profile  - Retrieve and update authenticated user's profile
import { NextRequest, NextResponse } from "next/server";
import db from "@/db/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { UserRole } from "@/db/models";

/**
 * GET handler: fetch user profile details depending on their role (Buyer, Seller, Helpdesk)
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // getting email of buyers
  const email = session.user.email;
  const role = session.user.role as UserRole;

  let profile = null;

  if (role === "Buyer") {
    profile = db
      .prepare(
        `SELECT
            u.email,
            b.business_name,
            a.street_num,
            a.street_name,
            z.city,
            z.state,
            z.zipcode
        FROM Users u
        JOIN Buyer b ON u.email = b.email
        JOIN Address a ON b.buyer_address_id = a.address_id
        JOIN Zipcode_Info z ON a.zipcode = z.zipcode
        WHERE u.email = ?`,
      )
      .get(email);
  } else if (role === "Seller") {
    profile = db
      .prepare(
        `SELECT
            u.email,
            s.business_name,
            a.street_num,
            a.street_name,
            z.city,
            z.state,
            z.zipcode,
            s.bank_routing_number,
            s.bank_account_number,
            s.balance
        FROM Users u
        JOIN Sellers s ON u.email = s.email
        JOIN Address a ON s.seller_address_id = a.address_id
        JOIN Zipcode_Info z ON a.zipcode = z.zipcode
        WHERE u.email = ?`,
      )
      .get(email);
  } else if (role === "Helpdesk") {
    profile = db
      .prepare(
        `SELECT
            u.email,
            h.position
        FROM Users u
        JOIN Helpdesk h ON u.email = h.email
        WHERE u.email = ?`,
      )
      .get(email);
  }

  // check if the profile retrieved is valid
  if (!profile) {
    return NextResponse.json(
      { error: "profile was not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(profile, { status: 200 });
}

/**
 * PUT handler: update user profile fields based on role
 */
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
  }

  // getting email of buyers
  const email = session.user.email;
  const body = await req.json();

  if (!body.email || email !== body.email) {
    return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
  }

  const role = session.user.role as UserRole;

  if (role === "Buyer") {
    const { business_name, street_num, street_name, city, state, zipcode } =
      body;

    if (
      !business_name ||
      !street_num ||
      !street_name ||
      !city ||
      !state ||
      !zipcode
    ) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // get and check Buyer email
    const buyer = db.prepare("SELECT * FROM Buyer WHERE email = ?").get(email);
    if (!buyer) {
      return NextResponse.json(
        { error: "Buyer was not found" },
        { status: 404 },
      );
    }

    // get and check Buyer address
    const address = db
      .prepare("SELECT buyer_address_id FROM Buyer WHERE email = ?")
      .get(email) as { buyer_address_id: string } | undefined;
    const address_id = address?.buyer_address_id;
    if (!address_id) {
      return NextResponse.json(
        { error: "Address was not found" },
        { status: 404 },
      );
    }

    // get and check zipcode
    const zc = db
      .prepare("SELECT zipcode FROM Zipcode_Info WHERE zipcode = ?")
      .get(zipcode);
    if (!zc) {
      db.prepare(
        "INSERT INTO Zipcode_Info (zipcode, city, state) VALUES (?, ?, ?)",
      ).run(zipcode, city, state);
    }

    // Updating the address
    db.prepare(
      `UPDATE Address
        SET street_num = ?, street_name = ?, zipcode = ?
        WHERE address_id = ?
      `,
    ).run(street_num, street_name, zipcode, address_id);

    // Updating business name
    db.prepare(
      `UPDATE Buyer
        SET business_name = ?
        WHERE email = ?
      `,
    ).run(business_name, email);
  } else if (role === "Seller") {
    const {
      business_name,
      street_num,
      street_name,
      city,
      state,
      zipcode,
      bank_routing_number,
      bank_account_number,
    } = body;

    if (
      !business_name ||
      !street_num ||
      !street_name ||
      !city ||
      !state ||
      !zipcode ||
      !bank_routing_number ||
      !bank_account_number
    ) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const seller = db
      .prepare("SELECT * FROM Sellers WHERE email = ?")
      .get(email);
    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    const address = db
      .prepare("SELECT business_address_id FROM Seller WHERE email = ?")
      .get(email) as { business_address_id: string } | undefined;
    const address_id = address?.business_address_id;
    if (!address_id) {
      return NextResponse.json(
        { error: "Address was not found" },
        { status: 404 },
      );
    }

    // get and check zipcode
    const zc = db
      .prepare("SELECT zipcode FROM Zipcode_Info WHERE zipcode = ?")
      .get(zipcode);
    if (!zc) {
      db.prepare(
        "INSERT INTO Zipcode_Info (zipcode, city, state) VALUES (?, ?, ?)",
      ).run(zipcode, city, state);
    }

    // Updating the address
    db.prepare(
      `UPDATE Address
        SET street_num = ?, street_name = ?, zipcode = ?
        WHERE address_id = ?
      `,
    ).run(street_num, street_name, zipcode, address_id);

    db.prepare(
      `UPDATE Sellers
        SET business_name = ?, bank_routing_number = ?, bank_account_number = ?
        WHERE email = ?
      `,
    ).run(business_name, bank_routing_number, bank_account_number, email);
  } else if (role === "Helpdesk") {
    const { position } = body;

    if (!position) {
      return NextResponse.json(
        { error: "Missing position field" },
        { status: 400 },
      );
    }

    db.prepare(`UPDATE Helpdesk SET position = ? WHERE email = ?`).run(
      position,
      email,
    );
  }

  // Returning success message that the profile has been updated
  return NextResponse.json(
    { message: "Profile updated successfully!" },
    { status: 200 },
  );
}
