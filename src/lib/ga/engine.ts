import { Individual, GenerationStats, GAConfig, Interval, DEFAULT_GA_CONFIG } from "@/types";
import { CompiledFunction } from "@/lib/math/evaluate";
import { randomInRange } from "@/lib/math/interval";

export function initializePopulation(
  size: number,
  interval: Interval,
  compiledFn: CompiledFunction
): Individual[] {
  const population: Individual[] = [];
  for (let i = 0; i < size; i++) {
    const x = randomInRange(interval);
    const fx = compiledFn.evaluate(x);
    population.push({ x, fitness: fx ?? NaN });
  }
  return population;
}

function scoreIndividual(individual: Individual, minimize: boolean): number {
  if (!Number.isFinite(individual.fitness)) {
    return -Infinity;
  }
  return minimize ? -individual.fitness : individual.fitness;
}

export function tournamentSelection(
  population: Individual[],
  minimize = false,
  tournamentSize = 3
): Individual {
  const size = Math.min(tournamentSize, population.length);
  let best = population[Math.floor(Math.random() * population.length)];
  for (let i = 1; i < size; i++) {
    const candidate = population[Math.floor(Math.random() * population.length)];
    if (scoreIndividual(candidate, minimize) > scoreIndividual(best, minimize)) {
      best = candidate;
    }
  }
  return best;
}

export function arithmeticCrossover(
  parent1: Individual,
  parent2: Individual,
  interval: Interval,
  compiledFn: CompiledFunction
): Individual {
  const alpha = Math.random();
  const x = alpha * parent1.x + (1 - alpha) * parent2.x;
  const clampedX = Math.max(
    interval.includeLeft ? interval.left : interval.left + (interval.right - interval.left) * 1e-6,
    Math.min(
      interval.includeRight ? interval.right : interval.right - (interval.right - interval.left) * 1e-6,
      x
    )
  );
  const fx = compiledFn.evaluate(clampedX);
  return { x: clampedX, fitness: fx ?? NaN };
}

export function boundedMutation(
  individual: Individual,
  interval: Interval,
  mutationRate: number,
  compiledFn: CompiledFunction
): Individual {
  if (Math.random() >= mutationRate) return individual;

  const range = interval.right - interval.left;
  const perturbation = (Math.random() * 2 - 1) * range * 0.1;
  let newX = individual.x + perturbation;

  const epsilon = range * 1e-6;
  const lo = interval.includeLeft ? interval.left : interval.left + epsilon;
  const hi = interval.includeRight ? interval.right : interval.right - epsilon;
  newX = Math.max(lo, Math.min(hi, newX));

  const fx = compiledFn.evaluate(newX);
  return { x: newX, fitness: fx ?? NaN };
}

export function getElites(
  population: Individual[],
  eliteCount: number,
  minimize = false
): Individual[] {
  const sorted = [...population].sort(
    (a, b) => scoreIndividual(b, minimize) - scoreIndividual(a, minimize)
  );
  return sorted.slice(0, eliteCount);
}

export interface GAResult {
  best: Individual;
  generations: number;
  earlyStopped: boolean;
  history: GenerationStats[];
}

export function runGA(
  compiledFn: CompiledFunction,
  interval: Interval,
  config: GAConfig = DEFAULT_GA_CONFIG,
  minimize = false
): GAResult {
  const {
    populationSize,
    generations,
    crossoverRate,
    mutationRate,
    eliteCount,
    tolerance,
    patience,
  } = config;

  let population = initializePopulation(populationSize, interval, compiledFn);
  const history: GenerationStats[] = [];
  let stagnantCount = 0;
  let prevBest = -Infinity;

  for (let gen = 0; gen < generations; gen++) {
    const elites = getElites(population, eliteCount, minimize);
    const newPopulation: Individual[] = [...elites];

    while (newPopulation.length < populationSize) {
      const parent1 = tournamentSelection(population, minimize);
      const parent2 = tournamentSelection(population, minimize);

      let child: Individual;
      if (Math.random() < crossoverRate) {
        child = arithmeticCrossover(parent1, parent2, interval, compiledFn);
      } else {
        child = { ...parent1 };
      }

      child = boundedMutation(child, interval, mutationRate, compiledFn);
      newPopulation.push(child);
    }

    population = newPopulation.slice(0, populationSize);

    const sorted = [...population].sort(
      (a, b) => scoreIndividual(b, minimize) - scoreIndividual(a, minimize)
    );
    const best = sorted[0];
    const validPopulation = population.filter((ind) => Number.isFinite(ind.fitness));
    const avgFitness =
      validPopulation.length > 0
        ? validPopulation.reduce((sum, ind) => sum + ind.fitness, 0) / validPopulation.length
        : NaN;
    const bestScore = scoreIndividual(best, minimize);

    history.push({
      generation: gen + 1,
      bestFitness: best.fitness,
      avgFitness,
      bestX: best.x,
    });

    const improvement = Math.abs(bestScore - prevBest);
    if (gen > 0 && improvement < tolerance) {
      stagnantCount++;
    } else {
      stagnantCount = 0;
    }

    prevBest = bestScore;

    if (stagnantCount >= patience) {
      const finalBest = sorted[0];
      return {
        best: finalBest,
        generations: gen + 1,
        earlyStopped: true,
        history,
      };
    }
  }

  const sorted = [...population].sort(
    (a, b) => scoreIndividual(b, minimize) - scoreIndividual(a, minimize)
  );
  const finalBest = sorted[0];
  return {
    best: finalBest,
    generations,
    earlyStopped: false,
    history,
  };
}
