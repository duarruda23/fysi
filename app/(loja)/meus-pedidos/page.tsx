"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MeusPedidosRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/minha-conta");
  }, [router]);
  return null;
}
