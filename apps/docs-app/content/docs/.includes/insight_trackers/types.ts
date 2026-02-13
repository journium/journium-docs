/**
 * Example type for demonstrating AutoTypeTable with various property types
 */
export interface TrackerSpecificationExample {
  /**
   * The name of the tracker.
   * Markdown syntax like links, `code` are supported.
   * See https://fumadocs.dev/docs/ui/components/type-table
   */
  name: boolean | null;
  
  /**
   * A function to process user data
   * @param name - user name.
   * @param allowNull - is null value allowed.
   * @returns user ID
   */
  fn: (name: string, allowNull?: boolean) => string;
  
  /**
   * Configuration options for the tracker.
   * We love Shiki.
   * 
   * ```ts
   * console.log("Hello World, powered by Shiki");
   * ```
   * 
   * @default { a: "test" }
   */
  options?: Partial<{ a: unknown }>;
}
