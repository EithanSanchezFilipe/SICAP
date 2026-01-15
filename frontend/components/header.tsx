import Link from "next/link";

const APP_NAME = "SICAP";



export default function Header() {
  return (
    <header className="w-full bg-white border-b border-gray-200 py-4 z-40 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-extrabold text-black">
              {APP_NAME}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}