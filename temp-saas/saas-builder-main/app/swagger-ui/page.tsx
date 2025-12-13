"use client";
import React, { useEffect, useRef } from "react";
import SwaggerUI from "swagger-ui-dist/swagger-ui-es-bundle";
import "swagger-ui-dist/swagger-ui.css";

export default function SwaggerUiPage() {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!el.current) return;
    SwaggerUI({ domNode: el.current, url: "/api/openapi.json" });
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Swagger UI</h1>
      <div ref={el} />
    </main>
  );
}
