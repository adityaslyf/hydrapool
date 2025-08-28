'use client';

import { useMemo } from 'react';
import type { SplitCalculation } from '@/types';

interface UseSplitCalculationProps {
  totalAmount: number;
  participantIds: string[];
  creatorId: string;
  splitType: 'equal' | 'custom';
  customAmounts: Record<string, number>;
}

export function useSplitCalculation({
  totalAmount,
  participantIds,
  creatorId,
  splitType,
  customAmounts,
}: UseSplitCalculationProps): SplitCalculation {
  const calculation = useMemo(() => {
    const allParticipantIds = [creatorId, ...participantIds];
    const totalParticipants = allParticipantIds.length;
    let participantAmounts: Record<string, number> = {};
    let creatorAmount = 0;
    let isValid = true;
    let remainingAmount = 0;

    if (totalAmount <= 0 || totalParticipants === 0) {
      return {
        totalAmount,
        totalParticipants,
        splitType,
        participantAmounts: {},
        creatorAmount: 0,
        isValid: false,
        remainingAmount: totalAmount,
      };
    }

    if (splitType === 'equal') {
      const perPersonAmount = totalAmount / totalParticipants;
      allParticipantIds.forEach((id) => {
        participantAmounts[id] = perPersonAmount;
      });
      creatorAmount = perPersonAmount;
      remainingAmount = 0; // For equal split, it should always be 0
      isValid = true;
    } else {
      // Custom split
      let allocatedAmount = 0;
      allParticipantIds.forEach((id) => {
        const amount = customAmounts[id] || 0;
        participantAmounts[id] = amount;
        allocatedAmount += amount;
      });

      creatorAmount = customAmounts[creatorId] || 0;
      remainingAmount = totalAmount - allocatedAmount;

      // Allow a small floating point tolerance
      isValid = Math.abs(remainingAmount) < 0.01;
    }

    return {
      totalAmount,
      totalParticipants,
      splitType,
      participantAmounts,
      creatorAmount,
      isValid,
      remainingAmount,
    };
  }, [totalAmount, participantIds, creatorId, splitType, customAmounts]);

  return calculation;
}
