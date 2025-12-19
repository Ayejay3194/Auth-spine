import vault from "node-vault";

export function vaultClient() {
  const addr = process.env.VAULT_ADDR;
  const token = process.env.VAULT_TOKEN;
  if (!addr || !token) throw new Error("Vault not configured");
  return vault({ endpoint: addr, token });
}

/**
 * Example: KV v2 read
 * path like: secret/data/app
 */
export async function readSecret(path: string) {
  const v = vaultClient();
  const res = await v.read(path);
  return (res as any).data?.data ?? (res as any).data;
}
