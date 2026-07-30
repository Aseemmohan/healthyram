import Ask from "./Ask";
import "./globals.css";

export const metadata = {
  title: "Healthyram — where the calories in Indian food actually are",
  description:
    "Honest teardowns of thirty everyday Indian dishes. Which component is doing the damage, and three ways to fix it.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Ask />
      </body>
    </html>
  );
}