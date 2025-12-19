import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container">
      <div className="card">
        <h1 style={{ marginTop: 0 }}>Ops Dashboard</h1>
        <p className="muted">Admin lives at /admin.</p>
        <Link className="btn" href="/admin">Open Admin</Link>
      </div>
    </div>
  );
}
