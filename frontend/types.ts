
export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export type AppState =
  | { status: AppStatus.IDLE }
  | { status: AppStatus.LOADING }
  | { status: AppStatus.SUCCESS; results: string[] }
  | { status: AppStatus.ERROR; error: string };

export interface ImageData {
  data: string;
  mimeType: string;
}

export type GenerationMode = 'inspiration' | 'tryon';

export interface StagedChanges {
  colorSwap: { from: string; to: string } | null;
  styleModifier: string | null;
  textPrompt: string;
}
