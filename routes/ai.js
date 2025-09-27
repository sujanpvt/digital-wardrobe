const express = require('express');
const OpenAI = require('openai');
const ClothingItem = require('../models/ClothingItem');
const Outfit = require('../models/Outfit');
const auth = require('../middleware/auth');

const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Generate AI outfit suggestions
router.post('/suggest-outfits', auth, async (req, res) => {
  try {
    const { occasion, weather, style, season } = req.body;

    // Get user's clothing items
    const userItems = await ClothingItem.find({
      userId: req.user._id,
      isInWash: false
    });

    if (userItems.length < 3) {
      return res.status(400).json({
        message: 'You need at least 3 clothing items to generate outfit suggestions'
      });
    }

    // Prepare items data for AI
    const itemsData = userItems.map(item => ({
      id: item._id.toString(),
      name: item.name,
      category: item.category,
      subcategory: item.subcategory,
      color: item.color,
      style: item.style,
      season: item.season,
      occasion: item.occasion
    }));

    // Create AI prompt
    const prompt = `
You are a fashion expert AI. Based on the user's wardrobe, suggest 3 complete outfit combinations.

User's wardrobe items:
${JSON.stringify(itemsData, null, 2)}

Requirements:
- Occasion: ${occasion || 'casual'}
- Weather: ${weather || 'moderate'}
- Style preference: ${style || 'casual'}
- Season: ${season || 'all-season'}

For each outfit, provide:
1. A complete outfit (top + bottom + shoes + optional accessories)
2. Reasoning for the combination
3. Confidence score (0-1)
4. Occasion appropriateness
5. Color harmony explanation

Return ONLY a JSON array with this structure:
[
  {
    "name": "Outfit Name",
    "items": ["item_id_1", "item_id_2", "item_id_3"],
    "reasoning": "Why this combination works",
    "confidence": 0.85,
    "occasion": "work",
    "colorHarmony": "Explanation of color coordination"
  }
]
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional fashion stylist with expertise in color theory, style matching, and occasion-appropriate dressing."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const aiResponse = completion.choices[0].message.content;
    let suggestions;

    try {
      suggestions = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('AI response parsing error:', parseError);
      return res.status(500).json({ message: 'Error parsing AI response' });
    }

    // Validate and save suggestions
    const savedOutfits = [];
    for (const suggestion of suggestions) {
      if (suggestion.items && suggestion.items.length >= 2) {
        const outfit = new Outfit({
          userId: req.user._id,
          name: suggestion.name,
          items: suggestion.items,
          occasion: suggestion.occasion || occasion,
          style: style,
          season: season,
          isAIGenerated: true,
          aiConfidence: suggestion.confidence,
          notes: suggestion.reasoning + '\n\nColor Harmony: ' + suggestion.colorHarmony
        });

        await outfit.save();
        savedOutfits.push(outfit);
      }
    }

    res.json({
      message: 'AI outfit suggestions generated successfully',
      outfits: savedOutfits,
      totalItems: userItems.length
    });

  } catch (error) {
    console.error('AI suggestion error:', error);
    res.status(500).json({ message: 'Error generating AI suggestions' });
  }
});

// Analyze outfit compatibility
router.post('/analyze-outfit', auth, async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || items.length < 2) {
      return res.status(400).json({
        message: 'At least 2 items required for analysis'
      });
    }

    // Get item details
    const itemDetails = await ClothingItem.find({
      _id: { $in: items },
      userId: req.user._id
    });

    if (itemDetails.length !== items.length) {
      return res.status(400).json({
        message: 'Some items not found or don\'t belong to user'
      });
    }

    // Create analysis prompt
    const itemsData = itemDetails.map(item => ({
      name: item.name,
      category: item.category,
      color: item.color,
      style: item.style,
      season: item.season
    }));

    const prompt = `
Analyze this outfit combination for compatibility:

Items: ${JSON.stringify(itemsData, null, 2)}

Provide analysis in JSON format:
{
  "overallScore": 0.85,
  "colorHarmony": 0.9,
  "styleConsistency": 0.8,
  "seasonMatch": 0.9,
  "categoryBalance": 0.85,
  "strengths": ["Good color coordination", "Style consistency"],
  "improvements": ["Consider adding accessories"],
  "recommendations": ["This outfit works well for casual occasions"]
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a fashion expert analyzing outfit compatibility."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 800
    });

    const analysis = JSON.parse(completion.choices[0].message.content);

    res.json({
      message: 'Outfit analysis completed',
      analysis,
      items: itemDetails
    });

  } catch (error) {
    console.error('Outfit analysis error:', error);
    res.status(500).json({ message: 'Error analyzing outfit' });
  }
});

// Get style recommendations
router.get('/style-recommendations', auth, async (req, res) => {
  try {
    const userItems = await ClothingItem.find({
      userId: req.user._id,
      isInWash: false
    });

    if (userItems.length === 0) {
      return res.json({
        message: 'No items found for analysis',
        recommendations: []
      });
    }

    // Analyze user's style patterns
    const styleAnalysis = {
      mostWornColors: {},
      preferredStyles: {},
      categoryDistribution: {},
      seasonPreferences: {}
    };

    userItems.forEach(item => {
      // Color analysis
      styleAnalysis.mostWornColors[item.color] = 
        (styleAnalysis.mostWornColors[item.color] || 0) + 1;
      
      // Style analysis
      styleAnalysis.preferredStyles[item.style] = 
        (styleAnalysis.preferredStyles[item.style] || 0) + 1;
      
      // Category analysis
      styleAnalysis.categoryDistribution[item.category] = 
        (styleAnalysis.categoryDistribution[item.category] || 0) + 1;
      
      // Season analysis
      styleAnalysis.seasonPreferences[item.season] = 
        (styleAnalysis.seasonPreferences[item.season] || 0) + 1;
    });

    // Generate recommendations
    const recommendations = [];

    // Color recommendations
    const topColors = Object.entries(styleAnalysis.mostWornColors)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([color]) => color);

    if (topColors.length > 0) {
      recommendations.push({
        type: 'color',
        message: `Your wardrobe is dominated by ${topColors.join(', ')}. Consider adding complementary colors for variety.`,
        priority: 'medium'
      });
    }

    // Style recommendations
    const topStyle = Object.entries(styleAnalysis.preferredStyles)
      .sort(([,a], [,b]) => b - a)[0];

    if (topStyle) {
      recommendations.push({
        type: 'style',
        message: `Your ${topStyle[0]} style is well-represented. Consider exploring other styles for versatility.`,
        priority: 'low'
      });
    }

    // Category recommendations
    const missingCategories = ['top', 'bottom', 'shoes', 'accessories'].filter(
      cat => !styleAnalysis.categoryDistribution[cat]
    );

    if (missingCategories.length > 0) {
      recommendations.push({
        type: 'category',
        message: `Consider adding items in these categories: ${missingCategories.join(', ')}`,
        priority: 'high'
      });
    }

    res.json({
      message: 'Style analysis completed',
      analysis: styleAnalysis,
      recommendations
    });

  } catch (error) {
    console.error('Style recommendations error:', error);
    res.status(500).json({ message: 'Error generating style recommendations' });
  }
});

module.exports = router;
