import rawDestinations from "@/data/destinations.json";
import type { Destination } from "./types";

export const destinations: Destination[] = rawDestinations as Destination[];

export function getDestinationById(id: string): Destination | undefined {
  return destinations.find((d) => d.id === id);
}

export function formatDestinationLabel(d: Destination): string {
  return `${d.ville}, ${d.pays}`;
}
