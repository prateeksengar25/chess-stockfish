import {
  buildEngineLines,
  parseInfoLine,
} from './uciParser';
import type { AnalysisResult, AnalyzeOptions, EngineScore } from './types';

const STOCKFISH_WORKER_URL = '/stockfish/stockfish-18-lite-single.js';

/**
 * Manages the Stockfish lite Web Worker and exposes a promise-based UCI API.
 */
export class StockfishManager {
  private worker: Worker | null = null;
  private readyPromise: Promise<void> | null = null;
  private activeReject: ((reason?: unknown) => void) | null = null;
  private activeFen = '';
  private infoByMultiPv = new Map<
    number,
    { depth: number; score: EngineScore; pv: string[] }
  >();
  private bestMoveUci: string | null = null;
  private resolveActive: ((result: AnalysisResult) => void) | null = null;

  /**
   * Initializes the worker and waits for UCI readiness.
   */
  async init(): Promise<void> {
    if (this.readyPromise) {
      return this.readyPromise;
    }

    this.readyPromise = new Promise((resolve, reject) => {
      try {
        this.worker = new Worker(STOCKFISH_WORKER_URL);
      } catch (error) {
        reject(error);
        return;
      }

      let sawUciOk = false;

      this.worker.onmessage = (event: MessageEvent<string>) => {
        const line = String(event.data).trim();
        this.handleLine(line);

        if (line === 'uciok') {
          sawUciOk = true;
          this.send('isready');
        }

        if (line === 'readyok' && sawUciOk && !this.resolveActive) {
          resolve();
        }
      };

      this.worker.onerror = (event) => {
        if (this.activeReject) {
          this.activeReject(event);
        } else {
          reject(event);
        }
      };

      this.send('uci');
    });

    return this.readyPromise;
  }

  /**
   * Stops any in-flight search.
   */
  stop(): void {
    this.send('stop');
    if (this.activeReject) {
      this.activeReject(new Error('Analysis stopped'));
      this.clearActive();
    }
  }

  /**
   * Runs a single-position analysis and resolves when `bestmove` is received.
   */
  async analyze(options: AnalyzeOptions): Promise<AnalysisResult> {
    await this.init();
    this.stop();

    return new Promise<AnalysisResult>((resolve, reject) => {
      this.activeFen = options.fen;
      this.infoByMultiPv.clear();
      this.bestMoveUci = null;
      this.resolveActive = resolve;
      this.activeReject = reject;

      const multiPv = options.multiPv ?? 1;
      this.send('setoption name MultiPV value ' + multiPv);

      if (options.limitStrength) {
        this.send('setoption name UCI_LimitStrength value true');
        this.send(
          'setoption name UCI_Elo value ' + Math.max(1320, options.elo ?? 1320),
        );
      } else {
        this.send('setoption name UCI_LimitStrength value false');
      }

      if (options.skillLevel !== undefined) {
        this.send('setoption name Skill Level value ' + options.skillLevel);
      }

      this.send('position fen ' + options.fen);

      if (options.movetimeMs) {
        this.send('go movetime ' + options.movetimeMs);
      } else {
        this.send('go depth ' + options.depth);
      }
    });
  }

  /**
   * Terminates the worker and resets internal state.
   */
  dispose(): void {
    this.stop();
    this.worker?.terminate();
    this.worker = null;
    this.readyPromise = null;
  }

  private send(command: string): void {
    this.worker?.postMessage(command);
  }

  private handleLine(line: string): void {
    const parsedInfo = parseInfoLine(line);
    if (parsedInfo) {
      const existing = this.infoByMultiPv.get(parsedInfo.multiPv);
      if (!existing || parsedInfo.depth >= existing.depth) {
        this.infoByMultiPv.set(parsedInfo.multiPv, {
          depth: parsedInfo.depth,
          score: parsedInfo.score,
          pv: parsedInfo.pv,
        });
      }
      return;
    }

    if (line.startsWith('bestmove ')) {
      const parts = line.split(/\s+/);
      this.bestMoveUci = parts[1] ?? null;
      this.finishActive();
    }
  }

  private finishActive(): void {
    if (!this.resolveActive) {
      return;
    }

    const result: AnalysisResult = {
      fen: this.activeFen,
      lines: buildEngineLines(this.infoByMultiPv),
      bestMoveUci: this.bestMoveUci,
    };

    const resolve = this.resolveActive;
    this.clearActive();
    resolve(result);
  }

  private clearActive(): void {
    this.resolveActive = null;
    this.activeReject = null;
    this.activeFen = '';
    this.infoByMultiPv.clear();
    this.bestMoveUci = null;
  }
}

/** Shared singleton used by the analysis hook. */
export const stockfishManager = new StockfishManager();
