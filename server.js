const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs/promises");
const { execFile } = require("child_process");
const { promisify } = require("util");
const { buildClipPlan, parseExtractionOptions } = require("./src/clip-utils");

const execFileAsync = promisify(execFile);
const app = express();
const port = process.env.PORT || 3000;

const dataRoot = path.join(__dirname, "data");
const uploadDir = path.join(dataRoot, "uploads");
const clipsDir = path.join(dataRoot, "clips");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdir(uploadDir, { recursive: true })
      .then(() => cb(null, uploadDir))
      .catch((error) => cb(error, uploadDir));
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/\s+/g, "-");
    cb(null, `${timestamp}-${safeName}`);
  }
});

const upload = multer({ storage });

async function ensureDirs() {
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.mkdir(clipsDir, { recursive: true });
}

async function getDurationSeconds(filePath) {
  try {
    const { stdout } = await execFileAsync("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      filePath
    ]);

    const duration = Number.parseFloat(stdout.trim());
    return Number.isFinite(duration) ? duration : 0;
  } catch {
    return 0;
  }
}

async function extractClip(inputPath, outputPath, startSeconds, durationSeconds) {
  const args = [
    "-y",
    "-ss",
    startSeconds.toFixed(2),
    "-i",
    inputPath,
    "-t",
    durationSeconds.toFixed(2),
    "-c",
    "copy",
    "-avoid_negative_ts",
    "1",
    outputPath
  ];

  await execFileAsync("ffmpeg", args);
}

app.use(express.static(path.join(__dirname, "public")));
app.use("/clips", express.static(clipsDir));

app.post("/api/extract", upload.single("video"), async (req, res) => {
  try {
    await ensureDirs();

    if (!req.file) {
      return res.status(400).json({ error: "No se adjuntó ningún video." });
    }

    const { clipCount, clipLength } = parseExtractionOptions(req.body);
    const duration = await getDurationSeconds(req.file.path);
    const plan = buildClipPlan(duration, clipCount, clipLength);

    if (plan.length === 0) {
      return res.status(400).json({
        error: "No se pudo leer la duración del video. Verifica ffprobe y el archivo cargado."
      });
    }

    const baseName = path.parse(req.file.filename).name;
    const results = [];

    for (let index = 0; index < plan.length; index += 1) {
      const segment = plan[index];
      const outputName = `${baseName}-clip-${index + 1}.mp4`;
      const outputPath = path.join(clipsDir, outputName);

      await extractClip(req.file.path, outputPath, segment.start, segment.duration);
      results.push({
        url: `/clips/${outputName}`,
        start: segment.start,
        duration: segment.duration
      });
    }

    return res.json({
      clips: results,
      duration,
      clipCount,
      clipLength
    });
  } catch (error) {
    return res.status(500).json({
      error: "Ocurrió un problema al extraer los clips.",
      detail: error.message
    });
  }
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

ensureDirs()
  .then(() => {
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`FlowForge OSS viral clip extractor listo en http://localhost:${port}`);
    });
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error("No se pudieron preparar los directorios de datos:", error.message);
    process.exit(1);
  });
