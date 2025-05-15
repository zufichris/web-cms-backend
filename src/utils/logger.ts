import { env } from "@app/config/env";

export const logger = {
  info(info: string, data?: unknown): void {
    if (!env.in_prod) console.info("\n ℹ️ ", info, "\t", data ?? "", "\n");
  },
  todo(info: string): void {
    if (!env.in_prod) console.warn("\n 📝 TODO:", info, "\n");
  },
  warn(info: string, data?: unknown): void {
    if (!env.in_prod) console.warn("\n ⚠️ Warning:", info, "\n", data);
  },
  debug(info: string, data?: unknown): void {
    if (!env.in_prod) console.debug("\n 🔍 ", info, "\t", data ?? "", "\n");
  },
  error(msg: string, error?: unknown) {
    console.error("\n ❌ ", msg, "\t", error ?? "", "\n");
  },
};
