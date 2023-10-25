import { store } from "@/stores/IonicStorage";

/**
 * A class representing a level manager that calculates the level and experience points required for the level.
 */
export class LevelManager {
  private xp: number = 0;
  private level: number = 0;

  constructor() {
    if (this.xp === 0)
      store.get("currentLevel").then((val) => {
        this.xp = val;
        if (this.xp === null) this.xp = 0;
      });
  }

  /**
   * Gets the current experience points.
   * If the experience points are not set, it retrieves them from the store.
   * @returns {Promise<number>} - The current experience points.
   */
  public async getXP(): Promise<number> {
    // this.xp = 250 * 20000 * 30;
    return this.xp;
  }

  /**
   * Adds experience points to the current level manager and updates the current level if necessary.
   * @param xp - The amount of experience points to add.
   */
  public addXP(newxp: number) {
    const oldLevel = this.getLevel();
    this.xp += newxp;
    store.set("currentLevel", this.xp);
    const newLevel = this.getLevel();
    if (newLevel > oldLevel) {
      for (let i = oldLevel; i < newLevel; i++) {}
    }
    return newLevel - oldLevel;
  }

  /**
   * Gets the current level.
   * @returns {number} - The current level.
   */
  public getLevel(): number {
    this.level = this.levelfromXP(this.xp);
    return this.level;
  }

  /**
   * Gets the experience points required for the current level.
   * @returns {number} - The experience points required for the current level.
   */
  public getXPForThisLevel(): number {
    return this.xpfromlevel(this.getLevel());
  }

  /**
   * Gets the experience points required for the next level.
   * @returns {number} - The experience points required for the next level.
   */
  public getXPForNextLevel(): number {
    return this.xpfromlevel(this.getLevel() + 1);
  }

  /**
   * Gets the experience points earned from the current level.
   * @returns {number} - The experience points earned from the current level.
   */
  public getXpFromThisLevel(): number {
    return this.xp - this.getXPForThisLevel();
  }

  /**
   * Gets the experience points required to level up from the current level to the next level.
   * @returns {number} - The experience points required to level up from the current level to the next level.
   */
  public getXPFromThisLevelToNextLevel(): number {
    return this.getXPForNextLevel() - this.getXPForThisLevel();
  }

  /**
   * Gets the experience points required to level up from the current level to the current experience points.
   * @returns {number} - The experience points required to level up from the current level to the current experience points.
   */
  public getXPFromThisLevelToCurrentXP(): number {
    return this.xp - this.getXPForThisLevel();
  }

  /**
   * Calculates the level based on the given experience points.
   * @param {number} xp - The experience points.
   * @returns {number} - The level.
   */
  public levelfromXP(xp: number): number {
    return Math.floor(xp ** (1 / 1.15) / 1000);
  }

  /**
   * Calculates the experience points required for the given level.
   * @param {number} lvl - The level.
   * @returns {number} - The experience points.
   */
  public xpfromlevel(lvl: number): number {
    return Math.round((lvl * 1000) ** 1.15);
  }

  /**
   * Calculate the level from XP using a logarithmic progression.
   * This function uses a logarithmic scale to make leveling more challenging as the user progresses.
   * It ensures that early levels are quickly attainable, while higher levels require more XP.
   * @param {number} baseXP - The amount of XP required for the first level.
   * @param {number} scaleFactor - The scaling factor that determines the rate of XP requirement increase.
   * @param {number} logBase - The logarithmic base.
   * @returns {number} - The calculated level.
   */
  private calculateLevelFromXP(
    xp: number,
    baseXP: number = 1000,
    scaleFactor: number = 25,
    logBase: number = 1.001
  ): number {
    // Ensure that baseXP is at least 1 to prevent division by zero
    baseXP = Math.max(baseXP, 1);

    let level = 1;

    // Use a logarithmic formula to calculate level
    level = Math.floor(
      Math.log(xp / baseXP + 1) / (Math.log(logBase) * scaleFactor)
    );

    //   // Make leveling after level 100 easier
    //   if (xp > 5000000) level += Math.floor(xp / 50000);

    // Ensure the level is never less than 1
    return Math.max(level, 0);
  }

  /**
   * Calculate the required XP from a given level using a logarithmic progression.
   * This function calculates the required XP for a specific level.
   * @param {number} level - The target level.
   * @param {number} baseXP - The amount of XP required for the first level.
   * @param {number} scaleFactor - The scaling factor that determines the rate of XP requirement increase.
   * @param {number} logBase - The logarithmic base.
   * @returns {number} - The required XP for the given level.
   */
  private calculateXPFromLevel(
    level: number,
    baseXP: number = 1000,
    scaleFactor: number = 25,
    logBase: number = 1.001
  ): number {
    // Ensure that baseXP is at least 1 to prevent division by zero
    baseXP = Math.max(baseXP, 1);

    if (level < 1) {
      return 0; // Level 0 oder negativ hat keine XP-Anforderungen
    }

    // Use a logarithmic formula to calculate XP
    const e = 2.718281828459045;
    let xp = (baseXP + 1) * e ** (scaleFactor * Math.log(logBase) * level);
    xp = Math.floor(xp);

    return Math.max(xp, 0);
  }
}
