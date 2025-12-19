import { useEffect } from "react";
import { XR, createXRStore } from "@react-three/xr";
export const xrStore = createXRStore({ emulate: false });

export default function XRWrapper({ children }) {
  return (
    <XR store={xrStore}>
      {children}
    </XR>
  );
}