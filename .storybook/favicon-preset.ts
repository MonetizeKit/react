import { resolve } from "node:path";

/**
 * Storybook 8 injects its own `./favicon.svg` outside `managerHead`.
 * Suppress it so the canonical `/brand/logo/icon.svg` is the only manager favicon.
 * Its resolver requires a file path, but only emits links for `.svg` and `.ico` files.
 */
export const favicon = () => resolve(".storybook/public/manifest.webmanifest");
