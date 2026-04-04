import { Navbar } from "./Navbar";

export function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Navbar />
      <main className="flex-1 bg-slate-50 relative">
        {children}
      </main>
      <footer className="border-t py-6 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} ICU Mortality Predictor. For research and demonstration purposes only.
        </div>
      </footer>
    </div>
  );
}
