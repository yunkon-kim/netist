import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();

        if (username !== process.env.NEXT_PUBLIC_NETIST_ADMIN_USERNAME) {
            return NextResponse.json(
                { success: false, error: "Invalid credentials" },
                { status: 401 }
            );
        }

        const hashedPassword = process.env.NEXT_PUBLIC_NETIST_ADMIN_PASSWORD;
        const isValid = await bcrypt.compare(password, hashedPassword || "");

        if (isValid) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(
                { success: false, error: "Invalid credentials" },
                { status: 401 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
