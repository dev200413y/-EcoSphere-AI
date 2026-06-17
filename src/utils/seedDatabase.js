import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const DEMO_USER_ID = "demo_user_123";

const seedData = {
  users: {
    [DEMO_USER_ID]: {
      name: "Jane Doe",
      level: "Level 3: Carbon Warrior",
      avatar: "JD",
      baseFootprint: 220,
      monthlyFootprint: 180,
      trend: "-12%",
      energySaved: 45,
      communityImpact: 8,
      streak: 5,
      globalRank: "Top 15%"
    }
  },
  carbonHistory: [
    { year: '2024', current: 2.2, optimized: 2.2 },
    { year: '2025', current: 4.5, optimized: 3.8 },
    { year: '2026', current: 6.8, optimized: 4.9 },
    { year: '2027', current: 9.1, optimized: 5.5 },
    { year: '2028', current: 11.5, optimized: 6.0 },
    { year: '2029', current: 14.0, optimized: 6.2 },
    { year: '2030', current: 16.5, optimized: 6.4 },
  ],
  leaderboard: [
    { rank: 1, name: 'Computer Science Dept', points: 12450, trend: '+450', avatar: '💻', isUserDept: false },
    { rank: 2, name: 'Mechanical Engineering', points: 11800, trend: '+320', avatar: '⚙️', isUserDept: true },
    { rank: 3, name: 'Bio-Tech Dept', points: 10200, trend: '+500', avatar: '🧬', isUserDept: false },
    { rank: 4, name: 'Electrical Engineering', points: 9500, trend: '+120', avatar: '⚡', isUserDept: false },
    { rank: 5, name: 'Civil Engineering', points: 8900, trend: '-50', avatar: '🏗️', isUserDept: false },
  ],
  scenarios: [
    { id: 'ev', title: 'Switch to EV', category: 'Transport', impact: -80, iconName: 'Car' },
    { id: 'solar', title: 'Install Solar (3kW)', category: 'Home', impact: -120, iconName: 'Home' },
    { id: 'meat', title: 'Meatless 2x/Week', category: 'Diet', impact: -15, iconName: 'ShoppingBag' },
    { id: 'public_transit', title: 'Metro 3x/Week', category: 'Transport', impact: -45, iconName: 'Car' },
  ],
  quests: [
    { id: 'q1', title: 'Walk 5,000 Steps', description: 'Upload a photo of your fitness band', points: 50, type: 'Health', target: 'camera' },
    { id: 'q2', title: 'EV Commute', description: 'Take a photo of your EV dashboard', points: 100, type: 'Transport', target: 'camera' },
    { id: 'q3', title: 'Lights Out', description: 'Turn off AC/Lights for 2 hours', points: 30, type: 'Energy', target: 'camera' },
    { id: 'q4', title: 'Hostel Cold Shower', description: 'Save electricity! Take a cold shower today.', points: 40, type: 'Energy', target: 'camera' },
    { id: 'q5', title: 'Local Vegan Meal', description: 'Eat an affordable local green meal. Snap a pic!', points: 60, type: 'Diet', target: 'camera' },
    { id: 'q6', title: 'Shared Auto/Cab', description: 'Carpooling with friends? Upload proof.', points: 80, type: 'Transport', target: 'camera' }
  ],
  mapMarkers: [
    { id: 'm1', lat: 28.6139, lng: 77.2090, title: 'Rahul', action: 'Planted a tree', type: 'user' },
    { id: 'm2', lat: 28.6200, lng: 77.2100, title: 'Sneha', action: 'Riding Metro', type: 'user' },
    { id: 'm3', lat: 28.6100, lng: 77.2200, title: 'High Emission Zone', weight: 10, type: 'heatmap' }
  ]
};

export const runSeed = async () => {
  try {
    console.log("Seeding Database...");

    // Force Reset User (to clear completedQuests for testing)
    await setDoc(doc(db, 'users', DEMO_USER_ID), seedData.users[DEMO_USER_ID]);

    // Seed Carbon History
    for (let i = 0; i < seedData.carbonHistory.length; i++) {
      const entry = seedData.carbonHistory[i];
      await setDoc(doc(db, `users/${DEMO_USER_ID}/carbonHistory`, entry.year), entry);
    }

    // Seed Leaderboard
    for (const team of seedData.leaderboard) {
      // using team name as ID for simplicity
      await setDoc(doc(db, 'leaderboard', team.name.replace(/\s+/g, '_')), team);
    }

    // Seed Scenarios
    for (const scenario of seedData.scenarios) {
      await setDoc(doc(db, 'scenarios', scenario.id), scenario);
    }

    // Seed Quests
    for (const quest of seedData.quests) {
      await setDoc(doc(db, 'quests', quest.id), quest);
    }

    // Seed Map Markers
    for (const marker of seedData.mapMarkers) {
      await setDoc(doc(db, 'mapMarkers', marker.id), marker);
    }

    console.log("Seeding Complete!");
  } catch (error) {
    console.error("Error seeding database: ", error);
  }
};
