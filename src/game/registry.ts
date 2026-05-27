import type { GameContent, GameDefinition } from "./contentTypes";
import sameSound from "../content/literacy/same-sound.json";
import rhymeHouse from "../content/literacy/rhyme-house.json";
import cvcBuildTray from "../content/literacy/cvc-build-tray.json";
import sightWordSnackGrab from "../content/literacy/sight-word-snack-grab.json";
import fixTheSentence from "../content/literacy/fix-the-sentence.json";
import opinionBuilder from "../content/literacy/opinion-builder.json";
import longVowelContrast from "../content/literacy/long-vowel-contrast.json";
import storyInOrder from "../content/literacy/story-in-order.json";
import punctuationPop from "../content/literacy/punctuation-pop.json";
import contextClueMatch from "../content/literacy/context-clue-match.json";
import numberParking from "../content/math/number-parking-lot.json";
import makeASet from "../content/math/make-a-set.json";
import addToStoryMat from "../content/math/add-to-story-mat.json";
import shapeSort from "../content/math/shape-sort.json";
import shapeHunt from "../content/math/shape-hunt.json";
import equalShares from "../content/math/equal-shares.json";
import measureMyDesk from "../content/math/measure-my-desk.json";
import subtractionStoryMat from "../content/math/subtraction-story-mat.json";
import materialSortLab from "../content/science/material-sort-lab.json";
import schoolGardenHelper from "../content/science/school-garden-helper.json";
import landWaterMapBuilder from "../content/science/land-water-map-builder.json";
import waterOnEarth from "../content/science/water-on-earth.json";
import communityHelperMatch from "../content/social-studies/community-helper-match.json";
import mySchoolMap from "../content/social-studies/my-school-map.json";
import howPeopleEarnMoney from "../content/social-studies/how-people-earn-money.json";
import saveForAGoal from "../content/social-studies/save-for-a-goal.json";
import helpOurCommunity from "../content/social-studies/help-our-community.json";
import thenAndNow from "../content/social-studies/then-and-now.json";

export const gameRegistry: GameDefinition[] = [
  {
    id: "same-sound",
    title: "Same Sound, Not Same Sound",
    category: "literacy",
    template: "choose-1-of-3",
    description: "Listen to two school words and choose if they start with the same sound.",
    status: "playable",
    image: "/assets/generated/current/game-icon-same-sound.png",
    content: sameSound as GameContent,
  },
  {
    id: "rhyme-house",
    title: "Rhyme House",
    category: "literacy",
    template: "drag-match",
    description: "Drag each picture to the house with the matching word family.",
    status: "playable",
    image: "/assets/generated/current/game-icon-rhyme-house.png",
    content: rhymeHouse as GameContent,
  },
  {
    id: "cvc-build-tray",
    title: "CVC Build Tray",
    category: "literacy",
    template: "drag-into-slots",
    description: "Drag letter tiles into boxes to build picture-supported CVC words.",
    status: "playable",
    image: "/assets/generated/current/game-icon-cvc-build-tray.png",
    content: cvcBuildTray as GameContent,
  },
  {
    id: "sight-word-snack-grab",
    title: "Sight Word Snack Grab",
    category: "literacy",
    template: "choose-1-of-3",
    description: "Tap the snack tray with the matching sight word.",
    status: "playable",
    image: "/assets/generated/current/game-icon-sight-word-snack-grab.png",
    content: sightWordSnackGrab as GameContent,
  },
  {
    id: "fix-the-sentence",
    title: "Fix the Sentence",
    category: "literacy",
    template: "drag-sequence",
    description: "Drag sentence parts into order and choose punctuation when needed.",
    status: "playable",
    image: "/assets/generated/current/game-icon-fix-the-sentence.png",
    content: fixTheSentence as GameContent,
  },
  {
    id: "opinion-builder",
    title: "Opinion Builder",
    category: "literacy",
    template: "drag-sequence",
    description: "Drag preset opinion parts into a sentence frame with a reason.",
    status: "playable",
    image: "/assets/generated/current/game-icon-opinion-builder.png",
    content: opinionBuilder as GameContent,
  },
  {
    id: "long-vowel-contrast",
    title: "Long A Match",
    category: "literacy",
    template: "choose-1-of-3",
    description: "Listen for the long-A word and choose the matching picture.",
    status: "playable",
    image: "/assets/generated/current/game-icon-long-vowel-contrast.png",
    content: longVowelContrast as GameContent,
  },
  {
    id: "story-in-order",
    title: "Story In Order",
    category: "literacy",
    template: "drag-sequence",
    description: "Drag simple daily-life story cards from first to last.",
    status: "playable",
    image: "/assets/generated/current/game-icon-story-in-order.png",
    content: storyInOrder as GameContent,
  },
  {
    id: "punctuation-pop",
    title: "Punctuation Pop",
    category: "literacy",
    template: "choose-1-of-3",
    description: "Choose the ending mark for a simple sentence.",
    status: "playable",
    image: "/assets/generated/current/game-icon-punctuation-pop.png",
    content: punctuationPop as GameContent,
  },
  {
    id: "context-clue-match",
    title: "Context Clue Match",
    category: "literacy",
    template: "choose-1-of-3",
    description: "Use a sentence clue to choose the matching word or picture.",
    status: "playable",
    image: "/assets/generated/current/game-icon-context-clue-match.png",
    content: contextClueMatch as GameContent,
  },
  {
    id: "number-parking-lot",
    title: "Number Parking Lot",
    category: "math",
    template: "choose-1-of-3",
    description: "Park the bus at the matching number space.",
    status: "playable",
    image: "/assets/generated/current/game-icon-number-parking-lot.png",
    content: numberParking as GameContent,
  },
  {
    id: "shape-sort",
    title: "Shape Sort",
    category: "math",
    template: "drag-match",
    description: "Sort shapes and familiar objects into matching shape bins.",
    status: "playable",
    image: "/assets/generated/current/game-icon-shape-sort.png",
    content: shapeSort as GameContent,
  },
  {
    id: "shape-hunt",
    title: "Shape Hunt",
    category: "math",
    template: "choose-1-of-3",
    description: "Find the matching 2D or 3D shape.",
    status: "playable",
    image: "/assets/generated/current/game-icon-shape-hunt.png",
    content: shapeHunt as GameContent,
  },
  {
    id: "equal-shares",
    title: "Equal Shares",
    category: "math",
    template: "choose-1-of-3",
    description: "Choose equal or not equal food shares with clear large pictures.",
    status: "playable",
    image: "/assets/generated/current/game-icon-equal-shares.png",
    content: equalShares as GameContent,
  },
  {
    id: "measure-my-desk",
    title: "Measure Classroom Items",
    category: "math",
    template: "drag-match",
    description: "Drag units end to end, press Done, then choose the measure.",
    status: "playable",
    image: "/assets/generated/current/game-icon-measure-my-desk.png",
    content: measureMyDesk as GameContent,
  },
  {
    id: "make-a-set",
    title: "Make a Set",
    category: "math",
    template: "drag-match",
    description: "Drag objects into a target area to make the matching set.",
    status: "playable",
    image: "/assets/generated/current/game-icon-make-a-set.png",
    content: makeASet as GameContent,
  },
  {
    id: "add-to-story-mat",
    title: "Add To Story Mat",
    category: "math",
    template: "drag-match",
    description: "Drag more objects into a story mat, then choose how many all together.",
    status: "playable",
    image: "/assets/generated/current/game-icon-add-to-story-mat.png",
    content: addToStoryMat as GameContent,
  },
  {
    id: "subtraction-story-mat",
    title: "Subtraction Story Mat",
    category: "math",
    template: "drag-match",
    description: "Take objects away from a story mat, then choose how many are left.",
    status: "playable",
    image: "/assets/generated/current/game-icon-subtraction-story-mat.png",
    content: subtractionStoryMat as GameContent,
  },
  {
    id: "material-sort-lab",
    title: "Material Sort Lab",
    category: "science",
    template: "drag-match",
    description: "Sort familiar objects by how the material feels or works.",
    status: "playable",
    image: "/assets/generated/current/game-icon-material-sort-lab.png",
    content: materialSortLab as GameContent,
  },
  {
    id: "school-garden-helper",
    title: "School Garden Helper",
    category: "science",
    template: "choose-1-of-3",
    description: "Choose what helps classroom and garden plants grow.",
    status: "playable",
    image: "/assets/generated/current/game-icon-school-garden-helper.png",
    content: schoolGardenHelper as GameContent,
  },
  {
    id: "land-water-map-builder",
    title: "Land and Water Map Builder",
    category: "science",
    template: "drag-match",
    description: "Drag simple land, water, and road features to a map spot.",
    status: "playable",
    image: "/assets/generated/current/game-icon-land-water-map-builder.png",
    content: landWaterMapBuilder as GameContent,
  },
  {
    id: "water-on-earth",
    title: "Water on Earth",
    category: "science",
    template: "choose-1-of-3",
    description: "Find bodies of water and sort solid or liquid water.",
    status: "playable",
    image: "/assets/generated/current/game-icon-water-on-earth-v2.png",
    content: waterOnEarth as GameContent,
  },
  {
    id: "community-helper-match",
    title: "Community Helper Match",
    category: "social-studies",
    template: "choose-1-of-3",
    description: "Match school and community problems to helpers.",
    status: "playable",
    image: "/assets/generated/current/game-icon-community-helper-match.png",
    content: communityHelperMatch as GameContent,
  },
  {
    id: "my-school-map",
    title: "My School Map",
    category: "social-studies",
    template: "choose-1-of-3",
    description: "Find familiar places on a simple school map.",
    status: "playable",
    image: "/assets/generated/current/game-icon-my-school-map.png",
    content: mySchoolMap as GameContent,
  },
  {
    id: "how-people-earn-money",
    title: "How People Earn Money",
    category: "social-studies",
    template: "choose-1-of-3",
    description: "Match familiar workers to the jobs they do.",
    status: "playable",
    image: "/assets/generated/current/game-icon-how-people-earn-money.png",
    content: howPeopleEarnMoney as GameContent,
  },
  {
    id: "save-for-a-goal",
    title: "Save for a Goal",
    category: "social-studies",
    template: "choose-1-of-3",
    description: "Choose simple saving pictures and age-appropriate goals.",
    status: "playable",
    image: "/assets/generated/current/game-icon-save-for-a-goal.png",
    content: saveForAGoal as GameContent,
  },
  {
    id: "help-our-community",
    title: "Help Our Community",
    category: "social-studies",
    template: "choose-1-of-3",
    description: "Choose actions that help school and neighborhood places.",
    status: "playable",
    image: "/assets/generated/current/game-icon-help-our-community.png",
    content: helpOurCommunity as GameContent,
  },
  {
    id: "then-and-now",
    title: "Then and Now",
    category: "social-studies",
    template: "drag-match",
    description: "Sort familiar objects into then and now.",
    status: "playable",
    image: "/assets/generated/current/game-icon-then-and-now.png",
    content: thenAndNow as GameContent,
  },
];

export const categories = [
  {
    id: "literacy",
    title: "Literacy",
    locked: false,
    image: "/assets/generated/current/category-literacy-v2.png",
    description: "Letters, sounds, words, and stories.",
  },
  {
    id: "math",
    title: "Math",
    locked: false,
    image: "/assets/generated/current/category-math-v2.png",
    description: "Numbers, sets, shapes, and early operations.",
  },
  {
    id: "science",
    title: "Science",
    locked: false,
    image: "/assets/generated/current/category-science-v2.png",
    description: "Plants, materials, maps, and water.",
  },
  {
    id: "social-studies",
    title: "Social Studies",
    locked: false,
    image: "/assets/generated/current/category-social-studies-v2.png",
    description: "Helpers, places, jobs, saving, and then and now.",
  },
] as const;




