import { Header } from "@/components/sections/header";
import { Footer } from "@/components/sections/footer";
import type { ReactNode } from "react";

export default function HomeLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <Header />
            {children}
            <Footer />
        </>
    );
}
