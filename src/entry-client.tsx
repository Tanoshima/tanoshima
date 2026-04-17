import { mount, StartClient } from "@solidjs/start/client";

// biome-ignore lint/style/noNonNullAssertion: element is guaranteed by entry-server.tsx
mount(() => <StartClient />, document.getElementById("app")!);
