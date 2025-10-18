import { minioClient } from "~/server/minio";

async function setup() {
  // Set up Minio bucket for dream voice recordings
  const bucketName = "dream-recordings";
  
  const bucketExists = await minioClient.bucketExists(bucketName);
  if (!bucketExists) {
    await minioClient.makeBucket(bucketName);
    console.log(`Created bucket: ${bucketName}`);
    
    // Set bucket policy to allow public read access
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: { AWS: ["*"] },
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${bucketName}/*`],
        },
      ],
    };
    
    await minioClient.setBucketPolicy(
      bucketName,
      JSON.stringify(policy)
    );
    console.log(`Set public read policy for bucket: ${bucketName}`);
  }
  
  // Seed initial archetypes and cultural lenses
  const { db } = await import("~/server/db");
  
  // Seed subscription plans
  const subscriptionPlans = [
    {
      name: "Free",
      description: "Basic dream logging and limited AI insights",
      price: 0,
      interval: "month",
      features: [
        "Log up to 10 dreams per month",
        "Basic AI symbol analysis",
        "Join up to 2 Dream Circles",
        "Access to public rituals"
      ]
    },
    {
      name: "Dreamer",
      description: "Unlimited dream logging with advanced insights",
      price: 9.99,
      interval: "month",
      features: [
        "Unlimited dream logging",
        "Advanced AI interpretation",
        "Pattern detection across dreams",
        "Join unlimited Dream Circles",
        "Create custom rituals",
        "Voice recording transcription",
        "Export dreams to PDF/CSV"
      ]
    },
    {
      name: "Mystic",
      description: "Premium features with expert interpretations",
      price: 29.99,
      interval: "month",
      features: [
        "Everything in Dreamer",
        "Priority AI analysis",
        "Monthly expert dream interpretation",
        "Personalized ritual recommendations",
        "Advanced analytics dashboard",
        "Custom report branding",
        "Early access to new features"
      ]
    },
    {
      name: "Circle Elder",
      description: "For groups and professional dream workers",
      price: 99.99,
      interval: "month",
      features: [
        "Everything in Mystic",
        "Manage unlimited Dream Circles",
        "Contributor marketplace access",
        "Create and sell ritual packs",
        "White-label options",
        "API access",
        "Priority support"
      ]
    }
  ];

  for (const plan of subscriptionPlans) {
    await db.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: {},
      create: plan
    });
  }
  console.log("Seeded subscription plans");

  // Seed sample products
  const products = [
    {
      name: "Expert Dream Analysis Session",
      description: "60-minute one-on-one session with a certified dream analyst. Deep dive into recurring symbols, patterns, and personal meaning.",
      price: 75.00,
      type: "GUIDED_SESSION" as const,
    },
    {
      name: "Moon Ritual Kit",
      description: "Complete physical kit for lunar dream rituals. Includes sage, crystals, journal, and guided audio.",
      price: 49.99,
      type: "PHYSICAL_KIT" as const,
      stock: 50,
      weight: 2.5,
      dimensions: { length: 12, width: 8, height: 4 }
    },
    {
      name: "Jungian Symbol Library",
      description: "Comprehensive digital guide to 500+ dream symbols with Jungian interpretations and exercises.",
      price: 19.99,
      type: "DIGITAL_CONTENT" as const,
    },
    {
      name: "7-Day Dream Clarity Ritual Pack",
      description: "Week-long guided ritual sequence to enhance dream recall and lucidity. Includes daily practices and meditations.",
      price: 14.99,
      type: "RITUAL_PACK" as const,
    },
    {
      name: "Cultural Interpretation Templates",
      description: "Multi-cultural dream interpretation frameworks from Yoruba, Chinese, Hindu, and Indigenous traditions.",
      price: 24.99,
      type: "INTERPRETATION_TEMPLATE" as const,
    }
  ];

  for (const product of products) {
    await db.product.upsert({
      where: { name: product.name },
      update: {},
      create: product
    });
  }
  console.log("Seeded sample products");

  // Seed sample rituals
  const rituals = [
    {
      name: "Evening Dream Preparation",
      description: "A calming ritual to prepare your mind and space for vivid, meaningful dreams.",
      steps: [
        "Dim the lights and light a candle or incense",
        "Sit comfortably and take 10 deep breaths",
        "Review your dream journal from previous nights",
        "Set an intention for tonight's dreams",
        "Write your intention in your journal",
        "Place journal and pen beside your bed"
      ],
      category: "Preparation",
      recommendedMoods: ["calm", "curious", "open"],
      energyRange: { min: 3, max: 7 },
      isPublic: true
    },
    {
      name: "Morning Dream Capture",
      description: "Immediately upon waking, capture your dreams before they fade.",
      steps: [
        "Stay still with eyes closed upon waking",
        "Mentally replay your dream",
        "Notice emotions, colors, and key symbols",
        "Open your journal without getting up",
        "Write or sketch everything you remember",
        "Note your waking mood and energy level"
      ],
      category: "Capture",
      recommendedMoods: ["peaceful", "focused", "receptive"],
      energyRange: { min: 2, max: 6 },
      isPublic: true
    },
    {
      name: "New Moon Intention Setting",
      description: "Align your dream practice with lunar cycles for deeper insights.",
      steps: [
        "Create sacred space with candles and crystals",
        "Meditate on what you wish to understand",
        "Write your dream question on paper",
        "Place it under your pillow",
        "Visualize receiving guidance in dreams",
        "Express gratitude to your dream guides"
      ],
      category: "Lunar",
      recommendedMoods: ["intentional", "spiritual", "hopeful"],
      energyRange: { min: 5, max: 9 },
      isPublic: true
    },
    {
      name: "Symbol Meditation",
      description: "Deepen your relationship with recurring dream symbols.",
      steps: [
        "Choose a symbol from recent dreams",
        "Find a quiet space and close your eyes",
        "Visualize the symbol in detail",
        "Ask: 'What do you want to teach me?'",
        "Notice any feelings, memories, or insights",
        "Journal your discoveries",
        "Thank the symbol for its message"
      ],
      category: "Integration",
      recommendedMoods: ["contemplative", "curious", "open"],
      energyRange: { min: 4, max: 8 },
      isPublic: true
    },
    {
      name: "Dream Circle Opening",
      description: "Sacred ritual to open a group dream sharing session.",
      steps: [
        "Gather in a circle",
        "Light a central candle",
        "Each person shares their name and intention",
        "Establish circle agreements (confidentiality, respect)",
        "Invoke dream guides or ancestors",
        "Begin with a moment of silence"
      ],
      category: "Circle",
      recommendedMoods: ["connected", "respectful", "open"],
      energyRange: { min: 5, max: 8 },
      isPublic: true
    }
  ];

  for (const ritual of rituals) {
    await db.ritual.upsert({
      where: { name: ritual.name },
      update: {},
      create: ritual
    });
  }
  console.log("Seeded sample rituals");

  // Seed achievements
  const achievements = [
    {
      name: "First Dream",
      description: "Log your first dream",
      criteria: { type: "dream_count", count: 1 },
      category: "milestone",
      iconUrl: "🌙"
    },
    {
      name: "Dream Apprentice",
      description: "Log 10 dreams",
      criteria: { type: "dream_count", count: 10 },
      category: "milestone",
      iconUrl: "📖"
    },
    {
      name: "Dream Adept",
      description: "Log 50 dreams",
      criteria: { type: "dream_count", count: 50 },
      category: "milestone",
      iconUrl: "✨"
    },
    {
      name: "Dream Master",
      description: "Log 100 dreams",
      criteria: { type: "dream_count", count: 100 },
      category: "milestone",
      iconUrl: "🔮"
    },
    {
      name: "Week Streak",
      description: "Log dreams for 7 consecutive days",
      criteria: { type: "streak", streakType: "dream_logging", length: 7 },
      category: "engagement",
      iconUrl: "🔥"
    },
    {
      name: "Month Streak",
      description: "Log dreams for 30 consecutive days",
      criteria: { type: "streak", streakType: "dream_logging", length: 30 },
      category: "engagement",
      iconUrl: "⚡"
    },
    {
      name: "Ritual Practitioner",
      description: "Complete 10 ritual sessions",
      criteria: { type: "ritual_count", count: 10 },
      category: "milestone",
      iconUrl: "🕯️"
    },
    {
      name: "Circle Builder",
      description: "Create your first Dream Circle",
      criteria: { type: "circle_created", count: 1 },
      category: "social",
      iconUrl: "👥"
    },
    {
      name: "Insight Guru",
      description: "Receive 25 AI-generated insights",
      criteria: { type: "insight_count", count: 25 },
      category: "engagement",
      iconUrl: "💡"
    },
    {
      name: "Pattern Seeker",
      description: "Discover your first dream pattern",
      criteria: { type: "pattern_detected", count: 1 },
      category: "milestone",
      iconUrl: "🧩"
    }
  ];

  for (const achievement of achievements) {
    await db.achievement.upsert({
      where: { name: achievement.name },
      update: {},
      create: achievement
    });
  }
  console.log("Seeded achievements");

  // Seed sample quests
  const quests = [
    {
      name: "Dream Journal Starter",
      description: "Begin your dream journey by logging your first 3 dreams this week",
      objective: { type: "log_dreams", count: 3, timeframe: "week" },
      reward: { type: "badge", achievementName: "Dream Apprentice" },
      type: "weekly"
    },
    {
      name: "Morning Ritual Challenge",
      description: "Complete the Morning Dream Capture ritual 5 times",
      objective: { type: "complete_ritual", ritualName: "Morning Dream Capture", count: 5 },
      reward: { type: "points", amount: 100 },
      type: "special"
    },
    {
      name: "Circle Connection",
      description: "Join a Dream Circle and share your first dream",
      objective: { type: "share_to_circle", count: 1 },
      reward: { type: "badge", achievementName: "Circle Builder" },
      type: "special"
    },
    {
      name: "Daily Dreamer",
      description: "Log a dream every day this week",
      objective: { type: "daily_dreams", count: 7, consecutive: true },
      reward: { type: "badge", achievementName: "Week Streak" },
      type: "weekly"
    }
  ];

  for (const quest of quests) {
    await db.quest.upsert({
      where: { name: quest.name },
      update: {},
      create: quest
    });
  }
  console.log("Seeded sample quests");

  // Seed promo codes
  const promoCodes = [
    {
      code: "WELCOME10",
      discountType: "percentage",
      discountValue: 10,
      usageLimit: 1000,
      isActive: true
    },
    {
      code: "FIRSTDREAM",
      discountType: "fixed",
      discountValue: 5.00,
      usageLimit: 500,
      isActive: true
    }
  ];

  for (const promo of promoCodes) {
    await db.promoCode.upsert({
      where: { code: promo.code },
      update: {},
      create: promo
    });
  }
  console.log("Seeded promo codes");
  
  // Seed Jungian archetypes
  const archetypes = [
    {
      name: "The Shadow",
      jungianType: "Shadow",
      description: "The dark side of the personality, containing repressed weaknesses, desires, and instincts. Often appears as a same-sex figure in dreams.",
      culturalVariants: {
        jungian: "Repressed aspects of self",
        yoruba: "Esu - the trickster energy that reveals hidden truths",
        chinese: "Yin aspect - the hidden, receptive force",
        native_american: "The spirit that tests and teaches through challenge"
      }
    },
    {
      name: "The Anima/Animus",
      jungianType: "Anima/Animus",
      description: "The feminine aspect in men (Anima) or masculine aspect in women (Animus). Represents the soul and connection to the unconscious.",
      culturalVariants: {
        jungian: "Contrasexual inner personality",
        yoruba: "Olokun - the depths of emotion and intuition",
        chinese: "Yin-Yang balance - the complementary force within",
        hindu: "Shakti-Shiva union - divine masculine and feminine"
      }
    },
    {
      name: "The Hero",
      jungianType: "Hero",
      description: "The ego's quest for wholeness and self-discovery. Represents the journey of individuation and overcoming obstacles.",
      culturalVariants: {
        jungian: "Ego consciousness on the path of individuation",
        yoruba: "Ogun - the warrior who clears the path",
        chinese: "The sage on the journey to enlightenment",
        native_american: "The vision quester seeking truth"
      }
    },
    {
      name: "The Wise Old Man/Woman",
      jungianType: "Wise Old Man",
      description: "The archetype of wisdom, guidance, and spiritual knowledge. Often appears as a mentor, sage, or elder.",
      culturalVariants: {
        jungian: "The Self - ultimate wisdom and guidance",
        yoruba: "Orunmila - divine wisdom and divination",
        chinese: "The Immortal - keeper of ancient knowledge",
        aboriginal: "The Dreamtime Elder - connection to ancestral wisdom"
      }
    },
    {
      name: "The Great Mother",
      jungianType: "Great Mother",
      description: "The nurturing, life-giving force. Can be both protective and devouring. Represents nature, fertility, and the unconscious.",
      culturalVariants: {
        jungian: "The nurturing and devouring mother",
        yoruba: "Yemoja - mother of waters, nurturer of life",
        hindu: "Kali - creator and destroyer",
        aztec: "Coatlicue - earth mother, life and death"
      }
    },
    {
      name: "The Trickster",
      jungianType: "Trickster",
      description: "The playful, chaotic force that disrupts order and reveals truth through mischief. Represents transformation and the unexpected.",
      culturalVariants: {
        jungian: "The disruptor of consciousness",
        yoruba: "Esu - messenger and trickster deity",
        native_american: "Coyote - teacher through chaos",
        norse: "Loki - shapeshifter and boundary-crosser"
      }
    }
  ];
  
  for (const archetype of archetypes) {
    await db.archetype.upsert({
      where: { name: archetype.name },
      update: {},
      create: archetype
    });
  }
  console.log("Seeded archetypes");
  
  // Seed cultural lenses
  const culturalLenses = [
    {
      tradition: "Jungian",
      region: "Western Psychology",
      beliefs: "Dreams are the language of the unconscious mind, containing symbols and archetypes from the collective unconscious. They guide us toward individuation and wholeness.",
      symbolMeanings: {
        water: "The unconscious mind, emotions, the flow of life",
        snake: "Transformation, healing, or threat depending on context",
        house: "The Self, the psyche's structure",
        death: "Transformation, the end of one phase and beginning of another"
      },
      color: "#4C1D95",
      icon: "brain"
    },
    {
      tradition: "Yoruba",
      region: "West Africa",
      beliefs: "Dreams connect us to Orun (the spiritual realm) and the Orisha. They bring messages from ancestors and divine forces, revealing destiny and spiritual truths.",
      symbolMeanings: {
        water: "Olokun - wealth, depth, hidden treasures of the soul",
        snake: "Transformation or warning of hidden enemies",
        crossroads: "Esu's domain - choice and destiny",
        white_cloth: "Obatala - purity and divine wisdom"
      },
      color: "#DC2626",
      icon: "sparkles"
    },
    {
      tradition: "Chinese",
      region: "East Asia",
      beliefs: "Dreams reflect the balance of Yin and Yang, connect to ancestral wisdom, and can be prophetic. They reveal the flow of Qi and cosmic harmony.",
      symbolMeanings: {
        dragon: "Divine favor, power, transformation",
        snake: "Prediction of children or hidden wisdom",
        water: "Flow of life energy (Qi)",
        mountain: "Stability, obstacles, or spiritual ascent"
      },
      color: "#DC2626",
      icon: "yin-yang"
    },
    {
      tradition: "Hindu",
      region: "South Asia",
      beliefs: "Dreams are experiences of the subtle body during sleep. They can be prophetic, karmic messages, or reflections of consciousness states.",
      symbolMeanings: {
        snake: "Kundalini energy, wealth, fertility (especially when consumed)",
        lotus: "Spiritual awakening, purity",
        cow: "Abundance, sacred nourishment",
        fire: "Purification, transformation, Agni's presence"
      },
      color: "#F59E0B",
      icon: "flame"
    },
    {
      tradition: "Native American",
      region: "North America",
      beliefs: "Dreams are sacred visions connecting us to the spirit world, animal guides, and ancestors. They provide guidance, healing, and prophetic insight.",
      symbolMeanings: {
        eagle: "Spiritual vision, connection to Great Spirit",
        bear: "Strength, introspection, healing",
        wolf: "Guidance, loyalty, instinct",
        buffalo: "Abundance, prayer, sacred life"
      },
      color: "#059669",
      icon: "feather"
    },
    {
      tradition: "Aboriginal",
      region: "Australia",
      beliefs: "Dreams connect to the Dreamtime - the eternal creation period. The soul wanders during sleep, connecting to ancestral beings and the land's spiritual essence.",
      symbolMeanings: {
        serpent: "Rainbow Serpent - creator, water, life force",
        kangaroo: "Forward movement, nurturing",
        emu: "Endurance, spiritual journey",
        land: "Connection to Country and ancestral spirits"
      },
      color: "#7C2D12",
      icon: "mountain"
    }
  ];
  
  for (const lens of culturalLenses) {
    await db.culturalLens.upsert({
      where: { tradition: lens.tradition },
      update: {},
      create: lens
    });
  }
  console.log("Seeded cultural lenses");
}

setup()
  .then(() => {
    console.log("setup.ts complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
