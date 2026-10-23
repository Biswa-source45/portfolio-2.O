import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import { Profile, Project, Experience, SkillGroup, Achievement, Message, Stat, Upload } from '../models/index.js';
import { getAiStatus, getAvailableModels, saveApiKey, removeApiKey, saveModel } from '../lib/aiConfig.js';

const router = Router();
router.use(requireAuth);

const strip = ({ _id, __v, createdAt, updatedAt, ...rest }) => rest;

router.get('/stats', async (_req, res) => {
  const [projects, experience, skills, achievements, messages, unread, stats] = await Promise.all([
    Project.countDocuments(),
    Experience.countDocuments(),
    SkillGroup.countDocuments(),
    Achievement.countDocuments(),
    Message.countDocuments(),
    Message.countDocuments({ read: false }),
    Stat.find().lean(),
  ]);
  const byKey = Object.fromEntries(stats.map((s) => [s.key, s.count]));
  res.json({ projects, experience, skills, achievements, messages, unread, views: byKey.views || 0, chats: byKey.chats || 0 });
});

// Each AI settings route responds with the updated status.
const aiRoute = (action) => async (req, res) => {
  try {
    await action(req);
    res.json(await getAiStatus());
  } catch (err) {
    if (!err.status) throw err;
    res.status(err.status).json({ error: err.message });
  }
};

router.get('/ai-status', aiRoute(() => {}));
router.put('/ai-key', aiRoute((req) => saveApiKey(req.body?.apiKey)));
router.delete('/ai-key', aiRoute(() => removeApiKey()));
router.put('/ai-model', aiRoute((req) => saveModel(req.body?.model)));
router.get('/ai-models', async (_req, res) => res.json(await getAvailableModels()));

router.get('/profile', async (_req, res) => res.json(await Profile.findOne().lean()));

router.put('/profile', async (req, res) => {
  const profile = await Profile.findOneAndUpdate({}, strip(req.body), { new: true, upsert: true, runValidators: true });
  res.json(profile);
});

// Same CRUD + reorder endpoints for every ordered collection.
function crud(Model) {
  const r = Router();
  r.get('/', async (_req, res) => res.json(await Model.find().sort({ order: 1, createdAt: 1 }).lean()));
  r.post('/', async (req, res) => {
    const order = await Model.countDocuments();
    res.status(201).json(await Model.create({ order, ...strip(req.body) }));
  });
  r.put('/reorder', async (req, res) => {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
    await Model.bulkWrite(ids.map((id, order) => ({ updateOne: { filter: { _id: id }, update: { order } } })));
    res.json({ ok: true });
  });
  r.put('/:id', async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, strip(req.body), { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  });
  r.delete('/:id', async (req, res) => {
    await Model.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  });
  return r;
}

router.use('/projects', crud(Project));
router.use('/experience', crud(Experience));
router.use('/skills', crud(SkillGroup));
router.use('/achievements', crud(Achievement));

router.get('/messages', async (_req, res) => res.json(await Message.find().sort({ createdAt: -1 }).lean()));
router.patch('/messages/:id', async (req, res) => {
  res.json(await Message.findByIdAndUpdate(req.params.id, { read: Boolean(req.body?.read) }, { new: true }));
});
router.delete('/messages/:id', async (req, res) => {
  await Message.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

// Vercel caps request bodies at 4.5 MB, so uploads stay under 4 MB.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, /^image\/(png|jpe?g|webp|gif|avif)$/.test(file.mimetype)),
});

router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Upload a PNG, JPG, WebP, GIF or AVIF image under 4 MB' });
  const doc = await Upload.create({ data: req.file.buffer, contentType: req.file.mimetype, size: req.file.size });
  res.status(201).json({ url: `/api/uploads/${doc._id}` });
});

export default router;
