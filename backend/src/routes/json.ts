import { Router, Request, Response } from 'express';
import { validateJson, formatJson, minifyJson, getJsonType } from '../utils/jsonUtils.js';
import { strictRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

/**
 * POST /api/json/validate
 * JSON ni validate qilish
 */
router.post('/validate', strictRateLimiter, (req: Request, res: Response) => {
  const { json } = req.body;

  if (typeof json !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'json field must be a string',
    });
  }

  const result = validateJson(json);

  return res.json({
    success: true,
    data: result,
  });
});

/**
 * POST /api/json/format
 * JSON ni pretty-print qilish
 */
router.post('/format', strictRateLimiter, (req: Request, res: Response) => {
  const { json, indent = 2, sortKeys = false } = req.body;

  if (typeof json !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'json field must be a string',
    });
  }

  if (typeof indent !== 'number' || indent < 0 || indent > 8) {
    return res.status(400).json({
      success: false,
      error: 'indent must be a number between 0 and 8',
    });
  }

  const result = formatJson(json, { indent, sortKeys: Boolean(sortKeys) });

  if (!result.success) {
    return res.status(422).json({
      success: false,
      error: result.error,
    });
  }

  return res.json({
    success: true,
    data: { formatted: result.result },
  });
});

/**
 * POST /api/json/minify
 * JSON ni minify qilish
 */
router.post('/minify', strictRateLimiter, (req: Request, res: Response) => {
  const { json } = req.body;

  if (typeof json !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'json field must be a string',
    });
  }

  const result = minifyJson(json);

  if (!result.success) {
    return res.status(422).json({
      success: false,
      error: result.error,
    });
  }

  return res.json({
    success: true,
    data: { minified: result.result },
  });
});

/**
 * POST /api/json/analyze
 * JSON ni to'liq tahlil qilish
 */
router.post('/analyze', strictRateLimiter, (req: Request, res: Response) => {
  const { json } = req.body;

  if (typeof json !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'json field must be a string',
    });
  }

  const validation = validateJson(json);
  const type = getJsonType(json);

  return res.json({
    success: true,
    data: {
      ...validation,
      type,
      charCount: json.length,
      lineCount: json.split('\n').length,
    },
  });
});

export default router;
