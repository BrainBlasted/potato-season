function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min) + min);
}

export function diceRoll(sides: number): number {
    return randomInt(1, sides);
}