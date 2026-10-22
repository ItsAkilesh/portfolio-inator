/**
 * File: netPolicy.ts
 * Purpose: Decides whether an IP address is on the public internet, so server-side link checks can
 *          never reach the developer's machine, LAN, cloud metadata endpoints or other reserved ranges.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { BlockList, isIP } from "node:net";

/* [network, prefix length] of non-public IPv4 ranges (RFC 6890 and friends). */
const IPV4_BLOCKED: readonly (readonly [string, number])[] = [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.88.99.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
];

const IPV6_BLOCKED: readonly (readonly [string, number])[] = [
  ["::", 128],
  ["::1", 128],
  /* IPv4-mapped (any spelling); real lookups return plain IPv4 for public hosts. */
  ["::ffff:0:0", 96],
  ["64:ff9b::", 96],
  ["64:ff9b:1::", 48],
  ["100::", 64],
  ["2001::", 23],
  ["2001:db8::", 32],
  ["2002::", 16],
  ["fc00::", 7],
  ["fe80::", 10],
  ["ff00::", 8],
];

/* Separate lists: one BlockList matches IPv4 addresses against IPv4-mapped IPv6 rules too. */
const blockedV4 = new BlockList();
const blockedV6 = new BlockList();
for (const [net, prefix] of IPV4_BLOCKED)
  blockedV4.addSubnet(net, prefix, "ipv4");
for (const [net, prefix] of IPV6_BLOCKED)
  blockedV6.addSubnet(net, prefix, "ipv6");

export function isPublicAddress(address: string): boolean {
  const version = isIP(address);
  if (version === 4) return !blockedV4.check(address, "ipv4");
  if (version === 6) return !blockedV6.check(address, "ipv6");
  return false;
}
