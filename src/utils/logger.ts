export const logger = {
  info(info: string, data?: unknown): void {
    console.info("\n", info, "\t", data ?? "", "\n");
  },
  todo(info: string): void {
    console.warn("\nTODO:", info, "\n");
  },
  debug(info: string, data?: unknown): void {
    console.debug("\n", info, "\t", data ?? "", "\n");
  },
  error(msg: string, error?: unknown) {
    console.error("\n", msg, "\t", error ?? "", "\n");
  },
};
