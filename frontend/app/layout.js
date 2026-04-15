export const metadata = {
  title: "Week5 Frontend",
  description: "Frontend Next.js para projeto CI/CD e EKS",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
