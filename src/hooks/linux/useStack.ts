import { useState } from "react";
import type { LinuxSurfaceId } from "../../types";

export function useStack() {
  const [activeSurfaceId, setActiveSurfaceId] = useState<LinuxSurfaceId | null>(null);
  const [surfaceOrder, setSurfaceOrder] = useState<LinuxSurfaceId[]>([]);

  const bringAnySurfaceToFront = (surfaceId: LinuxSurfaceId) => {
    setActiveSurfaceId(surfaceId);
    setSurfaceOrder((current) => [...current.filter((id) => id !== surfaceId), surfaceId]);
  };

  const removeSurfaceFromOrder = (surfaceId: LinuxSurfaceId) => {
    setSurfaceOrder((current) => current.filter((id) => id !== surfaceId));
    setActiveSurfaceId((current) => (current === surfaceId ? null : current));
  };

  const getSurfaceZIndex = (surfaceId: LinuxSurfaceId) => {
    const orderIndex = surfaceOrder.indexOf(surfaceId);
    return orderIndex === -1 ? 20 : 20 + orderIndex;
  };

  return {
    activeSurfaceId,
    bringAnySurfaceToFront,
    removeSurfaceFromOrder,
    getSurfaceZIndex,
  };
}
