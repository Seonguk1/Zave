// data/journey.js
const TEMP_IMAGE = require('../assets/images/icon.png');

export const journey = [
  {
    id: 'agriculture',
    label: '농업',
    icon: TEMP_IMAGE,
    recipe: ['farm', 'river'],
    unlocked: true
  },
  {
    id: 'village',
    label: '마을',
    icon: TEMP_IMAGE,
    recipe: ['agriculture', 'rock'],
    unlocked: false
  },
];
