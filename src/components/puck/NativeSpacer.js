import React from 'react';
import { View } from 'react-native';

/**
 * NativeSpacer — Vertical spacing
 * Maps to Puck: Spacer
 * 
 * Puck spacing values: "mt-1" through "mt-5", "flat-spacing-1", etc.
 * We map these to pixel values.
 */
const SPACING_MAP = {
  'mt-1': 8,
  'mt-2': 12,
  'mt-3': 16,
  'mt-4': 20,
  'mt-5': 28,
  'flat-spacing-1': 20,
  'flat-spacing-2': 24,
  'flat-spacing-3': 28,
  'flat-spacing-4': 32,
  'flat-spacing-5': 36,
  'flat-spacing-9': 48,
};

const NativeSpacer = ({ spacing }) => {
  const height = SPACING_MAP[spacing] || 20;
  return <View style={{ height }} />;
};

export default NativeSpacer;
