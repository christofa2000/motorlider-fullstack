'use client';

import Link from 'next/link';

export default function AdminLink() {
  return (
    <Link href="/admin/products" className="btn btn-secondary">
      Admin
    </Link>
  );
}