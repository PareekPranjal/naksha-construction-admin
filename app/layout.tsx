import "./globals.css";
import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import { ConfirmProvider } from "@/components/Confirm";

export const metadata: Metadata = {
  title: "Naksha Admin",
  description: "Naksha Construction CMS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConfirmProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 px-8 py-8 overflow-x-hidden">{children}</main>
          </div>
        </ConfirmProvider>
      </body>
    </html>
  );
}
