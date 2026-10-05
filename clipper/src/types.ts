export interface Word {
  text: string;
  start: number;
  end: number;
}
export interface Segment {
  text: string;
  start: number;
  end: number;
}
export interface Transcript {
  language: string;
  duration: number;
  segments: Segment[];
  words: Word[];
}

export type Platform = "tiktok" | "youtube";
export type ClipStatus = "pending" | "rendering" | "ready" | "failed";
export type FrameMode = "fill" | "blur";

export interface PostResult {
  status: "queued" | "posting" | "posted" | "failed";
  at: string;
  id?: string;
  url?: string;
  error?: string;
}

export interface Clip {
  id: string;
  projectId: string;
  start: number;
  end: number;
  title: string;
  hook: string;
  reason: string;
  score: number;
  status: ClipStatus;
  frame: FrameMode;
  captions: boolean;
  /** Overlay-mode only: on-screen hook text. */
  hookText?: string;
  /** Caption/description posted to the platforms. */
  caption?: string;
  file?: string;
  error?: string;
  /** ISO time; the scheduler publishes the clip to `scheduledPlatforms` once reached. */
  scheduledAt?: string;
  scheduledPlatforms?: Platform[];
  posts: Partial<Record<Platform, PostResult>>;
}

/** "clip" = cut highlights from long video. "overlay" = campaign mode: never trim/crop/alter the supplied edit, only add text + borders. */
export type ProjectMode = "clip" | "overlay";

export interface Project {
  id: string;
  mode: ProjectMode;
  title: string;
  createdAt: string;
  sourceUrl?: string;
  sourceFile?: string;
  duration?: number;
  stage: "queued" | "downloading" | "transcribing" | "selecting" | "rendering" | "done" | "failed";
  error?: string;
  autoPost: Platform[];
  frame: FrameMode;
  captions: boolean;
}
