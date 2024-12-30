import { DelinquencyBucket } from "@prisma/client";

export function getDelinquencyBucket(dueDate: Date): DelinquencyBucket {
  const today = new Date();
  const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff <= 0) return 'CURRENT';
  if (daysDiff <= 10) return 'PAST_DUE_10';
  if (daysDiff <= 30) return 'PAST_DUE_30';
  if (daysDiff <= 60) return 'PAST_DUE_60';
  if (daysDiff <= 90) return 'PAST_DUE_90';
  return 'PAST_DUE_OVER_90';
}