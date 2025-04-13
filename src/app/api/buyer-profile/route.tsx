import { NextRequest, NextResponse } from "next/server";
import db from "@/db/db";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route"
import { v4 as uuidv4 } from "uuid";

/** GET method: reutnrs the buyer's profile info. **/
export async function GET(req: NextRequest) {
    // getting current session and checking that it's valid
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
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

/** PUT method: update the Buyer's profile info. w/ the inputted data **/
export async function PUT(req:NextRequest) {
    // getting current session and checking that it's valid
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({error: "Unauthorized User"}, {status:401});
    } 

    // getting email of buyers
    const email = session.user.email;
    const body = await req.json();
    // getting the input
    const {
        business_name,
        street_number,
        street_name,
        city,
        state,
        zipcode,
        password
    } = body;

    // Checking Inputs 
    // checking number of fields
    if (!business_name || !street_number || !street_name || !city || !state || !zipcode) {
        return NextResponse.json({error: "Missing fileds"}, {status: 400});
    }

    // get and check Buyer email
    const buyer = db.prepare("SELECT * FROM Buyer WHERE email = ?").get(email);
    if(!buyer) {
        return NextResponse.json({error: "Buyer was not found"}, {status:404});
    }

    // get and check Buyer address
    const address = db
        .prepare("SELECT buyer_address_id FROM Buyer WHERE email = ?")
        .get(email) as { buyer_address_id: string } | undefined;
    const address_id = address?.buyer_address_id;
    if (!address_id) {
        return NextResponse.json({error: "Address was not found"}, {status: 404});
    }

    // get and check zipcode 
    const zc = db
        .prepare("SELECT zipcode FROM Zipcode_Info WHERE zipcode = ?")
        .get(zipcode);
    if(!zc) {
        db.prepare("INSERT INTO Zipcode_Info (zipcode, city, state) VALUES (?, ?, ?)").run(zipcode, city, state);
    }
    
    // Updating the address
    db.prepare(`
        UPDATE Address
        SET street_num = ?, street_name = ?, zipcode = ?
        WHERE address_id = ?
    `).run(street_number, street_name, zipcode, address_id);

    // Updating business name
    db.prepare(`
        UPDATE Buyer
        SET business_name = ?
        WHERE email = ?
    `).run(business_name, email);

    // Udpating pw if inputted (not empty string) --> making sure to hash it !!!
    if (password && password.trim() !== "") {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.prepare("UPDATE Users SET password = ? WHERE email = ?" ).run(hashedPassword, email);
    }

    // Returning success message that the profile has been udpated
    return NextResponse.json({message: "Profile updated successfully! :]"}, {status: 200});
}