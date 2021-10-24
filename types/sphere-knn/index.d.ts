declare module "sphere-knn" {
  interface Point {
    latitude: number;
    longitude: number;
  }

  type Lookup<T extends Point> = (
    latitude: number,
    longitude: number,
    maxResults: number,
    maxDistance?: number
  ) => T[];

  declare function SphereKnn<T extends Point>(points: T[]): Lookup<T>;
  export { SphereKnn as default };
}
