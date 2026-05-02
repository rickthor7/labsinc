import { Role } from "@/app/generated/prisma/enums";
import "next-auth";

declare module "next-auth" {
    interface User {
        id: string;
        role: Role;
        nama: string;
    }

    interface Session {
        user: {
            id: string;
            nama: string;
            email: string;
            role: Role;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: Role;
        nama: string;
    }
}
