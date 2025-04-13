import { NextRequest, NextResponse } from "next/server";
import db from "@/db/db";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route"
import { v4 as uuidv4 } from "uuid";