import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  Conversion,
  ConversionCanceledError,
  Input,
  Output,
  Mp3OutputFormat,
  QUALITY_LOW,
  QUALITY_MEDIUM,
  getFirstEncodableAudioCodec,
  type AudioCodec,
} from "mediabunny";

export type CompressedAudio = {
  file: File;
  durationMs?: number;
  bytes: number;
  cancelled?: boolean;
};

export type AudioCompressionProgress = {
  stage: "reading" | "encoding" | "done" | "cancelled";
  percent: number;
};

const CANDIDATE_CODECS: AudioCodec[] = ["mp3", "aac"];
const SKIP_BELOW_BYTES = 0;

export async function compressAudio(
    file: File,
    opts: {
      quality?: "low" | "medium";
      onProgress?: (p: AudioCompressionProgress) => void;
      signal?: AbortSignal;
    } = {},
): Promise<CompressedAudio> {
  const quality = opts.quality === "low" ? QUALITY_LOW : QUALITY_MEDIUM;
  const report = opts.onProgress ?? (() => {});
  const signal = opts.signal;

  const cancelledResult = (): CompressedAudio => {
    report({ stage: "cancelled", percent: 0 });
    return { file, bytes: file.size, cancelled: true };
  };

  if (signal?.aborted) {
    return cancelledResult();
  }

  if (file.size < SKIP_BELOW_BYTES) {
    return { file, bytes: file.size };
  }

  report({ stage: "reading", percent: 0 });

  let conversion: Conversion | undefined;
  const onAbort = () => {
    void conversion?.cancel();
  };

  signal?.addEventListener("abort", onAbort);

  try {
    const codec = await getFirstEncodableAudioCodec(CANDIDATE_CODECS, {
      bitrate: quality,
    });

    if (signal?.aborted) return cancelledResult();

    if (!codec) {
      return { file, bytes: file.size };
    }

    const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
    const track = await input.getPrimaryAudioTrack();
    if (!track) {
      return { file, bytes: file.size };
    }

    if (signal?.aborted) return cancelledResult();

    const output = new BufferTarget();
    const outputFormat = codec === "mp3" ? new Mp3OutputFormat() : new Mp3OutputFormat();

    conversion = await Conversion.init({
      input,
      output: new Output({
        format: outputFormat,
        target: output,
      }),
      audio: {
        codec,
        bitrate: quality,
      },
    });

    if (!conversion.isValid) {
      return { file, bytes: file.size };
    }

    if (signal?.aborted) {
      await conversion.cancel();
      return cancelledResult();
    }

    conversion.onProgress = (percent: number) => {
      report({ stage: "encoding", percent: Math.round(percent * 100) });
    };

    await conversion.execute();
    const buffer = output.buffer;
    if (!buffer) {
      return { file, bytes: file.size };
    }

    const durationMs = Math.round((await input.computeDuration()) * 1000);

    if (buffer.byteLength >= file.size) {
      // Compression didn't help: keep the original file's real bytes, name, and
      // type untouched. Do NOT rename/relabel it as .mp3 here — the bytes are
      // still whatever the original container was (e.g. webm/opus), and a
      // mismatched extension/mime will make players report a 0-duration file
      // downstream.
      report({ stage: "done", percent: 100 });
      return { file, durationMs, bytes: file.size };
    }

    const ext = ".mp3";
    const mime = "audio/mpeg";
    const compressedFile = new File(
        [buffer],
        file.name.replace(/\.[^.]+$/, "") + ext,
        { type: mime },
    );

    report({ stage: "done", percent: 100 });
    return {
      file: compressedFile,
      durationMs,
      bytes: buffer.byteLength,
    };
  } catch (e) {
    if (e instanceof ConversionCanceledError || signal?.aborted) {
      return cancelledResult();
    }
    console.error("Audio compression failed, uploading original", e);
    // Conversion failed: fall back to the original file completely unchanged.
    // Renaming/relabeling these bytes as .mp3 here would mislabel the real
    // container (e.g. webm/opus), causing 0-duration playback downstream.
    return { file, bytes: file.size };
  } finally {
    signal?.removeEventListener("abort", onAbort);
  }
}