declare module 'node-cron' {
  const cron: {
    schedule: (expression: string, callback: () => void | Promise<void>) => void;
  };
  export default cron;
}

declare module 'dockerode' {
  export interface ContainerInfo {
    Id: string;
    Names: string[];
    Image: string;
    State: string;
    Status: string;
    Created: number;
  }

  class Dockerode {
    constructor(options?: { socketPath?: string });
    ping(): Promise<void>;
    listContainers(options?: { all?: boolean }): Promise<ContainerInfo[]>;
    getContainer(id: string): {
      inspect(): Promise<any>;
      stats(options: { stream: false }): Promise<unknown>;
      stats(
        options: { stream: true },
        callback: (error: Error | null, stream?: NodeJS.ReadableStream) => void
      ): void;
      logs(options: {
        stdout?: boolean;
        stderr?: boolean;
        timestamps?: boolean;
        tail?: number;
      }): Promise<Buffer>;
    };
  }

  export default Dockerode;
}

