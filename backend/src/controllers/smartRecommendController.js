const Anthropic = require("@anthropic-ai/sdk");
const pool = require("../config/db");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";

const VALID_CATEGORIES = [
  "loose_fixture",
  "frayed_wiring",
  "bolt_to_cut",
  "drilling_job",
  "cutting_grinding",
];

const PROMPT = `You classify a customer's photo of a home repair problem for a hardware store.
Pick exactly ONE category key:
- loose_fixture: loose/stripped screw, wobbly switchboard, hinge or fixture
- frayed_wiring: damaged insulation, exposed bare copper wires
- bolt_to_cut: rusted/stuck bolt, chain or padlock that must be cut
- drilling_job: a marked or partly drilled spot on a wall, wood or metal needing a hole
- cutting_grinding: rough metal pipe end or sharp metal edge needing cutting/grinding
- none: the photo shows none of these, or is too unclear to tell
Reply with ONLY JSON, no other text: {"category":"<key>","confidence":<0 to 1>}`;

async function classifyImage(buffer, mimeType) {
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 100,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mimeType, data: buffer.toString("base64") } },
          { type: "text", text: PROMPT },
        ],
      },
    ],
  });
  const text = msg.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return { category: "none", confidence: 0 };
  const parsed = JSON.parse(match[0]);
  const category = VALID_CATEGORIES.includes(parsed.category) ? parsed.category : "none";
  return { category, confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0)) };
}

const getSmartRecommendation = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a photo in the 'image' field." });
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(req.file.mimetype)) {
      return res.status(400).json({ message: "Only JPG, PNG or WEBP photos are allowed." });
    }

    const { category: recognizedCategory, confidence } = await classifyImage(
      req.file.buffer,
      req.file.mimetype
    );

    // Not recognised or not confident: never guess products
    if (recognizedCategory === "none" || confidence < 0.5) {
      return res.status(200).json({
        recognized_item: null,
        confidence,
        recommended_products: [],
        message: "We couldn't recognise the problem in this photo. Please try a clearer, closer photo.",
      });
    }

    const categoryResult = await pool.query(
      `SELECT id, category_name, display_name
       FROM product_categories
       WHERE category_name = $1`,
      [recognizedCategory]
    );

    if (categoryResult.rows.length === 0) {
      return res.status(404).json({
        message: "Recognized category has no mapping configured yet.",
        recognized_category: recognizedCategory,
      });
    }

    const category = categoryResult.rows[0];

    const productsResult = await pool.query(
      `SELECT
          p.id, p.name, p.sku, p.brand, p.price, p.unit, p.image_url,
          ccm.is_required, ccm.display_order
       FROM category_component_map ccm
       JOIN products p ON p.id = ccm.product_id
       WHERE ccm.category_id = $1
       ORDER BY ccm.display_order ASC, p.name ASC`,
      [category.id]
    );

    res.status(200).json({
      recognized_item: {
        category: category.category_name,
        display_name: category.display_name,
        confidence,
      },
      recommended_products: productsResult.rows,
    });
  } catch (err) {
    console.error("smart-recommend error:", err);
    res.status(500).json({ message: "Smart recommendation failed. Please try again." });
  }
};

module.exports = { getSmartRecommendation };