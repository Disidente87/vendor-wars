// Simplified KV storage - in production this would use a real KV store
const memoryStore = new Map<string, any>();

export async function setUserNotificationDetails(
  fid: number,
  notificationDetails: any
): Promise<void> {
  const key = `user:${fid}:notifications`;
  memoryStore.set(key, notificationDetails);
}

export async function getUserNotificationDetails(fid: number): Promise<any | null> {
  const key = `user:${fid}:notifications`;
  return memoryStore.get(key) || null;
}

export async function deleteUserNotificationDetails(fid: number): Promise<void> {
  const key = `user:${fid}:notifications`;
  memoryStore.delete(key);
} 