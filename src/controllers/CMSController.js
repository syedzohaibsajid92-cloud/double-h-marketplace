const pool = require("../config/db"); // <-- adjust path to your existing pg Pool

// GET /api/admin/cms
async function getPages(req, res) {
  try {
    const result = await pool.query(
      `SELECT id, slug, title, updated_at FROM cms_pages ORDER BY updated_at DESC`
    );
    res.json({ success: true, pages: result.rows });
  } catch (err) {
    console.error("getPages error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch CMS pages" });
  }
}

// GET /api/admin/cms/:slug
async function getPageBySlug(req, res) {
  try {
    const { slug } = req.params;
    const result = await pool.query(`SELECT * FROM cms_pages WHERE slug = $1`, [slug]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Page not found" });
    }

    res.json({ success: true, page: result.rows[0] });
  } catch (err) {
    console.error("getPageBySlug error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch page" });
  }
}

// PUT /api/admin/cms/:slug  (creates the page if it doesn't exist yet — upsert)
async function upsertPage(req, res) {
  try {
    const { slug } = req.params;
    const { title, content } = req.body;
    const adminId = req.user.id;

    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const result = await pool.query(
      `INSERT INTO cms_pages (slug, title, content, updated_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (slug) DO UPDATE
         SET title = EXCLUDED.title,
             content = EXCLUDED.content,
             updated_by = EXCLUDED.updated_by,
             updated_at = NOW()
       RETURNING *`,
      [slug, title, content || "", adminId]
    );

    res.json({ success: true, page: result.rows[0] });
  } catch (err) {
    console.error("upsertPage error:", err);
    res.status(500).json({ success: false, message: "Failed to save page" });
  }
}

module.exports = { getPages, getPageBySlug, upsertPage };