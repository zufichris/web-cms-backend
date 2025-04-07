export const logger = {
  info(info: string, data?: unknown): void {
    console.info("\n ℹ️ ", info, "\t", data ?? "", "\n");
  },
  todo(info: string): void {
    console.warn("\n 📝 TODO:", info, "\n");
  },
  warn(info: string,data?: unknown): void {
    console.warn("\n ⚠️ Warning:", info, "\n",data);
  },
  debug(info: string, data?: unknown): void {
    console.debug("\n 🔍 ", info, "\t", data ?? "", "\n");
  },
  error(msg: string, error?: unknown) {
    console.error("\n ❌ ", msg, "\t", error ?? "", "\n");
  },
};