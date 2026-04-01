// chainbreaker/src/tools/ITool.ts

export interface ITool {
  name: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute(params: any): Promise<any>;
}