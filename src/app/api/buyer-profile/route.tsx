import { NextRequest, NextResponse } from "next/server";
import db from "@/db/db";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route"
import { v4 as uuidv4 } from "uuid";

/** GET method: reutnrs the buyer's profile info. */
export async function GET(req: NextRequest) {
    // getting current session and checking that it's valid
    const session = await getServerSession(authOptions);
    if (!session.user?.email) {
        return NextResponse.json({error: "unauthorized"}, {status:401});
    } 

    // getting email of buyers
    const email = session.user.email;
    
    // retrieving Buyer info./profile to return by joining Buyer, Address, and Zipcode_Info
    const profile = db.prepare(`
        SELECT 
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
        WHERE u.email = ?
    `).get(email);

    // check if the profile retrieved is valid
    if(!profile) {
        return NextResponse.json({error: "profile was not found"}, {status:404});
    }

    return NextResponse.json(profile, {status: 200});
}