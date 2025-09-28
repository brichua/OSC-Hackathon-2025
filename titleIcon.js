import React from "react";
import { FontAwesome } from '@expo/vector-icons';
import { colors } from "./style";

export function getTitleIcon(title, size = 22, color, style) {
  if (!title) return null;
  const map = {
    'Relentless': 'bolt',
    'Dawnbringer': 'sun',
    'Shadowbane': 'moon',
    'Habit Hero': 'star',
    'Unyielding': 'shield',
    'Night Conqueror': 'moon-o',
    'Hopebringer': 'heart',
    'Ironwilled': 'diamond',
    'Motivator': 'thumbs-up',
    'Steadfast': 'anchor',
    'Vampire Vanquisher': 'medkit',
    'Resilient': 'leaf',
    'Streakmaster': 'fire',
    'Redeemer': 'refresh',
    'Unbreakable': 'lock',
    'Comeback Kid': 'arrow-up',
    'Consistent': 'repeat',
    'Phoenix': 'fire',
    'Sanguine': 'tint',
    'Lightkeeper': 'lightbulb-o',
  };
  for (const key in map) {
    if (title.includes(key)) {
      return React.createElement(FontAwesome, {
        name: map[key],
        size: size,
        color: color || colors.prussianBlue,
      });
    }
  }
  return React.createElement(FontAwesome, {
    name: "star",
    size: size,
    color: color || colors.prussianBlue,
    style: { marginRight: 4, ...(style || {}) }
  });
}
