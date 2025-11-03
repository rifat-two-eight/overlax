import Link from "next/link";

export default function Page() {
  return (
    <>
      <h1 className="">Hello, Next.js!</h1>
      <Link href="/auth/login">Login</Link>
    </>
  );
}